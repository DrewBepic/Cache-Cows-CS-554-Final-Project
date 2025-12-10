import { ObjectId } from 'mongodb';
import { users, reviews } from "../db_config/mongoCollections.js";
import * as userFunctions from '../db_functions/users.js';
import * as reviewFunctions from '../db_functions/reviews.js';
import * as friendFunctions from '../db_functions/friends.js';
import * as savedPlaceFunctions from '../db_functions/saved_places.js';
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
        notes: review.notes || ''
    };
};

const convertSavedPlace = (place) => {
    if (!place) return null;
    return {
        id: place._id?.toString() || place._id,
        name: place.name,
        description: place.description || '',
        city: place.city,
        country: place.country,
        photos: place.photos || [],
        reviews: []
    };
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
        getSavedPlace: async (_, { placeId }) => {
            if (!isValidObjectId(placeId)) {
                throw new Error('Invalid place ID format');
            }
            const place = await savedPlaceFunctions.getSavedPlaceById(placeId);
            if (!place) {
                throw new Error('Saved place not found');
            }
            return convertSavedPlace(place);
        },
        getUserSavedPlaces: async (_, { userId }) => {
            if (!isValidObjectId(userId)) {
                throw new Error('Invalid user ID format');
            }
            const places = await savedPlaceFunctions.getUserSavedPlaces(userId);
            return places.map(convertSavedPlace);
        },
        searchSavedPlaces: async (_, { query }) => {
            if (!query || query.trim() === '') {
                throw new Error('Search query cannot be empty');
            }
            if (query.length < 2) {
                throw new Error('Search query must be at least 2 characters long');
            }
            const places = await savedPlaceFunctions.searchSavedPlaces(query);
            return places.map(convertSavedPlace);
        }
    },
    Mutation: {
        createUser: async (_, { username, firstName, lastName, password }) => {
            if (!username.trim() || !firstName.trim() || !lastName.trim()) {
                throw new Error('All fields are required');
            }
            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters');
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
        createReview: async (_, { userId, placeId, placeName, rating, notes }) => {
            if (!isValidObjectId(userId)) {
                throw new Error('Invalid user ID format');
            }
            if (!placeId.trim() || !placeName.trim()) {
                throw new Error('Place ID and name are required');
            }
            if (rating < 1 || rating > 5) {
                throw new Error('Rating must be between 1 and 5');
            }
            try {
                const review = await reviewFunctions.createReview(userId, placeId.trim(), placeName.trim(), rating, notes?.trim());
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
                const success = await reviewFunctions.deleteReview(userId, reviewId);
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
        createSavedPlace: async (_, { userId, name, description, city, country, photos }) => {
            if (!isValidObjectId(userId)) {
                throw new Error('Invalid user ID format');
            }
            if (!name.trim() || !city.trim() || !country.trim()) {
                throw new Error('Name, city, and country are required');
            }
            try {
                const place = await savedPlaceFunctions.createSavedPlace(
                    userId,
                    name.trim(),
                    description?.trim(),
                    city.trim(),
                    country.trim(),
                    photos || []
                );
                return convertSavedPlace(place);
            } catch (error) {
                throw new Error(error.message);
            }
        },
        updateSavedPlace: async (_, { placeId, name, description, city, country, photos }) => {
            if (!isValidObjectId(placeId)) {
                throw new Error('Invalid place ID format');
            }
            try {
                const updates = {};
                if (name !== undefined) updates.name = name.trim();
                if (description !== undefined) updates.description = description.trim();
                if (city !== undefined) updates.city = city.trim();
                if (country !== undefined) updates.country = country.trim();
                if (photos !== undefined) updates.photos = photos;

                const updatedPlace = await savedPlaceFunctions.updateSavedPlace(placeId, updates);
                return convertSavedPlace(updatedPlace);
            } catch (error) {
                throw new Error(error.message);
            }
        },
        deleteSavedPlace: async (_, { userId, placeId }) => {
            if (!isValidObjectId(userId) || !isValidObjectId(placeId)) {
                throw new Error('Invalid ID format');
            }
            try {
                const success = await savedPlaceFunctions.deleteSavedPlace(userId, placeId);
                return success;
            } catch (error) {
                throw new Error(error.message);
            }
        },
        addPhotoToPlace: async (_, { placeId, photoUrl }) => {
            if (!isValidObjectId(placeId)) {
                throw new Error('Invalid place ID format');
            }
            if (!photoUrl.trim()) {
                throw new Error('Photo URL is required');
            }
            const res = await savedPlaceFunctions.addPhotoToPlace(placeId, photoUrl.trim());
            return res;
        },
        removePhotoFromPlace: async (_, { placeId, photoUrl }) => {
            if (!isValidObjectId(placeId)) {
                throw new Error('Invalid place ID format');
            }
            if (!photoUrl.trim()) {
                throw new Error('Photo URL is required');
            }
            const res = await savedPlaceFunctions.removePhotoFromPlace(placeId, photoUrl.trim());
            return res;
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
    },
    SavedPlace: {
        reviews: async (parent) => {
            if (!parent.reviews || parent.reviews.length === 0) {
                return [];
            }
            // If reviews are already converted
            if (typeof parent.reviews[0] === 'object' && parent.reviews[0].placeName) {
                return parent.reviews;
            }
            // Otherwise fetch them
            const reviewsCollection = await reviews();
            const reviewIds = parent.reviews.map(id => new ObjectId(id));
            const reviewList = await reviewsCollection.find({ _id: { $in: reviewIds } }).toArray();
            return reviewList.map(convertReview);
        }
    }
};
