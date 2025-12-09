export const typeDefs = `#graphql
    type User {
        id: ID!
        username: String!
        firstName: String!
        lastName: String!
        friends: [User!]!
        sentFriendRequests: [User!]!
        receivedFriendRequests: [User!]!
        reviews: [Review!]!
        savedPlaces: [String!]!
    }

    type Review {
        id: ID!
        userId: ID!
        placeId: String!
        placeName: String!
        rating: Int!
        notes: String
        createdAt: String!
    }

    type Query {
        getUser(id: ID!): User
        getUserByUsername(username: String!): User
        searchUsers(query: String!): [User!]!

        getFriends(userId: ID!): [User!]!
        getFriendRequests(userId: ID!): [User!]!
        getSentFriendRequests(userId: ID!): [User!]!

        getUserReviews(userId: ID!): [Review!]!
        getReviewsByPlace(placeId: String!): [Review!]!

        getSavedPlaces(userId: ID!): [String!]!
    }

    type Mutation {
        createUser(
            username: String!
            firstName: String!
            lastName: String!
            password: String!
        ): User!

        sendFriendRequest(currentUserId: ID!, friendUsername: String!): User!
        acceptFriendRequest(currentUserId: ID!, friendId: ID!): User!
        rejectFriendRequest(currentUserId: ID!, friendId: ID!): User!
        removeFriend(currentUserId: ID!, friendId: ID!): User!

        createReview(
            userId: ID!
            placeId: String!
            placeName: String!
            rating: Int!
            notes: String
        ): Review!

        deleteReview(userId: ID!, reviewId: ID!): Boolean!

        addSavedPlace(userId: ID!, placeId: String!): Boolean!
        removeSavedPlace(userId: ID!, placeId: String!): Boolean!
    }
`;