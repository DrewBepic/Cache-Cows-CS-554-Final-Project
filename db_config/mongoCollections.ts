import { get } from 'http';
import { User, Review} from "../types/index.js";
import { Db, Collection, Document} from 'mongodb';
import {dbConnection} from './mongoConnection.js';

const getCollectionFn = <T extends Document>(collection: string) => {
  let _col: Collection<T> | undefined = undefined;

  return async (): Promise<Collection<T>> => {
    if (!_col) {
      const db: Db = await dbConnection();
      _col = await db.collection<T>(collection);
    }

    return _col;
  };
};

//Typescript

//assume we only use db for users, reviews and saved places for now
export const users = getCollectionFn<User>('users');
export const reviews = getCollectionFn<Review>('reviews');
export const saved_places = getCollectionFn<Document>('saved_places');