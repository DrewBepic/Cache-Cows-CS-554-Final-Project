import { reviews, users } from '../db_config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import { deletekeywithPattern } from '../config/redishelper.js';

export const createReview = async (userId, placeId, placeName, rating, notes, photos = []) => {
    if (rating < 1 || rating > 5) {
        throw new Error("Rating must be between 1 and 5");
    }

    const usersCollection = await users();
    const userExists = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!userExists) {
        throw new Error("User not found - Cannot create review");
    }

    const newReview = {
        user_id: new ObjectId(userId),
        place_id: placeId,
        place_name: placeName,
        rating: rating,
        notes: notes || '',
        photos: photos,
        createdAt: new Date()
    };
    const reviewsCollection = await reviews();
    const insertResult = await reviewsCollection.insertOne(newReview);
    newReview._id = insertResult.insertedId.toString();
    //since we gotta also add reviewID to user's reviews array
    await usersCollection.updateOne({ _id: new ObjectId(userId) }, { $addToSet: { reviews: new ObjectId(newReview._id) } } //store as list of objectids
    );
    await deletekeywithPattern('topspots:*');
    return newReview;
};
export const getReviewsByUserId = async (userId) => {
    const reviewsCollection = await reviews();
    return await reviewsCollection.find({ user_id: new ObjectId(userId) }).toArray();
};
//used string id since we dont store in our db
export const getReviewsByPlaceId = async (placeId) => {
    const reviewsCollection = await reviews();
    return await reviewsCollection.find({ place_id: placeId }).toArray();
};
export const deleteReview = async (userId, reviewId) => {
    const reviewsCollection = await reviews();
    const review = await reviewsCollection.findOne({
        _id: new ObjectId(reviewId),
        user_id: new ObjectId(userId)
    });
    if (!review) {
        throw new Error('Review not found or you do not have permission to delete it');
    }
    // Delete the review
    const result = await reviewsCollection.deleteOne({ _id: new ObjectId(reviewId) });
    // Remove review ID from user's reviews array
    if (result.deletedCount > 0) {
        const usersCollection = await users();
        await usersCollection.updateOne({ _id: review.user_id }, //since its stored as objectId
        { $pull: { reviews: new ObjectId(reviewId) } });
    }
    await deletekeywithPattern('topspots:*');
    return result.deletedCount > 0;
};
