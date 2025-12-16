import { createUser } from '../db_functions/users.js';
import { sendFriendRequest, acceptFriendRequest } from '../db_functions/friends.js';
import { createReview } from '../db_functions/reviews.js';
import { users, reviews, places } from '../db_config/mongoCollections.js';
import { clearRedis } from '../config/redishelper.js'
import { ObjectId } from 'mongodb';
import { getOrImportPlace } from '../db_functions/places.js';
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

const PLACES = {
    future_vr: {
        place_id: 'ChIJTwfV0LBXwokRocd0MdBGREc',
        name: 'FUTURE (VR, Arcades, Fun)',
        description: 'No description available.',
        address: 'Next to JCPenney inside the Newport Centre Mall, 30 Mall Dr W, Jersey City, NJ 07310, USA',
        city: 'Jersey City',
        country: 'United States',
        geolocation: {
            lat: 40.7268406,
            lng: -74.0379931
        },
        rating: 4.9,
        phone_number: '(201) 464-8812',
        types: [
            'amusement_park',
            'establishment',
            'point_of_interest'
        ],
        photos: [
            'https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AZLasHply3G93fbj0njdd6MYaW8XOdryfDK295nNmp2iq9zi2Eypo2DJ2iWui9WqKeMvaLFhtp6UebHnCDCDJwKUvOEiwxFTZqzxmRrcbXUUAReD-Mj6AoaXmGh_38mktoeT0_P67ChobWiU6Mgy4SGQaA8kzxv6PMS3zR4c59RfaTFUsig9tBHT1ZnHu_fO5Ofr8LHzD7YBA-MeUK1Qo60K9I4EurJ5BqBktjxWcBLj1jp2q9Jd-d08UNc1hGa9oOcbSocHwoJGj_ocR5h8tx0TGzptxHVcw2gWWTH5p4L_ISmPveoKwLZ1jBcU1dpqnCc19bkAmgJoPlPUcDwfj5kwLAmzCqA-e3YglV-Y6LbVK626ZFfyfpFyV2ZBqYvWXONCHdlyA4WWETJZ9nseXf6B2-9Is6zTUSjhs2w5GJn26R4Nk7N6&key=AIzaSyC7k_SnSLBk1lvP_3KG_2vjSkuc-_dFITQ',
            'https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AZLasHrISdfRRgnXBwbPm9E1DR7Aj89wXkw9YHp1fNZKNx_Oei5U3M7rhoaLZRIelrtvzfqHfZljrpJRVLS72nVecWe0VRuE60f86j3YJV323oqLe_PtJrXL5g0EHYf_C3xZ2-RQH8ipkqTsD-R0ZNmMgoOvADObInq6xRvcEaXAr38dhJzZTU9RoUb-qRSWJt9TqpOp5dYnRP8E3xdZ_SO_DDT_La-LmEN6g_9UT4qajtdblaeNR5-WJEzxo1CaWPKsn8BUTjMOhMffMTfFaZrZUZ12g8yHRRSTYBffT5VvY52T7a7NtvpKs6Sp1eOaK2lzgr4eQ51P7bWGXgzmA5Zzx2XnNVsjXiLrCaKFu-vrj-SRDxLKZ4e1spG3j1-rVQsAk84x7UO19-AKXL2Roa5T4DMmnri4kQ11RT9LyElrjA&key=AIzaSyC7k_SnSLBk1lvP_3KG_2vjSkuc-_dFITQ',
            'https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AZLasHoLVRilS5aW4nedHK2JBeqSc0hNP5S5Uod5vAnV3Sd9WZGaBshaC06gOneSud1upF4AHhIE_LS1gFSfJdDKFMNi4znuEAreSSZEs8LVAORjaoJuy3QJJ1P_zgNkg0aH_j7nqd6of4C27-4WiGs2YPcdHNlGI-ibW0isrqd_EiPDP8WhBzAcuDYVchJRMNFH6YCX-9KVsSeQythaaCFxhvJeMbBarnMPiFyfMxJPTIynVKRy7-f_nWm407tidt4VOxkBJntfomt8weWuI7SMyqZvmrKVOu2-o3M7ulSXcwWM_fSTjV_PX7w0IBfbGrE7vAqGr5p4sOPjK5mdOCNcK76DJ6VVKcEsftkM9eIB_x4hJllCb7-KYhcFsRhZS0bfCThwiU_Nxp1_US_nyAtv9LN-UhcoZsTqWwJkyJAN0xnNgg&key=AIzaSyC7k_SnSLBk1lvP_3KG_2vjSkuc-_dFITQ'
        ]
    },
    splash_pad: {
        place_id: 'ChIJY8_lJ8VXwokRJCKWhqKnsyM',
        name: 'Splash pad',
        description: 'No description available.',
        address: '201 Central Ave, Jersey City, NJ 07307, USA',
        city: 'Jersey City',
        country: 'United States',
        geolocation: {
            lat: 40.7412122,
            lng: -74.0537068
        },
        rating: 0,
        phone_number: 'N/A',
        types: [
            'amusement_park',
            'establishment',
            'point_of_interest'
        ],
        photos: []
    },
    village_west_gallery: {
        place_id: 'ChIJm9BWMLVQwokRXB3gA8QOH5Y',
        name: 'Village West Gallery',
        description: 'No description available.',
        address: '331 Newark Ave, Jersey City, NJ 07302, USA',
        city: 'Jersey City',
        country: 'United States',
        geolocation: {
            lat: 40.7247646,
            lng: -74.0514522
        },
        rating: 4.5,
        phone_number: '(201) 656-3408',
        types: [
            'art_gallery',
            'establishment',
            'point_of_interest'
        ],
        photos: [
            'https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AZLasHriINQmz0xg6V0GRtbsz7tJKjwYp6jRFDG13FupRsG6baImMQxY8uk6YLFgBB5nDg7w1RJ7wSO1DLeHb9lTiAWldiXIV9VTpvdtFzjZk7QWYazs9n-oEWgOIF-CH7h824NOgDkaWtVgrtx600I_Ri9hCw8h_ka15D6aXqL4Lp3c8-Gbpxw2m-ayZ4YmjGZGmPPukEMIPEr1tMhKW7ePtQnMT19t-MzntRsbCeteZVc9KCIOmuFiXZ3MIxoLYgwjQqYSIYMSxFdRxvTb7yni-kt0KbloaM2DseDtWqhFQ-8_4KL9oh4A0C4MoWGgJaYmVkuz0F5qUxT7tIBnhDDwK4tkwRs-p1vB_G820A9Yt3mbKKDYYHRMPBpBrJt930-VWImVZa3ouwWGyV6ht3nbWTxCSXeGmgCFyqpnJ_Gpt1ajTw&key=AIzaSyC7k_SnSLBk1lvP_3KG_2vjSkuc-_dFITQ',
            'https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AZLasHoBGw1OdfoA_7Yi3boGCo406sE7gZu2KKYHuTzuitaBfqa2AkL16qy3iIgsP_UCHNgqht7LRiUl2bJxpjiSiwmvD-DZ_ockA48FFyePhVSHMOwLLWFeWac5pkDs6VpYPKv9ImZJNGYktMJlAzsIU9scJt_706cLva0Un3nVv_ohZL4_mUdQ7ETJJsZ503aUYbwcvNqAQ-IZFjb0V2Ign3GdWXluDe7-Owek4c517mxFODQ7Oy2Kj-INpwnaSLeLAqxXUGDgCweV4BQZZF6vH56fkrNW3kfJRykD3_ofRgf7vRUTT7wNxpgZ3L5iEs79nWfcU_arA4bvcksN7eIzWrYdrhFRfSarkarNMLcvlmPld5LqzfRbc9lbyN29bjxPSKBJzxActyDfZYRgVDPFOtWWHmfjAghLS6vt5HU0eyckdA&key=AIzaSyC7k_SnSLBk1lvP_3KG_2vjSkuc-_dFITQ',
            'https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AZLasHqL_YKdb0tM-uSxb0pxiD5DZwon7y8A5BW9ewPqoBD45smr0Lk_vog13jGxrnHx5s8Tg8OLUrGaWJ6rDKyKAc-4xUoyjpUlACIFRz5TWL79Gs_5OYyeaJZewrufJdht-IgRUSpuBrhthcyya19canfeusfTAT6qdwh67JR5rGuSF2d5znLCOH3d9FVMS_EOTt3KEB7EWe3rtHl7TF5jdEDPguEKm01DT24riA_6aVciPqMeKFrggZWyBhO4BCJ4TmMBoc-BGMToGYalWGQhvN48c7nc8XnIrnZknymb0jjoPay0i2v0M9Hm_GpbDuB_LgcZdVfLhUbsIMPUHGItx7-GCh9TSFlC5wUeGK_GYVEYEcx3mNAxE8WFRNqnYsfJbNZ5pNqt7k1ClkjJ5tXs9QvxxjSwtQoVNpQ9POyady_U5A&key=AIzaSyC7k_SnSLBk1lvP_3KG_2vjSkuc-_dFITQ'
        ]
    }
};

const FRIENDSHIPS = [
    { from: 'alice', to: 'bob', accept: true },
    { from: 'alice', to: 'charlie', accept: false },
    { from: 'bob', to: 'charlie', accept: true }
];

// Reviews reference place keys
const REVIEWS = [
    {
        user: 'alice',
        placeKey: 'future_vr',
        rating: 5,
        comment: 'Amazing VR experience! The staff was super helpful and the games were incredible.'
    },
    {
        user: 'alice',
        placeKey: 'village_west_gallery',
        rating: 4,
        comment: 'Beautiful local art gallery. Great place to spend an afternoon.'
    },
    {
        user: 'bob',
        placeKey: 'future_vr',
        rating: 5,
        comment: 'Best arcade in Jersey City! The VR setup is top-notch.'
    },
    {
        user: 'bob',
        placeKey: 'splash_pad',
        rating: 4,
        comment: 'Great for kids in the summer. Free and well-maintained.'
    },
    {
        user: 'charlie',
        placeKey: 'splash_pad',
        rating: 5,
        comment: 'My kids love this place! Perfect for hot summer days.'
    },
    {
        user: 'charlie',
        placeKey: 'village_west_gallery',
        rating: 5,
        comment: 'Wonderful collection of local art. Very friendly staff!'
    },
    {
        user: 'alice',
        placeKey: 'splash_pad',
        rating: 3,
        comment: 'Nice but gets crowded on weekends.'
    }
];

// Main function to populate the database

const populateData = async () => {
    console.log('Populating database...\n');

    try {
        // cleanup existing data
        console.log('Cleaning up existing data...');
        const usersCollection = await users();
        const reviewsCollection = await reviews();
        const placesCollection = await places();

        await usersCollection.deleteMany({});
        await reviewsCollection.deleteMany({});
        await placesCollection.deleteMany({});



        console.log('✅ Database cleaned\n');
        await clearRedis();
        // Create users
        console.log('Creating users...');
        const userMap = {};

        for (const key of Object.keys(USERS)) {
            const user = await createUser(USERS[key]);
            console.log(`✅ Created user: ${user.username}`);
        }

        // Fetch all users fresh from DB to get correct ObjectIds
        for (const key of Object.keys(USERS)) {
            const user = await usersCollection.findOne({ username: USERS[key].username });
            userMap[key] = user;
            console.log(`Loaded user from DB: ${user.username} (${user._id})`);
        }

        // Create friendships
        console.log('\nCreating friendships...');
        for (const f of FRIENDSHIPS) {
            // Send friend request from 'from' user to 'to' user
            await sendFriendRequest(
                userMap[f.from]._id.toString(),
                userMap[f.to].username
            );
            console.log(`${f.from} sent friend request to ${f.to}`);

            // Allow Mongo write to flush
            await new Promise(resolve => setTimeout(resolve, 100));

            if (f.accept) {
                // 'to' user accepts request FROM 'from' user
                await acceptFriendRequest(
                    userMap[f.to]._id.toString(),   // currentUserId (receiver accepting)
                    userMap[f.from]._id.toString()  // friendId (sender of request)
                );
                console.log(`✅ Success: ${f.to} accepted friend request from ${f.from} - now friends!`);
            } else {
                console.log(`✅  ${f.from} → ${f.to} request pending (not accepted)`);
            }
        }

        // Create places
        console.log('\n📍 Creating places...');
        const placeMap = {};


        for (const key of Object.keys(PLACES)) {
            const placeData = PLACES[key];

            // Use the getOrImportPlace function
            const importedPlace = await getOrImportPlace(placeData.place_id);
            placeMap[key] = importedPlace;

            console.log(`✅ Place created: ${importedPlace.name}`);
            console.log(`    MongoDB _id: ${importedPlace._id}`);
            console.log(`    Google place_id: ${importedPlace.place_id}`);
        }

        // Create reviews
        console.log('\nCreating reviews...');
        for (const r of REVIEWS) {
            const place = placeMap[r.placeKey];

            // Create review with place's MongoDB _id
            await createReview(
                userMap[r.user]._id.toString(),  // User ID
                place._id.toString(),             // Place MongoDB _id
                place.name,                       // Place name
                r.rating,
                r.comment
            );
            console.log(`✅ ${r.user} reviewed ${place.name} (${r.rating}⭐)`);
        }

        // Index cities in Elasticsearch
        console.log('\nIndexing cities in Elasticsearch...');
        try {
            const setupCityIndex = (await import('./indexing_cities.js')).default;
            await setupCityIndex();
            console.log('✅ Success Cities indexed in Elasticsearch');
        } catch (error) {
            console.error('❌ Failed to index cities:', error.message);
            console.log('❌ Make sure Elasticsearch is running');
        }

        console.log('\n Database seeded successfully!');
        console.log('='.repeat(60));
        console.log('\n Summary:');
        console.log(`   Users created: ${Object.keys(userMap).length}`);
        console.log(`   Places: ${Object.keys(placeMap).length}`);
        console.log(`   Reviews: ${REVIEWS.length}`);
        console.log(`   Friendships: ${FRIENDSHIPS.filter(f => f.accept).length} accepted, ${FRIENDSHIPS.filter(f => !f.accept).length} pending`);


        console.log('\n Finished seeding database.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error Seeding failed:', err);
        process.exit(1);
    }
};

populateData();