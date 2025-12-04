import { reviews, users } from '../db_config/mongoCollections.js';
import {ObjectId} from 'mongodb';
import type { Review } from '../types/index.js';

export const createReview = async (
    userId: string,
    placeId: string,
    placeName: string,
    rating: number,
    notes?: string
): Promise<Review> => {
    if (rating < 1 || rating > 5) {throw new Error("Rating must be between 1 and 5");}
    const newReview: Review = {
        user_id: new ObjectId(userId),
        place_id: placeId,
        place_name: placeName,
        rating: rating,
        notes: notes || '',
        createdAt: new Date()
    };

    const reviewsCollection = await reviews();
    const insertResult = await reviewsCollection.insertOne(newReview);
    newReview._id = insertResult.insertedId.toString();

    //since we gotta also add reviewID to user's reviews array
    const usersCollection = await users();
    await usersCollection.updateOne(
        {_id: new ObjectId(userId)},
        { $addToSet: {reviews: new ObjectId(newReview._id)}} //store as list of objectids
    );
    return newReview;

};

export const getReviewsByUserId = async (userId: string): Promise<Review[]> => {
    const reviewsCollection = await reviews();
    return await reviewsCollection.find({user_id: new ObjectId(userId)}).toArray();
};

//used string id since we dont store in our db
export const getReviewsByPlaceId = async (placeId: string): Promise<Review[]> => {
    const reviewsCollection = await reviews();
    return await reviewsCollection.find({place_id: placeId}).toArray();
};

export const deleteReview = async (reviewId: string): Promise<boolean> => {
    const reviewsCollection = await reviews();
    const review = await reviewsCollection.findOne({ _id: new ObjectId(reviewId) });
    if (!review) {return false;}

    // Delete the review
    const result = await reviewsCollection.deleteOne({ _id: new ObjectId(reviewId) });

    // Remove review ID from user's reviews array
    if (result.deletedCount > 0) {
        const usersCollection = await users();
        await usersCollection.updateOne(
            { _id: review.user_id }, //since its stored as objectId
            { $pull: { reviews: new ObjectId(reviewId) } }
        );
    }

    return result.deletedCount > 0;
};
