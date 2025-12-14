import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { SEARCH_CITIES } from '../queries';
import axios from 'axios';

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
    const query = (params.get('query') || '').trim();
    const isValid = query.length >= 1;

    const [selectedCity, setSelectedCity] = useState(null);
    const [entertainmentType, setEntertainmentType] = useState('');
    const [places, setPlaces] = useState([]);

    const { data, loading, error } = useQuery(SEARCH_CITIES, {
        variables: { query },
        skip: !isValid,
    });

    const cities = data?.searchCities || [];

    const handleCityClick = (city) => {
        setSelectedCity(city);
        setEntertainmentType('');
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
            }
        } else {
            alert('Please select a city and entertainment type.');
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
                <ul className="places-list">
                    {places.map((place, index) => (
                        <li key={index}>
                            <strong>{place.name}</strong> - {place.vicinity}
                        </li>
                    ))}
                </ul>
            )}


            <Link to="/search" className="back-link">Back to Search</Link>
        </div>
    );
}