import { useMutation, useQuery } from '@apollo/client';
import { Link, useNavigate  } from 'react-router-dom';
import { Container, Alert } from 'react-bootstrap';
import { LOGOUT, GET_RECENT_REVIEWS } from '../queries';

function Feed() {
    const userId = localStorage.getItem('userId');
    const navigate = useNavigate();

     // Check if logged in
    if (!userId) {
        return (
            <Container className="my-5">
                <Alert variant="warning">
                    <Alert.Heading>Log In</Alert.Heading>
                    <p>You need to be logged in to perform a search.</p>
                    <Link to="/login">Go to Login</Link>
                </Alert>
            </Container>
        );
    }
    
    const { data, loading, error } = useQuery(GET_RECENT_REVIEWS, {
        variables: { limit: 25 },
        fetchPolicy: "cache-and-network"
    });

    const getRatingVariant = (rating) => {
        if (!rating) return 'secondary';
        if (rating >= 4.5) return 'success';
        if (rating >= 3.5) return 'primary';
        if (rating >= 2.5) return 'warning';
        return 'danger';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric'
        });
    };

    const reviews = data?.getRecentReviews || [];

    return (
        <div className="feed-container">
                <h2>Recent Reviews</h2>
                
                {loading && <p className="loading-text">Loading recent reviews...</p>}
                {error && <p className="error-text">Error loading reviews: {error.message}</p>}
                {!loading && reviews.length === 0 && <p className="empty-text">No reviews yet!</p>}

                {reviews.length > 0 && (
                    <div className="reviews-list">
                        {reviews.map((review) => (
                            <div key={review.id} className="review-card">
                                <div className="review-header">
                                    <div className="review-user-info">
                                        <Link to={`/profile/${review.userId}`} className="username-link">
                                            {review.username}
                                        </Link>
                                        <span className="review-date">{formatDate(review.createdAt)}</span>
                                    </div>
                                    <div className={`rating-badge rating-${getRatingVariant(review.rating)}`}>
                                        ★ {review.rating}
                                    </div>
                                </div>
                                <Link to={`/place/${review.placeId}`} className="place-link">
                                    <h4 className="place-name">{review.placeName}</h4>
                                </Link>
                                {review.notes && (<p className="review-notes">{review.notes}</p>)}
                            </div>
                        ))}
                    </div>
                )}
        </div>
    );
}

export default Feed;