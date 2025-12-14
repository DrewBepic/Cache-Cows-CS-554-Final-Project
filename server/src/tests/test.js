import { createUser } from '../db_functions/users.js';
import { sendFriendRequest, acceptFriendRequest } from '../db_functions/friends.js';
import { createReview } from '../db_functions/reviews.js';
import { createSavedPlace } from '../db_functions/saved_places.js';
import { users, reviews, saved_places } from '../db_config/mongoCollections.js';
import { ObjectId } from 'mongodb';

/* =====================================================
   🧱 SEED DATA (EDIT HERE ONLY)
===================================================== */

const USERS = {
    alice: {
        username: 'alice_wonder',
        first_name: 'Alice',
        last_name: 'Wonderland',
        password: 'password123'
    },
    bob: {
        username: 'bob_builder',
        first_name: 'Bob',
        last_name: 'Builder',
        password: 'password123'
    },
    charlie: {
        username: 'charlie_choc',
        first_name: 'Charlie',
        last_name: 'Chocolate',
        password: 'password123'
    }
};

const SAVED_PLACES = {
    ifly_paramus: {
        place_id: 'ChIJRsMymJ36wokRJcPv6-ayzo',
        name: 'iFLY Indoor Skydiving - Paramus',
        description: 'No description available.',
        address: '211 Route 4, Paramus, NJ 07652, USA',
        city: 'Paramus',
        country: 'United States',
        geolocation: {
            lat: 40.9445,
            lng: -74.0701
        },
        rating: 4.7,
        phone_number: '(201) 733-4359',
        types: [
            'amusement_park',
            'establishment',
            'point_of_interest',
            'tourist_attraction'
        ],
        photos: [
            'https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=AAA',
            'https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=BBB',
            'https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=CCC'
        ]
    },
    eiffel_tower: {
        place_id: 'ChIJLU7jZClu5kcR4PcOOO6p3I0',
        name: 'Eiffel Tower',
        description: 'Iconic wrought-iron lattice tower on the Champ de Mars.',
        address: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France',
        city: 'Paris',
        country: 'France',
        geolocation: {
            lat: 48.8584,
            lng: 2.2945
        },
        rating: 4.6,
        phone_number: '+33 892 70 12 39',
        types: [
            'monument',
            'establishment',
            'point_of_interest',
            'tourist_attraction'
        ],
        photos: [
            'https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=EEE',
            'https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=FFF'
        ]
    },
    statue_of_liberty: {
        place_id: 'ChIJPTacEpBQwokRKwIlDbbTnLU',
        name: 'Statue of Liberty',
        description: 'Colossal neoclassical sculpture on Liberty Island.',
        address: 'New York, NY 10004, USA',
        city: 'New York',
        country: 'United States',
        geolocation: {
            lat: 40.6892,
            lng: -74.0445
        },
        rating: 4.7,
        phone_number: '(212) 363-3200',
        types: [
            'monument',
            'museum',
            'establishment',
            'point_of_interest',
            'tourist_attraction'
        ],
        photos: [
            'https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=GGG',
            'https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=HHH',
            'https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=III'
        ]
    },
    tokyo_tower: {
        place_id: 'ChIJCewJkL2LGGAR3Qmk0vCTGkg',
        name: 'Tokyo Tower',
        description: 'Communications and observation tower in Tokyo.',
        address: '4 Chome-2-8 Shibakoen, Minato City, Tokyo 105-0011, Japan',
        city: 'Tokyo',
        country: 'Japan',
        geolocation: {
            lat: 35.6586,
            lng: 139.7454
        },
        rating: 4.3,
        phone_number: '+81 3-3433-5111',
        types: [
            'monument',
            'observation_deck',
            'establishment',
            'point_of_interest',
            'tourist_attraction'
        ],
        photos: [
            'https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=JJJ',
            'https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=KKK'
        ]
    }
};

const FRIENDSHIPS = [
    { from: 'alice', to: 'bob', accept: true },
    { from: 'alice', to: 'charlie', accept: false }
];

const REVIEWS = [
    {
        user: 'alice',
        placeId: 'ChIJRsMymJ36wokRJcPv6-ayzo',
        placeName: 'iFLY Indoor Skydiving - Paramus',
        rating: 5,
        comment: 'Super fun experience! Staff was professional and friendly.'
    },
    {
        user: 'alice',
        placeId: 'ChIJLU7jZClu5kcR4PcOOO6p3I0',
        placeName: 'Eiffel Tower',
        rating: 5,
        comment: 'Absolutely breathtaking! A must-see in Paris.'
    },
    {
        user: 'bob',
        placeId: 'ChIJLU7jZClu5kcR4PcOOO6p3I0',
        placeName: 'Eiffel Tower',
        rating: 4,
        comment: 'Beautiful but very crowded. Go early in the morning!'
    },
    {
        user: 'bob',
        placeId: 'ChIJPTacEpBQwokRKwIlDbbTnLU',
        placeName: 'Statue of Liberty',
        rating: 5,
        comment: 'Iconic American landmark. The ferry ride is worth it!'
    },
    {
        user: 'charlie',
        placeId: 'ChIJPTacEpBQwokRKwIlDbbTnLU',
        placeName: 'Statue of Liberty',
        rating: 3,
        comment: 'Nice to see once, but tickets are expensive.'
    },
    {
        user: 'charlie',
        placeId: 'ChIJCewJkL2LGGAR3Qmk0vCTGkg',
        placeName: 'Tokyo Tower',
        rating: 4,
        comment: 'Great views of Tokyo! Better than I expected.'
    },
    {
        user: 'alice',
        placeId: 'ChIJCewJkL2LGGAR3Qmk0vCTGkg',
        placeName: 'Tokyo Tower',
        rating: 5,
        comment: 'Amazing at night with all the lights!'
    }
];

/* =====================================================
   🚀 POPULATE DATABASE
===================================================== */

const populateData = async () => {
    console.log('📝 Populating database...\n');

    try {
        /* ---------- CLEANUP ---------- */
        console.log('🧹 Cleaning up existing data...');
        const usersCollection = await users();
        const reviewsCollection = await reviews();
        const savedPlacesCollection = await saved_places();
        
        await usersCollection.deleteMany({});
        await reviewsCollection.deleteMany({});
        await savedPlacesCollection.deleteMany({});
        
        console.log('✅ Database cleaned\n');

        /* ---------- USERS ---------- */
        const userMap = {};

        for (const key of Object.keys(USERS)) {
            const user = await createUser(USERS[key]);
            console.log(`✅ Created user: ${user.username}`);
        }

        // Fetch all users fresh from DB to get correct ObjectIds
        for (const key of Object.keys(USERS)) {
            const user = await usersCollection.findOne({ username: USERS[key].username });
            userMap[key] = user;
            console.log(`📌 Loaded user from DB: ${user.username} (${user._id})`);
        }

        /* ---------- FRIENDSHIPS ---------- */
        console.log('\n🤝 Creating friendships...');
        for (const f of FRIENDSHIPS) {
            console.log(`\n--- Processing: ${f.from} → ${f.to} ---`);
            console.log(`From user ID: ${userMap[f.from]._id}`);
            console.log(`To user ID: ${userMap[f.to]._id}`);
            
            // Send friend request from 'from' user to 'to' user
            const sentResult = await sendFriendRequest(
                userMap[f.from]._id.toString(),
                userMap[f.to].username
            );
            console.log(`📤 ${f.from} sent friend request to ${f.to}`);
            console.log(`Sent requests array:`, sentResult.sent_friend_requests);

            // ⛔ IMPORTANT: allow Mongo write to flush
            await new Promise(resolve => setTimeout(resolve, 100));

            // Let's verify the request was received
            const usersCollection = await users();
            const receiverUser = await usersCollection.findOne({ _id: userMap[f.to]._id });
            console.log(`${f.to}'s received requests:`, receiverUser.received_friend_requests);

            if (f.accept) {
                // FIXED: 'to' user accepts request FROM 'from' user
                await acceptFriendRequest(
                    userMap[f.to]._id.toString(),   // currentUserId (receiver accepting)
                    userMap[f.from]._id.toString()  // friendId (sender of request)
                );
                console.log(`✅ ${f.to} accepted friend request from ${f.from} - now friends!`);
            } else {
                console.log(`⏸️  ${f.from} → ${f.to} request pending (not accepted)`);
            }
        }


        /* ---------- SAVED PLACES ---------- */
        console.log('\n📍 Creating saved places...');
        const savedPlaceMap = {};

        for (const key of Object.keys(SAVED_PLACES)) {
            const place = await createSavedPlace(
                userMap.alice._id.toString(),  // Alice saves all places
                SAVED_PLACES[key]
            );
            savedPlaceMap[key] = place;
            console.log(`✅ SavedPlace created: ${place.name}`);
        }

        // Note: createSavedPlace already adds places to user's saved_places array

        /* ---------- REVIEWS ---------- */
        console.log('\n⭐ Creating reviews...');
        for (const r of REVIEWS) {
            await createReview(
                userMap[r.user]._id.toString(),  // Convert ObjectId to string
                r.placeId,
                r.placeName,
                r.rating,
                r.comment
            );
            console.log(`✅ ${r.user} reviewed ${r.placeName}`);
        }

        console.log('\n🎉 Database seeded successfully!');
        console.log('='.repeat(50));
        console.log('\n📊 Summary:');
        console.log(`Users created: ${Object.keys(userMap).length}`);
        console.log(`Saved places: ${Object.keys(savedPlaceMap).length}`);
        console.log(`Reviews: ${REVIEWS.length}`);
        console.log(`Friendships: ${FRIENDSHIPS.filter(f => f.accept).length} accepted`);
        
        console.log('\n📍 Saved Places:');
        for (const key of Object.keys(savedPlaceMap)) {
            console.log(`  - ${savedPlaceMap[key].name} (${savedPlaceMap[key].city}, ${savedPlaceMap[key].country})`);
            console.log(`    Google place_id: ${savedPlaceMap[key].place_id}`);
        }
        
        console.log('\n⭐ Review Distribution:');
        const reviewCounts = {};
        REVIEWS.forEach(r => {
            reviewCounts[r.placeName] = (reviewCounts[r.placeName] || 0) + 1;
        });
        for (const [place, count] of Object.entries(reviewCounts)) {
            console.log(`  - ${place}: ${count} reviews`);
        }
    } catch (err) {
        console.error('❌ Seeding failed:', err);
    }
};

populateData();