import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

function Home() {
    return (
        <div className="portal-home-container">
            <h1 className='App-title'>Welcome to Tripli!</h1>
            <p className='App-description'>Plan your perfect trip with ease.</p>
            <div className="portal-links">
                <Link to="/login">Login</Link>
                <Link to="/signup">Sign Up</Link>
            </div>
        </div>
    );
}

export default Home;