import { gql } from '@apollo/client';

const GET_INSTRUCTORS = gql`
query {
    instructors {
        _id
        first_name
        last_name
        department
        email
        phone
        office
        date_hired
        numOfClassesTaught
        courses {
            _id
            course_name
            department
            credits
        }
    }
}
`;

//Queries for Samara
export const GET_USER = gql`
    query GetUser($id: ID!) {
        getUser(id: $id) {
            id
            username
            firstName
            lastName
        }
    }
`;

export const GET_USER_BY_USERNAME = gql`
    query GetUserByUsername($username: String!) {
        getUserByUsername(username: $username) {
            id
            username
            firstName
            lastName
        }
    }
`;

export const SEARCH_USERS = gql`
    query SearchUsers($query: String!) {
        searchUsers(query: $query) {
            id
            username
            firstName
            lastName
        }
    }
`;

export const GET_FRIENDS = gql`
    query GetFriends($userId: ID!) {
        getFriends(userId: $userId) {
            id
            username
            firstName
            lastName
        }
    }
`;

export const GET_FRIEND_REQUESTS = gql`
    query GetFriendRequests($userId: ID!) {
        getFriendRequests(userId: $userId) {
            id
            username
            firstName
            lastName
        }
    }
`;

export const GET_SENT_FRIEND_REQUESTS = gql`
    query GetSentFriendRequests($userId: ID!) {
        getSentFriendRequests(userId: $userId) {
            id
            username
            firstName
            lastName
        }
    }
`;

export const GET_USER_REVIEWS = gql`
    query GetUserReviews($userId: ID!) {
        getUserReviews(userId: $userId) {
            id
            userId
            placeId
            placeName
            rating
            notes
            createdAt
        }
    }
`;

export const GET_REVIEWS_BY_PLACE = gql`
    query GetReviewsByPlace($placeId: String!) {
        getReviewsByPlace(placeId: $placeId) {
            id
            userId
            placeName
            rating
            notes
            createdAt
        }
    }
`;

//may need to change this one later
export const GET_SAVED_PLACES = gql`
    query GetSavedPlaces($userId: ID!) {
        getSavedPlaces(userId: $userId)
    }
`;

export const SEND_FRIEND_REQUEST = gql`
    mutation SendFriendRequest($currentUserId: ID!, $friendUsername: String!) {
        sendFriendRequest(currentUserId: $currentUserId, friendUsername: $friendUsername) {
            id
            username
            firstName
            lastName
        }
    }
`;

export const ACCEPT_FRIEND_REQUEST = gql`
    mutation AcceptFriendRequest($currentUserId: ID!, $friendId: ID!) {
        acceptFriendRequest(currentUserId: $currentUserId, friendId: $friendId) {
            id
            username
            firstName
            lastName
        }
    }
`;

export const REJECT_FRIEND_REQUEST = gql`
    mutation RejectFriendRequest($currentUserId: ID!, $friendId: ID!) {
        rejectFriendRequest(currentUserId: $currentUserId, friendId: $friendId) {
            id
            username
            firstName
            lastName
        }
    }
`;

export const REMOVE_FRIEND = gql`
    mutation RemoveFriend($currentUserId: ID!, $friendId: ID!) {
        removeFriend(currentUserId: $currentUserId, friendId: $friendId) {
            id
            username
            firstName
            lastName
        }
    }
`;