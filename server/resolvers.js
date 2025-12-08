import { GraphQLError } from 'graphql';
import { ObjectId } from 'mongodb';
import { dbConnection } from './config/mongoConnection.js';

import {
    users as usersCollection,
    reviews as reviewsCollection
} from '../config/mongoCollections.js';

const Mutation = {
    login: async (_, { email, password }, context) => {
        try {
            const user = await userCommands.userLogin(email, password);
            context.req.session.user = user;
            return user;
        } 
        catch (error) {
            throw new Error('Invalid email or password');
        }
    }
};

export const resolvers = {
    Mutation
};