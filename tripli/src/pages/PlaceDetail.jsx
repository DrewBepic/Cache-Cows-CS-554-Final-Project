import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { useState } from 'react';
import { Modal, Button, Form, Container, Alert, Card, Badge } from 'react-bootstrap';
import { GET_SAVED_PLACE, CREATE_REVIEW, DELETE_REVIEW } from '../queries';
import '../PlaceDetail.css';

function PlaceDetail({ userId }) {
  const { placeId } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, notes: '' });
  const [validated, setValidated] = useState(false);

  if (!userId) {
      return (
          <Container className="my-5">
              <Alert variant="warning">
                  <Alert.Heading>Log In</Alert.Heading>
                  <p>You need to be logged in to view places.</p>
                  <Link to="/login">Go to Login</Link>
              </Alert>
          </Container>
      );
  }

  const { loading, error, data, refetch } = useQuery(GET_SAVED_PLACE, {
    variables: { placeId }
  });

  const [createReview] = useMutation(CREATE_REVIEW);
  const [deleteReview] = useMutation(DELETE_REVIEW);

  if (loading) return <div className="container mt-5"><p>Loading...</p></div>;
  if (error) return <div className="container mt-5"><p>Error loading place</p></div>;
  if (!data) return null;

  const place = data?.getSavedPlace;
  if (!place) return null;

  // Find friend reviews
  const friends = data?.getFriends || [];
  const friendIds = new Set(friends.map(f => f.id));
  const friendReviews = place.reviews ? place.reviews.filter(r => friendIds.has(r.userId)) : [];

  // Find the user's review
  const myReview = place.reviews ? place.reviews.find(r => r.userId === userId) : null;

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      await createReview({
        variables: {
          userId: userId,
          placeId: place.id, 
          placeName: place.name,
          rating: parseInt(reviewForm.rating),
          notes: reviewForm.notes
        }
      });
      setShowModal(false);
      setReviewForm({ rating: 5, notes: '' });
      setValidated(false);
      refetch();
    } catch (e) {
      alert("Error submitting review: " + e.message);
    }
  };

  const handleDeleteReview = async () => {
    if(!window.confirm("Are you sure you want to delete your review?")) return;
    try {
      await deleteReview({
        variables: { userId: userId, reviewId: myReview.id }
      });
      refetch();
    } catch (e) {
      alert("Error deleting review");
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.0) return 'success';
    if (rating >= 2.5) return 'warning';
    return 'danger';
  };

return (
    <Container className="place-detail-container">
      <Card className="place-card">
        
        {/* header stuff */}
        <Card.Header className="place-header">
          <div className="place-header-content">
            <div className="place-info">
              <h1 className="place-name">{place.name}</h1>
              <p className="place-address">
                <i className="bi bi-geo-alt-fill"></i>
                {place.address || `${place.city}, ${place.country}`}
              </p>
              {place.phoneNumber && (
                <p className="place-phone">
                  <i className="bi bi-telephone-fill"></i>
                  {place.phoneNumber}
                </p>
              )}
            </div>
            
            <div className="place-rating-block">
              <Badge bg={getRatingColor(place.rating)} className="rating-badge main-rating">
                {place.rating ? `★ ${Number(place.rating).toFixed(1)}` : 'N/A'}
              </Badge>
              <div className="rating-label">General Rating</div>
            </div>
          </div>
          
          {/* tags*/}
          {place.types && place.types.length > 0 && (
             <div className="place-tags">
               {place.types.map(t => (
                 <Badge key={t} bg="light" text="dark" className="tag-badge">
                    {t.replace(/_/g, ' ')}
                 </Badge>
               ))}
             </div>
          )}
        </Card.Header>

        <Card.Body className="place-body">

            {place.description && (
                <div className="place-description-section">
                    <p className="place-description">{place.description}</p>
                </div>
            )}

            {/* photos, probably have to change later */}
            {place.photos && place.photos.length > 0 && (
                <div className="photos-grid">
                  {place.photos.slice(0, 3).map((photo, index) => (
                      <div key={index} className="photo-wrapper">
                          <img src={photo} alt={place.name} className="place-photo" />
                      </div>
                  ))}
                </div>
            )}

            {/* user actions */}
            <div className="action-buttons">
                {!myReview ? (
                    <Button variant="primary" onClick={() => setShowModal(true)} className="btn-action">
                        Write a Review
                    </Button>
                ) : (
                    <Button variant="outline-danger" onClick={handleDeleteReview} className="btn-action">
                        Delete My Review
                    </Button>
                )}
            </div>

            <hr className="section-divider" />

            {/* friend ratings sections */}
            <div className="friends-activity-section">
                <h4 className="section-title">Friends' Activity</h4>
                {friendReviews.length > 0 ? (
                    <div className="friends-list">
                      {friendReviews.map(r => (
                          <Alert key={r.id} variant="info" className="friend-review-alert">
                              <div className="friend-review-header">
                                <Badge bg="info" className="rating-badge small">★ {r.rating.toFixed(1)}</Badge>
                                <span><strong>A friend</strong> rated this place.</span>
                              </div>
                              {r.notes && <p className="review-note">"{r.notes}"</p>}
                          </Alert>
                      ))}
                    </div>
                ) : (
                    <p className="empty-state-text">No friends have reviewed this place yet.</p>
                )}
            </div>

             {/* all reviews */}
             <div className="all-reviews-section">
                <h4 className="section-title">All Reviews ({place.reviews?.length || 0})</h4>
                {place.reviews && place.reviews.length > 0 ? (
                   <div className="reviews-list">
                     {place.reviews.map(r => (
                      <Card key={r.id} className="review-card">
                        <Card.Body>
                          <div className="review-header">
                            <div className="review-rating-group">
                              <Badge bg={getRatingColor(r.rating)} className="rating-badge small">
                                ★ {Number(r.rating).toFixed(1)}
                              </Badge>
                              <span className="rating-text">Rating</span>
                            </div>
                            <small className="review-date">
                              {new Date(r.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                            </small>
                          </div>
                          <Card.Text className="review-content">
                            {r.notes || <em className="no-notes">No written review provided.</em>}
                          </Card.Text>
                        </Card.Body>
                      </Card>
                    ))}
                   </div>
                ) : (
                  <Alert variant="light" className="empty-reviews-alert">
                    No reviews yet. Be the first to share your experience!
                  </Alert>
                )}
            </div>
        </Card.Body>
      </Card>

      {/* review modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered className="review-modal">
        <Modal.Header closeButton>
          <Modal.Title>Rate {place.name}</Modal.Title>
        </Modal.Header>
        {/* FIX: Form has onSubmit, Button has type="submit" */}
        <Form noValidate validated={validated} onSubmit={handleReviewSubmit}>
          <Modal.Body>
              <Form.Group className="form-group-rating">
                <Form.Label>Rating</Form.Label>
                {/* FIX: Integer dropdown instead of float input */}
                <Form.Select 
                  required
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({...reviewForm, rating: e.target.value})}
                >
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Good</option>
                  <option value="3">3 - Okay</option>
                  <option value="2">2 - Bad</option>
                  <option value="1">1 - Terrible</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="form-group-notes">
                <Form.Label>Notes <span className="optional-text">(Optional)</span></Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={4} 
                  placeholder="Share details of your own experience at this place."
                  value={reviewForm.notes}
                  onChange={(e) => setReviewForm({...reviewForm, notes: e.target.value})}
                />
              </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
            <Button type="submit" variant="primary">Submit Review</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}
export default PlaceDetail;