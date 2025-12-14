import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { SEARCH_CITIES } from '../queries';

const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const ENTERTAINMENT_TYPES = [
    { value: 'entertainment.activity_park', label: 'Activity Park' },
    { value: 'entertainment.activity_park.climbing', label: 'Climbing Park' },
    { value: 'entertainment.activity_park.trampoline', label: 'Trampoline Park' },
    { value: 'entertainment.amusement_arcade', label: 'Amusement Arcade' },
    { value: 'entertainment.aquarium', label: 'Aquarium' },
    { value: 'entertainment.bowling_alley', label: 'Bowling Alley' },
    { value: 'entertainment.cinema', label: 'Cinema' },
    { value: 'entertainment.culture', label: 'Culture' },
    { value: 'entertainment.culture.arts_centre', label: 'Arts Centre' },
    { value: 'entertainment.culture.gallery', label: 'Gallery' },
    { value: 'entertainment.culture.theatre', label: 'Theatre' },
    { value: 'entertainment.escape_game', label: 'Escape Game' },
    { value: 'entertainment.flying_fox', label: 'Flying Fox' },
    { value: 'entertainment.miniature_golf', label: 'Miniature Golf' },
    { value: 'entertainment.museum', label: 'Museum' },
    { value: 'entertainment.planetarium', label: 'Planetarium' },
    { value: 'entertainment.theme_park', label: 'Theme Park' },
    { value: 'entertainment.water_park', label: 'Water Park' },
    { value: 'entertainment.zoo', label: 'Zoo' },
];

export default function SearchResults() {
    const [params] = useSearchParams();
    const query = (params.get('query') || '').trim();
    const isValid = query.length >= 1;

    const [selectedCity, setSelectedCity] = useState(null);
    const [entertainmentType, setEntertainmentType] = useState('');

    const { data, loading, error } = useQuery(SEARCH_CITIES, {
        variables: { query },
        skip: !isValid,
    });

    const cities = data?.searchCities || [];

    const handleCityClick = (city) => {
        setSelectedCity(city);
        setEntertainmentType('');
    };

    const handleSearch = () => {
        if (selectedCity && entertainmentType) {
            console.log(import.meta.env);
            console.log(key)
            let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${selectedCity.lat},${selectedCity.lng}&radius=5000&type=${entertainmentType}&key=${key}`;
            console.log('Searching entertainment with URL:', url);
            // ANDREW CALL THE API HERE OR ELSE
        }else{
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
            {selectedCity && entertainmentType && (
                <div className="entertainment-results">
                    <h5>Entertainment Results for {selectedCity.name} - {entertainmentType}</h5>
                    {/* Render entertainment results here after API call */}
                </div>
            )}

            <Link to="/search" className="back-link">Back to Search</Link>
        </div>
    );
}