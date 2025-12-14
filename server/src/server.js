import express from 'express';
import session from 'express-session';
import {ApolloServer} from '@apollo/server';
import {expressMiddleware} from '@apollo/server/express4';
import {typeDefs} from './graphql/typeDefs.js';
import {resolvers} from './graphql/resolvers.js';
import { createClient } from 'redis';
import { initializeElasticsearch } from './config/elasticsearch.js';
import { importCitiesIfEmpty } from './db_functions/import_cities.js';
import axios from 'axios';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 4000;

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json({ limit: '10mb'}));
app.use(express.urlencoded({extended: true, limit: '10mb'}));

export const client = createClient({
    url: 'redis://localhost:6379'
});

await client.connect();

try {
    await initializeElasticsearch();
    console.log('Successs Elasticsearch initialized');
} catch (error) {
    console.error('Error  Elasticsearch initialization failed:', error.message);
    console.log('Error Server will continue without Elasticsearch search');
}

app.use(session({
    name: 'AuthenticationState', 
    secret: 'some super secret string!',
    resave: false,
    saveUninitialized: false,
}));

app.use('/public', express.static('public'));

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PHOTOS_ROOT = path.join(__dirname, 'photos');

console.log('Serving photos from:', PHOTOS_ROOT);

// Serve place photos at http://localhost:4000/photos/<placeId>/<file>
app.use('/photos', express.static(PHOTOS_ROOT));

const server = new ApolloServer({
    typeDefs,
    resolvers
});

await server.start();

app.use('/graphql', expressMiddleware(server, {
    context: async ({ req, res }) => {
        return {
            req,
            res,
            session: req.session
        };
    }
}));

try {
    const res = await importCitiesIfEmpty();
    if (res && res.imported) {
        console.log(`Imported ${res.imported} cities documents on startup.`);
    } else if (res && res.reason) {
        console.log('Import skipped:', res.reason);
    }
} catch (err) {
    console.error('Failed to import cities:', err);
}

app.get('/api/maps/places', async (req, res) => {
    const { lat, lng, type } = req.query;

    if (!lat || !lng || !type) {
        return res.status(400).json({ error: 'Missing required query parameters' });
    }

    try {
        const googleKey = process.env.VITE_GOOGLE_MAPS_API_KEY;
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=${type}&key=${googleKey}`;
        console.log('Fetching Google Maps places with URL:', url);
        const response = await axios.get(url);
        // console.log(response)
        res.json(response.data);
    } catch (err) {
        console.error('Error fetching Google Maps places:', err.message);
        res.status(500).json({ error: 'Failed to fetch places' });
    }
});

app.get('/api/place/:placeId/photos', async (req, res) => {
    const { placeId } = req.params;
    const placePhotosDir = path.join(PHOTOS_ROOT, placeId);

    try {
        if (!fs.existsSync(placePhotosDir)) {
            return res.json([]); // No photos yet
        }

        const files = fs.readdirSync(placePhotosDir)
            .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
            .map(file => `/photos/${placeId}/${encodeURIComponent(file)}`);

        res.json(files);
    } catch (err) {
        console.error('Error reading place photos:', err);
        res.status(500).json({ error: 'Failed to load photos' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server ready at: http://localhost:${PORT}/graphql`);
});
