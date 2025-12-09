//Typescript types

export interface User {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    friends: User[];
    sentFriendRequests: User[];
    receivedFriendRequests: User[];
    reviews: Review[];
    savedPlaces: string[];
}

export interface Review {
    id: string;
    userId: string;
    placeId: string;
    placeName: string;
    rating: number;
    notes?: string;
    createdAt: string;
}

export interface UserInput {
    username: string;
    firstName: string;
    lastName: string;
    password: string;
}

export interface FriendRequestInput {
    currentUserId: string;
    friendUsername: string;
}

export interface AcceptFriendRequestInput {
    currentUserId: string;
    friendId: string;
}

export interface ReviewInput {
    userId: string;
    placeId: string;
    placeName: string;
    rating: number;
    notes?: string;
}