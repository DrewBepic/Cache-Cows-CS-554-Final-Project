import { createUser } from '../db_functions/users.js';
import { createSavedPlace, addPhotoToPlace, addReviewToPlace } from '../db_functions/saved_places.js';
import { createReview } from '../db_functions/reviews.js';

// Seed file to populate saved places test data
const seedSavedPlaces = async () => {
    console.log('📝 Populating saved places test data...\n');
    
    try {
        // Create test users
        console.log('👥 Creating test users...');
        
        const user1 = await createUser({
            username: 'travel_sarah',
            first_name: 'Sarah',
            last_name: 'Thompson',
            password: 'password123'
        });
        console.log('✅ Created Sarah:', user1.username);

        const user2 = await createUser({
            username: 'explorer_mike',
            first_name: 'Mike',
            last_name: 'Johnson',
            password: 'password123'
        });
        console.log('✅ Created Mike:', user2.username);

        // Create saved places
        console.log('\n📍 Creating saved places...');

        // Sarah's saved places
        const place1 = await createSavedPlace(
            user1._id,
            'Café de Flore',
            'Historic Parisian café frequented by famous writers and philosophers',
            'Paris',
            'France',
            [
                'https://example.com/cafe-exterior.jpg',
                'https://example.com/cafe-interior.jpg'
            ]
        );
        console.log('✅ Sarah created:', place1.name);

        const place2 = await createSavedPlace(
            user1._id,
            'Shibuya Crossing',
            'The world\'s busiest pedestrian crossing in Tokyo',
            'Tokyo',
            'Japan',
            ['https://example.com/shibuya-day.jpg']
        );
        console.log('✅ Sarah created:', place2.name);

        const place3 = await createSavedPlace(
            user1._id,
            'Central Park Conservatory Garden',
            'A hidden gem of formal gardens in Central Park',
            'New York',
            'United States',
            []
        );
        console.log('✅ Sarah created:', place3.name);

        // Mike's saved places
        const place4 = await createSavedPlace(
            user2._id,
            'La Sagrada Familia',
            'Gaudí\'s unfinished masterpiece basilica',
            'Barcelona',
            'Spain',
            [
                'https://example.com/sagrada-exterior.jpg',
                'https://example.com/sagrada-interior.jpg',
                'https://example.com/sagrada-stained-glass.jpg'
            ]
        );
        console.log('✅ Mike created:', place4.name);

        const place5 = await createSavedPlace(
            user2._id,
            'Bondi Beach',
            'Famous beach in Sydney with golden sand and surf culture',
            'Sydney',
            'Australia',
            ['https://example.com/bondi-beach.jpg']
        );
        console.log('✅ Mike created:', place5.name);

        // Add more photos to some places
        console.log('\n📸 Adding additional photos...');
        
        await addPhotoToPlace(place1._id, 'https://example.com/cafe-pastries.jpg');
        console.log('✅ Added photo to Café de Flore');

        await addPhotoToPlace(place3._id, 'https://example.com/conservatory-spring.jpg');
        await addPhotoToPlace(place3._id, 'https://example.com/conservatory-fountain.jpg');
        console.log('✅ Added photos to Central Park Conservatory Garden');

        // Create reviews for saved places
        console.log('\n⭐ Creating reviews for saved places...');

        const review1 = await createReview(
            user1._id,
            place1._id,
            'Café de Flore',
            5,
            'Absolutely charming! The coffee is excellent and the atmosphere is perfect for people watching.'
        );
        await addReviewToPlace(place1._id, review1._id);
        console.log('✅ Sarah reviewed Café de Flore');

        const review2 = await createReview(
            user1._id,
            place2._id,
            'Shibuya Crossing',
            4,
            'Mesmerizing experience! Best viewed from the Starbucks window above. Go at sunset for the best light.'
        );
        await addReviewToPlace(place2._id, review2._id);
        console.log('✅ Sarah reviewed Shibuya Crossing');

        const review3 = await createReview(
            user2._id,
            place4._id,
            'La Sagrada Familia',
            5,
            'Mind-blowing architecture! Book tickets in advance. The stained glass windows are otherworldly.'
        );
        await addReviewToPlace(place4._id, review3._id);
        console.log('✅ Mike reviewed La Sagrada Familia');

        const review4 = await createReview(
            user2._id,
            place5._id,
            'Bondi Beach',
            4,
            'Great surf beach with a vibrant atmosphere. The coastal walk to Coogee is stunning!'
        );
        await addReviewToPlace(place5._id, review4._id);
        console.log('✅ Mike reviewed Bondi Beach');

        // Display summary
        console.log('\n' + '='.repeat(60));
        console.log('🎉 Saved places test data populated successfully!');
        console.log('='.repeat(60));
        
        console.log('\n📊 Summary:');
        console.log('• Created 2 test users');
        console.log('• Created 5 saved places');
        console.log('• Added multiple photos to places');
        console.log('• Created 4 reviews for saved places');
        
        console.log('\n👤 Test User IDs:');
        console.log('Sarah (travel_sarah):', user1._id);
        console.log('Mike (explorer_mike):', user2._id);
        
        console.log('\n📍 Test Saved Place IDs:');
        console.log('Café de Flore:', place1._id);
        console.log('Shibuya Crossing:', place2._id);
        console.log('Central Park Conservatory Garden:', place3._id);
        console.log('La Sagrada Familia:', place4._id);
        console.log('Bondi Beach:', place5._id);
        
        console.log('\n💡 Use these IDs to test saved places features in the frontend!');

    } catch (error) {
        console.error('❌ Error populating saved places data:', error.message);
        console.error(error);
    }
};

seedSavedPlaces();