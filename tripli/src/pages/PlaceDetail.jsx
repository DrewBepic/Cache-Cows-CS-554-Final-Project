import { useParams } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';

const GET_SAVED_PLACE = gql`
  query GetSavedPlace($placeId: ID!) {
    getSavedPlace(placeId: $placeId) {
      id
      name
      address
      city
      country
      phoneNumber // Updated based on the schema we decided on, if changes let Ryan know
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
    // Needed later to get reviews for friends
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

function PlaceDetail() {
  const { placeId } = useParams();
  // Not yet fully implemented
  const [showModal, setShowModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, notes: '' });

  // Assume for now login is required to view places
  if (!userId) {
    return (
      <div className="container mt-5 text-center">
        <h2>Access Restricted</h2>
        <p>Please <Link to="/login">Log In</Link> or <Link to="/signup">Sign Up</Link> to view place details.</p>
      </div>
    );
  }

  const { loading, error, data, refetch } = useQuery(GET_SAVED_PLACE, {
    variables: { placeId, userId }
  });

  const [createReview] = useMutation(CREATE_REVIEW);
  const [deleteReview] = useMutation(DELETE_REVIEW);

  if (loading) return <div className="container mt-5"><p>Loading...</p></div>;
  if (error) return <div className="container mt-5"><p>Error loading place</p></div>;

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

  // Waiting to have the new schema finalized and ready to go with how saved_places is stored before including review modals and more details on the pages
  return (
    <div className="container mt-5">
      <div className="card">
        <div className="card-body">
          <h1 className="card-title">{place.name}</h1>
          <h5 className="text-muted mb-3">{place.city}, {place.country}</h5>
          <p className="card-text">{place.description}</p>
          
          {place.photos.length > 0 && (
            <div className="row">
              {place.photos.map((photo, index) => (
                <div key={index} className="col-md-4 mb-3">
                  <img src={photo} alt={place.name} className="img-fluid rounded" />
                </div>
              ))}
            </div>
          )}

          {place.reviews.length > 0 && (
            <div className="mt-4">
              <h4>Reviews</h4>
              {place.reviews.map((review) => (
                <div key={review.id} className="card mb-2">
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <strong>Rating: {review.rating}/5</strong>
                      <small className="text-muted">{new Date(review.createdAt).toLocaleDateString()}</small>
                    </div>
                    <p className="mb-0 mt-2">{review.notes}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlaceDetail;