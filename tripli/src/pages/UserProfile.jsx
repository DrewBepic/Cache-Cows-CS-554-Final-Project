import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { GET_USER, GET_USER_REVIEWS, GET_SAVED_PLACES } from '../queries.js';

function UserProfile() {
    const { userId } = useParams();
    const [activeTab, setActiveTab] = useState('reviews');
    
    const { loading: userLoading, error: userError, data: userData } = useQuery(
        GET_USER, {
            variables: { id: userId }
        }
    );
    
    const { loading: reviewsLoading, error: reviewsError, data: reviewsData } = useQuery(
        GET_USER_REVIEWS, {
            variables: { userId }
        }
    );
    
    const { loading: savedLoading, error: savedError, data: savedData } = useQuery(
        GET_SAVED_PLACES, {
            variables: { userId }
        }
    );

    //check if loading
    if (userLoading) {
        return (
            <Container className="text-center my-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-3">Loading user profile...</p>
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
                    <Link to="/friends" className="btn btn-outline-primary">
                        Back to Friends
                    </Link>
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
                    <Link to="/friends" className="btn btn-outline-primary">
                        Back to Friends
                    </Link>
                </Alert>
            </Container>
        );
    }

    const user = userData.getUser;
    const reviews = reviewsData?.getUserReviews || [];
    const savedPlaces = savedData?.getSavedPlaces || [];

    // Format date function
    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown date';
        const date = new Date(parseInt(dateString));
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Render star rating
    const renderStars = (rating) => {
        return (
            <div className="text-warning mb-2">
                {'★'.repeat(rating)}
                {'☆'.repeat(5 - rating)}
                <span className="ms-2 text-dark fw-bold">{rating}/5</span>
            </div>
        );
    };

    return (
        <Container className="my-4">
            {/* Card for user info */}
            <Card className="mb-4 shadow-sm border-0">
                <Card.Body className="p-4">
                    <Row className="align-items-center">
                        <Col>
                            <div className="d-flex align-items-center mb-3">
                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                                     style={{ width: '60px', height: '60px', fontSize: '24px' }}>
                                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                                </div>
                                <div>
                                    <h1 className="mb-1">{user.firstName} {user.lastName}</h1>
                                    <h4 className="text-muted mb-0">@{user.username}</h4>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Tabs for reviews and saved places */}
            <div className="d-flex border-bottom mb-4">
                <Button
                    variant="link"
                    className={`text-decoration-none me-3 px-4 py-2 ${activeTab === 'reviews' ? 'text-primary border-bottom border-primary border-3' : 'text-secondary'}`}
                    onClick={() => setActiveTab('reviews')}
                >
                    <h5 className="mb-0">Reviews</h5>
                </Button>
                <Button
                    variant="link"
                    className={`text-decoration-none px-4 py-2 ${activeTab === 'saved' ? 'text-primary border-bottom border-primary border-3' : 'text-secondary'}`}
                    onClick={() => setActiveTab('saved')}
                >
                    <h5 className="mb-0">Saved Places</h5>
                </Button>
            </div>

            {/* Reviews tab info */}
            {activeTab === 'reviews' && (
                <>
                    <h3 className="mb-4">Reviews ({reviews.length})</h3>
                    {reviewsLoading ? (
                        <div className="text-center my-5">
                            <Spinner animation="border" />
                            <p className="mt-2">Loading reviews...</p>
                        </div>
                    ) : reviewsError ? (
                        <Alert variant="danger" className="mb-4">
                            <Alert.Heading>Error loading reviews</Alert.Heading>
                            <p>{reviewsError.message}</p>
                        </Alert>
                    ) : reviews.length === 0 ? (
                        <Card className="mb-4">
                            <Card.Body className="text-center py-5">
                                <p className="text-muted mb-0">{user.firstName} hasn't written any reviews yet.</p>
                            </Card.Body>
                        </Card>
                    ) : (
                        <Row xs={1} md={2} lg={3} className="g-4">
                            {reviews.map((review) => (
                                <Col key={review.id}>
                                    <Card className="shadow-sm border-0 hover-shadow" style={{ width: '18rem' }}>
                                        <Card.Body className="p-4">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <Card.Title className="mb-0 fw-bold">{review.placeName}</Card.Title>
                                                <Badge bg="light" text="dark" className="px-3 py-2">
                                                    {review.rating}/5
                                                </Badge>
                                            </div>
                                            {renderStars(review.rating)}
                                            <Card.Text className="text-muted mb-4" style={{ minHeight: '80px' }}>
                                                {review.notes || "No review notes provided."}
                                            </Card.Text>
                                            <Card.Text className="text-muted small mt-auto">
                                                <em>Reviewed on {formatDate(review.createdAt)}</em>
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}
                </>
            )}

            {/* Saved places tab info */}
            {activeTab === 'saved' && (
                <>
                    <h3 className="mb-4">Saved Places ({savedPlaces.length})</h3>
                    {savedLoading ? (
                        <div className="text-center my-5">
                            <Spinner animation="border" />
                            <p className="mt-2">Loading saved places...</p>
                        </div>
                    ) : savedError ? (
                        <Alert variant="danger" className="mb-4">
                            <Alert.Heading>Error loading saved places</Alert.Heading>
                            <p>{savedError.message}</p>
                        </Alert>
                    ) : savedPlaces.length === 0 ? (
                        <Card className="mb-4">
                            <Card.Body className="text-center py-5">
                                <p className="text-muted mb-0">{user.firstName} hasn't saved any places yet.</p>
                            </Card.Body>
                        </Card>
                    ) : (
                        <Row xs={1} md={2} lg={3} className="g-4">
                            {savedPlaces.map((placeId, index) => (
                                <Col key={index}>
                                    <Card className="shadow-sm border-0 hover-shadow" style={{ width: '18rem' }}>
                                        <Card.Body className="p-4 d-flex flex-column">
                                            <Card.Title className="fw-bold mb-3">Saved Place</Card.Title>
                                            <div className="mb-3">
                                                <small className="text-muted">Place ID:</small>
                                                <p className="mb-0 fw-bold">{placeId}</p>
                                            </div>
                                            <Card.Text className="text-muted mb-4 flex-grow-1">
                                                This location has been saved by {user.firstName}.
                                            </Card.Text>
                                            <div className="mt-auto">
                                                <Button variant="outline-primary" size="sm" className="w-100">
                                                    View Details
                                                </Button>
                                            </div>
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