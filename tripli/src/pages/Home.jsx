import { Link } from 'react-router-dom';

function Home({ isLoggedIn, userId }) {
  return (
    <div className="container">
      <div className="row min-vh-100 align-items-center">
        <div className="col-12 text-center">
          <h1 className="display-1 mb-4">Welcome to Tripli!</h1>
          
          {isLoggedIn ? (
            <div className="d-grid gap-3 col-6 mx-auto">
              <Link to="/feed" className="btn btn-primary btn-lg">
                Go to Feed
              </Link>
              <Link to={`/profile/${userId}`} className="btn btn-outline-primary btn-lg">
                View Profile
              </Link>
            </div>
          ) : (
            <div className="d-grid gap-3 col-6 mx-auto">
              <Link to="/login" className="btn btn-primary btn-lg">
                Login
              </Link>
              <Link to="/signup" className="btn btn-outline-primary btn-lg">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;