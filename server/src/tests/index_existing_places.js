import { saved_places } from '../db_config/mongoCollections.js';
import { bulkIndexSavedPlaces } from '../config/elasticsearch.js';

const indexExistingPlaces = async () => {
    try {
        console.log('Starting bulk index of existing saved places...');
        
        const savedPlacesCollection = await saved_places();
        const allPlaces = await savedPlacesCollection.find({}).toArray();
        
        console.log(`Found ${allPlaces.length} saved places to index`);
        
        if (allPlaces.length > 0) {
            await bulkIndexSavedPlaces(allPlaces);
            console.log('Success  Bulk indexing complete!');
        } else {
            console.log('Error  No saved places found to index');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error Bulk index error:', error);
        process.exit(1);
    }
};

indexExistingPlaces();