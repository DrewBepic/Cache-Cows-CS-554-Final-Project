import { ObjectId } from 'mongodb';
import { users, cities, reviews as reviewsCollection, places } from "../db_config/mongoCollections.js";
import * as userFunctions from '../db_functions/users.js';
import * as reviewFunctions from '../db_functions/reviews.js';
import * as friendFunctions from '../db_functions/friends.js';
import * as topspotFunctions from '../db_functions/topspots.js';
import * as placeFunctions from '../db_functions/places.js';
import { setCache, getFromCache, deletekeywithPattern } from '../config/redishelper.js';
import bcrypt from 'bcryptjs';
import { GraphQLError } from 'graphql';
import { client } from '../server.js';
//Some helpers
const isValidObjectId = (id) => {
    return ObjectId.isValid(id);
};
const convertUser = (user) => {
    if (!user) {
        return null;
    }
    return {
        id: user._id?.toString() || user._id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        savedPlaces: user.saved_places || [],
        friends: [],
        sentFriendRequests: [],
        receivedFriendRequests: [],
        reviews: [],
    };
};
const convertReview = (review) => {
    if (!review)
        return null;
    return {
        id: review._id?.toString() || review._id,
        placeId: review.place_id?.toString() || review.place_id,
        placeName: review.place_name?.toString() || review.place_name,
        userId: review.user_id instanceof ObjectId ?
            review.user_id.toString() : review.user_id,
        createdAt: review.createdAt?.toISOString(),
        rating: review.rating,
        notes: review.notes || '',
        photos: review.photos || []
    };
};
const convertSavedPlace = (place) => {
    if (!place) {
        return null;
    }
    return {
        id: place._id?.toString() || place._id,
        placeId: place.place_id || '',
        name: place.name,
        description: place.description || 'No description given.',
        city: place.city || '',
        country: place.country || '',
        address: place.address || '',
        rating: place.rating,
        phoneNumber: place.phone_number || '',
        types: place.types || [],
        photos: place.photos || [],
        reviews: place.reviews || []
    }
};
export const resolvers = {
    Query: {
        getUser: async (_, { id }) => {
            if (!isValidObjectId(id)) {
                throw new Error('Invalid user ID format');
            }
            const user = await userFunctions.findUserById(id);
            if (!user) {
                throw new Error('User not found');
            }
            return convertUser(user);
        },
        getUserByUsername: async (_, { username }) => {
            if (!username || username.trim() === '') {
                throw new Error('Username cannot be empty');
            }
            const user = await userFunctions.findUserByUsername(username);
            if (!user) {
                throw new Error('User not found');
            }
            return convertUser(user);
        },
        getPlace: async (_, { id }) => {
            const place = await placeFunctions.getPlaceById(id);
            if (!place) throw new Error("Place not found");
            return convertSavedPlace(place);
        },
        searchUsers: async (_, { query }) => {
            if (!query || query.trim() === '') {
                throw new Error('Search query cannot be empty');
            }
            if (query.length < 2) {
                throw new Error('Search query must be at least 2 characters long');
            }
            const users = await userFunctions.searchUsersByUsername(query);
            return users.map(convertUser);
        },
        getFriends: async (_, { userId }) => {
            if (!isValidObjectId(userId)) {
                throw new Error('Invalid user ID format');
            }
            const friends = await friendFunctions.getUserFriends(userId);
            return friends.map(convertUser);
        },
        getFriendRequests: async (_, { userId }) => {
            if (!isValidObjectId(userId)) {
                throw new Error('Invalid user ID format');
            }
            const friendRequests = await friendFunctions.getFriendRequests(userId);
            return friendRequests.map(convertUser);
        },
        getSentFriendRequests: async (_, { userId }) => {
            if (!isValidObjectId(userId)) {
                throw new Error('Invalid user ID format');
            }
            const sentFriendRequests = await friendFunctions.getSentFriendRequests(userId);
            return sentFriendRequests.map(convertUser);
        },
        getUserReviews: async (_, { userId }) => {
            if (!isValidObjectId(userId)) {
                throw new Error('Invalid user ID format');
            }
            const reviews = await reviewFunctions.getReviewsByUserId(userId);
            return reviews.map(convertReview);
        },
        getReviewsByPlace: async (_, { placeId }) => {
            if (!placeId || placeId.trim() === '') {
                throw new Error('Place ID cannot be empty');
            }
            const reviews = await reviewFunctions.getReviewsByPlaceId(placeId);
            return reviews.map(convertReview);
        },
        getRecentReviews: async (_, { limit = 10 }) => {
            try {
                if (limit < 1 || limit > 100) {
                    throw new Error('Limit must be between 1 and 100');
                }

                const reviewsCol = await reviewsCollection();
                const recentReviews = await reviewsCol
                    .find({})
                    .sort({ createdAt: -1 })
                    .limit(limit)
                    .toArray();

                const usersCol = await users();
                const reviewsWithUsernames = [];
                
                for (const review of recentReviews) {
                    const user = await usersCol.findOne({ _id: review.user_id });
                    reviewsWithUsernames.push({
                        ...convertReview(review),
                        username: user?.username || 'Unknown'
                    });
                }

                return reviewsWithUsernames;
            } catch (error) {
                throw new Error(`Error fetching recent reviews: ${error.message}`);
            }
        },
        getSavedPlaces: async (_, { userId }) => {
            if (!isValidObjectId(userId)) {
                throw new Error('Invalid user ID format');
            }
            const places = await userFunctions.getSavedPlaces(userId);
            return places.map(convertSavedPlace);
        },
        getSavedPlace: async (_, { placeId }) => {
            if (!isValidObjectId(placeId)) return null;

            const cacheKey = `place:${placeId}`;
            const cachedData = await getFromCache(cacheKey);
            if (cachedData) return cachedData;

            const place = await placeFunctions.getPlaceById(placeId);
            if (!place) return null;

            const reviewsCol = await reviewsCollection();
            const placeReviews = await reviewsCol.find({ place_id: placeId }).toArray();

            let tripliRating = 0;
            if (placeReviews.length > 0) {
                const sum = placeReviews.reduce((acc, r) => acc + r.rating, 0);
                tripliRating = sum / placeReviews.length;
            }

            const usersCol = await users();
            const reviewsWithUsernames = await Promise.all(
                placeReviews.map(async (review) => {
                    const user = await usersCol.findOne({ _id: review.user_id });
                    return {
                        ...convertReview(review),
                        username: user?.username || 'Unknown',
                    };
                })
            );

            const result = {
                ...convertSavedPlace(place),
                tripliRating: parseFloat(tripliRating.toFixed(1)),
                reviews: reviewsWithUsernames
            };

            await setCache(cacheKey, result, 3600); // cache for 1 hour
            return result;
        },
        searchCities: async (_, { query }) => {
            if (!query || query.trim() === '') return [];

            const cacheKey = `search:cities:${query.toLowerCase()}`;
            const cached = await getFromCache(cacheKey);
            if (cached) return cached;

            var trimmed = query.trim();
            if (!trimmed || trimmed.length < 1) {
                throw new Error('Search query must be at least 1 character');
            }

            const { searchCitiesElastic } = await import('../config/elasticsearch.js');
            const results = await searchCitiesElastic(trimmed); //use elasticsearch to search

            const result = results.map(city => ({
                name: city.name,
                country: city.country,
                lat: city.lat,
                lng: city.lng
            }));

            await setCache(cacheKey, result, 100000);

            return result;
        },
        getGlobalTopRatedSpots: async (_, { limit = 10, country, city }) => {
            try {
                const cacheKey = `topspots:global:${limit || 10}:${country || 'all'}:${city || 'all'}`;
                const cached = await getFromCache(cacheKey);
                if (cached) return cached;

                const topSpots = await topspotFunctions.getGlobalTopRatedSpots(limit, country, city);

                await setCache(cacheKey, topSpots, 300); // Cache for 5 minutes

                return topSpots;
            } catch (error) {
                throw new Error(`Error fetching global top rated spots: ${error.message}`);
            }
        },
        getUserAndFriendsTopRatedSpots: async (_, { userId, limit = 10, country, city }) => {
            if (!isValidObjectId(userId)) {
                throw new Error('Invalid user ID format');
            }

            try {
                const cacheKey = `topspots:user:${userId}:${limit || 10}:${country || 'all'}:${city || 'all'}`;
                const cached = await getFromCache(cacheKey);
                if (cached) return cached;
                const topSpots = await topspotFunctions.getUserAndFriendsTopRatedSpots(userId, limit, country, city);
                // Cache result
                await setCache(cacheKey, topSpots, 300); // Cache for 5 minutes
                return topSpots;
            } catch (error) {
                throw new Error(`Error fetching user and friends top rated spots: ${error.message}`);
            }
        },
    },
    Mutation: {
        createUser: async (_, { username, firstName, lastName, password }) => {
            if (!username || !firstName || !lastName || !password) {
                throw new Error('All fields are required');
            }
            if (!username.trim() || !firstName.trim() || !lastName.trim()) {
                throw new Error('All fields are required');
            }
            if (username.trim().length < 3) {
                throw new Error('Username must be at least 3 characters');
            }
            if (username.trim().length > 30) {
                throw new Error('Username cannot exceed 30 characters');
            }
            if (firstName.trim().length < 1 || lastName.trim().length < 1) {
                throw new Error('First name and last name must be at least 1 character');
            }
            if (firstName.trim().length > 30 || lastName.trim().length > 30) {
                throw new Error('First name and last name cannot exceed 30 characters');
            }
            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }
            if (password.length > 30) {
                throw new Error('Password cannot exceed 30 characters');
            }
            const cleanUsername = username.toLowerCase().trim();
            const user = await userFunctions.createUser({
                username: cleanUsername,
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                password: password.trim()
            });
            const dbUser = await userFunctions.findUserByUsername(cleanUsername);
            if (dbUser) {
                await client.set(`user:username:${cleanUsername}`, JSON.stringify(dbUser));
            }
            return convertUser(user);
        },
        login: async (_, { username, password }, { session }) => {
            if (!username || !password) {
                throw new Error('Username and password are required');
            }
            const cleanUsername = username.toLowerCase().trim();
            const cacheKey = `user:username:${cleanUsername}`;
            let user;
            const cachedUser = await client.get(cacheKey);
            if (cachedUser) {
                user = JSON.parse(cachedUser);
            }
            else {
                user = await userFunctions.findUserByUsername(cleanUsername);
                if (!user) {
                    throw new Error('Invalid username or password');
                }
                await client.set(cacheKey, JSON.stringify(user));
            }

            if (!user.password) {
                throw new Error('Authentication error - invalid user data');
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new Error('Invalid username or password');
            }
            session.userId = user._id.toString();

            return convertUser(user);
        },
        logout: async (_, __, { session }) => {
            try {
                session.destroy();
                return { success: true, message: 'Logged out successfully' };
            }
            catch (error) {
                throw new GraphQLError('Error logging out');
            }
        },
        sendFriendRequest: async (_, { currentUserId, friendUsername }) => {
            if (!isValidObjectId(currentUserId)) {
                throw new Error('Invalid user ID format');
            }
            if (!friendUsername.trim()) {
                throw new Error('Friend username is required');
            }
            console.log('GRAPHQL DEBUG - sendFriendRequest called with:');
            console.log('  currentUserId:', currentUserId);
            console.log('  friendUsername:', friendUsername);
            console.log('  isValidObjectId(currentUserId):', isValidObjectId(currentUserId));
            try {
                const updatedUser = await friendFunctions.sendFriendRequest(currentUserId, friendUsername.trim());
                const converted = convertUser(updatedUser);
                // DEBUG: Log after conversion
                return converted;
            }
            catch (error) {
                throw new Error(error.message);
            }
        },
        acceptFriendRequest: async (_, { currentUserId, friendId }) => {
            if (!isValidObjectId(currentUserId) || !isValidObjectId(friendId)) {
                throw new Error('Invalid user ID format');
            }
            try {
                const updatedUser = await friendFunctions.acceptFriendRequest(currentUserId, friendId);
                await deletekeywithPattern('topspots:*');
                return convertUser(updatedUser);
            }
            catch (error) {
                throw new Error(error.message);
            }
        },
        rejectFriendRequest: async (_, { currentUserId, friendId }) => {
            if (!isValidObjectId(currentUserId) || !isValidObjectId(friendId)) {
                throw new Error('Invalid user ID format');
            }
            try {
                const updatedUser = await friendFunctions.rejectFriendRequest(currentUserId, friendId);
                await deletekeywithPattern('topspots:*');
                return convertUser(updatedUser);
            }
            catch (error) {
                throw new Error(error.message);
            }
        },
        removeFriend: async (_, { currentUserId, friendId }) => {
            if (!isValidObjectId(currentUserId) || !isValidObjectId(friendId)) {
                throw new Error('Invalid user ID format');
            }
            try {
                const updatedUser = await friendFunctions.removeFriend(currentUserId, friendId);
                return convertUser(updatedUser);
            }
            catch (error) {
                throw new Error(error.message);
            }
        },
        createReview: async (_, { userId, placeId, placeName, rating, notes, photos }) => {
            if (!userId || !placeId || !placeName || rating === undefined) {
                throw new Error('User ID, Place ID, Place Name, and Rating are required');
            }
            if (!isValidObjectId(userId.trim())) {
                throw new Error('Invalid user ID format');
            }
            if (!placeId.trim() || !placeName.trim()) {
                throw new Error('Place ID and name are required');
            }
            if (rating < 1 || rating > 5) {
                throw new Error('Rating must be between 1 and 5');
            }
            if (notes) {
                if (typeof notes !== 'string') {
                    throw new Error('Notes must be a string');
                }
                notes = notes.trim();
            }
            try {
                const cleanPlaceId = placeId.trim();
                const review = await reviewFunctions.createReview(userId, cleanPlaceId, placeName.trim(), rating, notes?.trim(), photos);
                await placeFunctions.addReviewToPlace(cleanPlaceId, review._id.toString());
                if (review) {
                    await deletekeywithPattern('topspots:*'); 
                    await client.del(`place:${cleanPlaceId}`);
                }
                return convertReview(review);
            }
            catch (error) {
                throw new Error(error.message);
            }
        },
        deleteReview: async (_, { userId, reviewId }) => {
            if (!isValidObjectId(userId) || !isValidObjectId(reviewId)) {
                throw new Error('Invalid ID format');
            }
            try {
                const reviewsCol = await reviewsCollection();
                const review = await reviewsCol.findOne({ _id: new ObjectId(reviewId) });
                if (!review) throw new Error("Review not found");
                const placeId = review.place_id;
                const success = await reviewFunctions.deleteReview(userId, reviewId);
                if (success) {
                    if (placeId) {
                        await placeFunctions.removeReviewFromPlace(placeId, reviewId);
                        await client.del(`place:${placeId}`);
                    }
                    await deletekeywithPattern('topspots:*');
                }
                return success;
            }
            catch (error) {
                throw new Error(error.message);
            }
        },
        addSavedPlace: async (_, { userId, placeId }) => {
            if (!isValidObjectId(userId)) {
                throw new Error('Invalid user ID format');
            }
            if (!placeId.trim()) {
                throw new Error('Place ID is required');
            }
            const res = await userFunctions.addSavedPlace(userId, placeId.trim());
            return res; //true if modified, false otherwise
        },
        removeSavedPlace: async (_, { userId, placeId }) => {
            if (!isValidObjectId(userId)) {
                throw new Error('Invalid user ID format');
            }
            if (!placeId.trim()) {
                throw new Error('Place ID is required');
            }
            const res = await userFunctions.removeSavedPlace(userId, placeId.trim());
            return res; //true if modified, false otherwise
        },
        importGooglePlace: async (_, { googlePlaceId }) => {
            try {
                const place = await placeFunctions.getOrImportPlace(googlePlaceId);
                return convertSavedPlace(place);
            } catch (e) {
                throw new Error(e.message);
            }
        }


    },
    //Field resolvers
    User: {
        friends: async (parent) => {
            if (parent.friends && parent.friends.length > 0) {
                //some friends alr exist
                //check if its alr including user objects. otherwise fetch them
                if (typeof parent.friends[0] == 'object' && parent.friends[0].username) {
                    return parent.friends.map(convertUser);
                }
                const friends = await friendFunctions.getUserFriends(parent.id);
                return friends.map(convertUser);
            }
            //otherwise j return empty array
            return [];
        },
        reviews: async (parent) => {
            if (!parent.reviews || parent.reviews.length === 0) {
                return [];
            }
            //review has alr been converted
            if (typeof parent.reviews[0] == 'object' && parent.reviews[0].placeName) {
                return parent.reviews;
            }
            const reviews = await reviewFunctions.getReviewsByUserId(parent.id);
            return reviews.map(convertReview);
        },
        sentFriendRequests: async (parent) => {
            if (!parent.sentFriendRequests || parent.sentFriendRequests.length === 0) {
                return [];
            }
            //list alr exists and has been converted
            if (typeof parent.sentFriendRequests[0] === 'object' && parent.sentFriendRequests[0].username) {
                return parent.sentFriendRequests;
            }
            //otherwise it dont so get it
            const usersCollection = await users();
            const requestIds = parent.sentFriendRequests.map((id) => new ObjectId(id));
            const requests = await usersCollection.find({ _id: { $in: requestIds } }).toArray();
            return requests.map(convertUser);
        },
        receivedFriendRequests: async (parent) => {
            if (!parent.receivedFriendRequests || parent.receivedFriendRequests.length === 0) {
                return [];
            }
            //list alr exists and has been converted
            if (typeof parent.receivedFriendRequests[0] === 'object' && parent.receivedFriendRequests[0].username) {
                return parent.receivedFriendRequests;
            }
            //otherwise it dont so get it
            const usersCollection = await users();
            const requestIds = parent.receivedFriendRequests.map((id) => new ObjectId(id));
            const requests = await usersCollection.find({ _id: { $in: requestIds } }).toArray();
            return requests.map(convertUser);
        }
    }
}