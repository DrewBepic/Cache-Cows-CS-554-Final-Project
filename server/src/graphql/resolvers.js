import { ObjectId } from 'mongodb';
import { users } from "../db_config/mongoCollections.js";
import * as userFunctions from '../db_functions/users.js';
import * as reviewFunctions from '../db_functions/reviews.js';
import * as friendFunctions from '../db_functions/friends.js';
import redis from 'redis';
const client = redis.createClient();
client.connect().then(() => {});
import bcrypt from 'bcryptjs';
import { GraphQLError } from 'graphql';
import { client } from '../server.js';
//Some helpers
const CACHE_KEYS = {
    USER: (id) => `user:${id}`,
    USER_BY_USERNAME: (username) => `user:username:${username.toLowerCase()}`,
    FRIENDS: (userId) => `friends:${userId}`,
    FRIEND_REQUESTS: (userId) => `friendRequests:${userId}`,
    SENT_REQUESTS: (userId) => `sentRequests:${userId}`,
    REVIEWS: (userId) => `reviews:${userId}`,
    REVIEWS_BY_PLACE: (placeId) => `reviews:place:${placeId}`,
    SAVED_PLACES: (userId) => `savedPlaces:${userId}`,
    SEARCH_USERS: (query) => `search:users:${query.toLowerCase()}`
};

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
export const resolvers = {
    Query: {
        getUser: async (_, { id }) => {
            if (!isValidObjectId(id)) {
                throw new Error('Invalid user ID format');
            }
            const cacheKey = CACHE_KEYS.USER(id);
            const cachedUser = await client.get(cacheKey);
            if (cachedUser) {
                console.log(`Cache Hit: ${cacheKey}`);
                return JSON.parse(cachedUser);
            }
            const user = await userFunctions.findUserById(id);
            if (!user) {
                throw new Error('User not found');
            }
            await client.set(cacheKey, JSON.stringify(convertUser(user)));
            return convertUser(user);
        },
        getUserByUsername: async (_, { username }) => {
            if (!username || username.trim() === '') {
                throw new Error('Username cannot be empty');
            }
            const cacheKey = CACHE_KEYS.USER_BY_USERNAME(username.trim());
            const cachedUser = await client.get(cacheKey);
            if (cachedUser) {
                console.log(`Cache Hit: ${cacheKey}`);
                return JSON.parse(cachedUser);
            }
            const user = await userFunctions.findUserByUsername(username.trim());
            if (!user) {
                throw new Error('User not found');
            }
            await client.set(cacheKey, JSON.stringify(convertUser(user)));
            return convertUser(user);
        },
        searchUsers: async (_, { query }) => {
            if (!query || query.trim() === '') {
                throw new Error('Search query cannot be empty');
            }
            if (query.length < 2) {
                throw new Error('Search query must be at least 2 characters long');
            }
            const cacheKey = CACHE_KEYS.SEARCH_USERS(query.trim());
            const cachedUsers = await client.get(cacheKey);
            if (cachedUsers) {
                console.log(`Cache Hit: ${cacheKey}`);
                return JSON.parse(cachedUsers);
            }
            const users = await userFunctions.searchUsersByUsername(query);
            await client.set(cacheKey, JSON.stringify(users.map(convertUser)));
            return users.map(convertUser);
        },
        getFriends: async (_, { userId }) => {
            if (!isValidObjectId(userId.trim())) {
                throw new Error('Invalid user ID format');
            }
            const cacheKey = CACHE_KEYS.FRIENDS(userId.trim());
            const cachedFriends = await client.get(cacheKey);
            if (cachedFriends) {
                console.log(`Cache Hit: ${cacheKey}`);
                return JSON.parse(cachedFriends);
            }
            const friends = await friendFunctions.getUserFriends(userId);
            await client.set(cacheKey, JSON.stringify(friends.map(convertUser)));
            return friends.map(convertUser);
        },
        getFriendRequests: async (_, { userId }) => {
            if (!isValidObjectId(userId.trim())) {
                throw new Error('Invalid user ID format');
            }
            const cacheKey = CACHE_KEYS.FRIEND_REQUESTS(userId.trim());
            const cachedFriends = await client.get(cacheKey);
            if (cachedFriends) {
                console.log(`Cache Hit: ${cacheKey}`);
                return JSON.parse(cachedFriends);
            }
            const friendRequests = await friendFunctions.getFriendRequests(userId.trim());
            await client.set(cacheKey, JSON.stringify(friends.map(convertUser)));
            return friendRequests.map(convertUser);
        },
        getSentFriendRequests: async (_, { userId }) => {
            if (!isValidObjectId(userId)) {
                throw new Error('Invalid user ID format');
            }
            const cacheKey = CACHE_KEYS.SENT_REQUESTS(userId.trim());
            const cachedFriends = await client.get(cacheKey);
            if (cachedFriends) {
                console.log(`Cache Hit: ${cacheKey}`);
                return JSON.parse(cachedFriends);
            }
            const sentFriendRequests = await friendFunctions.getSentFriendRequests(userId.trim());
            await client.set(cacheKey, JSON.stringify(friends.map(convertUser)));
            return sentFriendRequests.map(convertUser);
        },
        getUserReviews: async (_, { userId }) => {
            if (!isValidObjectId(userId)) {
                throw new Error('Invalid user ID format');
            }
            const cacheKey = CACHE_KEYS.REVIEWS(userId.trim());
            const cachedReviews = await client.get(cacheKey);
            if (cachedReviews) {
                console.log(`Cache Hit: ${cacheKey}`);
                return JSON.parse(cachedReviews);
            }
            const reviews = await reviewFunctions.getReviewsByUserId(userId.trim());
            await client.set(cacheKey, JSON.stringify(reviews.map(convertReview)));
            return reviews.map(convertReview);
        },
        getReviewsByPlace: async (_, { placeId }) => {
            if (!placeId || placeId.trim() === '') {
                throw new Error('Place ID cannot be empty');
            }
            const cacheKey = CACHE_KEYS.REVIEWS_BY_PLACE(placeId.trim());
            const cachedReviews = await client.get(cacheKey);
            if (cachedReviews) {
                console.log(`Cache Hit: ${cacheKey}`);
                return JSON.parse(cachedReviews);
            }
            const reviews = await reviewFunctions.getReviewsByPlaceId(placeId);
            await client.set(cacheKey, JSON.stringify(reviews.map(convertReview)));
            return reviews.map(convertReview);
        },
        getSavedPlaces: async (_, { userId }) => {
            if (!isValidObjectId(userId)) {
                throw new Error('Invalid user ID format');
            }
            const cacheKey = CACHE_KEYS.SAVED_PLACES(userId.trim());
            const cachedPlaces = await client.get(cacheKey);
            if (cachedPlaces) {
                console.log(`Cache Hit: ${cacheKey}`);
                return JSON.parse(cachedPlaces);
            }
            const savedPlaces = await userFunctions.getSavedPlaces(userId);
            await client.set(cacheKey, JSON.stringify(savedPlaces));
            return savedPlaces;
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
            await client.flushAll();
        
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
        sendFriendRequest: async (_, { currentUserId, friendUsername }) => {
            if (!isValidObjectId(currentUserId)) {
                throw new Error('Invalid user ID format');
            }
            if (!friendUsername.trim()) {
                throw new Error('Friend username is required');
            }
            try {
                const updatedUser = await friendFunctions.sendFriendRequest(currentUserId, friendUsername.trim());
                const converted = convertUser(updatedUser);
                // DEBUG: Log after conversion
                await client.flushAll();
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
                await client.flushAll();
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
                await client.flushAll();
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
                await client.flushAll();
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
                await client.flushAll();
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
                await client.flushAll(); //CHANGE EVENTUALLY
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
            if (res) {await client.flushAll();}
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
            if (res) {await client.flushAll();}
            return res; //true if modified, false otherwise
        }
    },
    //Field resolvers
    User: {
        friends: async (parent) => {
            const friends = await friendFunctions.getUserFriends(parent.id);
            return friends.map(convertUser);
        },
        reviews: async (parent) => {
            const reviews = await reviewFunctions.getReviewsByUserId(parent.id);
            return reviews.map(convertReview);
        },
        sentFriendRequests: async (parent) => {
            const usersCollection = await users();
            const requestIds = parent.sentFriendRequests.map((id) => new ObjectId(id));
            const requests = await usersCollection.find({ _id: { $in: requestIds } }).toArray();
            return requests.map(convertUser);
        },
        receivedFriendRequests: async (parent) => {
            const usersCollection = await users();
            const requestIds = parent.receivedFriendRequests.map((id) => new ObjectId(id));
            const requests = await usersCollection.find({ _id: { $in: requestIds } }).toArray();
            return requests.map(convertUser);
        }
    }
};
