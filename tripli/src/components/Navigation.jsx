/*Add tabs so that they are available on every page after login if we want*/
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { LOGOUT } from '../queries';

// GraphQL Query for searching saved places defined in the backend using elasticsearch
const SEARCH_SAVED_PLACES = gql`
  query SearchSavedPlaces($query: String!) {
    searchSavedPlaces(query: $query) {
      id
      name
      city
      country
      description
    }
  }
`;

function Navigation({ isLoggedIn, currentUserId, setIsLoggedIn, setCurrentUserId }) {
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();
  const [logoutMutation] = useMutation(LOGOUT, {
    onCompleted: () => {
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      navigate('/');
    }
  });

  const handleLogout = async () => {
    try {
      setIsLoggedIn(false);
      setCurrentUserId(null);
      await logoutMutation();
    }
    catch (err) {
      console.error('Logout failed:', err);
    }
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchSavedPlaces({ variables: { query: searchQuery.trim() } });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const [searchSavedPlaces, { loading }] = useLazyQuery(SEARCH_SAVED_PLACES, {
    onCompleted: (data) => {
      setSearchResults(data.searchSavedPlaces);
      setShowResults(true);
    },
    onError: (error) => {
      console.error('Search error:', error);
      setSearchResults([]);
    }
  });

  /*const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUserId(null);
    navigate('/');
  }; */

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      searchSavedPlaces({ variables: { query: searchQuery.trim() } });
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear results if search is too short, also elasticsearch won't handle it well
    if (value.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleResultClick = (placeId) => {
    //reset search and redirect to place detail page
    setShowResults(false);
    setSearchQuery('');
    setSearchResults([]);
    navigate(`/place/${placeId}`);
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          Tripli
        </Link>


        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto"></ul>

          <div className="me-3" style={{ maxWidth: '400px', width: '100%', position: 'relative' }}>
            <form className="d-flex" onSubmit={handleSearch}>
              <input
                className="form-control me-2"
                type="search"
                placeholder="Search places..."
                value={searchQuery}
                onChange={handleSearchChange}
                aria-label="Search"
              />
              <button className="btn btn-outline-light" type="submit" disabled={loading}>
                Search
              </button>
            </form>
            {/* if there is result */}
            {showResults && searchResults.length > 0 && (
              <div
                className="position-absolute bg-white rounded shadow-lg"
                style={{
                  top: 'calc(100% + 8px)',
                  left: 0,
                  right: 0,
                  zIndex: 1000,
                  maxHeight: '400px',
                  overflowY: 'auto'
                }}
              >
                <div className="list-group list-group-flush">
                  {searchResults.map((place) => (
                    <button
                      key={place.id}
                      className="list-group-item list-group-item-action text-start"
                      onClick={() => handleResultClick(place.id)}
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1 text-dark">{place.name}</h6>
                        <small className="text-muted">{place.city}</small>
                      </div>
                      <small className="text-muted">
                        {place.city}, {place.country}
                      </small>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No Results Message */}
            {showResults && searchResults.length === 0 && searchQuery.trim().length >= 2 && !loading && (
              <div
                className="position-absolute bg-white rounded shadow"
                style={{
                  top: 'calc(100% + 8px)',
                  left: 0,
                  right: 0,
                  zIndex: 1000
                }}
              >
                <p className="text-muted mb-0 text-center p-3">No places found</p>
              </div>
            )}
          </div>

          <ul className="navbar-nav">
            {isLoggedIn ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/feed">
                    Feed
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/leaderboard">
                    Leaderboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to={`/friends/`}>
                    Friends
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to={`/profile/${currentUserId}`}>
                    Profile
                  </Link>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-outline-light ms-2"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/signup">
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;