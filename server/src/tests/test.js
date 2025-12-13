import { createUser } from '../db_functions/users.js';
import { createSavedPlace, addPhotoToPlace, addReviewToPlace } from '../db_functions/saved_places.js';
import { createReview } from '../db_functions/reviews.js';

// Seed file to populate saved places test data with real NYC movie theater data
const seedSavedPlaces = async () => {
    console.log('📝 Populating saved places test data...\n');
    
    try {
        // Create test users
        console.log('👥 Creating test users...');
        
        const user1 = await createUser({
            username: 'movie_lover_nyc',
            first_name: 'Sarah',
            last_name: 'Thompson',
            password: 'password123'
        });
        console.log('✅ Created Sarah:', user1.username);

        const user2 = await createUser({
            username: 'cinema_explorer',
            first_name: 'Mike',
            last_name: 'Johnson',
            password: 'password123'
        });
        console.log('✅ Created Mike:', user2.username);

        // Create saved places based on real NYC movie theater data
        console.log('\n📍 Creating saved places from real data...');

        // Sarah's saved places
        const place1 = await createSavedPlace(
            user1._id,
            'Brooklyn Children\'s Museum',
            '145 Brooklyn Avenue, Brooklyn',
            'Brooklyn',
            'United States',
            { lat: 40.6744611, lng: -73.9439863 },
            ['AZLasHpyGC7xTwHBdR5P-oJH4JmfMtOyUUob3jGjeO60MWkRWk7Z76g2M02kJNz0mtJ4f5knidEdVp3VXXEd-69W3AGaKnzm9v4UcSQNy1PpYB0Jxu0aiZqF-kpNaQj1YmOB-Ahnw0kI2wcqOdpo0s7ZIvoon9rBrRYSbbPEQ6VbFzfm2SFz'],
            4.5,
            '',
            'ChIJBrooklyn_Museum_001',
            ['tourist_attraction', 'movie_theater', 'museum', 'point_of_interest', 'establishment']
        );
        console.log('✅ Sarah created:', place1.name);

        const place2 = await createSavedPlace(
            user1._id,
            '100 Sutton Event Space',
            '100 Sutton Street #2fl, Brooklyn',
            'Brooklyn',
            'United States',
            { lat: 40.7265554, lng: -73.9405471 },
            ['AZLasHp3GVAsYw8-kqy5GiVClsn6nbWFBLaR3BYMkiegVEiZou1Lth-BUglvfRfhqc8L8d4CAy9df5QuYVZVKQ1PFcZ_X1RdDzQCEEzAVaJAl0sgiUAFwzma7-PKkMrVZ5sTih6cwQz2wiTV6iPNw_Dy7tQlnknviyW1HF1RYQq7CQZF_nd2dvhaU8SgNoqWP_WEtDcgeVJdcJ8Ke7PrpIBNkf-ZAHToUvLXMSTR2_6tXsyrjerwt5euf0CI3dVt5Pz-MRrW6S03HK9A2Fw5Ocw2_uHAGz3CIR8UiwPMCufrSQIuZW9QSfwsrbyyuSz6_PpjcYSMMmzTJ0o'],
            4.8,
            '+1 978-515-3719',
            'ChIJ7yLN_gpZwokRAMlFg84uThA',
            ['art_gallery', 'movie_theater', 'point_of_interest', 'establishment']
        );
        console.log('✅ Sarah created:', place2.name);

        const place3 = await createSavedPlace(
            user1._id,
            'Gymnopedie',
            '1139 Bushwick Avenue, Brooklyn',
            'Brooklyn',
            'United States',
            { lat: 40.689742, lng: -73.917894 },
            ['AZLasHpiJznReE4kmAlQVd4B4U8Oy2rn_D-fYpoxhXSqYs41ScFXKBCOSl-KuGwdDKmQSnKstoX1VXeFqgb9hE4nCGicIw11tfsu7qc8Tt2NV6_OlzOB3iWdRXabeZV04TQSN1XAQp03QaalVVQjylgIyyLj-COHIZQXhHCzGCW7-5X_59ERWDmTLYZf12yAAvERpFf5-rVRw017ICBOi6inUtFXsktpvENTc0Mn_11GYoefFrkPzg1DGhkFuQuSNagdjcA0VHkLNRf0E7dp_LBIk95c48DCFdb94UI6wk88Awid8oDuRrtkerRgbmwJuqmlVOT31PPmGDE'],
            4.2,
            '',
            'ChIJGymnopedie_Brooklyn_001',
            ['movie_theater', 'point_of_interest', 'establishment']
        );
        console.log('✅ Sarah created:', place3.name);

        // Mike's saved places
        const place4 = await createSavedPlace(
            user2._id,
            'Cinemart Cinemas',
            '106-03 Metropolitan Avenue, Forest Hills',
            'Forest Hills',
            'United States',
            { lat: 40.7100344, lng: -73.8469606 },
            ['AZLasHobPrjMioIdJNPazqVvYRzawqmFdGMzBGuFqpa_Ml-Nnz5bJt_YZwZr_YkSFLorypO5N1GkNkOZSp32AE2UIRVnesDVvUs_3yHUMnQiluLcjmifUFxG9c2z7OcEOfvZaVSzmGz_2OTLIr_EWnJsb4cTSde5ZV1973rmz61-TZn99CtS4Ef2Lvye8pL-VXKwA95qgcCgfJDKOZkuxcQY9zfkVkAPA6ShuC_1u-Ws5LERCCzT9WxLq_OWEMjl4w1O85KZSP8mfvnzXKiLkC0T-MYnn4lm9QzUnrupNXEqfhvhk0rzoRrOh4_M3ztCNcXdc2LdT2eD2llxepsQhaP8Og4-k-EGxtKljAC3LPZpv8-qq95U3Z4sFP084-nhG-Gtp7IwSHHL2ZXLVBLi6kC2zTgQhl-VhJkJYFXzdzmf4uFtkIDozE9EzSaCNMvic_imI-mBnJ10SZY__56RqmzexIU6v51EqQgoY_vZYWhevlwzzRzGxAV5Cs3sXplSoPTTdwU2MlQGrJbbmD9a7OvUa1388cuV1bYhvf7xCFL6ZcAA2UNzPruPQO4m1RKtqr9TGf7ADMeRxUu7U0A88eqVi142et1Ol0aDotHMbHUBHYnkyuYKEJ9JxjOWejBD0MvQIukQlY99'],
            4.3,
            '',
            'ChIJCinemart_ForestHills_001',
            ['movie_theater', 'point_of_interest', 'establishment']
        );
        console.log('✅ Mike created:', place4.name);

        const place5 = await createSavedPlace(
            user2._id,
            'Regal Atlas Park',
            '80-00 Cooper Avenue, Glendale',
            'Glendale',
            'United States',
            { lat: 40.7078865, lng: -73.868153 },
            ['AZLasHqfqgrx2qT6EFae37NUSiF8MvJuWAkVn7k7_-r5LFE2SXXpJzpCn1weSK7uvBAslNpogdIb1JQsebU6xkHVugGdHRttyMm7byTlSJZjzBkPZvsmERy12nbDrsc6LRuDpqt3U3a_Y6dQJ0SkliCgNdnlJjIkv72cLVvZ7YCc58j7JTS6Da3C_R-L6R_T4-m5wWXrO6IaJu4FI3_kjL6G2xYDyzZmRsPO_Hm8wPipLtQwIoHTwp-ZpXt9Qwg7WCRm0hj_HwZC6trOnEOtOU0-ymUbgwZrOEKPzXB3-6fRRsaCcjS2niXRHFN6GGWKtiJBCwvmC3-oYaXYRtXpLvkw9gSB4QhvnNEYQ38D2bBL3O8_YqmgR59Rbs6owUUh8qB4o0cl9FYtfLvhcd1Sj3H_P4q5wUwTGFGCmPDaXdxHnM-JnzJV4lndQZ70QOdTDrmJITz_dj9pabssEVICfeiOh2otL-Ut3Vc7WgpRcdiis1ZPR54pAJGvUQ9pDV8_-bASpdYzgr0qeDd0DWFYj6xwknZTvYGxlnmESvmSqYtZ3g3EX80EyvNI0s7H6pcy9HhjakgWESieTfEBQ18PxySu5M25QqggmHvPrXQhYPLNkigg97x9uTityZvUMB_ss_QxPh7asFAR'],
            4.1,
            '',
            'ChIJRegal_AtlasPark_Glendale_001',
            ['movie_theater', 'point_of_interest', 'establishment']
        );
        console.log('✅ Mike created:', place5.name);

        const place6 = await createSavedPlace(
            user2._id,
            'Low Cinema',
            '70-11 60th Street, Ridgewood',
            'Ridgewood',
            'United States',
            { lat: 40.7012171, lng: -73.898538 },
            ['AZLasHrrulK5Fc-IIPUrEjryyDpXKtz4Wy8pWWpGFYIRNqMDghHdFP6UlAqHoCqWTS8aB77r03ytKYiNDIMzBa2jYiwc4YGemZrahXDwLPjnMF1qaC4JjF4xb_PxFTJnhq_x2IIKr5e29Wrz8ML2YF8-VYtWSbTTF3NKGy2PZKF4ki3zfowzyk-zqUxDdMA_JrY4cqJ-vkiHLmFds5wWcLaHxvxqd98VeKhaDdRbFqC0uR9uWc_6SKAVjM2FUtnhtFEdx7WzM3d7HVuM2IJOUTEY0NfGlifiSHQS1bySe2PkcpB0xEGSlb0afPvtnRt7qQMaod7HN85w0Ik'],
            4.6,
            '',
            'ChIJLow_Cinema_Ridgewood_001',
            ['movie_theater', 'point_of_interest', 'establishment']
        );
        console.log('✅ Mike created:', place6.name);

        const place7 = await createSavedPlace(
            user1._id,
            'The Green Vegan Monsta',
            '1470 Broadway, Brooklyn',
            'Brooklyn',
            'United States',
            { lat: 40.6873507, lng: -73.9186853 },
            ['AZLasHoB4dNOp4M_lDN2B01iE4kYcsqz7GzrV5JV391CSBb32z8giOyG5WqG9BkWecLy2VBL8LxxgjqMFNVxv6I9GyQyN3AbqsbJXmBhJz2ktoeu4oR7Q3CcM1Nd9NTEv5N6mAwZzdqrmhsh6WpKhas-ZtkQ24KDSJpeBJVX5QOawGX6g_npaYlDt1Kqn_KqsSqCsQceW4nYXE2T7gbtmlqaGxPOjJRqfzuOWKUYZsR6Fdkxt8Y83gC-fhBOz5RJP28WzpWF6ueAB1lvQ1AHIVbhrchvykRCn7KuR3Z_90aTJiGectUlwBikiLEQB2hZ6ynuZA3_piNKhCk'],
            4.4,
            '',
            'ChIJGreen_Vegan_Monsta_001',
            ['meal_delivery', 'movie_theater', 'cafe', 'restaurant', 'food', 'point_of_interest', 'establishment']
        );
        console.log('✅ Sarah created:', place7.name);

        // Create reviews for saved places
        console.log('\n⭐ Creating reviews for saved places...');

        const review1 = await createReview(
            user1._id,
            place1._id.toString(),
            'Brooklyn Children\'s Museum',
            5,
            'Amazing interactive exhibits for kids! The movie screenings they host are educational and fun.'
        );
        await addReviewToPlace(place1._id, review1._id);
        console.log('✅ Sarah reviewed Brooklyn Children\'s Museum');

        const review2 = await createReview(
            user1._id,
            place2._id.toString(),
            '100 Sutton Event Space',
            5,
            'Stunning art gallery and event space! They screen independent films in a beautiful setting.'
        );
        await addReviewToPlace(place2._id, review2._id);
        console.log('✅ Sarah reviewed 100 Sutton Event Space');

        const review3 = await createReview(
            user2._id,
            place4._id.toString(),
            'Cinemart Cinemas',
            4,
            'Classic neighborhood cinema with reasonable prices.'
        );
        await addReviewToPlace(place4._id, review3._id);
        console.log('✅ Mike reviewed Cinemart Cinemas');

        const review4 = await createReview(
            user2._id,
            place5._id.toString(),
            'Regal Atlas Park',
            4,
            'Modern multiplex with comfortable seating and good sound.'
        );
        await addReviewToPlace(place5._id, review4._id);
        console.log('✅ Mike reviewed Regal Atlas Park');

        const review5 = await createReview(
            user2._id,
            place6._id.toString(),
            'Low Cinema',
            5,
            'Hidden gem! Curated selection of arthouse and experimental films.'
        );
        await addReviewToPlace(place6._id, review5._id);
        console.log('✅ Mike reviewed Low Cinema');

        const review6 = await createReview(
            user1._id,
            place7._id.toString(),
            'The Green Vegan Monsta',
            4,
            'Unique spot! Vegan café that also screens documentaries and indie films.'
        );
        await addReviewToPlace(place7._id, review6._id);
        console.log('✅ Sarah reviewed The Green Vegan Monsta');

        // Display summary
        console.log('\n' + '='.repeat(60));
        console.log('🎉 Saved places test data populated successfully!');
        console.log('='.repeat(60));
        
        console.log('\n📊 Summary:');
        console.log('• Created 2 test users');
        console.log('• Created 7 saved places (NYC movie theaters & venues)');
        console.log('• Added Google Places photo references');
        console.log('• Added geolocation data for all places');
        console.log('• Created 6 reviews for saved places');
        
        console.log('\n👤 Test User Credentials:');
        console.log('Username: movie_lover_nyc | Password: password123');
        console.log('Username: cinema_explorer | Password: password123');

    } catch (error) {
        console.error('❌ Error populating saved places data:', error.message);
        console.error(error);
    }
};

export default seedSavedPlaces;

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    seedSavedPlaces()
        .then(() => {
            console.log('\n✅ Seeding completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Seeding failed:', error);
            process.exit(1);
        });
}