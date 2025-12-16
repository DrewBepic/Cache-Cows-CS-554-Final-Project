import setupCityIndex from './indexing_cities.js';

const run = async () => {
    try {
        console.log('🚀 Starting city indexing...');
        await setupCityIndex();
        console.log('✅ City indexing completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

run();