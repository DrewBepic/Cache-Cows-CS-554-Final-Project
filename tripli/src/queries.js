import { gql } from '@apollo/client';

//user queries

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

// friend ones

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

// review ones

export const GET_USER_REVIEWS = gql`
  query GetUserReviews($userId: ID!) {
    getUserReviews(userId: $userId) {
      id
      placeId
      placeName
      rating
      notes
      createdAt
    }
  }
`;

// saved places ones

export const GET_SAVED_PLACES = gql`
  query GetSavedPlaces($userId: ID!) {
    getSavedPlaces(userId: $userId)
  }
`;

// mutations - only some used by samara

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

export const CREATE_REVIEW = gql`
  mutation CreateReview($userId: ID!, $placeId: String!, $placeName: String!, $rating: Int!, $notes: String) {
    createReview(userId: $userId, placeId: $placeId, placeName: $placeName, rating: $rating, notes: $notes) {
      id
      placeId
      placeName
      rating
      notes
      createdAt
    }
  }
`;

export const DELETE_REVIEW = gql`
  mutation DeleteReview($userId: ID!, $reviewId: ID!) {
    deleteReview(userId: $userId, reviewId: $reviewId)
  }
`;

export const ADD_SAVED_PLACE = gql`
  mutation AddSavedPlace($userId: ID!, $placeId: String!) {
    addSavedPlace(userId: $userId, placeId: $placeId)
  }
`;

export const REMOVE_SAVED_PLACE = gql`
  mutation RemoveSavedPlace($userId: ID!, $placeId: String!) {
    removeSavedPlace(userId: $userId, placeId: $placeId)
  }
`;