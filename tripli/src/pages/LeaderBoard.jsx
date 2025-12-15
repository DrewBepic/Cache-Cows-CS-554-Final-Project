import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_GLOBAL_TOP_SPOTS, GET_FRIENDS_TOP_SPOTS } from '../queries';
import { useNavigate } from 'react-router-dom';
import LBTable from '../components/LBTable';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
    Container, Row, Col, Card, Button, Alert, Spinner, ListGroup, Form,
    InputGroup, Badge, Tab, Tabs
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
const Leaderboard = ({ currentUserId }) => {
    const navigate = useNavigate();

    // Set up state for city and country filters
    const [globalCityFilter, setGlobalCityFilter] = useState('');
    const [friendsCityFilter, setFriendsCityFilter] = useState('');
    const [globalCountryFilter, setGlobalCountryFilter] = useState('');
    const [friendsCountryFilter, setFriendsCountryFilter] = useState('');


    const userId = currentUserId || localStorage.getItem('currentUserId');

    // Check if logged in
    if (!userId) {
        return (
            <Container className="my-5">
                <Alert variant="warning">
                    <Alert.Heading>Log In</Alert.Heading>
                    <p>You need to be logged in to view the leaderboard.</p>
                    <Link to="/login">Go to Login</Link>
                </Alert>
            </Container>
        );
    }

    // Query for global top-rated spots
    const { data: globalData, loading: globalLoading, error: globalError } = useQuery(GET_GLOBAL_TOP_SPOTS, {
        variables: {
            limit: 10,
            city: globalCityFilter || undefined,
            country: globalCountryFilter || undefined,
        },
    });

    // Query for the user and friends top-rated spots
    const { data: friendsData, loading: friendsLoading, error: friendsError } = useQuery(GET_FRIENDS_TOP_SPOTS, {
        variables: {
            userId: currentUserId,
            limit: 10,
            city: friendsCityFilter || undefined,
            country: friendsCountryFilter || undefined,
        },
    });

    // initialise variable and get data from query data
    let globalSpots = [];
    if (globalData && globalData.getGlobalTopRatedSpots) {
        globalSpots = globalData.getGlobalTopRatedSpots;
    }

    let friendsSpots = [];
    if (friendsData && friendsData.getUserAndFriendsTopRatedSpots) {
        friendsSpots = friendsData.getUserAndFriendsTopRatedSpots;
    }


    return (
        <div className="container mt-4">
            <h1>Leaderboard</h1>
            <hr />

            <LBTable
                spots={globalSpots}
                loading={globalLoading}
                error={globalError}
                title="Global Top Spots"
                cityFilter={globalCityFilter}
                setCityFilter={setGlobalCityFilter}
                countryFilter={globalCountryFilter}
                setCountryFilter={setGlobalCountryFilter}
            />

            <LBTable
                spots={friendsSpots}
                loading={friendsLoading}
                error={friendsError}
                title="Friends Top Spots"
                cityFilter={friendsCityFilter}
                setCityFilter={setFriendsCityFilter}
                countryFilter={friendsCountryFilter}
                setCountryFilter={setFriendsCountryFilter}
            />
        </div>
    );
};

export default Leaderboard;