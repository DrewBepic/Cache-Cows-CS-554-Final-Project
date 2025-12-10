import { saved_places, users } from '../db_config/mongoCollections.js';
import { ObjectId } from 'mongodb';

// Create a new saved place
export const createSavedPlace = async (userId, name, description, city, country, photos) => {
    const newSavedPlace = {
        user_id: new ObjectId(userId),
        name: name,
        description: description || '',
        city: city,
        country: country,
        photos: photos || [],
        reviews: [], // Array of review ObjectIds
        createdAt: new Date()
    };

    const savedPlacesCollection = await saved_places();
    const insertResult = await savedPlacesCollection.insertOne(newSavedPlace);
    newSavedPlace._id = insertResult.insertedId.toString();

    // Add saved place ID to user's saved_places array
    const usersCollection = await users();
    await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $addToSet: { saved_places: insertResult.insertedId } }
    );

    return newSavedPlace;
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