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
        username: String
        placeId: String!
        placeName: String!
        rating: Int!
        notes: String
        photos: [String]
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

    type City {
        name: String!
        country: String!
        lat: Float!
        lng: Float!
    }

    type SavedPlace {
        id: ID!
        placeId: String
        name: String!
        description: String
        city: String
        country: String
        address: String
        photos: [String!]!
        rating: Float
        tripliRating: Float
        phoneNumber: String
        types: [String!]
        reviews: [Review!]!
    }

    type Place {
        id: ID!
        placeId: String!
        name: String!
        description: String
        city: String
        country: String
        address: String
        rating: Float
        phoneNumber: String
        types: [String!]
        photos: [String!]
        reviews: [Review!]
    }

    type NearbyPlace {
        placeId: String!
        name: String!
        address: String
        rating: Float
        types: [String!]
        photos: [String!]
        phoneNumber: String
        description: String
    }

    type TopRatedSpot {
        placeId: String!
        placeName: String!
        averageRating: Float!
        reviewCount: Int!
        country: String
        city: String
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
        searchNearbyPlaces(lat: Float!, lng: Float!, type: String!): [NearbyPlace!]!
        searchCities(query: String!): [City!]!
        getPlace(id: ID!): SavedPlace
        
        getGlobalTopRatedSpots(limit: Int, country: String, city: String): [TopRatedSpot!]!
        getUserAndFriendsTopRatedSpots(userId: ID!, limit: Int, country: String, city: String): [TopRatedSpot!]!
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
            photos: [String]
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

        importGooglePlace(googlePlaceId: String!): SavedPlace!
    }
`;