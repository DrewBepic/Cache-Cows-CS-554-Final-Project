import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { SEARCH_CITIES, IMPORT_GOOGLE_PLACE } from '../queries';
import axios from 'axios';
import { Button, Card, Spinner, Alert, Badge } from 'react-bootstrap';
import './SearchResults.css';

const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const ENTERTAINMENT_TYPES = [
    { value: 'amusement_park', label: 'Amusement Park' },
    { value: 'aquarium', label: 'Aquarium' },
    { value: 'art_gallery', label: 'Art Gallery' },
    { value: 'bowling_alley', label: 'Bowling Alley' },
    { value: 'casino', label: 'Casino' },
    { value: 'movie_theater', label: 'Movie Theater' },
    { value: 'museum', label: 'Museum' },
    { value: 'night_club', label: 'Night Club' },
    { value: 'stadium', label: 'Stadium' },
    { value: 'zoo', label: 'Zoo' },
];

export default function SearchResults() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const query = (params.get('query') || '').trim();
    const isValid = query.length >= 1;

    const [selectedCity, setSelectedCity] = useState(null);
    const [entertainmentType, setEntertainmentType] = useState('');
    const [places, setPlaces] = useState([]);
    const [loadingPlaces, setLoadingPlaces] = useState(false);
    const [searchError, setSearchError] = useState(null);

    const { data, loading, error } = useQuery(SEARCH_CITIES, {
        variables: { query },
        skip: !isValid,
    });

    const [importPlace] = useMutation(IMPORT_GOOGLE_PLACE);
    const cities = data?.searchCities || [];

    const handleCityClick = (city) => {
        setSelectedCity(city);
        setEntertainmentType('');
        setPlaces([]);
        setSearchError(null);
    };

    // Rating flair
    const getRatingVariant = (rating) => {
        if (!rating) return 'secondary';
        if (rating >= 4.5) return 'success';
        if (rating >= 3.5) return 'primary';
        if (rating >= 2.5) return 'warning';
        return 'danger';
    };

    // const handleSearch = () => {
    //     if (selectedCity && entertainmentType) {
    //         console.log(import.meta.env);
    //         console.log(key)
    //         let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${selectedCity.lat},${selectedCity.lng}&radius=5000&type=${entertainmentType}&key=${key}`;
    //         console.log('Searching entertainment with URL:', url);
    //         // ANDREW CALL THE API HERE OR ELSE
    //     }else{
    //         alert('Please select a city and entertainment type.');
    //     }
    // };

    const handleSearch = async () => {
        if (selectedCity && entertainmentType) {
            setLoadingPlaces(true);
            setSearchError(null);
            try {
                // Call your backend route instead of Google Maps directly
                const response = await axios.get('http://localhost:4000/api/maps/places', {
                    params: {
                        lat: selectedCity.lat,
                        lng: selectedCity.lng,
                        type: entertainmentType
                    }
                });

                if (response.data.results) {
                    console.log('Entertainment places found:', response.data.results);
                    setPlaces(response.data.results); // store places in state
                } else {
                    alert('No results found');
                    setPlaces([]);
                }
            } catch (err) {
                console.error('Error fetching places:', err);
                alert('Failed to fetch entertainment places');
            } finally {
                setLoadingPlaces(false);
            }
        } else {
            alert('Please select a city and entertainment type.');
        }
    };

    // Click logic for listed places
    const handlePlaceClick = async (place) => {
        try {
            // Import the place to our DB (or get existing ID)
            const result = await importPlace({ 
                variables: { googlePlaceId: place.place_id } 
            });
            
            // Get the internal MongoDB ID
            const internalId = result.data.importGooglePlace.id;

            // Navigate to the Details Page for that place
            navigate(`/place/${internalId}`);
        } catch (e) {
            alert("Failed to load place details: " + e.message);
        }
    };

    return (
        <div className="search-results">
            <h3 className="results-title">
                Search Results{query && ` for "${query}"`}
            </h3>

            {!isValid && <p className="hint-text">Enter at least one character to search.</p>}
            {loading && <p className="loading-text">Searching...</p>}
            {error && <p className="error-text">Error: {error.message}</p>}
            {isValid && !loading && !error && !cities.length && <p className="empty-text">No cities found.</p>}

            {cities.length > 0 && (
                <div className="city-list">
                    {cities.map((city, i) => (
                        <div
                            key={`${city.name}-${i}`}
                            className={`city-item ${selectedCity?.name === city.name ? 'selected' : ''}`}
                            onClick={() => handleCityClick(city)}
                        >
                            <div className="city-header">
                                <h6 className="city-name">{city.name}, {city.country}</h6>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedCity && (
                <div className="entertainment-selector">
                    <h5>Select Entertainment for {selectedCity.name}, {selectedCity.country}</h5>
                    <select
                        className="entertainment-dropdown"
                        value={entertainmentType}
                        onChange={(e) => setEntertainmentType(e.target.value)}
                    >
                        <option value="">Choose entertainment type...</option>
                        {ENTERTAINMENT_TYPES.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                    <button
                        className="search-button"
                        onClick={handleSearch}
                        disabled={!entertainmentType}
                    >
                        Search Entertainment
                    </button>
                </div>
            )}
            {selectedCity && entertainmentType && places.length > 0 && (
                <div className="results-grid">
                    {places.map((place) => (
                        <Card 
                            key={place.place_id} 
                            className="place-result-card"
                            onClick={() => handlePlaceClick(place)}
                        >
                            <Card.Body className="place-card-body">
                                <div className="place-title">{place.name}</div>
                                <div className="place-address">
                                    <i className="bi bi-geo-alt-fill me-1"></i>
                                    {place.vicinity}
                                </div>
                                
                                <div className="place-footer">
                                    <Badge bg={getRatingVariant(place.rating)} className="rating-badge">
                                        {place.rating ? `★ ${place.rating}` : 'N/A'}
                                    </Badge>
                                    <span className="view-details-link">
                                        View Details &rarr;
                                    </span>
                                </div>
                            </Card.Body>
                        </Card>
                    ))}
                </div>
            )}


            <Link to="/search" className="back-link">Back to Search</Link>
        </div>
    );
}