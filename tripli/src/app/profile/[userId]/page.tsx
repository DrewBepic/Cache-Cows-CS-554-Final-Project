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


    return (
        <div>
            <h1></h1>
        </div>
    );
}