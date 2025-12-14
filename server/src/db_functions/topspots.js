import { reviews as reviewsCollection, saved_places } from '../db_config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import * as friendFunctions from './friends.js';
import * as userFunctions from './users.js';

// Get global top rated spots
export const getGlobalTopRatedSpots = async (limit = 50, country, city) => {
    const reviewsCol = await reviewsCollection();
    const savedPlacesCol = await saved_places();
    
    const pipeline = [
        {
            $group: {
                _id: "$place_id",
                placeName: { $first: "$place_name" },
                averageRating: { $avg: "$rating" },
                reviewCount: { $sum: 1 },
            }
        },
        { $sort: { averageRating: -1, reviewCount: -1 } }
    ];

    const aggregatedReviews = await reviewsCol.aggregate(pipeline).toArray();
    const placeIds = aggregatedReviews.map(spot => spot._id);
    
    const placesData = await savedPlacesCol.find(
        { place_id: { $in: placeIds } },
        { projection: { place_id: 1, city: 1, country: 1, address: 1, photos: 1, types: 1 } }
    ).toArray();

    const placeDataMap = {};
    placesData.forEach(place => {
        placeDataMap[place.place_id] = {
            city: place.city,
            country: place.country,
            address: place.address,
            photos: place.photos,
            types: place.types
        };
    });

    let results = aggregatedReviews.map(spot => {
        const placeData = placeDataMap[spot._id] || {};
return {
    placeId: spot._id,
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

    return results.slice(0, limit);
};

// Get user and friends top rated spots
export const getUserAndFriendsTopRatedSpots = async (userId, limit = 50, country, city) => {
    const user = await userFunctions.findUserById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    const friends = await friendFunctions.getUserFriends(userId);
    const friendIds = friends.map(friend => new ObjectId(friend._id));
    const allUserIds = [new ObjectId(userId), ...friendIds];

    const reviewsCol = await reviewsCollection();
    const savedPlacesCol = await saved_places();
    
    const pipeline = [
        { $match: { user_id: { $in: allUserIds } } },
        {
            $group: {
                _id: "$place_id",
                placeName: { $first: "$place_name" },
                averageRating: { $avg: "$rating" },
                reviewCount: { $sum: 1 },
                latestReview: { $first: "$$ROOT" }
            }
        },
        { $sort: { averageRating: -1, reviewCount: -1 } }
    ];

    const aggregatedReviews = await reviewsCol.aggregate(pipeline).toArray();
    const placeIds = aggregatedReviews.map(spot => spot._id);
    
    const placesData = await savedPlacesCol.find(
        { place_id: { $in: placeIds } },
        { projection: { place_id: 1, city: 1, country: 1 } }
    ).toArray();

    const placeDataMap = {};
    placesData.forEach(place => {
        placeDataMap[place.place_id] = {
            city: place.city,
            country: place.country
        };
    });

    let results = aggregatedReviews.map(spot => {
        const placeData = placeDataMap[spot._id] || {};
        return {
            placeId: spot._id,
            placeName: spot.placeName,
            averageRating: parseFloat(spot.averageRating.toFixed(2)),
            reviewCount: spot.reviewCount,
            country: placeData.country || null,
            city: placeData.city || null,
            latestReview: spot.latestReview
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