import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { SEARCH_CITIES } from '../queries';

export default function SearchResults() {
    const [params] = useSearchParams();
    const query = (params.get('query') || '').trim();
    const isValid = query.length >= 1;

    const { data, loading, error } = useQuery(SEARCH_CITIES, {
        variables: { query },
        skip: !isValid,
    });

    const cities = data?.searchCities || [];

    return (
        <div className="search-results">
            <h3 className="results-title">
                Search Results{query && ` for "${query}"`}
            </h3>

            {!isValid && <p className="hint-text">Enter at least one character to search.</p>}
            {loading && <p className="loading-text">Searching…</p>}
            {error && <p className="error-text">Error: {error.message}</p>}
            {isValid && !loading && !error && !cities.length && <p className="empty-text">No cities found.</p>}

            {cities.length > 0 && (
                <div className="city-list">
                    {cities.map((city, i) => (
                        <div key={`${city.name}-${i}`} className="city-item">
                            <div className="city-header">
                                <h6 className="city-name">{city.name}, {city.country}</h6>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Link to="/search" className="back-link">Back to Search</Link>
        </div>
    );
}