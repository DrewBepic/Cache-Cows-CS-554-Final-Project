import { places, saved_places } from '../db_config/mongoCollections.js';
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
    const savedCollection = await saved_places();
    const cacheCollection = await places();

    // Check if the place is in saved_places first 
   const directoryPlace = await savedCollection.findOne({ place_id: googlePlaceId });
    if (directoryPlace) {
        console.log(`Found ${googlePlaceId} in Directory (saved_places)`);
        return normalizePlace(directoryPlace);
    }
    
    // Check if the place is in places second
    const cachedPlace = await cacheCollection.findOne({ place_id: googlePlaceId });
    if (cachedPlace) {
        console.log(`Found ${googlePlaceId} in Cache (places)`);
        return normalizePlace(cachedPlace);
    }

    // if we dont have the place, we need to import it from the API
    const gPlace = await fetchGooglePlaceDetails(googlePlaceId);

    // Format the data for our schema
    const newPlace = {
        name: gPlace.name,
        place_id: gPlace.place_id, // The Google ID
        description: gPlace.editorial_summary?.overview || "No description available.",
        address: gPlace.formatted_address,
        city: gPlace.address_components?.find(c => c.types.includes('locality'))?.long_name || "Unknown City",
        country: gPlace.address_components?.find(c => c.types.includes('country'))?.long_name || "Unknown Country",
        geolocation: {
            lat: gPlace.geometry?.location?.lat || 0,
            lng: gPlace.geometry?.location?.lng || 0
        },
        rating: gPlace.rating || 0,
        phone_number: gPlace.formatted_phone_number || "N/A",
        types: gPlace.types || [],
        // Get the first 3 photo references (Google requires a separate API call to display them, but we store the ref)
        photos: gPlace.photos ? gPlace.photos.slice(0, 3).map(p => 
            `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${p.photo_reference}&key=${process.env.VITE_GOOGLE_MAPS_API_KEY}`
        ) : [],
        reviews: [],
        createdAt: new Date()
    };

    // Insert the place into our Places database 
    const insertInfo = await cacheCollection.insertOne(newPlace);
    if (!insertInfo.acknowledged) throw new Error('Failed to save place to database');

   return normalizePlace({ ...newPlace, _id: insertInfo.insertedId });
};

// Get a place normally, checking both saved_places and places
export const getPlaceById = async (id) => {
    if (!ObjectId.isValid(id)) return null;
    const objId = new ObjectId(id);

    const savedCollection = await saved_places();
    const cacheCollection = await places();

    // Check Directory first
    const directoryPlace = await savedCollection.findOne({ _id: objId });
    if (directoryPlace) return normalizePlace(directoryPlace);

    // Check Cache second
    const cachedPlace = await cacheCollection.findOne({ _id: objId });
    if (cachedPlace) return normalizePlace(cachedPlace);

    return null;
};