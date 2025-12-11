import express from 'express';
import session from 'express-session';
import {ApolloServer} from '@apollo/server';
import {expressMiddleware} from '@apollo/server/express4';
import {typeDefs} from './graphql/typeDefs.js';
import {resolvers} from './graphql/resolvers.js';
import { createClient } from 'redis';
import { initializeElasticsearch } from './config/elasticsearch.js';


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

app.use(express.json());
app.use(express.urlencoded({extended: true}));

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

app.listen(PORT, () => {
    console.log(`🚀 Server ready at: http://localhost:${PORT}/graphql`);
}); 
    