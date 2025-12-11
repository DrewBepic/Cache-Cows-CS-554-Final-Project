import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useNavigate, Link } from 'react-router-dom';
import { CREATE_USER } from '../queries';

function Signup() {
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const [createUser] = useMutation(CREATE_USER, {
        update(cache, { data: { createUser } }) {
            try {
                navigate('/login');
            }
            catch (e) {
                console.error('Signup error:', e);
                setError('Signup failed. Please try again.');
            }
        }
    });

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username || !firstName || !lastName || !password) {
            setError('All fields are required');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        //Will change password requirements later
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        try {
            await createUser({
                variables: {
                    username,
                    firstName,
                    lastName,
                    password
                }
            });
        }
        catch (err) {
            setError('Signup failed. Please try again.');
        }
    };

return (
  <div className="container">
    <div className="row justify-content-center mt-5">
      <div className="col-md-8 col-lg-6">
        <div className="card shadow">
          <div className="card-body p-4">
            <h2 className="card-title text-center mb-4 text-primary">Sign Up</h2>
            
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <div className="mb-3">
              <label className="form-label fw-bold">Username</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">First Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Last Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Confirm Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button 
              onClick={onSubmit} 
              className="btn btn-primary w-100 py-2 fw-bold"
            >
              Sign Up
            </button>

            <p className="text-center mt-3 mb-0">
              Already have an account? <Link to="/login" className="text-decoration-none">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

}

export default Signup;