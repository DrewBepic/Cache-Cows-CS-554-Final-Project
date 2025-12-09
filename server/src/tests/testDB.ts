import { MongoClient } from 'mongodb';

const testDirectDB = async () => {
  console.log('🔍 Testing MongoDB directly...\n');
  
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('Tripli_DB');
    const users = db.collection('users');
    
    // 1. Create two users directly
    console.log('1. Creating test users...');
    
    const user1 = {
      username: 'direct1',
      first_name: 'Direct',
      last_name: 'One',
      password: 'hash',
      friends: [],
      sent_friend_requests: [],
      received_friend_requests: [],
      reviews: [],
      saved_places: [],
      createdAt: new Date()
    };
    
    const user2 = {
      username: 'direct2',
      first_name: 'Direct',
      last_name: 'Two',
      password: 'hash',
      friends: [],
      sent_friend_requests: [],
      received_friend_requests: [],
      reviews: [],
      saved_places: [],
      createdAt: new Date()
    };
    
    const result1 = await users.insertOne(user1);
    const result2 = await users.insertOne(user2);
    
    console.log('✅ Users created with IDs:', result1.insertedId, result2.insertedId);
    
    // 2. Try the update manually
    console.log('\n2. Testing $addToSet update...');
    
    const update1 = await users.updateOne(
      { _id: result1.insertedId },
      { $addToSet: { sent_friend_requests: result2.insertedId } }
    );
    
    const update2 = await users.updateOne(
      { _id: result2.insertedId },
      { $addToSet: { received_friend_requests: result1.insertedId } }
    );
    
    console.log('✅ Updates attempted:');
    console.log('   Update 1 modified:', update1.modifiedCount);
    console.log('   Update 2 modified:', update2.modifiedCount);
    
    // 3. Check the results
    console.log('\n3. Checking updated documents...');
    
    const updatedUser1 = await users.findOne({ _id: result1.insertedId });
    const updatedUser2 = await users.findOne({ _id: result2.insertedId });
    
    console.log('User1 sent_friend_requests:', updatedUser1?.sent_friend_requests?.length || 0);
    console.log('User2 received_friend_requests:', updatedUser2?.received_friend_requests?.length || 0);
    
    // 4. Clean up
    console.log('\n4. Cleaning up...');
    await users.deleteMany({ username: { $in: ['direct1', 'direct2'] } });
    console.log('✅ Cleaned up test data');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
};

testDirectDB();