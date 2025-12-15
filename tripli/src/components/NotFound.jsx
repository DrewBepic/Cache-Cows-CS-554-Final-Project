import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function NotFound() {
  return (
    <div className="container text-center mt-5">
      <h1 className="display-1">404</h1>
      <h2>Page Not Found</h2>
      <p className="lead">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary">Go Home</Link>
    </div>
  );
}

export default NotFound;