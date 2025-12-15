import { Client } from '@elastic/elasticsearch';

// Create and export the Elasticsearch client
export const client = new Client({
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200'
});
// Index a city
export const indexCity = async (city) => {
    try {
        await client.index({
            // state for the collection
            index: 'cities',
            // link MongoDB _id to Elasticsearch _id
            id: city._id.toString(),
            //represent the document structure
            document: {
                name: city.name,
                country: city.country,
                lat: city.lat,
                lng: city.lng
            }
        });
    } catch (error) {
        console.error('Error indexing city:', error);
    }
};

// Bulk index all cities (run once to populate)
export const indexAllCities = async (citiesArray) => {
    try {
        const operations = citiesArray.flatMap(city => [
            { index: { _index: 'cities', _id: city._id.toString() } },
            {
                name: city.name,
                country: city.country,
                lat: city.lat,
                lng: city.lng
            }
        ]);
        //refresh true -> Data is searchable instantly.
        const bulkResponse = await client.bulk({ refresh: true, operations });

        if (bulkResponse.errors) {
            console.error('Bulk indexing had errors');
        } else {
            console.log(`Successfully indexed ${citiesArray.length} cities`);
        }
    } catch (error) {
        console.error('Error bulk indexing cities:', error);
    }
};

// Search cities using Elasticsearch
export const searchCitiesElastic = async (query) => {
    try {
        const result = await client.search({
            //refers to the index created for cities
            index: 'cities',
            body: {
                query: {
                    bool: {
                        should: [
                            {
                                match: {
                                    name: {
                                        query: query,
                                        fuzziness: 'AUTO', //allowing for minor typos
                                    }
                                }
                            },
                            {
                                wildcard: {
                                    name: {
                                        value: `*${query.toLowerCase()}*`, //Partial/Substring Match
                                    }
                                }
                            }
                        ],
                        minimum_should_match: 1
                    }
                },
                size: 50
            }
        });

        return result.hits.hits.map(hit => ({
            id: hit._id,
            name: hit._source.name,
            country: hit._source.country,
            lat: hit._source.lat,
            lng: hit._source.lng
        }));
    } catch (error) {
        console.error('Error searching cities:', error);
        return [];
    }
};

// Initialize Elasticsearch connection
export const initializeElasticsearch = async () => {
    try {
        const ping = await client.ping();
        console.log('Success Elasticsearch connected');
        return true;
    } catch (error) {
        console.error('Error Elasticsearch connection failed:', error);
        console.error('Make sure Elasticsearch is running on', process.env.ELASTICSEARCH_URL || 'http://localhost:9200');
        return false;
    }
};