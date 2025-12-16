/*Add tabs so that they are available on every page after login if we want*/
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { LOGOUT } from '../queries';

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

  if (!isLoggedIn) {
    return null;
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/feed">
          Tripli
        </Link>


        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto"></ul>

          <ul className="navbar-nav">
            {isLoggedIn ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/search">
                    Search
                  </Link>
                </li>
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