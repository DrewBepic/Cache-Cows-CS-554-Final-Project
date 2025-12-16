import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import {
    Container, Row, Col, Card, Button, Alert, Spinner, ListGroup, Form,
    InputGroup, Badge, Tab, Tabs
} from 'react-bootstrap';

export default function Search() {
    const [term, setTerm] = useState('');
    const navigate = useNavigate();

    // Check if logged in
    const userId = localStorage.getItem('userId');
    if (!userId) {
        return (
            <Container className="my-5">
                <Alert variant="warning">
                    <Alert.Heading>Log In</Alert.Heading>
                    <p>You need to be logged in to perform a search.</p>
                    <Link to="/login">Go to Login</Link>
                </Alert>
            </Container>
        );
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const query = term.trim();

        if (query.length === 0) return;
        if (query.length > 20) {
            alert("Search term must be under 20 characters long");
            return;
        }

        navigate(`/search/results?query=${encodeURIComponent(query)}`);
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
                <div className="search-text">Enter at least one character to search.</div>
            </form>
        </div>
    );
}