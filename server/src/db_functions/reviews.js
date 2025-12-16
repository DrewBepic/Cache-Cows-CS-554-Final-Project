import { reviews, users, comparisonSessions } from '../db_config/mongoCollections.js';
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
        createdAt: new Date(),
        finalRating: null,
    };
    const reviewsCollection = await reviews();
    const insertResult = await reviewsCollection.insertOne(newReview);
    newReview._id = insertResult.insertedId.toString();

    await usersCollection.updateOne({ _id: new ObjectId(userId) }, { $addToSet: { reviews: new ObjectId(newReview._id) } });
    await deletekeywithPattern('topspots:*');
    return newReview;
};

export const getReviewsByUserId = async (userId) => {
    const reviewsCollection = await reviews();
    return await reviewsCollection.find({ user_id: new ObjectId(userId) }).toArray();
};

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

    const result = await reviewsCollection.deleteOne({ _id: new ObjectId(reviewId) });

    if (result.deletedCount > 0) {
        const usersCollection = await users();
        await usersCollection.updateOne(
            { _id: review.user_id },
            { $pull: { reviews: new ObjectId(reviewId) } }
        );
    }
    await deletekeywithPattern('topspots:*');
    return result.deletedCount > 0;
};

export const getComparisonCandidates = async (userId, newReviewId) => {
    const reviewsCollection = await reviews();

    const newReview = await reviewsCollection.findOne({ _id: new ObjectId(newReviewId) });
    if (!newReview) {
        throw new Error('Review not found');
    }

    const existingReviews = await reviewsCollection
        .find({
            user_id: new ObjectId(userId),
            _id: { $ne: new ObjectId(newReviewId) }
        })
        .sort({ rating: 1 })
        .toArray();

    if (existingReviews.length < 2) {
        await reviewsCollection.updateOne(
            { _id: new ObjectId(newReviewId) },
            { $set: { finalRating: newReview.rating } }
        );
        return null;
    }

    // Find two closest rated reviews
    let closest1 = null;
    let closest2 = null;
    let minDiff = Infinity;

    for (let i = 0; i < existingReviews.length - 1; i++) {
        const review1 = existingReviews[i];
        const review2 = existingReviews[i + 1];

        if (review1.rating <= newReview.rating && review2.rating >= newReview.rating) {
            const diff1 = Math.abs(review1.rating - newReview.rating);
            const diff2 = Math.abs(review2.rating - newReview.rating);
            const totalDiff = diff1 + diff2;

            if (totalDiff < minDiff) {
                minDiff = totalDiff;
                closest1 = review1;
                closest2 = review2;
            }
        }
    }

    // If not between any two, find the two closest on one of the sides
    if (!closest1 || !closest2) {
        const sorted = existingReviews
            .map(r => ({
                ...r,
                diff: Math.abs(r.rating - newReview.rating)
            }))
            .sort((a, b) => a.diff - b.diff);

        closest1 = sorted[0];
        closest2 = sorted[1] || sorted[0];
    }

    return {
        newReviewId: newReviewId,
        candidate1: {
            id: closest1._id.toString(),
            placeName: closest1.place_name,
            rating: closest1.rating
        },
        candidate2: {
            id: closest2._id.toString(),
            placeName: closest2.place_name,
            rating: closest2.rating
        }
    };
};

export const finalizeComparativeRating = async (reviewId, chosenCandidateRating, comparison) => {
    const reviewsCollection = await reviews();

    let finalRating;

    if (comparison === 'SAME') {
        finalRating = chosenCandidateRating;
    }
    else if (comparison === 'BETTER') {
        finalRating = Math.min(5, chosenCandidateRating + 0.5);
    }
    else if (comparison === 'WORSE') {
        finalRating = Math.max(1, chosenCandidateRating - 0.5);
    }
    else {
        throw new Error('Invalid comparison. Must be BETTER, WORSE, or SAME');
    }

    await reviewsCollection.updateOne(
        { _id: new ObjectId(reviewId) },
        { $set: { finalRating: finalRating, rating: finalRating } }
    );
    await deletekeywithPattern('topspots:*');

    return finalRating;
};