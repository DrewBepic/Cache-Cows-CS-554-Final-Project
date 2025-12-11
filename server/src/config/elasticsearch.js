import { Client } from '@elastic/elasticsearch';

// Create Elasticsearch client
export const esClient = new Client({
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200'
});

// Index name for saved places
export const SAVED_PLACES_INDEX = 'saved_places';

// Initialize Elasticsearch index
export const initializeElasticsearch = async () => {
    try {
        // Check if index exists
        const indexExists = await esClient.indices.exists({
            index: SAVED_PLACES_INDEX
        });

        if (!indexExists) {
            // Create index with mappings
            await esClient.indices.create({
                index: SAVED_PLACES_INDEX,
                body: {
                    mappings: {
                        properties: {
                            id: { type: 'keyword' },
                            name: { 
                                type: 'text',
                                fields: {
                                    keyword: { type: 'keyword' },
                                    completion: { type: 'completion' }
                                }
                            },
                            description: { type: 'text' },
                            city: { 
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
                            user_id: { type: 'keyword' },
                            photos: { type: 'keyword' },
                            createdAt: { type: 'date' }
                        }
                    }
                }
            });
            console.log(`✅ Created Elasticsearch index: ${SAVED_PLACES_INDEX}`);
        } else {
            console.log(`✅ Elasticsearch index already exists: ${SAVED_PLACES_INDEX}`);
        }

        // Test connection
        await esClient.ping();
        console.log('✅ Elasticsearch connection successful');
    } catch (error) {
        console.error('❌ Elasticsearch initialization error:', error.message);
        throw error;
    }
};

// Index a saved place document
export const indexSavedPlace = async (place) => {
    try {
        await esClient.index({
            index: SAVED_PLACES_INDEX,
            id: place._id.toString(),
            document: {
                id: place._id.toString(),
                name: place.name,
                description: place.description || '',
                city: place.city,
                country: place.country,
                user_id: place.user_id.toString(),
                photos: place.photos || [],
                createdAt: place.createdAt
            }
        });
        console.log(`✅ Indexed saved place: ${place.name}`);
    } catch (error) {
        console.error('❌ Error indexing saved place:', error.message);
    }
};

// Update a saved place document
export const updateSavedPlaceIndex = async (placeId, updates) => {
    try {
        await esClient.update({
            index: SAVED_PLACES_INDEX,
            id: placeId,
            doc: updates
        });
        console.log(`✅ Updated saved place index: ${placeId}`);
    } catch (error) {
        console.error('❌ Error updating saved place index:', error.message);
    }
};

// Delete a saved place document
export const deleteSavedPlaceIndex = async (placeId) => {
    try {
        await esClient.delete({
            index: SAVED_PLACES_INDEX,
            id: placeId
        });
        console.log(`✅ Deleted saved place from index: ${placeId}`);
    } catch (error) {
        console.error('❌ Error deleting saved place from index:', error.message);
    }
};

// Search saved places
export const searchSavedPlacesElastic = async (query, userId = null) => {
    try {
        const must = [
            {
                multi_match: {
                    query: query,
                    fields: ['name^3', 'city^2', 'country^2', 'description'],
                    fuzziness: 'AUTO'
                }
            }
        ];

        // Optional: Filter by user
        if (userId) {
            must.push({
                term: { user_id: userId }
            });
        }

        const result = await esClient.search({
            index: SAVED_PLACES_INDEX,
            body: {
                query: {
                    bool: { must }
                },
                size: 50
            }
        });

        return result.hits.hits.map(hit => hit._source);
    } catch (error) {
        console.error('❌ Elasticsearch search error:', error.message);
        return [];
    }
};

// Get autocomplete suggestions
export const getAutocompleteSuggestions = async (prefix) => {
    try {
        const result = await esClient.search({
            index: SAVED_PLACES_INDEX,
            body: {
                suggest: {
                    place_suggest: {
                        prefix: prefix,
                        completion: {
                            field: 'name.completion',
                            size: 10,
                            fuzzy: {
                                fuzziness: 'AUTO'
                            }
                        }
                    }
                }
            }
        });

        return result.suggest.place_suggest[0].options.map(option => ({
            text: option.text,
            score: option._score
        }));
    } catch (error) {
        console.error('❌ Autocomplete error:', error.message);
        return [];
    }
};

// Bulk index all existing saved places (for initial setup)
export const bulkIndexSavedPlaces = async (places) => {
    try {
        const operations = places.flatMap(place => [
            { index: { _index: SAVED_PLACES_INDEX, _id: place._id.toString() } },
            {
                id: place._id.toString(),
                name: place.name,
                description: place.description || '',
                city: place.city,
                country: place.country,
                user_id: place.user_id.toString(),
                photos: place.photos || [],
                createdAt: place.createdAt
            }
        ]);

        const result = await esClient.bulk({ operations });
        console.log(`✅ Bulk indexed ${places.length} saved places`);
        return result;
    } catch (error) {
        console.error('❌ Bulk index error:', error.message);
    }
};