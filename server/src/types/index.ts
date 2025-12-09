//put sll interfaces and types here
import { ObjectId } from 'mongodb';

export interface User {
    _id?: ObjectId | string;
    username: string;
    first_name: string;
    last_name: string;
    password: string;
    friends: ObjectId[] | string[]; //arr of user ids
    sent_friend_requests: ObjectId[] | string[];
    received_friend_requests: ObjectId[] | string[];
    reviews: ObjectId[] | string[];//arr of review ids
    saved_places: ObjectId[] | string[]; 
}

//below needed for creating user
export interface UserInput {
    username: string;
    first_name: string;
    last_name: string;
    password: string;
}

//below is for friend request
export interface FriendRequestInput {
    username: string;
}

//below is for search results
export interface UserSearchResult {
    _id: string;
    username: string;
    first_name: string;
    last_name: string;
}

export interface Review {
    _id?: ObjectId | string;
    user_id: ObjectId | string;
    place_id: ObjectId | string; //idek what exactly will identify a place yet
    place_name: string;
    rating: number;
    notes?: string;
    createdAt: Date;
}