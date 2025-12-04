import {MongoClient, Db} from 'mongodb';
import {mongoConfig} from './settings.js';

let _connection: MongoClient | undefined = undefined;
let _db: Db | undefined = undefined;

const dbConnection = async (): Promise<Db> => {
  if (!_connection) {
    _connection = await MongoClient.connect(mongoConfig.serverUrl);
    _db = _connection.db(mongoConfig.database);
  }

  return _db!;
};
const closeConnection = async (): Promise<void> => {
  await _connection!.close();
};

export {dbConnection, closeConnection};
