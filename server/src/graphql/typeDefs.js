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

    type AuthResponse {
        success: Boolean!
        message: String!
    }

    type GeoLocation {
        lat: Float
        lng: Float
    }

    type SavedPlace {
        id: ID!
        name: String!
        description: String
        city: String!
        country: String!
        address: String
        photos: [String!]!
        rating: Float
        phoneNumber: String
        types: [String!]
        reviews: [Review!]!
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

        getSavedPlace(placeId: ID!): SavedPlace
        getUserSavedPlaces(userId: ID!): [SavedPlace!]! 
        searchSavedPlaces(query: String!, userId: ID): [SavedPlace!]!
        autocompleteSavedPlaces(prefix: String!): [String!]!
    }

    type Mutation {
        createUser(
            username: String!
            firstName: String!
            lastName: String!
            password: String!
        ): User!

        login(username: String!, password: String!): User!
        logout: AuthResponse!

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

        createSavedPlace(
        userId: ID!
        name: String!
        description: String
        city: String!
        country: String!
        photos: [String!]
        ): SavedPlace!

        updateSavedPlace(
            placeId: ID!
            name: String
            description: String
            city: String
            country: String
            photos: [String!]
        ): SavedPlace!

        deleteSavedPlace(userId: ID!, placeId: ID!): Boolean!
        addPhotoToPlace(placeId: ID!, photoUrl: String!): Boolean!
        removePhotoFromPlace(placeId: ID!, photoUrl: String!): Boolean!
    }
`;