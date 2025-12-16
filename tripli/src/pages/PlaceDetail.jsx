import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { useState, useEffect } from 'react';
import { Modal, Button, Form, Container, Alert, Card, Badge } from 'react-bootstrap';
import { GET_SAVED_PLACE, CREATE_REVIEW, DELETE_REVIEW, GET_FRIENDS, GET_USER, GET_USER_REVIEWS, GET_SAVED_PLACES, ADD_SAVED_PLACE, REMOVE_SAVED_PLACE, GET_GLOBAL_TOP_SPOTS, GET_FRIENDS_TOP_SPOTS, GET_COMPARISON_CANDIDATES, FINALIZE_COMPARATIVE_RATING } from '../queries';
import './PlaceDetail.css';
import axios from 'axios';

function PlaceDetail({ userId: incomingUserId }) {
  const userId = incomingUserId || localStorage.getItem('currentUserId');
  const { placeId } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, notes: '' });
  const [validated, setValidated] = useState(false);
  const [reviewImage, setReviewImage] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [placePhotos, setPlacePhotos] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const client = useApolloClient();

  const [cmpVisible, setCmpVisible] = useState(false);
  const [cmpData, setCmpData] = useState(null);
  const [chosenCandidate, setChosenCandidate] = useState(null);
  const [stage, setStage] = useState('CHOOSE_CLOSER');

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

  const { data: friendsData } = useQuery(GET_FRIENDS, {
    variables: { userId },
    skip: !userId
  });

  const { data: userData, refetch: refetchUser } = useQuery(GET_USER, {
    variables: { id: userId },
    skip: !userId
  });

  const [createReview] = useMutation(CREATE_REVIEW, {
    refetchQueries: [
      { query: GET_USER_REVIEWS, variables: { userId } },
      { query: GET_SAVED_PLACE, variables: { placeId } },
      { query: GET_GLOBAL_TOP_SPOTS, variables: { limit: 10 } },
      { query: GET_FRIENDS_TOP_SPOTS, variables: { userId, limit: 10 } }
    ]
  });

  const [deleteReview] = useMutation(DELETE_REVIEW, {
    refetchQueries: [
      { query: GET_USER_REVIEWS, variables: { userId } },
      { query: GET_SAVED_PLACE, variables: { placeId } },
      { query: GET_GLOBAL_TOP_SPOTS, variables: { limit: 10 } },
      { query: GET_FRIENDS_TOP_SPOTS, variables: { userId, limit: 10 } }
    ]
  });

  const [addSavedPlace] = useMutation(ADD_SAVED_PLACE, {
    refetchQueries: [
      { query: GET_USER, variables: { id: userId } },
      { query: GET_SAVED_PLACES, variables: { userId } }
    ]
  });

  const [removeSavedPlace] = useMutation(REMOVE_SAVED_PLACE, {
    refetchQueries: [
      { query: GET_USER, variables: { id: userId } },
      { query: GET_SAVED_PLACES, variables: { userId } }
    ]
  });

  const [finalizeRating] = useMutation(FINALIZE_COMPARATIVE_RATING);

  useEffect(() => {
    if (userData?.getUser?.savedPlaces && placeId) {
      setIsBookmarked(userData.getUser.savedPlaces.includes(placeId));
    }
  }, [userData, placeId]);

  useEffect(() => {
    const googlePlaceId = data?.getSavedPlace?.placeId;
    if (!googlePlaceId) return;

    const fetchPhotos = async () => {
      try {
        const res = await axios.get(
          `http://localhost:4000/api/place/${encodeURIComponent(googlePlaceId)}/photos`
        );
        setPlacePhotos(res.data);
      } catch (err) {
        console.error('Failed to load place photos', err);
      }
    };

    fetchPhotos();
  }, [data?.getSavedPlace?.placeId]);

  const handleBookmarkToggle = async () => {
    try {
      if (isBookmarked) {
        await removeSavedPlace({ variables: { userId, placeId } });
        setIsBookmarked(false);
      }
      else {
        await addSavedPlace({ variables: { userId, placeId } });
        setIsBookmarked(true);
      }
    }
    catch (e) {
      alert("Failed to update bookmark: " + e.message);
    }
  };

  const place = data?.getSavedPlace;
  if (!place) {
    return (
      <Container className="place-detail-container">
        <Alert variant="warning" className="not-found-alert">
          <Alert.Heading>Place Not Found</Alert.Heading>
          <p>We couldn't find a place with ID: {placeId}</p>
          <p>It might be saved in the cache but not the directory yet.</p>
          <Link to="/search" className="btn btn-primary">Return to Search</Link>
        </Alert>
      </Container>
    );
  }

  const friends = friendsData?.getFriends || [];
  const friendIds = new Set(friends.map(f => f.id));
  const friendReviews = place.reviews ? place.reviews.filter(r => friendIds.has(r.userId)) : [];
  const myReview = place.reviews ? place.reviews.find(r => r.userId === userId) : null;

  // convert file to base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5000000) {
      setUploadError("File is too large (Max 5MB)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setReviewImage(reader.result);
      setUploadError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      const result = await createReview({
        variables: {
          userId: userId,
          placeId: place.id,
          placeName: place.name,
              rating: parseFloat(reviewForm.rating),
          notes: reviewForm.notes,
          photos: reviewImage ? [reviewImage] : []
        }
      });

      const newReviewId = result?.data?.createReview?.id;

      setShowModal(false);
      setReviewForm({ rating: 5, notes: '' });
      setReviewImage(null);
      setValidated(false);

      if (newReviewId) {
        try {
          const { data } = await client.query({
            query: GET_COMPARISON_CANDIDATES,
            variables: { userId, reviewId: newReviewId }
          });

          if (data?.getComparisonCandidates) {
            setCmpData(data.getComparisonCandidates);
            setStage('CHOOSE_CLOSER');
            setChosenCandidate(null);
            setCmpVisible(true);
          }
        }
        catch (e) {
          console.error('Comparison error:', e);
        }
      }
      else {
        console.log('Skipped Comparison');
      }
    }
    catch (e) {
      console.error('Submit error:', e);
      alert("Error submitting review: " + e.message);
    }
  };

  const handleDeleteReview = async () => {
    try {
      await deleteReview({ variables: { userId: userId, reviewId: myReview.id } });
      setShowDeleteModal(false);
    }
    catch (e) {
      console.error("Delete failed:", e);
      alert("Error deleting review: " + e.message);
    }
  };

  const handleChooseCloser = (candidateNumber) => {
    const chosen = candidateNumber === 1 ? cmpData.candidate1 : cmpData.candidate2;
    setChosenCandidate(chosen);
    setStage('BETTER_OR_WORSE');
  };

  const handleBetterOrWorse = async (answer) => {
    try {
      const result = await finalizeRating({
        variables: {
          reviewId: cmpData.newReviewId,
          chosenRating: chosenCandidate.rating,
          comparison: answer
        }
      });

      const finalRatingValue = result?.data?.finalizeComparativeRating;
      setCmpVisible(false);
      setCmpData(null);
      setChosenCandidate(null);
      setStage('CHOOSE_CLOSER');
      alert(`Your new rating is ${finalRatingValue.toFixed(1)} stars.`);
      refetch();
    }
    catch (e) {
      alert('Failed to finalize rating: ' + e.message);
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.0) return 'success';
    if (rating >= 2.5) return 'warning';
    return 'danger';
  };

  if (loading) return <div className="container mt-5"><p>Loading...</p></div>;
  if (error) return <div className="container mt-5"><p>Error loading place</p></div>;
  if (!data) return null;

  return (
    <Container className="place-detail-container">
      <Card className="place-card">
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

            <Button
              variant={isBookmarked ? "success" : "outline-secondary"}
              onClick={handleBookmarkToggle}
              className="ms-3"
            >
              {isBookmarked ? (
                <><i className="bi bi-bookmark-fill me-2"></i>Bookmarked</>
              ) : (
                <><i className="bi bi-bookmark me-2"></i>Bookmark</>
              )}
            </Button>

            <div className="d-flex gap-4">
              <div className="place-rating-block">
                <Badge bg={getRatingColor(place.rating)} className="rating-badge main-rating">
                  {place.rating ? `★ ${Number(place.rating).toFixed(1)}` : 'N/A'}
                </Badge>
                <div className="rating-label">Google Rating</div>
              </div>

              <div className="place-rating-block">
                <Badge bg="primary" className="rating-badge main-rating">
                  {place.tripliRating > 0 ? `★ ${place.tripliRating}` : 'N/A'}
                </Badge>
                <div className="rating-label">Tripli Rating</div>
              </div>
            </div>
          </div>

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

        {/* body */}
        <Card.Body className="place-body">
          {place.description && (
            <div className="place-description-section">
              <p className="place-description">{place.description}</p>
            </div>
          )}

          {place.photos && place.photos.length > 0 && (
            <div className="photos-grid">
              {place.photos.slice(0, 3).map((photo, index) => (
                <div key={index} className="photo-wrapper">
                  <img src={photo} alt={place.name} className="place-photo" />
                </div>
              ))}
            </div>
          )}
          <div className="action-buttons">
            {!myReview ? (
              <Button variant="primary" onClick={() => setShowModal(true)} className="btn-action">
                Write a Review
              </Button>
            ) : (
              <Button variant="outline-danger" onClick={() => setShowDeleteModal(true)} className="btn-action">
                Delete My Review
              </Button>
            )}
          </div>

          <hr className="section-divider" />

          <div className="friends-activity-section">
            <h4 className="section-title">Friends' Activity</h4>
            {friendReviews.length > 0 ? (
              <div className="friends-list">
                {friendReviews.map(r => (
                  <Alert key={r.id} variant="info" className="friend-review-alert">
                    <div className="friend-review-header">
                      <Badge bg="info" className="rating-badge small">★ {r.rating.toFixed(1)}</Badge>
                      <span>A friend rated this place.</span>
                    </div>
                    {r.notes && <p className="review-note">"{r.notes}"</p>}
                  </Alert>
                ))}
              </div>
            ) : (
              <p className="empty-state-text">No friends have reviewed this place yet.</p>
            )}
          </div>

          <div className="all-reviews-section">
            <h4 className="section-title">All Reviews ({place.reviews?.length || 0})</h4>
            {place.reviews && place.reviews.length > 0 ? (
              <div className="reviews-list">
                {place.reviews.map(r => (
                  <Card key={r.id} className="review-card">
                    <Card.Body>
                      <div className="review-header">
                        <div className="d-flex align-items-center gap-2">
                          <Badge bg={getRatingColor(r.rating)} className="rating-badge small">
                            ★ {Number(r.rating).toFixed(1)}
                          </Badge>
                          <span className="fw-bold">
                            {r.username || "User"}
                          </span>
                        </div>
                        <small className="review-date">
                          {new Date(r.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </small>
                      </div>
                      <Card.Text className="review-content">
                        {r.notes || <em className="no-notes">No written review provided.</em>}

                        {r.photos && r.photos.length > 0 && (
                          <div className="mt-3">
                            <img
                              src={r.photos[0]}
                              alt="Review attachment"
                              style={{ maxWidth: '200px', borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                          </div>
                        )}
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
        <Form noValidate validated={validated} onSubmit={handleReviewSubmit}>
          <Modal.Body>
            <Form.Group className="form-group-rating">
              <Form.Label>Rating</Form.Label>
              <Form.Select
                required
                value={reviewForm.rating}
                onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
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
                onChange={(e) => setReviewForm({ ...reviewForm, notes: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Attach a Photo</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {uploadError && <div className="text-danger small mt-1">{uploadError}</div>}
              {reviewImage && (
                <div className="mt-2">
                  <small>Preview:</small><br />
                  <img src={reviewImage} alt="Preview" style={{ height: '80px', borderRadius: '4px' }} />
                </div>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
            <Button type="submit" variant="primary">Submit Review</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* delete modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Your Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete your review? This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteReview}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/*Comparison Modal */}
      <Modal
        show={cmpVisible}
        onHide={() => setCmpVisible(false)}
        centered
        backdrop="static"
        keyboard={false}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-arrows-angle-expand me-2"></i>
            Refine Your Rating
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/*Choose review */}
          {stage === 'CHOOSE_CLOSER' && cmpData && (
            <div>
              <Alert variant="info" className="mb-4">
                <i className="bi bi-info-circle me-2"></i>
                  Step 1 of 2: Which of these places did you enjoy the most compared to {place.name}?
              </Alert>

              <div className="row g-3">
                {/* Candidate 1 */}
                <div className="col-md-6">
                  <Card
                    className="comparison-card h-100 cursor-pointer hover-shadow"
                    onClick={() => handleChooseCloser(1)}
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    <Card.Body className="text-center p-4">
                      <Badge bg="primary" className="mb-3 rating-badge">
                        ★ {cmpData.candidate1.rating.toFixed(1)}
                      </Badge>
                      <h5 className="mb-2">{cmpData.candidate1.placeName}</h5>
                      <Button variant="outline-primary" size="sm" className="mt-2">
                        Select This One
                      </Button>
                    </Card.Body>
                  </Card>
                </div>

                {/* Candidate 2 */}
                <div className="col-md-6">
                  <Card
                    className="comparison-card h-100 cursor-pointer hover-shadow"
                    onClick={() => handleChooseCloser(2)}
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    <Card.Body className="text-center p-4">
                      <Badge bg="primary" className="mb-3 rating-badge">
                        ★ {cmpData.candidate2.rating.toFixed(1)}
                      </Badge>
                      <h5 className="mb-2">{cmpData.candidate2.placeName}</h5>
                      <Button variant="outline-primary" size="sm" className="mt-2">
                        Select This One
                      </Button>
                    </Card.Body>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Better or worse than chosen review */}
          {stage === 'BETTER_OR_WORSE' && chosenCandidate && (
            <div>
              <Alert variant="success" className="mb-4">
                <i className="bi bi-check-circle me-2"></i>
                  Step 2 of 2: Now compare to your selected place
              </Alert>

              <Card className="mb-4 bg-light">
                <Card.Body className="text-center p-4">
                  <h5 className="mb-2">{chosenCandidate.placeName}</h5>
                  <Badge bg="primary" className="rating-badge">
                    ★ {chosenCandidate.rating.toFixed(1)}
                  </Badge>
                </Card.Body>
              </Card>

              <p className="text-center fw-semibold mb-4">
                Did you enjoy {place.name} more, less, or about the same?
              </p>

              <div className="d-grid gap-3">
                <Button
                  variant="danger"
                  size="lg"
                  onClick={() => handleBetterOrWorse('WORSE')}
                >
                  <i className="bi bi-arrow-down-circle me-2"></i>
                  I Enjoyed It Less
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => handleBetterOrWorse('SAME')}
                >
                  <i className="bi bi-dash-circle me-2"></i>
                  About the Same
                </Button>

                <Button
                  variant="success"
                  size="lg"
                  onClick={() => handleBetterOrWorse('BETTER')}
                >
                  <i className="bi bi-arrow-up-circle me-2"></i>
                  I Enjoyed It More
                </Button>
              </div>

              <Alert variant="light" className="mt-4 mb-0 text-center">
                <small className="text-muted">
                  Better: +0.5 stars | Same: Equal rating | Worse: -0.5 stars
                </small>
              </Alert>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default PlaceDetail;