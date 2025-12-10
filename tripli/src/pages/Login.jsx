import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useNavigate, Link } from 'react-router-dom';
import { LOGIN } from '../queries';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const [login] = useMutation(LOGIN, {
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
            await login({
                variables: {
                    username,
                    password
                }
            });
        }
        catch (err) {
            setError('Login failed. Please try again.');
        }
    };

    return (
        <div className="Login">
            <h2 className='Login-Title'>Login</h2>

            {error && <p className="error">{error}</p>}

            <div className='FormDiv'>
                <label>Username</label>
                <input
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>

            <div className='FormDiv'>
                <label>Password</label>
                <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <button onClick={onSubmit}>Login</button>

            <p>Don't have an account? <Link to="/signup">Sign up</Link></p>

        </div>
    );
}

export default Login;
