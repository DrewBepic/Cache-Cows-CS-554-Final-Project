import { Link } from 'react-router-dom';

function Home({ isLoggedIn, userId }) {
  return (
    <div className="home-container">
      <div className="main-header">
        <h1 className="home-title">Welcome to Tripli!</h1>
        <p className="home-subtitle">Travel. Share. Discover. Connect.</p>
      </div>
      
      <div className="main-content">
        <div className="slideshow-section">
          <div className="slideshow">
            <img className="slide slide1" src="/japan.jpg" alt="Japan" />
            <img className="slide slide2" src="/paris.jpg" alt="Paris" />
            <img className="slide slide3" src="/petersburg.jpg" alt="Petersburg" />
            <img className="slide slide4" src="/sanfran.jpg" alt="San Francisco" />
            <img className="slide slide5" src="/usa.jpg" alt="USA" />
          </div>
          <p className="slideshow-caption">Discover new amazing destinations around the globe</p>
        </div>

        <div className="user-section">
          <div className="user-card">
            <h2 className="user-title">Become a Tripli Explorer Today</h2>
            <p className="user-description">Share your journeys, discover new destinations, and make lasting memories.</p>
            <div className="button-container">
              <Link to="/login" className="button">
                Login
              </Link>
              <Link to="/signup" className="button">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;