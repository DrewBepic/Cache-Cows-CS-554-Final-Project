import { ApolloServer } from '@apollo/server';
import { typeDefs } from '../graphql/typeDefs.js';
import { resolvers } from '../graphql/resolvers.js';
const server = new ApolloServer({ typeDefs, resolvers });
const execute = async (query, variables) => {
    const result = await server.executeOperation({ query, variables });
    return result.body.kind === 'single' ? result.body.singleResult : null;
};
(async () => {
    console.log('🔍 Diagnostic Test - Fresh Users\n');
    const timestamp = Date.now();
    const user1Username = `fresh1_${timestamp}`;
    const user2Username = `fresh2_${timestamp}`;
    console.log('Creating users:', user1Username, 'and', user2Username);
    // Create User 1
    const user1 = await execute(`
    mutation CreateUser1($username: String!) {
      createUser(
        username: $username
        firstName: "Fresh"
        lastName: "One"
        password: "pass123"
      ) {
        id
        username
        firstName
        lastName
      }
    }
  `, { username: user1Username });
    if (user1?.errors) {
        console.log('❌ User1 creation error:', user1.errors[0].message);
        return;
    }
    // Create User 2
    const user2 = await execute(`
    mutation CreateUser2($username: String!) {
      createUser(
        username: $username
        firstName: "Fresh"
        lastName: "Two"
        password: "pass123"
      ) {
        id
        username
        firstName
        lastName
      }
    }
  `, { username: user2Username });
    if (user2?.errors) {
        console.log('❌ User2 creation error:', user2.errors[0].message);
        return;
    }
    const id1 = user1?.data?.createUser?.id;
    const id2 = user2?.data?.createUser?.id;
    console.log('\n✅ Created:');
    console.log('  User1:', user1?.data?.createUser?.username, 'ID:', id1);
    console.log('  User2:', user2?.data?.createUser?.username, 'ID:', id2);
    if (!id1 || !id2) {
        console.log('❌ User IDs are empty!');
        console.log('User1 data:', JSON.stringify(user1?.data, null, 2));
        console.log('User2 data:', JSON.stringify(user2?.data, null, 2));
        return;
    }
    // ========== TEST 1: Send Friend Request ==========
    console.log('\n' + '='.repeat(50));
    console.log('1. Testing sendFriendRequest...');
    const sendResult = await execute(`
    mutation SendRequest($currentUserId: ID!, $friendUsername: String!) {
      sendFriendRequest(currentUserId: $currentUserId, friendUsername: $friendUsername) {
        id
        username
        sentFriendRequests {
          id
          username
        }
      }
    }
  `, {
        currentUserId: id1,
        friendUsername: user2Username
    });
    if (sendResult?.errors) {
        console.log('❌ sendFriendRequest error:', sendResult.errors[0].message);
    }
    else {
        console.log('✅ sendFriendRequest succeeded');
        const sender = sendResult?.data?.sendFriendRequest;
        console.log(`   ${sender?.username} shows sent requests:`, sender?.sentFriendRequests?.length || 0);
    }
    // ========== TEST 2: Check User1 Directly ==========
    console.log('\n2. Checking User1 via getUser...');
    const checkUser1 = await execute(`
    query CheckUser1($id: ID!) {
      getUser(id: $id) {
        id
        username
        sentFriendRequests {
          id
          username
        }
      }
    }
  `, { id: id1 });
    if (checkUser1?.errors) {
        console.log('❌ getUser error:', checkUser1.errors[0].message);
    }
    else {
        const user1Data = checkUser1?.data?.getUser;
        console.log(`✅ ${user1Data?.username} has sent requests:`, user1Data?.sentFriendRequests?.length || 0);
    }
    // ========== TEST 3: Check User2 Friend Requests ==========
    console.log('\n3. Checking User2 friend requests...');
    const checkRequests = await execute(`
    query CheckRequests($id: ID!) {
      getFriendRequests(userId: $id) {
        id
        username
      }
    }
  `, { id: id2 });
    if (checkRequests?.errors) {
        console.log('❌ getFriendRequests error:', checkRequests.errors[0].message);
    }
    else {
        const requests = checkRequests?.data?.getFriendRequests || [];
        console.log(`✅ getFriendRequests found ${requests.length} request(s)`);
        if (requests.length > 0) {
            console.log('   From:', requests.map((r) => r.username).join(', '));
        }
    }
    // ========== TEST 4: Check User2 Directly ==========
    console.log('\n4. Checking User2 via getUser...');
    const checkUser2 = await execute(`
    query CheckUser2($id: ID!) {
      getUser(id: $id) {
        id
        username
        receivedFriendRequests {
          id
          username
        }
      }
    }
  `, { id: id2 });
    if (checkUser2?.errors) {
        console.log('❌ getUser error:', checkUser2.errors[0].message);
    }
    else {
        const user2Data = checkUser2?.data?.getUser;
        console.log(`✅ ${user2Data?.username} has received requests:`, user2Data?.receivedFriendRequests?.length || 0);
    }
    console.log('\n' + '='.repeat(50));
    console.log('🎯 Diagnostic Complete');
    console.log('='.repeat(50));
})();
