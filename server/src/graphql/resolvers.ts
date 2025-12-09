import { ObjectId } from 'mongodb';
import { users} from "../db_config/mongoCollections.js";
import * as userFunctions from '../db_functions/users.js';
import * as reviewFunctions from '../db_functions/reviews.js';
import * as friendFunctions from '../db_functions/friends.js';

//Some helpers
const isValidObjectId = (id: string): boolean => {
  return ObjectId.isValid(id);
};

const convertUser = (user:any) => {
    if (!user) {return null;}
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

const convertReview = (review: any) => {
    if (!review) return null;

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
        getUser: async (_:any, { id }: { id:string }) => {
            if (!isValidObjectId(id)) {throw new Error('Invalid user ID format');}
            const user = await userFunctions.findUserById(id);
            if (!user) {throw new Error('User not found');}
            return convertUser(user);
        },
        getUserByUsername: async (_: any, {username}: {username:string}) => {
            if (!username || username.trim() === '') {
                throw new Error('Username cannot be empty');
            }
            const user = await userFunctions.findUserByUsername(username);
            if (!user) {throw new Error('User not found');}
            return convertUser(user);
        },
        searchUsers: async (_: any, {query}: {query:string}) => {
            if (!query || query.trim() === '') {
                throw new Error('Search query cannot be empty');
            }
            if (query.length < 2) {throw new Error('Search query must be at least 2 characters long');}
            const users = await userFunctions.searchUsersByUsername(query);
            return users.map(convertUser);
        },
        getFriends: async (_: any, {userId}: {userId:string}) => {
            if (!isValidObjectId(userId)) {throw new Error('Invalid user ID format');}
            const friends = await friendFunctions.getUserFriends(userId);
            return friends.map(convertUser);
        },
        getFriendRequests: async (_: any, {userId}: {userId: string}) => {
            if (!isValidObjectId(userId)) {throw new Error('Invalid user ID format');}
            const friendRequests = await friendFunctions.getFriendRequests(userId);
            return friendRequests.map(convertUser);
        },
        getSentFriendRequests: async (_: any, {userId}: {userId: string}) => {
            if (!isValidObjectId(userId)) {
                throw new Error('Invalid user ID format');
            }
            const sentFriendRequests = await friendFunctions.getSentFriendRequests(userId);
            return sentFriendRequests.map(convertUser);
        },
        getUserReviews: async (_: any, {userId}: {userId:string}) => {
            if (!isValidObjectId(userId)) {throw new Error('Invalid user ID format');}
            const reviews = await reviewFunctions.getReviewsByUserId(userId);
            return reviews.map(convertReview);
        },
        getReviewsByPlace: async (_: any, {placeId}: {placeId:string}) => {
            if (!placeId || placeId.trim() === '') {
                throw new Error('Place ID cannot be empty');
            }
            const reviews = await reviewFunctions.getReviewsByPlaceId(placeId);
            return reviews.map(convertReview);
        },
        getSavedPlaces: async (_: any, {userId}: {userId:string}) => {
            if (!isValidObjectId(userId)) {throw new Error('Invalid user ID format');}
            return await userFunctions.getSavedPlaces(userId);
        }
    },
    Mutation: {
        createUser: async (
        _: any, 
        { username, firstName, lastName, password }: 
        { username: string; firstName: string; lastName: string; password: string }
        ) => {
            // Basic validation
            if (!username.trim() || !firstName.trim() || !lastName.trim()) {throw new Error('All fields are required');}
            if (password.length < 6) {throw new Error('Password must be at least 6 characters');}

            const user = await userFunctions.createUser({
                username: username.toLowerCase().trim(),
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                password: password.trim()
            });

            return convertUser(user);
        },
        sendFriendRequest: async (
            _: any,
            {currentUserId, friendUsername}:
            {currentUserId: string; friendUsername: string}
        ) => {
            if (!isValidObjectId(currentUserId)) {
                throw new Error('Invalid user ID format');
            }
            if (!friendUsername.trim()) {throw new Error('Friend username is required');}
            console.log('GRAPHQL DEBUG - sendFriendRequest called with:');
            console.log('  currentUserId:', currentUserId);
            console.log('  friendUsername:', friendUsername);
            console.log('  isValidObjectId(currentUserId):', isValidObjectId(currentUserId));
            
            try {
                const updatedUser = await friendFunctions.sendFriendRequest(
                    currentUserId,
                    friendUsername.trim()
                );
                const converted = convertUser(updatedUser);
                // DEBUG: Log after conversion
                return converted;
            } catch (error:any) {
                throw new Error(error.message);
            }
        },
        acceptFriendRequest: async (
            _: any,
            {currentUserId, friendId}:
            {currentUserId: string; friendId: string}
        ) => {
            if (!isValidObjectId(currentUserId) || !isValidObjectId(friendId)) {throw new Error('Invalid user ID format');}
            try {
                const updatedUser = await friendFunctions.acceptFriendRequest(currentUserId, friendId);
                return convertUser(updatedUser);
            } catch (error:any) {
                throw new Error(error.message);
            }
        },
        rejectFriendRequest: async (
            _: any,
            {currentUserId, friendId}:
            {currentUserId: string; friendId: string}
        ) => {
            if (!isValidObjectId(currentUserId) || !isValidObjectId(friendId)) {throw new Error('Invalid user ID format');}
            try {
                const updatedUser = await friendFunctions.rejectFriendRequest(currentUserId, friendId);
                return convertUser(updatedUser);
            } catch (error:any) {
                throw new Error(error.message);
            }
        },
        removeFriend: async (
            _: any,
            {currentUserId, friendId}:
            {currentUserId: string; friendId: string}
        ) => {
            if (!isValidObjectId(currentUserId) || !isValidObjectId(friendId)) {throw new Error('Invalid user ID format');}
            try {
                const updatedUser = await friendFunctions.removeFriend(currentUserId, friendId);
                return convertUser(updatedUser);
            } catch (error:any) {
                throw new Error(error.message);
            }
        },
        createReview: async (
            _: any,
            {userId, placeId, placeName, rating, notes}:
            {userId: string; placeId: string; placeName: string; rating: number; notes?: string}
        ) => {
            if (!isValidObjectId(userId)) {throw new Error('Invalid user ID format');}
            if (!placeId.trim() || !placeName.trim()) {throw new Error('Place ID and name are required');}
            if (rating < 1 || rating > 5) {throw new Error('Rating must be between 1 and 5');}
            try {
                const review = await reviewFunctions.createReview(
                    userId, placeId.trim(), placeName.trim(), rating, notes?.trim()
                );
                return convertReview(review);
            } catch (error:any) {
                throw new Error(error.message);
            }
        },
        deleteReview: async (
            _: any,
            {userId, reviewId}:
            {userId: string; reviewId: string}
        ) => {
            if (!isValidObjectId(userId) || !isValidObjectId(reviewId)) {throw new Error('Invalid ID format');}
            try {
                const success = await reviewFunctions.deleteReview(userId, reviewId);
                return success;
            } catch (error:any) {
                throw new Error(error.message);
            }
        },
        addSavedPlace: async (
            _: any,
            {userId, placeId}:
            {userId: string; placeId: string}
        ) => {
            if (!isValidObjectId(userId)) {throw new Error('Invalid user ID format');}
            if (!placeId.trim()) {throw new Error('Place ID is required');}
            const res = await userFunctions.addSavedPlace(userId, placeId.trim());
            return res; //true if modified, false otherwise
        },
        removeSavedPlace: async (
            _: any,
            {userId, placeId}:
            {userId: string; placeId: string}
        ) => {
            if (!isValidObjectId(userId)) {throw new Error('Invalid user ID format');}
            if (!placeId.trim()) {throw new Error('Place ID is required');}
            const res = await userFunctions.removeSavedPlace(userId, placeId.trim());
            return res; //true if modified, false otherwise
        }
    },
    //Field resolvers
    User: {
        friends: async (parent: any) => {
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
        reviews: async (parent: any) => {
            if (!parent.reviews || parent.reviews.length === 0) {return [];}
            //review has alr been converted
            if (typeof parent.reviews[0] == 'object' && parent.reviews[0].placeName) {
                return parent.reviews;
            }
            const reviews = await reviewFunctions.getReviewsByUserId(parent.id);
            return reviews.map(convertReview);
        },
        sentFriendRequests: async (parent: any) => {
            if (!parent.sentFriendRequests || parent.sentFriendRequests.length === 0) {
                return [];
            }
            //list alr exists and has been converted
            if (typeof parent.sentFriendRequests[0] === 'object' && parent.sentFriendRequests[0].username) {
                return parent.sentFriendRequests;
            }
            //otherwise it dont so get it
            const usersCollection = await users();
            const requestIds = parent.sentFriendRequests.map((id: any) => new ObjectId(id));
            const requests = await usersCollection.find({_id: {$in: requestIds}}).toArray();
            return requests.map(convertUser);
        },
        receivedFriendRequests: async (parent: any) => {
            if (!parent.receivedFriendRequests || parent.receivedFriendRequests.length === 0) {
                return [];
            }
            //list alr exists and has been converted
            if (typeof parent.receivedFriendRequests[0] === 'object' && parent.receivedFriendRequests[0].username) {
                return parent.receivedFriendRequests;
            }
            //otherwise it dont so get it
            const usersCollection = await users();
            const requestIds = parent.receivedFriendRequests.map((id: any) => new ObjectId(id));
            const requests = await usersCollection.find({_id: {$in: requestIds}}).toArray();
            return requests.map(convertUser);            
        }
    }
};