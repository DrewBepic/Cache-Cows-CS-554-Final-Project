import { useParams } from 'react-router-dom';
import { useQuery, gql, useMutation } from '@apollo/client';
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import '../PlaceDetail.css';

const GET_SAVED_PLACE = gql`
  query GetSavedPlace($placeId: ID!) {
    getSavedPlace(placeId: $placeId) {
      id
      name
      address
      city
      country
      phoneNumber
      rating
      types
      photos
      reviews {
        id
        userId
        rating
        notes
        createdAt
      }
    }
    getFriends(userId: $userId) {
      id
      username
    }
  }
`;

// Modals to create and delete reviews, not implemented yet
// Wanted to wait until we are able to pull the data from the API and soldified the schema - Ryan
const CREATE_REVIEW = gql`
  mutation CreateReview($userId: ID!, $placeId: String!, $placeName: String!, $rating: Int!, $notes: String) {
    createReview(userId: $userId, placeId: $placeId, placeName: $placeName, rating: $rating, notes: $notes) {
      id
      rating
      notes
    }
  }
`;

const DELETE_REVIEW = gql`
  mutation DeleteReview($userId: ID!, $reviewId: ID!) {
    deleteReview(userId: $userId, reviewId: $reviewId)
  }
`;

function PlaceDetail({ userId }) {
  const { placeId } = useParams();
  // Not yet fully implemented
  const [showModal, setShowModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, notes: '' });

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
    variables: { placeId, userId }
  });

  const [createReview] = useMutation(CREATE_REVIEW);
  const [deleteReview] = useMutation(DELETE_REVIEW);

  if (loading) return <div className="container mt-5"><p>Loading...</p></div>;
  if (error) return <div className="container mt-5"><p>Error loading place</p></div>;
  if (!data) return null;

  const place = data.getSavedPlace;
  const friends = data.getFriends;

  // Find friend reviews
  const friendIds = new Set(friends.map(f => f.id));
  const friendReviews = place.reviews.filter(r => friendIds.has(r.userId));

  // Find the user's review
  const myReview = place.reviews.find(r => r.userId === userId);

  const handleReviewSubmit = async () => {
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

//  Old, just in case
//   return (
//     <div className="container mt-5">
//       <div className="card">
//         <div className="card-body">
//           <h1 className="card-title">{place.name}</h1>
//           <h5 className="text-muted mb-3">{place.city}, {place.country}</h5>
//           <p className="card-text">{place.description}</p>
          
//           {place.photos.length > 0 && (
//             <div className="row">
//               {place.photos.map((photo, index) => (
//                 <div key={index} className="col-md-4 mb-3">
//                   <img src={photo} alt={place.name} className="img-fluid rounded" />
//                 </div>
//               ))}
//             </div>
//           )}

//           {place.reviews.length > 0 && (
//             <div className="mt-4">
//               <h4>Reviews</h4>
//               {place.reviews.map((review) => (
//                 <div key={review.id} className="card mb-2">
//                   <div className="card-body">
//                     <div className="d-flex justify-content-between">
//                       <strong>Rating: {review.rating}/5</strong>
//                       <small className="text-muted">{new Date(review.createdAt).toLocaleDateString()}</small>
//                     </div>
//                     <p className="mb-0 mt-2">{review.notes}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

return (
    <div className="place-detail-page">
      <div className="place-card">
        
        {/* header stuff */}
        <div className="place-header">
          <div className="header-content">
            <div className="place-identity">
              <h1 className="place-name">{place.name}</h1>
              <p className="place-location">
                {place.address || `${place.city}, ${place.country}`}
              </p>
              {place.phoneNumber && (
                <small className="place-phone">{place.phoneNumber}</small>
              )}
            </div>
            
            <div className="general-rating-container">
                <span className="rating-badge">
                    {place.rating ? `★ ${place.rating}` : 'No Rating'}
                </span>
                <div className="rating-label">General Rating</div>
            </div>
          </div>
          
          {/* tags*/}
          {place.types && (
             <div className="tags-container">
               {place.types.map(t => (
                 <span key={t} className="place-type-tag">
                    {t.replace('_', ' ')}
                 </span>
               ))}
             </div>
          )}
        </div>

        <div className="place-body">
            {/* photos, probably have to change later */}
            {place.photos.length > 0 && (
                <div className="photos-gallery">
                  {place.photos.slice(0, 3).map((photo, index) => (
                      <div key={index} className="photo-wrapper">
                        <img src={photo} alt={place.name} className="place-photo" />
                      </div>
                  ))}
                </div>
            )}

            <hr className="section-divider" />

            {/* friend ratings sections */}
            <div className="friends-activity-section">
                <h4 className="section-title">Friends' Activity</h4>
                {friendReviews.length > 0 ? (
                    friendReviews.map(r => (
                        <div key={r.id} className="friend-review-card">
                            <strong>Friend Rated: {r.rating}/5</strong> - "{r.notes}"
                        </div>
                    ))
                ) : (
                    <p className="no-activity-message">No friend reivews. Be the first of your friends to rate this!</p>
                )}
            </div>

            {/* user actions */}
            <div className="action-buttons">
                {!myReview ? (
                    <Button variant="primary" onClick={() => setShowModal(true)} className="btn-add-review">
                        Add Review
                    </Button>
                ) : (
                    <Button variant="danger" onClick={handleDeleteReview} className="btn-delete-review">
                        Delete My Review
                    </Button>
                )}
            </div>

             {/* all reviews */}
             <div className="all-reviews-section">
                <h5 className="section-title">All Reviews</h5>
                {place.reviews && place.reviews.length > 0 ? (
                   place.reviews.map(r => (
                    <div key={r.id} className="public-review-item">
                         <div className="review-header">
                            <strong className="review-score">{r.rating}/5</strong>
                            <small className="review-date">{new Date(r.createdAt).toLocaleDateString()}</small>
                         </div>
                         <p className="review-notes">{r.notes}</p>
                    </div>
                ))
                ) : <p className="no-reviews-message">No reviews yet.</p>}
            </div>
        </div>
      </div>

      {/* review modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} className="review-modal">
        <Modal.Header closeButton>
          <Modal.Title>Rate {place.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Rating</Form.Label>
              <Form.Select 
                value={reviewForm.rating}
                onChange={(e) => setReviewForm({...reviewForm, rating: e.target.value})}
              >
                <option value="5">5 - Excelent</option>
                <option value="4">4 - Good</option>
                <option value="3">3 - Alright</option>
                <option value="2">2 - Bad</option>
                <option value="1">1 - Terrible</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                value={reviewForm.notes}
                onChange={(e) => setReviewForm({...reviewForm, notes: e.target.value})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleReviewSubmit}>Submit Review</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
export default PlaceDetail;