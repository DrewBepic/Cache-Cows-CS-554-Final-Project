import { client } from '../config/elasticsearch.js';
import { cities } from '../db_config/mongoCollections.js';
import { indexAllCities } from '../config/elasticsearch.js';

const setupCityIndex = async () => {
    try {
        // Delete existing index if it exists
        const indexExists = await client.indices.exists({ index: 'cities' });
        if (indexExists) {
            await client.indices.delete({ index: 'cities' });
            console.log('  Deleted existing cities index');
        }

        // Create index with mapping
        await client.indices.create({
            index: 'cities',
            body: {
                mappings: {
                    properties: {
                        name: {
                            type: 'text',
                            fields: {
                                keyword: { type: 'keyword' }
                            }
                        },
                        country: {
                            type: 'text',
                            fields: {
                                keyword: { type: 'keyword' }
                            }
                        },
                        lat: { type: 'float' },
                        lng: { type: 'float' }
                    }
                }
            }
        });
        console.log('✅ Success Created cities index');

        // Index all cities from MongoDB
        const citiesCollection = await cities();
        const allCities = await citiesCollection.find({}).toArray();
        
        await indexAllCities(allCities);
        console.log(`✅ Success Indexed ${allCities.length} cities`);

    } catch (error) {
        console.error('Error setting up city index:', error);
    }
};

export default setupCityIndex; 