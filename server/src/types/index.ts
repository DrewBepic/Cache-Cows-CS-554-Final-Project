//put sll interfaces and types here

export interface User {
    _id?: string;
    username: string;
    first_name: string;
    last_name: string;
    password: string;
    friends: string[]; //arr of user ids
    sent_friend_requests: string[];
    received_friend_requests: string[];
    reviews: string[];//arr or review ids
    saved_places: string[]; 
}

export interface Review {
    _id?: string;
    user_id: string;
    place_id: string; //idek what exactly will identify a place yet
    place_name: string;
    rating: number;
    notes?: string;
    createdAt: Date;
}

//GraphQL context
export interface Context {
    user?: User;
}