import { places } from '../db_config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import axios from 'axios';
import 'dotenv/config'

// Helper to standardize the object
const normalizePlace = (place) => ({
    ...place,
    _id: place._id.toString(),
    reviews: place.reviews || [],
    photos: place.photos || [],
    types: place.types || []
});

// Get all details of a place through Google Maps API
const fetchGooglePlaceDetails = async (googlePlaceId) => {
    const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${googlePlaceId}&key=${apiKey}`;
    
    try {
        const { data } = await axios.get(url);
        if (!data || data.status !== 'OK') throw new Error('Google API Error');
        return data.result;
    } catch (e) {
        throw new Error(`Failed to fetch details for ${googlePlaceId}: ${e.message}`);
    }
};

// Decide whether to import or get a place depending if it already exists in the database
export const getOrImportPlace = async (googlePlaceId) => {
    const collection = await places();

    const existingPlace = await collection.findOne({ place_id: googlePlaceId });
    if (existingPlace) {
        return normalizePlace(existingPlace);
    }

    console.log(`Importing ${googlePlaceId} from Google...`);
    const gPlace = await fetchGooglePlaceDetails(googlePlaceId);

    const newPlace = {
        name: gPlace.name,
        place_id: gPlace.place_id, // Google ID
        description: gPlace.editorial_summary?.overview || "No description available.",
        address: gPlace.formatted_address,
        city: gPlace.address_components?.find(c => c.types.includes('locality'))?.long_name || "",
        country: gPlace.address_components?.find(c => c.types.includes('country'))?.long_name || "",
        geolocation: {
            lat: gPlace.geometry?.location?.lat || 0,
            lng: gPlace.geometry?.location?.lng || 0
        },
        rating: gPlace.rating || 0,
        phone_number: gPlace.formatted_phone_number || "",
        types: gPlace.types || [],
        // Store first 3 photo URLs
        photos: gPlace.photos ? gPlace.photos.slice(0, 3).map(p => 
            `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${p.photo_reference}&key=${process.env.VITE_GOOGLE_MAPS_API_KEY}`
        ) : [],
        reviews: [], // Will store MongoDB _ids of reviews
        createdAt: new Date()
    };

    const insertInfo = await collection.insertOne(newPlace);
    if (!insertInfo.acknowledged) throw new Error('Failed to save place');

    return normalizePlace({ ...newPlace, _id: insertInfo.insertedId });
};

// Get a place normally, checking both saved_places and places
export const getPlaceById = async (id) => {
    if (!ObjectId.isValid(id)) return null;
    const collection = await places();
    const place = await collection.findOne({ _id: new ObjectId(id) });
    return place ? normalizePlace(place) : null;
};

export const addReviewToPlace = async (placeId, reviewId) => {
    if (!ObjectId.isValid(placeId) || !ObjectId.isValid(reviewId)) return false;
    const collection = await places();
    const result = await collection.updateOne(
        { _id: new ObjectId(placeId) },
        { $addToSet: { reviews: new ObjectId(reviewId) } }
    );
    return result.modifiedCount > 0;
};

export const removeReviewFromPlace = async (placeId, reviewId) => {
    if (!ObjectId.isValid(placeId) || !ObjectId.isValid(reviewId)) return false;
    const collection = await places();
    const result = await collection.updateOne(
        { _id: new ObjectId(placeId) },
        { $pull: { reviews: new ObjectId(reviewId) } }
    );
    return result.modifiedCount > 0;
};