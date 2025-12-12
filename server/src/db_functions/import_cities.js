import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { cities as getCitiesCollection } from '../db_config/mongoCollections.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function importCitiesIfEmpty() {
  const getCol = getCitiesCollection;
  const collection = await getCol();

  const count = await collection.countDocuments();
  if (count > 0) {
    console.log('Cities already imported');
    return { imported: 0, reason: 'already-populated' };
  }

  const filePath = path.join(__dirname, 'world_cities.json');
  if (!fs.existsSync(filePath)) {
    console.log('world_cities.json not found at', filePath);
    return { imported: 0, reason: 'file-not-found' };
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  let cities;
  try {
    cities = JSON.parse(raw);
  } catch (e) {
    return { imported: 0, reason: 'parse-error' };
  }

  if (Array.isArray(cities)) {
    const result = await collection.insertMany(cities);
    return { imported: result.insertedCount };
  } else {
    const result = await collection.insertOne(cities);
    return { imported: 1 };
  }
}
