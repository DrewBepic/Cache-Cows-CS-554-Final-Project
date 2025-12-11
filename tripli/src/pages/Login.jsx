import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useNavigate, Link } from 'react-router-dom';
import { LOGIN } from '../queries';

function Login({ setIsLoggedIn, setCurrentUserId }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const [login] = useMutation(LOGIN, {
      onCompleted: (data) => {
        setIsLoggedIn(true);
        setCurrentUserId(data.login.id);
      },
        update(cache, { data: { login } }) {
            try {
              
              navigate('/feed');
            }
            catch (e) {
                console.error('Login error:', e);
                setError('Login failed. Please try again.');
            }
        }
    });

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('Username and password are required');
            return;
        }

        try {
            const result = await login({
                variables: {
                    username,
                    password
                }
            });
            if (result.data?.login?.id) {
                localStorage.setItem('userId', result.data.login.id);
                localStorage.setItem('username', result.data.login.username);
            }
        }
        catch (err) {
            setError('Login failed. Please try again.');
        }
    };

return (
  <div className="container">
    <div className="row justify-content-center mt-5">
      <div className="col-md-6 col-lg-4">
        <div className="card shadow">
          <div className="card-body p-4">
            <h2 className="card-title text-center mb-4 text-primary">Login</h2>
            
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

            <div className="mb-3">
              <label className="form-label fw-bold">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              onClick={onSubmit} 
              className="btn btn-primary w-100 py-2 fw-bold"
            >
              Login
            </button>

            <p className="text-center mt-3 mb-0">
              Don't have an account? <Link to="/signup" className="text-decoration-none">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

}

export default Login;
