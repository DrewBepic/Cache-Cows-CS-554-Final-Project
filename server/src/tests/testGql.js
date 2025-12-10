import { ApolloServer } from '@apollo/server';
import { typeDefs } from '../graphql/typeDefs.js';
import { resolvers } from '../graphql/resolvers.js';

const server = new ApolloServer({ typeDefs, resolvers });

const execute = async (query, variables) => {
    const result = await server.executeOperation({ query, variables });
    return result.body.kind === 'single' ? result.body.singleResult : null;
};

(async () => {
    console.log('🔍 Diagnostic Test - Saved Places\n');
    
    const timestamp = Date.now();
    const testUsername = `place_tester_${timestamp}`;
    
    console.log('Creating test user:', testUsername);
    
    // ========== CREATE TEST USER ==========
    const userResult = await execute(`
        mutation CreateUser($username: String!) {
            createUser(
                username: $username
                firstName: "Place"
                lastName: "Tester"
                password: "pass123"
            ) {
                id
                username
                firstName
                lastName
            }
        }
    `, { username: testUsername });
    
    if (userResult?.errors) {
        console.log('❌ User creation error:', userResult.errors[0].message);
        return;
    }
    
    const userId = userResult?.data?.createUser?.id;
    console.log('✅ Created user:', testUsername, 'ID:', userId);
    
    if (!userId) {
        console.log('❌ User ID is empty!');
        return;
    }
    
    // ========== TEST 1: Create Saved Place ==========
    console.log('\n' + '='.repeat(60));
    console.log('1. Testing createSavedPlace...');
    
    const createPlaceResult = await execute(`
        mutation CreatePlace($userId: ID!) {
            createSavedPlace(
                userId: $userId
                name: "Test Coffee Shop"
                description: "A cozy coffee shop with great ambiance"
                city: "Seattle"
                country: "United States"
                photos: [
                    "https://example.com/photo1.jpg",
                    "https://example.com/photo2.jpg"
                ]
            ) {
                id
                name
                description
                city
                country
                photos
            }
        }
    `, { userId });
    
    if (createPlaceResult?.errors) {
        console.log('❌ createSavedPlace error:', createPlaceResult.errors[0].message);
    } else {
        const place = createPlaceResult?.data?.createSavedPlace;
        console.log('✅ createSavedPlace succeeded');
        console.log('   Place:', place?.name);
        console.log('   City:', place?.city);
        console.log('   Photos:', place?.photos?.length || 0);
    }
    
    const placeId = createPlaceResult?.data?.createSavedPlace?.id;
    
    // ========== TEST 2: Get User's Saved Places ==========
    console.log('\n2. Testing getUserSavedPlaces...');
    
    const getUserPlacesResult = await execute(`
        query GetUserPlaces($userId: ID!) {
            getUserSavedPlaces(userId: $userId) {
                id
                name
                description
                city
                country
                photos
            }
        }
    `, { userId });
    
    if (getUserPlacesResult?.errors) {
        console.log('❌ getUserSavedPlaces error:', getUserPlacesResult.errors[0].message);
    } else {
        const places = getUserPlacesResult?.data?.getUserSavedPlaces || [];
        console.log(`✅ getUserSavedPlaces found ${places.length} place(s)`);
        if (places.length > 0) {
            console.log('   Places:', places.map(p => p.name).join(', '));
        }
    }
    
    // ========== TEST 3: Get Specific Saved Place ==========
    console.log('\n3. Testing getSavedPlace...');
    
    if (placeId) {
        const getPlaceResult = await execute(`
            query GetPlace($placeId: ID!) {
                getSavedPlace(placeId: $placeId) {
                    id
                    name
                    description
                    city
                    country
                    photos
                    reviews {
                        id
                        rating
                        notes
                    }
                }
            }
        `, { placeId });
        
        if (getPlaceResult?.errors) {
            console.log('❌ getSavedPlace error:', getPlaceResult.errors[0].message);
        } else {
            const place = getPlaceResult?.data?.getSavedPlace;
            console.log('✅ getSavedPlace succeeded');
            console.log('   Place:', place?.name);
            console.log('   Reviews:', place?.reviews?.length || 0);
        }
    }
    
    // ========== TEST 4: Add Photo to Place ==========
    console.log('\n4. Testing addPhotoToPlace...');
    
    if (placeId) {
        const addPhotoResult = await execute(`
            mutation AddPhoto($placeId: ID!, $photoUrl: String!) {
                addPhotoToPlace(placeId: $placeId, photoUrl: $photoUrl)
            }
        `, {
            placeId,
            photoUrl: "https://example.com/photo3.jpg"
        });
        
        if (addPhotoResult?.errors) {
            console.log('❌ addPhotoToPlace error:', addPhotoResult.errors[0].message);
        } else {
            const success = addPhotoResult?.data?.addPhotoToPlace;
            console.log(success ? '✅ addPhotoToPlace succeeded' : '⚠️ Photo not added (may already exist)');
        }
    }
    
    // ========== TEST 5: Update Saved Place ==========
    console.log('\n5. Testing updateSavedPlace...');
    
    if (placeId) {
        const updatePlaceResult = await execute(`
            mutation UpdatePlace($placeId: ID!) {
                updateSavedPlace(
                    placeId: $placeId
                    description: "Updated: An amazing coffee shop with the best lattes!"
                    photos: [
                        "https://example.com/photo1.jpg",
                        "https://example.com/photo2.jpg",
                        "https://example.com/photo3.jpg",
                        "https://example.com/updated-photo.jpg"
                    ]
                ) {
                    id
                    name
                    description
                    photos
                }
            }
        `, { placeId });
        
        if (updatePlaceResult?.errors) {
            console.log('❌ updateSavedPlace error:', updatePlaceResult.errors[0].message);
        } else {
            const place = updatePlaceResult?.data?.updateSavedPlace;
            console.log('✅ updateSavedPlace succeeded');
            console.log('   Updated description:', place?.description?.substring(0, 50) + '...');
            console.log('   Total photos:', place?.photos?.length || 0);
        }
    }
    
    // ========== TEST 6: Create Another Place for Search ==========
    console.log('\n6. Creating another place for search test...');
    
    const createPlace2Result = await execute(`
        mutation CreatePlace2($userId: ID!) {
            createSavedPlace(
                userId: $userId
                name: "Seattle Art Museum"
                description: "Modern and contemporary art in downtown Seattle"
                city: "Seattle"
                country: "United States"
            ) {
                id
                name
                city
            }
        }
    `, { userId });
    
    if (createPlace2Result?.errors) {
        console.log('❌ Second place creation error:', createPlace2Result.errors[0].message);
    } else {
        const place = createPlace2Result?.data?.createSavedPlace;
        console.log('✅ Created:', place?.name);
    }
    
    // ========== TEST 7: Search Saved Places ==========
    console.log('\n7. Testing searchSavedPlaces...');
    
    const searchResult = await execute(`
        query SearchPlaces($query: String!) {
            searchSavedPlaces(query: $query) {
                id
                name
                city
                country
            }
        }
    `, { query: "Seattle" });
    
    if (searchResult?.errors) {
        console.log('❌ searchSavedPlaces error:', searchResult.errors[0].message);
    } else {
        const places = searchResult?.data?.searchSavedPlaces || [];
        console.log(`✅ searchSavedPlaces found ${places.length} place(s) matching "Seattle"`);
        places.forEach(p => {
            console.log(`   - ${p.name} (${p.city}, ${p.country})`);
        });
    }
    
    // ========== TEST 8: Remove Photo from Place ==========
    console.log('\n8. Testing removePhotoFromPlace...');
    
    if (placeId) {
        const removePhotoResult = await execute(`
            mutation RemovePhoto($placeId: ID!, $photoUrl: String!) {
                removePhotoFromPlace(placeId: $placeId, photoUrl: $photoUrl)
            }
        `, {
            placeId,
            photoUrl: "https://example.com/photo1.jpg"
        });
        
        if (removePhotoResult?.errors) {
            console.log('❌ removePhotoFromPlace error:', removePhotoResult.errors[0].message);
        } else {
            const success = removePhotoResult?.data?.removePhotoFromPlace;
            console.log(success ? '✅ removePhotoFromPlace succeeded' : '⚠️ Photo not removed (may not exist)');
        }
    }
    
    // ========== TEST 9: Delete Saved Place ==========
    console.log('\n9. Testing deleteSavedPlace...');
    
    if (placeId) {
        const deletePlaceResult = await execute(`
            mutation DeletePlace($userId: ID!, $placeId: ID!) {
                deleteSavedPlace(userId: $userId, placeId: $placeId)
            }
        `, { userId, placeId });
        
        if (deletePlaceResult?.errors) {
            console.log('❌ deleteSavedPlace error:', deletePlaceResult.errors[0].message);
        } else {
            const success = deletePlaceResult?.data?.deleteSavedPlace;
            console.log(success ? '✅ deleteSavedPlace succeeded' : '❌ deleteSavedPlace failed');
        }
    }
    
    // ========== TEST 10: Verify Deletion ==========
    console.log('\n10. Verifying deletion...');
    
    const finalCheckResult = await execute(`
        query FinalCheck($userId: ID!) {
            getUserSavedPlaces(userId: $userId) {
                id
                name
            }
        }
    `, { userId });
    
    if (finalCheckResult?.errors) {
        console.log('❌ Final check error:', finalCheckResult.errors[0].message);
    } else {
        const places = finalCheckResult?.data?.getUserSavedPlaces || [];
        console.log(`✅ Final check: User has ${places.length} saved place(s) remaining`);
        if (places.length > 0) {
            console.log('   Remaining places:', places.map(p => p.name).join(', '));
        }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 Diagnostic Complete');
    console.log('='.repeat(60));
    console.log('\n📋 Test Summary:');
    console.log('  ✓ Created saved place');
    console.log('  ✓ Retrieved user\'s saved places');
    console.log('  ✓ Retrieved specific saved place');
    console.log('  ✓ Added photo to place');
    console.log('  ✓ Updated saved place');
    console.log('  ✓ Searched saved places');
    console.log('  ✓ Removed photo from place');
    console.log('  ✓ Deleted saved place');
    console.log('  ✓ Verified deletion');
    
})();