import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const LBTable = ({ 
    spots, //data to display
    loading, 
    error, 
    title, 
    cityFilter, 
    setCityFilter, 
    countryFilter, 
    setCountryFilter 
}) => {
    const navigate = useNavigate();

    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        let stars = '';
        for (let i = 0; i < fullStars; i++) {
            stars += '★';
        }
        const emptyStars = 5 - fullStars;
        for (let i = 0; i < emptyStars; i++) {
            stars += '☆';
        }
        return stars;
    };

    return (
        <div className="mb-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>{title}</h3>
                <div className="d-flex align-items-center gap-2">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by city"
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                        style={{ width: '150px' }}
                    />
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by country"
                        value={countryFilter}
                        onChange={(e) => setCountryFilter(e.target.value)}
                        style={{ width: '150px' }}
                    />
                    {(cityFilter || countryFilter) && (
                        <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => {
                                setCityFilter('');
                                setCountryFilter('');
                            }}
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {loading && (
                <div className="text-center py-3">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}

            {error && (
                <div className="alert alert-danger">
                    Error: {error.message}
                </div>
            )}

            {!loading && !error && spots.length === 0 && (
                <div className="alert alert-info">
                    No spots found
                </div>
            )}

            {!loading && !error && spots.length > 0 && (
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Place Name</th>
                            <th>Location</th>
                            <th>Rating</th>
                            <th>Reviews</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* mapping with index to display rank */}
                        {spots.map((spot, index) => (
                            <tr key={spot.placeId}>
                                <td>{index + 1}</td>
                                <td>{spot.placeName}</td>
                                {/* using city and country to display location exact location is too long */}
                                <td>
                                    {spot.city && spot.country
                                        ? `${spot.city}, ${spot.country}`
                                        : 'N/A'}
                                </td>
                                <td>
                                    <span className="text-warning">{renderStars(spot.averageRating)}</span>
                                    <br />
                                    {/* one decimal to display average rating */}
                                    <small>{spot.averageRating.toFixed(1)}</small>
                                </td>
                                <td>{spot.reviewCount}</td>
                                <td>
                                    <button
                                        className="btn btn-sm btn-primary"
                                        onClick={() => navigate(`/place/${spot.placeId}`)}
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default LBTable;