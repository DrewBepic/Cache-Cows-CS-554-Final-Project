import { reviews as reviewsCollection, places } from '../db_config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import * as friendFunctions from './friends.js';
import * as userFunctions from './users.js';

// Get global top rated spots
export const getGlobalTopRatedSpots = async (limit = 10, country, city) => {
    const reviewsCol = await reviewsCollection();
    const placesCol = await places();
    // add aggregation pipeline to calculate average ratings and review counts
    const pipeline = [
        {
            $group: {
                _id: "$place_id",
                placeName: { $first: "$place_name" },
                averageRating: { $avg: "$rating" },
                reviewCount: { $sum: 1 },
            }
        },
        // Sort by averageRating descending, then by reviewCount descending
        { $sort: { averageRating: -1, reviewCount: -1 } }
    ];
    //get aggregated reviews to array
    const aggregatedReviews = await reviewsCol.aggregate(pipeline).toArray();
    const placeObjectIds = aggregatedReviews.map(spot => new ObjectId(spot._id));
    // Fetch place details from places collection so that we get city and country info
    const placesData = await placesCol.find(
        { _id: { $in: placeObjectIds } },
        { projection: { _id: 1, city: 1, country: 1, address: 1, photos: 1, types: 1 } }
    ).toArray();
    // create a map for easy lookup and prepare to match results
    const placeDataMap = {};
    placesData.forEach(place => {
        placeDataMap[place._id.toString()] = {
            city: place.city,
            country: place.country,
            address: place.address,
            photos: place.photos,
            types: place.types
        };
    });
    // Map aggregated reviews to TopRatedSpot format
    let results = aggregatedReviews.map(spot => {
        const placeData = placeDataMap[spot._id.toString()] || {};

        return {
            placeId: spot._id.toString(),
            placeName: spot.placeName,
            averageRating: parseFloat(spot.averageRating.toFixed(2)),
            reviewCount: spot.reviewCount,
            country: placeData.country || null,
            city: placeData.city || null
        };
    });

    // Apply filters
    if (country) {
        results = results.filter(spot =>
            spot.country && spot.country.toLowerCase() === country.toLowerCase()
        );
    }
    if (city) {
        results = results.filter(spot =>
            spot.city && spot.city.toLowerCase() === city.toLowerCase()
        );
    }

    return results.slice(0, limit); // return only up to the specified limit to avoid excessive data
};

// Get user and friends top rated spots
export const getUserAndFriendsTopRatedSpots = async (userId, limit = 10, country, city) => {
    const user = await userFunctions.findUserById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    // Get friends' IDs
    const friends = await friendFunctions.getUserFriends(userId);
    const friendIds = friends.map(friend => new ObjectId(friend._id));
    // Combine user ID with friends' IDs
    // const allUserIds = [new ObjectId(userId), ...friendIds];
    const allUserIds = friendIds;

    const reviewsCol = await reviewsCollection();
    const placesCol = await places();
    // Aggregation pipeline to calculate average ratings and review counts for user and friends
    const pipeline = [
        { $match: { user_id: { $in: allUserIds } } },
        {
            $group: {
                _id: "$place_id",
                placeName: { $first: "$place_name" },
                averageRating: { $avg: "$rating" },
                reviewCount: { $sum: 1 },
            }
        },
        // Sort by averageRating descending, then by reviewCount descending
        { $sort: { averageRating: -1, reviewCount: -1 } }
    ];
    // Get aggregated reviews to array
    const aggregatedReviews = await reviewsCol.aggregate(pipeline).toArray();
    const placeObjectIds = aggregatedReviews.map(spot => new ObjectId(spot._id));
    // Fetch place details from places collection to get city and country info
    const placesData = await placesCol.find(
        { _id: { $in: placeObjectIds } },
        { projection: { _id: 1, city: 1, country: 1 } }
    ).toArray();
    //prepare place data map and match results
    const placeDataMap = {};
    placesData.forEach(place => {
        placeDataMap[place._id.toString()] = {
            city: place.city,
            country: place.country
        };
    });
    // Map aggregated reviews to TopRatedSpot format
    let results = aggregatedReviews.map(spot => {
        const placeData = placeDataMap[spot._id.toString()] || {};

        return {
            placeId: spot._id.toString(),
            placeName: spot.placeName,
            averageRating: parseFloat(spot.averageRating.toFixed(2)),
            reviewCount: spot.reviewCount,
            country: placeData.country || null,
            city: placeData.city || null,
        };
    });

    // Apply filters
    if (country) {
        results = results.filter(spot =>
            spot.country && spot.country.toLowerCase() === country.toLowerCase()
        );
    }
    if (city) {
        results = results.filter(spot =>
            spot.city && spot.city.toLowerCase() === city.toLowerCase()
        );
    }

    return results.slice(0, limit);
};