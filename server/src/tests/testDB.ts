//DELETE BEFORE SUBMITTING
//WORKS
import { createUser, findUserByUsername, searchUsersByUsername, addSavedPlace, getSavedPlaces } from '../db_functions/users.js';
import { 
  sendFriendRequest, 
  acceptFriendRequest, 
  rejectFriendRequest, 
  removeFriend, 
  getUserFriends, 
  getFriendRequests,
  getSentFriendRequests 
} from '../db_functions/friends.js';
import { createReview, getReviewsByUserId, deleteReview } from '../db_functions/reviews.js';

// Helper function to clear console and add spacing
const log = (message: string, data?: any) => {
  console.log('\n' + '='.repeat(50));
  console.log(`📝 ${message}`);
  if (data) console.log(data);
  console.log('='.repeat(50) + '\n');
};

const runTests = async () => {
  try {
    log('🚀 STARTING DATABASE TESTS');
    
    // ========== TEST 1: Create Users ==========
    log('1️⃣ Creating test users...');
    
    const user1 = await createUser({
      username: 'john_doe',
      first_name: 'John',
      last_name: 'Doe',
      password: 'password123'
    });
    log('Created user 1:', { username: user1.username, id: user1._id });

    const user2 = await createUser({
      username: 'jane_smith',
      first_name: 'Jane',
      last_name: 'Smith',
      password: 'password123'
    });
    log('Created user 2:', { username: user2.username, id: user2._id });

    const user3 = await createUser({
      username: 'bob_johnson',
      first_name: 'Bob',
      last_name: 'Johnson',
      password: 'password123'
    });
    log('Created user 3:', { username: user3.username, id: user3._id });

    // ========== TEST 2: Find Users ==========
    log('2️⃣ Finding users...');
    
    const foundUser = await findUserByUsername('john_doe');
    if (foundUser) {
      log('Found user by username:', { 
        username: foundUser.username, 
        name: `${foundUser.first_name} ${foundUser.last_name}` 
      });
    }

    const searchResults = await searchUsersByUsername('j');
    log('Search users with "j":', 
      searchResults.map(u => ({ username: u.username, name: `${u.first_name} ${u.last_name}` }))
    );

    // ========== TEST 3: Friend Requests ==========
    log('3️⃣ Testing friend requests...');
    
    // John sends friend request to Jane
    const johnAfterSending = await sendFriendRequest(user1._id!.toString(), user2.username);
    log('John sent friend request to Jane:', {
      sent_requests: johnAfterSending.sent_friend_requests.length,
      received_requests: johnAfterSending.received_friend_requests.length
    });

    // Check Jane's received requests
    const janeRequests = await getFriendRequests(user2._id!.toString());
    log('Jane has pending requests:', janeRequests.map(r => r.username));

    // Check John's sent requests
    const johnSent = await getSentFriendRequests(user1._id!.toString());
    log('John\'s sent requests:', johnSent.map(r => r.username));

    // ========== TEST 4: Accept Friend Request ==========
    log('4️⃣ Accepting friend request...');
    
    // Jane accepts John's request
    const janeAfterAccepting = await acceptFriendRequest(user2._id!.toString(), user1._id!.toString());
    log('Jane accepted John\'s request:', {
      friends: janeAfterAccepting.friends.length,
      sent_requests: janeAfterAccepting.sent_friend_requests.length,
      received_requests: janeAfterAccepting.received_friend_requests.length
    });

    // Check John's friends
    const johnFriends = await getUserFriends(user1._id!.toString());
    log('John\'s friends:', johnFriends.map(f => f.username));

    // ========== TEST 5: Send request to Bob ==========
    log('5️⃣ Sending request to Bob...');
    
    await sendFriendRequest(user1._id!.toString(), user3.username);
    log('John sent friend request to Bob');

    // ========== TEST 6: Reject Friend Request ==========
    log('6️⃣ Rejecting friend request...');
    
    // Bob rejects John's request
    const bobAfterRejecting = await rejectFriendRequest(user3._id!.toString(), user1._id!.toString());
    log('Bob rejected John\'s request:', {
      friends: bobAfterRejecting.friends.length,
      sent_requests: bobAfterRejecting.sent_friend_requests.length,
      received_requests: bobAfterRejecting.received_friend_requests.length
    });

    // ========== TEST 7: Saved Places ==========
    log('7️⃣ Testing saved places...');
    
    // John saves some places
    await addSavedPlace(user1._id!.toString(), 'place_123');
    await addSavedPlace(user1._id!.toString(), 'place_456');
    await addSavedPlace(user1._id!.toString(), 'place_789');
    
    const johnPlaces = await getSavedPlaces(user1._id!.toString());
    log('John\'s saved places:', johnPlaces);

    // Try to add duplicate (should not add)
    await addSavedPlace(user1._id!.toString(), 'place_123');
    const johnPlacesAfterDuplicate = await getSavedPlaces(user1._id!.toString());
    log('John\'s saved places after duplicate (should still be 3):', johnPlacesAfterDuplicate.length);

    // ========== TEST 8: Reviews ==========
    log('8️⃣ Testing reviews...');
    
    // John reviews a place
    const review1 = await createReview(
      user1._id!.toString(),
      'place_123',
      'Eiffel Tower',
      5,
      'Amazing view!'
    );
    log('John created review:', {
      place: review1.place_name,
      rating: review1.rating,
      notes: review1.notes
    });

    // John reviews another place
    const review2 = await createReview(
      user1._id!.toString(),
      'place_456',
      'Statue of Liberty',
      4,
      'Great tour!'
    );

    // Get John's reviews
    const johnReviews = await getReviewsByUserId(user1._id!.toString());
    log('John\'s reviews:', johnReviews.map(r => ({
      place: r.place_name,
      rating: r.rating,
      notes: r.notes
    })));

    // ========== TEST 9: Remove Friend ==========
    log('9️⃣ Removing friend...');
    
    // John and Jane are friends, let's remove
    const johnAfterRemoving = await removeFriend(user1._id!.toString(), user2._id!.toString());
    log('John removed Jane as friend:', {
      friends: johnAfterRemoving.friends.length,
      sent_requests: johnAfterRemoving.sent_friend_requests.length
    });

    const johnFriendsAfterRemoval = await getUserFriends(user1._id!.toString());
    log('John\'s friends after removal:', johnFriendsAfterRemoval.map(f => f.username));

    // ========== TEST 10: Edge Cases ==========
    log('🔟 Testing edge cases...');
    
    try {
      // Try to add yourself as friend
      await sendFriendRequest(user1._id!.toString(), user1.username);
      log('ERROR: Should have thrown "cannot add yourself" error');
    } catch (error: any) {
      log('✓ Correctly prevented adding self:', error.message);
    }

    try {
      // Try to send duplicate request
      await sendFriendRequest(user1._id!.toString(), user3.username); // Already sent earlier
      log('ERROR: Should have thrown "already sent" error');
    } catch (error: any) {
      log('✓ Correctly prevented duplicate request:', error.message);
    }

    // ========== FINAL STATE ==========
    log('📊 FINAL DATABASE STATE');
    
    // Get all users
    const { users: usersCollection } = await import('../db_config/mongoCollections.js');
    const allUsers = await (await usersCollection()).find({}).toArray();
    
    console.log('\nAll Users in Database:');
    allUsers.forEach(user => {
      console.log(`\n👤 ${user.username} (${user.first_name} ${user.last_name}):`);
      console.log(`   Friends: ${user.friends.length}`);
      console.log(`   Sent Requests: ${user.sent_friend_requests.length}`);
      console.log(`   Received Requests: ${user.received_friend_requests.length}`);
      console.log(`   Reviews: ${user.reviews.length}`);
      console.log(`   Saved Places: ${user.saved_places.length}`);
    });

    // Get all reviews
    const { reviews: reviewsCollection } = await import('../db_config/mongoCollections.js');
    const allReviews = await (await reviewsCollection()).find({}).toArray();
    
    console.log('\n📝 All Reviews in Database:');
    allReviews.forEach(review => {
      console.log(`\n   ${review.place_name} (${review.rating}/5)`);
      console.log(`   Notes: ${review.notes}`);
      console.log(`   By user ID: ${review.user_id}`);
    });

    log('✅ ALL TESTS COMPLETED SUCCESSFULLY!');
    
  } catch (error: any) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

// Run tests
runTests();