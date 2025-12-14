import { places, saved_places } from '../db_config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import axios from 'axios';
import 'dotenv/config'
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

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

const fetchAndStoreGooglePhoto = async (photoReference, placeId, index) => {
    try {
        const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;
        const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoReference}&key=${apiKey}`;

        // Fetch the image as arraybuffer
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data, 'binary');

        // Ensure the place-specific folder exists
        const placeDir = path.join(path.resolve(process.cwd(), 'server', 'src', 'photos'), placeId);
        if (!fs.existsSync(placeDir)) fs.mkdirSync(placeDir, { recursive: true });

        // Temporary path to store raw image
        const tempPath = path.join(placeDir, `${index}-temp.jpg`);
        fs.writeFileSync(tempPath, buffer);

        // Final path after ImageMagick processing
        const finalPath = path.join(placeDir, `${index}.jpg`);

        // Process the image with ImageMagick
        await new Promise((resolve, reject) => {
            exec(`magick convert "${tempPath}" -quality 80 "${finalPath}"`, (err) => {
                if (err) return reject(err);
                fs.unlinkSync(tempPath); // delete temp file
                resolve();
            });
        });

        console.log(`Saved processed image: ${finalPath}`);
        return `${placeId}/${index}.jpg`; // return relative path
    } catch (error) {
        console.error('Error fetching or saving photo:', error);
        throw error;
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

    const storedPhotos = [];
    if (gPlace.photos && gPlace.photos.length > 0) {
        for (let i = 0; i < Math.min(3, gPlace.photos.length); i++) {
            const photoReference = gPlace.photos[i].photo_reference;
            try {
                const localFile = await fetchAndStoreGooglePhoto(photoReference, gPlace.place_id, i + 1);
                storedPhotos.push(localFile);
            } catch (err) {
                console.error(`Failed to fetch/store photo ${i + 1} for place ${gPlace.place_id}:`, err);
            }
        }
    }


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
        photos: storedPhotos,
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