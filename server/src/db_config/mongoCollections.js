import { dbConnection } from './mongoConnection.js';
const getCollectionFn = (collection) => {
    let _col = undefined;
    return async () => {
        if (!_col) {
            const db = await dbConnection();
            _col = await db.collection(collection);
        }
        return _col;
    };
};
//Typescript
//assume we only use db for users, reviews and saved places for now
export const users = getCollectionFn('users');
export const reviews = getCollectionFn('reviews');
export const saved_places = getCollectionFn('saved_places');
export const UScities = getCollectionFn('us_cities');