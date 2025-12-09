import { useState, useEffect} from 'react';
import { useParams, Link} from 'react-router-dom';
import {useQuery} from '@apollo/client/react';
import {Container, Row, Col, Card, Button, Alert, Spinner} from 'react-bootstrap';
import {GET_USER, GET_USER_REVIEWS, GET_SAVED_PLACES} from '../queries.js';

function UserProfile() {
    const {userId} = useParams();
    const [activeTab, setActiveTab] = useState('reviews');
    const {loading: userLoading, error: userError, data: userData} = useQuery(
        GET_USER, {
            variables: { id: userId}
        }
    );
    const {loading: reviewsLoading, error: reviewsError, data: reviewsData} = useQuery(
        GET_USER_REVIEWS, {
            variables: {userId}
        }
    );
    const {loading: savedLoading, error: savedError, data: savedData} = useQuery(
        GET_SAVED_PLACES, {
            variables: {userId}
        }
    );

    //check if loading
    if (userLoading) {
        return (
            <Container className="text-center my-5">
                <Spinner animation="border" role="status">
                    <span>Loading...</span>
                </Spinner>
                <p className="mt-3">Loading...</p>
            </Container>
        );
    }
    
    //check for errors
    if (userError) {
        return (
            <Container className="my-5">
                <Alert variant="danger">
                    <Alert.Heading>Error loading profile</Alert.Heading>
                    <p>{userError.message}</p>
                </Alert>
            </Container>
        );
    }

    //check if user exists
    if (!userData || !userData.getUser) {
        return (
            <Container className="my-5">
                <Alert variant="warning">
                    <Alert.Heading>User not found</Alert.Heading>
                    <p>The user you are looking for does not exist.</p>
                </Alert>
            </Container>
        );
    }

    const user = userData.getUser;
    return (
        <Container className="my-4">
            {/* Card for user info*/}
            <Card className="mb-4 shadow-sm">
                <Card.Body>
                    <Row className="align-items-center">
                        <Col>
                            <h1>{user.firstName} {user.lastName}</h1>
                            <h2>Username: @{user.username}</h2>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
            {/*tabs for reviews and saved places*/}
            <div className="d-flex border-bottom mb-4">
                <Button
                    variant="link"
                    className={`text-decoration-none me-3 ${activeTab == 'reviews'? 'text-primary' : 'text-secondary'}`}
                    onClick={() => setActiveTab('reviews')}
                >
                    Reviews
                </Button>
                <Button
                    variant="link"
                    className={`text-decoration-none me-3 ${activeTab == 'saved'? 'text-primary' : 'text-secondary'}`}
                    onClick={() => setActiveTab('saved')}
                >
                    Places
                </Button>
            </div>
            {/*reviews tab info*/}
            {activeTab == 'reviews' && (
                <>
                    <h3 className="mb-4">Reviews</h3>
                    {reviewsLoading? (
                        <div className="text-center">
                            <Spinner animation="border"/>
                            <p>Loading...</p>
                        </div>
                    ) : reviewsError? (
                        <Alert variant="danger">
                            <Alert.Heading>Error loading reviews</Alert.Heading>
                            <p>{reviewsError.message}</p>
                        </Alert>
                    ) : !reviewsData || reviewsData.getUserReviews.length == 0 ? (
                        <p>{user.username} hasn't written any reviews yet.</p>
                    ) : (
                        <Row className="g-4" md={2} lg={3}>
                            {reviewsData.getuserReviews.map((review) => (
                                <Col key={review.id}>
                                    <Card className="h-100 shadow-sm">
                                        <Card.Body>
                                            <Card.Title>{review.placeName}</Card.Title>
                                            <span>Rating: {review.rating}/5</span>
                                            <Card.Text>{review.notes || "No review notes provided."}</Card.Text>
                                            <Card.Text><em>Reviewed on {review.createdAt}</em></Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}
                </>
            )}
            {/*saved places tab info*/}
            {activeTab == 'saved' && (
                <>
                <h3 className="mb-4">Saved Places</h3>
                {savedLoading ? (
                    <div className="text-center">
                        <Spinner animation="border"/>
                        <p>Loading...</p>
                    </div>
                ) : savedError ? (
                    <Alert variant="danger">
                        <Alert.Heading>Error loading saved places</Alert.Heading>
                        <p>{savedError.message}</p>
                    </Alert>
                ) : !savedData || savedData.getSavedPlaces.length == 0 ? (
                    <p>{user.username} hasn't saved any places yet.</p>
                ) : (
                    <Row className="g-4" md={2} lg={3}>
                        {savedData.getSavedPlaces.map((placeId, index) => (
                            <Col key={index}>
                                <Card className="h-100 shadow-sm">
                                    <Card.Body>
                                        <Card.Title>Saved Place</Card.Title>
                                        <Card.Text>Place ID: <strong>{placeId}</strong></Card.Text>
                                        <Card.Text>will eventually be added lol</Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
                </>
            )}
        </Container>
    );


}

export default UserProfile;