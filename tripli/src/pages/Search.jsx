import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Search() {
    const [term, setTerm] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const query = term.trim();
        if (query) {
            navigate(`/search/results?query=${encodeURIComponent(query)}`);
        }
    };

    return (
        <div className="search-page">
            <h3 className="page-title">Search Cities</h3>

            <form className="search-form" onSubmit={handleSubmit}>
                <div className="search-input-group">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search for a city..."
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                    />
                    <button className="search-button" type="submit">Search</button>
                </div>
                <small className="hint-text">Enter at least one character to search.</small>
            </form>
        </div>
    );
}