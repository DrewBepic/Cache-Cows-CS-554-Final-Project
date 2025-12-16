import { client } from '../server.js';

export const getFromCache = async (key) => {
    try {
        const cached = await client.get(key);
        return cached ? JSON.parse(cached) : null;
    } catch (error) {
        console.error(`Redis GET error:`, error);
        return null;
    }
};

export const setCache = async (key, value, ttl) => {
    try {
        await client.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
        console.error(`Redis SET error:`, error);
    }
};

export const deletekeywithPattern = async (pattern) => {
    try {
        const keys = await client.keys(pattern);
        if (keys.length > 0) await client.del(keys);
    } catch (error) {
        console.error(`Error invalidating:`, error);
    }
};