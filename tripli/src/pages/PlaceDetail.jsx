import { useParams } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';

const GET_SAVED_PLACE = gql`
  query GetSavedPlace($placeId: ID!) {
    getSavedPlace(placeId: $placeId) {
      id
      name
      description
      city
      country
      photos
      reviews {
        id
        rating
        notes
        createdAt
      }
    }
  }
`;

function PlaceDetail() {
  const { placeId } = useParams();
  const { loading, error, data } = useQuery(GET_SAVED_PLACE, {
    variables: { placeId }
  });

  if (loading) return <div className="container mt-5"><p>Loading...</p></div>;
  if (error) return <div className="container mt-5"><p>Error loading place</p></div>;

  const place = data.getSavedPlace;

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