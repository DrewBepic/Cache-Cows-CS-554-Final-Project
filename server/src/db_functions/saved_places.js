import { saved_places, users } from '../db_config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import { 
    indexSavedPlace, 
    updateSavedPlaceIndex, 
    deleteSavedPlaceIndex 
} from '../config/elasticsearch.js';

// Create a new saved place
export const createSavedPlace = async (userId, placeData) => {
    const newPlace = {
        place_id: placeData.place_id,   // Google Place ID (string)
        name: placeData.name,
        description: placeData.description || '',
        address: placeData.address,
        city: placeData.city,
        country: placeData.country,
        geolocation: placeData.geolocation,
        rating: placeData.rating,
        phone_number: placeData.phone_number,
        types: placeData.types || [],
        photos: placeData.photos || [],
        reviews: [],                    // start empty
        createdAt: new Date()
    };

    const savedPlacesCollection = await saved_places();
    const insertResult = await savedPlacesCollection.insertOne(newPlace);
    newPlace._id = insertResult.insertedId;

    // Add saved place ID to user's saved_places array
    const usersCollection = await users();
    await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $addToSet: { saved_places: insertResult.insertedId } }
    );
    
    await indexSavedPlace(newPlace); //index for elasticsearch
    
    return newPlace;
};

// Get saved place by ID
export const getSavedPlaceById = async (placeId) => {
    const savedPlacesCollection = await saved_places();
    try {
        return await savedPlacesCollection.findOne({ _id: new ObjectId(placeId) });
    } catch (error) {
        return null;
    }
};

// Get saved place by Google Place ID
export const getSavedPlaceByPlaceId = async (placeId) => {
    const savedPlacesCollection = await saved_places();
    try {
        return await savedPlacesCollection.findOne({ place_id: placeId });
    } catch (error) {
        return null;
    }
};

// Get all saved places for a user
export const getUserSavedPlaces = async (userId) => {
    const usersCollection = await users();
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
    if (!user || !user.saved_places || user.saved_places.length === 0) {
        return [];
    }

    const savedPlacesCollection = await saved_places();
    const placeIds = user.saved_places.map(id => new ObjectId(id));
    return await savedPlacesCollection.find({ _id: { $in: placeIds } }).toArray();
};

// Update a saved place
export const updateSavedPlace = async (placeId, updates) => {
    const savedPlacesCollection = await saved_places();
    
    // Build update object with only provided fields
    const updateFields = {};
    if (updates.name !== undefined) updateFields.name = updates.name;
    if (updates.description !== undefined) updateFields.description = updates.description;
    if (updates.city !== undefined) updateFields.city = updates.city;
    if (updates.country !== undefined) updateFields.country = updates.country;
    if (updates.photos !== undefined) updateFields.photos = updates.photos;

    const result = await savedPlacesCollection.findOneAndUpdate(
        { _id: new ObjectId(placeId) },
        { $set: updateFields },
        { returnDocument: 'after' }
    );
    await updateSavedPlaceIndex(placeId, updateFields); //update elasticsearch index

    return result;
};

// Delete a saved place
export const deleteSavedPlace = async (userId, placeId) => {
    const savedPlacesCollection = await saved_places();
    
    // Check if place exists and belongs to user
    const place = await savedPlacesCollection.findOne({
        _id: new ObjectId(placeId),
        user_id: new ObjectId(userId)
    });

    if (!place) {
        throw new Error('Saved place not found or you do not have permission to delete it');
    }

    // Delete the saved place
    const result = await savedPlacesCollection.deleteOne({ _id: new ObjectId(placeId) });

    // Remove place ID from user's saved_places array
    if (result.deletedCount > 0) {
        const usersCollection = await users();
        await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $pull: { saved_places: new ObjectId(placeId) } }
        );
        await deleteSavedPlaceIndex(placeId); //delete from elasticsearch
    }

    return result.deletedCount > 0;
};

// Add a photo to a saved place
export const addPhotoToPlace = async (placeId, photoUrl) => {
    const savedPlacesCollection = await saved_places();
    const result = await savedPlacesCollection.updateOne(
        { _id: new ObjectId(placeId) },
        { $addToSet: { photos: photoUrl } } // Prevents duplicates
    );
    return result.modifiedCount > 0;
};

// Remove a photo from a saved place
export const removePhotoFromPlace = async (placeId, photoUrl) => {
    const savedPlacesCollection = await saved_places();
    const result = await savedPlacesCollection.updateOne(
        { _id: new ObjectId(placeId) },
        { $pull: { photos: photoUrl } }
    );
    return result.modifiedCount > 0;
};

// Search saved places by name or city
export const searchSavedPlaces = async (searchTerm) => {
    const savedPlacesCollection = await saved_places();
    const regex = new RegExp(searchTerm, 'i');
    
    return await savedPlacesCollection.find({
        $or: [
            { name: { $regex: regex } },
            { city: { $regex: regex } },
            { country: { $regex: regex } }
        ]
    }).toArray();
};

// Add a review to a saved place
export const addReviewToPlace = async (placeId, reviewId) => {
    const savedPlacesCollection = await saved_places();
    const result = await savedPlacesCollection.updateOne(
        { _id: new ObjectId(placeId) },
        { $addToSet: { reviews: new ObjectId(reviewId) } }
    );
    return result.modifiedCount > 0;
};

// Remove a review from a saved place
export const removeReviewFromPlace = async (placeId, reviewId) => {
    const savedPlacesCollection = await saved_places();
    const result = await savedPlacesCollection.updateOne(
        { _id: new ObjectId(placeId) },
        { $pull: { reviews: new ObjectId(reviewId) } }
    );
    return result.modifiedCount > 0;
};

// Elasticsearch search function
export const searchSavedPlacesElastic = async (searchTerm, userId = null) => {
    // Import at top of function to avoid circular dependency
    const { searchSavedPlacesElastic: esSearch } = await import('../config/elasticsearch.js');
    
    const results = await esSearch(searchTerm, userId);
    
    // Convert ES results back to MongoDB ObjectIds
    return results.map(result => ({
        _id: new ObjectId(result.id),
        place_id: result.place_id,
        name: result.name,
        description: result.description,
        city: result.city,
        country: result.country,
        photos: result.photos,
        reviews: [],
        createdAt: new Date(result.createdAt)
    }));
};

// Get location data for multiple places by Google Place IDs
export const getPlaceLocationsByPlaceIds = async (placeIds) => {
    const savedPlacesCollection = await saved_places();
    
    const places = await savedPlacesCollection.find(
        { place_id: { $in: placeIds } },
        { projection: { place_id: 1, city: 1, country: 1, address: 1, photos: 1, types: 1 } }
    ).toArray();
    
    // Return as a map for easy lookup
    const locationMap = {};
    places.forEach(place => {
        locationMap[place.place_id] = {
            city: place.city,
            country: place.country,
            address: place.address,
            photos: place.photos,
            types: place.types
        };
    });
    
    return locationMap;
};