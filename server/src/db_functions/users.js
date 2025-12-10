import { users } from "../db_config/mongoCollections.js";
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
export const createUser = async (userData) => {
    //im assuming checks were done b4 calling this function
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    const newUser = {
        username: userData.username,
        first_name: userData.first_name,
        last_name: userData.last_name,
        password: hashedPassword,
        friends: [],
        sent_friend_requests: [],
        received_friend_requests: [],
        reviews: [],
        saved_places: [],
    };
    const usersCollection = await users();
    const insertResult = await usersCollection.insertOne(newUser);
    newUser._id = insertResult.insertedId.toString();
    const { password, ...user_without_password } = newUser;
    return user_without_password;
};
export const findUserByUsername = async (username) => {
    const usersCollection = await users();
    return await usersCollection.findOne({ username: username });
};
export const findUserById = async (userId) => {
    const usersCollection = await users();
    try {
        return await usersCollection.findOne({ _id: new ObjectId(userId) });
    }
    catch (error) {
        return null;
    }
};
export const searchUsersByUsername = async (searchTerm) => {
    const usersCollection = await users();
    const regex = new RegExp(searchTerm, 'i');
    const res = await usersCollection.find({ username: { $regex: regex } })
        .toArray();
    return res.map((user) => {
        const { password, ...user_without_password } = user;
        return user_without_password;
    });
};
//saved places functions
export const addSavedPlace = async (userId, placeId) => {
    const usersCollection = await users();
    const result = await usersCollection.updateOne({ _id: new ObjectId(userId) }, { $addToSet: { saved_places: placeId } } //as a string btw - also this prevents duplicates
    );
    return result.modifiedCount > 0;
};
export const removeSavedPlace = async (userId, placeId) => {
    const usersCollection = await users();
    const result = await usersCollection.updateOne({ _id: new ObjectId(userId) }, { $pull: { saved_places: placeId } });
    return result.modifiedCount > 0;
};
export const getSavedPlaces = async (userId) => {
    const user = await findUserById(userId);
    return user?.saved_places.map(place => place.toString()) || [];
};
