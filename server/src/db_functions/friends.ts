import { users } from '../db_config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import type { User } from '../types/index.js';

//send friend req by username
export const sendFriendRequest = async (currentUserId: string, friendUsername: string): Promise<User> => {
    const usersCollection = await users();
    //Find both users
    const [currentUser, friend] = await Promise.all([
        usersCollection.findOne({ _id: new ObjectId(currentUserId) }),
        usersCollection.findOne({ username: friendUsername })
    ]);

    //check if one does not exist
    if (!currentUser || !friend) {throw new Error("User not found");}

    //make sure theyre not tryna add themself as a friend
    if (currentUser._id.toString() === friend._id.toString()) {
        throw new Error("You cannot add yourself as a friend");
    }

    //make sure theyre not alr ur friend
    const isAlreadyFriend = currentUser.friends.some(
        id => id.toString() === friend._id.toString()
    );
    if (isAlreadyFriend) {throw new Error("Already friends");}

    //and make sure we havent alr sent a request
    const hasSentRequest = currentUser.sent_friend_requests.some(
        id => id.toString() === friend._id.toString()
    );
    if (hasSentRequest) {throw new Error("Friend request already sent");}

    //now check if we've already received a request from that friend
    const hasReceivedRequest = currentUser.received_friend_requests.some(
        id => id.toString() === friend._id.toString()
    );
    if (hasReceivedRequest) {throw new Error("This user has already sent you a friend request");}

    //passed all checks!
    await Promise.all([
        usersCollection.updateOne(
            {_id: currentUser._id},
            { $addToSet: {sent_friend_requests: friend._id} }
        ),
        usersCollection.updateOne(
            {_id: friend._id},
            { $addToSet: {received_friend_requests: currentUser._id} }
        )
    ]);

    //now return updated user w/o password
    const updatedUser = await usersCollection.findOne({_id: currentUser._id});
    const { password, ...userWithoutPassword } = updatedUser!;
    return userWithoutPassword as User;
};

//accept friend request by user id
export const acceptFriendRequest = async (currentUserId: string, friendId: string): Promise<User> => {
    const usersCollection = await users();
    const [currentUser, friend] = await Promise.all([
        usersCollection.findOne({ _id: new ObjectId(currentUserId)}),
        usersCollection.findOne({ _id: new ObjectId(friendId)})
    ]);

    if (!currentUser || !friend) {throw new Error("User not found");}

    //check if request acc exists
    const hasRequest = currentUser.received_friend_requests.some(
        id => id.toString() === friendId
    );
    if (!hasRequest) {throw new Error("No friend request from this user");}

    //below removes the friend from the requests and adds them to friends list
    await Promise.all([
        usersCollection.updateOne(
            {_id: currentUser._id},
            {
                $pull: {received_friend_requests: friend._id},
                $addToSet: {friends: friend._id}
            }
        ),
        usersCollection.updateOne(
            {_id: friend._id},
            {
                $pull: { sent_friend_requests: currentUser._id},
                $addToSet: { friends: currentUser._id }
            }
        )
    ]);

    //now return updaed user w/o password
    const updatedUser = await usersCollection.findOne({_id: currentUser._id});
    const { password, ...userWithoutPassword } = updatedUser!;
    return userWithoutPassword as User;
};

//now reject
export const rejectFriendRequest = async (currentUserId: string, friendId: string): Promise<User> => {
    const usersCollection = await users();
    const [currentUser, friend] = await Promise.all([
        usersCollection.findOne({ _id: new ObjectId(currentUserId)}),
        usersCollection.findOne({ _id: new ObjectId(friendId)})
    ]);

    if (!currentUser || !friend) {throw new Error("User not found");}

    //check if request acc exists
    const hasRequest = currentUser.received_friend_requests.some(
        id => id.toString() === friendId
    );
    if (!hasRequest) {throw new Error("No friend request from this user");}

    //below just removes the friend from the requests
    await Promise.all([
        usersCollection.updateOne(
            {_id: currentUser._id},
            { $pull: {received_friend_requests: friend._id} }
        ),
        usersCollection.updateOne(
            {_id: friend._id},
            { $pull: { sent_friend_requests: currentUser._id} }
        )
    ]);

    const updatedUser = await usersCollection.findOne({_id: currentUser._id});
    const { password, ...userWithoutPassword } = updatedUser!;
    return userWithoutPassword as User;
};

//now unfriend
export const removeFriend = async (currentUserId: string, friendId: string): Promise<User> => {
    const usersCollection = await users();
    const [currentUser, friend] = await Promise.all([
        usersCollection.findOne({ _id: new ObjectId(currentUserId)}),
        usersCollection.findOne({ _id: new ObjectId(friendId)})
    ]);

    if (!currentUser || !friend) {throw new Error("User not found");}
    //check if they are actually friends
    const areFriends = currentUser.friends.some(
        id => id.toString() === friendId
    );
    if (!areFriends) {throw new Error("Users are not friends");}

    await Promise.all([
        usersCollection.updateOne(
            {_id: currentUser._id},
            { $pull: {friends: friend._id} }
        ),
        usersCollection.updateOne(
            {_id: friend._id},
            { $pull: {friends: currentUser._id} }
        )
    ]);

    const updatedUser = await usersCollection.findOne({_id: currentUser._id});
    const { password, ...userWithoutPassword } = updatedUser!;
    return userWithoutPassword as User;
};

//get all friends
export const getUserFriends = async (userId: string): Promise<Omit<User, 'password'>[]> => {
    const usersCollection = await users();
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user || !user.friends.length) {return [];} //no friends or no user

    //otherwise get all friends
    const friendIds = user.friends.map(id => new ObjectId(id));
    const friends = await usersCollection.find({
        _id: {$in: friendIds}
    }).toArray();
    return friends.map(({ password, ...friend }) => friend);
};

//get all friend requests (received)
export const getFriendRequests = async (userId: string): Promise<Omit<User, 'password'>[]> => {
    const usersCollection = await users();
    const user = await usersCollection.findOne({_id: new ObjectId(userId)});
    if (!user || !user.received_friend_requests.length) {return [];}

    const requestIds = user.received_friend_requests.map(id => new ObjectId(id));
    const requests = await usersCollection.find({_id: {$in: requestIds}}).toArray();
    return requests.map(({ password, ...request }) => request);
};

//get all friend requests (sent)
export const getSentFriendRequests = async (userId: string): Promise<Omit<User, 'password'>[]> => {
    const usersCollection = await users();
    const user = await usersCollection.findOne({_id: new ObjectId(userId)});
    if (!user || !user.sent_friend_requests.length) {return [];}

    const requestIds = user.sent_friend_requests.map(id => new ObjectId(id));
    const requests = await usersCollection.find({_id: {$in: requestIds}}).toArray();
    return requests.map(({ password, ...request }) => request);
};
