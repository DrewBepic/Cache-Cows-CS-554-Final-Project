'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client/react'; //remember to download
import {useState, useEffect} from 'react';
import {Container, Row, Col, Card, Badge, Button, Spinner, Alert} from 'react-bootstrap';
import {GET_USER, GET_USER_REVIEWS, GET_SAVED_PLACES} from "../../../queries.js";
import type {User, Review} from '../../../types.js';



export default function ProfilePage() {
    const params = useParams();
    const userId = params.userId as string;

    //get user data
    const { data: userData, loading: userLoading, error: userError} = useQuery(GET_USER, {
        variables: {id: userId}
    });

    const {data: reviewsData, loading: reviewsLoading, error: reviewsError} = useQuery(
        GET_USER_REVIEWS,
        {
            variables: {userId: userId}
        }
    );

    const {data: savedPlacedData, loading: savedLoading, error: savedError} = useQuery(
        GET_SAVED_PLACES,
        {
            variables: {userId: userId}
        }
    );

    //check if loading
    if (userLoading || reviewsLoading || savedLoading) {
        return (
            <Container className="text-center py-5">
                <Spinner animation="border" variant="primary"/>
                <p className="mt-3">Loading profile...</p>
            </Container>
        );
    }
    //check if error
    if (userError) {
        return (
            <Container className="py-5">
                <Alert variant="danger">
                    <Alert.Heading>Error loading profile</Alert.Heading>
                    <p>{userError.message}</p>
                </Alert>
            </Container>
        );
    }
    else if (reviewsError) {
        return (
            <Container className="py-5">
                <Alert variant="danger">
                    <Alert.Heading>Error loading reviews</Alert.Heading>
                    <p>{reviewsError.message}</p>
                </Alert>
            </Container>
        );
    }
    else if (savedError) {
        return (
            <Container className="py-5">
                <Alert variant="danger">
                    <Alert.Heading>Error loading saved places</Alert.Heading>
                    <p>{savedError.message}</p>
                </Alert>
            </Container>
        );
    }

    //check if user was found
    if (!userData || !userData.getUser) {
        return (
            <Container className="py-5">
                <Alert variant="warning">
                    <Alert.Heading>User not found</Alert.Heading>
                    <p>The user profile you're looking for does not exist</p>
                </Alert>
            </Container>
        );
    }

    const user = userData.getUser;

    return (
        <div>
            <h1></h1>
        </div>
    );
}