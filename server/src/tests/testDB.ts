import { createUser } from '../db_functions/users.js';
import { sendFriendRequest, acceptFriendRequest } from '../db_functions/friends.js';
import { createReview } from '../db_functions/reviews.js';

//called test but acc j populates db lol
const populateData = async () => {
  console.log('📝 Populating test data...\n');
  
  try {
    // Create test users
    const users = [];
    
    const user1 = await createUser({
      username: 'alice_wonder',
      first_name: 'Alice',
      last_name: 'Wonderland',
      password: 'password123'
    });
    users.push(user1);
    console.log('✅ Created Alice:', user1.username);
    
    const user2 = await createUser({
      username: 'bob_builder',
      first_name: 'Bob',
      last_name: 'Builder',
      password: 'password123'
    });
    users.push(user2);
    console.log('✅ Created Bob:', user2.username);
    
    const user3 = await createUser({
      username: 'charlie_choc',
      first_name: 'Charlie',
      last_name: 'Chocolate',
      password: 'password123'
    });
    users.push(user3);
    console.log('✅ Created Charlie:', user3.username);
    
    // Create friendships
    console.log('\n🤝 Creating friendships...');
    
    // Alice sends request to Bob
    await sendFriendRequest(user1._id!, user2.username);
    // Bob accepts
    await acceptFriendRequest(user2._id!, user1._id!);
    console.log('✅ Alice and Bob are now friends');
    
    // Alice sends request to Charlie
    await sendFriendRequest(user1._id!, user3.username);
    console.log('✅ Alice sent friend request to Charlie');
    
    // Create reviews
    console.log('\n⭐ Creating reviews...');
    
    await createReview(
      user1._id!,
      'eiffel-tower',
      'Eiffel Tower',
      5,
      'Absolutely breathtaking views! The lights at night are magical.'
    );
    console.log('✅ Alice reviewed Eiffel Tower');
    
    await createReview(
      user1._id!,
      'colosseum',
      'Colosseum',
      4,
      'Incredible historical site. The guided tour was informative.'
    );
    console.log('✅ Alice reviewed Colosseum');
    
    await createReview(
      user2._id!,
      'great-wall',
      'Great Wall of China',
      5,
      'An unforgettable hike with stunning vistas.'
    );
    console.log('✅ Bob reviewed Great Wall');
    
    // Add saved places
    console.log('\n📍 Adding saved places...');
    
    const { addSavedPlace } = await import('./db_functions/users.js');
    await addSavedPlace(user1._id!, 'statue-of-liberty');
    await addSavedPlace(user1._id!, 'taj-mahal');
    await addSavedPlace(user2._id!, 'machu-picchu');
    await addSavedPlace(user3._id!, 'santorini');
    
    console.log('✅ Added saved places for all users');
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 Test data populated successfully!');
    console.log('='.repeat(50));
    console.log('\nTest User IDs:');
    console.log('Alice:', user1._id);
    console.log('Bob:', user2._id);
    console.log('Charlie:', user3._id);
    console.log('\nUse Alice\'s ID in the frontend debug input!');
    
  } catch (error: any) {
    console.error('❌ Error populating data:', error.message);
  }
};

populateData();