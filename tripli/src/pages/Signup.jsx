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
        <div className="Signup">
            <h2 className='Signup-Title'>Sign Up</h2>
            
            {error && <p className="error">{error}</p>}

            <div className='FormDiv'>
                <label>Username</label>
                <input
                    type =" text"
                    placeholder = "Enter username"
                    value = {username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>

            <div className='FormDiv'>
                <label>First Name</label>
                <input
                    type = "text"
                    placeholder = "Enter first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                />
            </div>

            <div className='FormDiv'>
                <label>Last Name</label>
                <input
                    type="text"
                    placeholder="Enter last name"
                    value = {lastName}
                    onChange={(e) => setLastName(e.target.value)}
                />
            </div>

            <div className='FormDiv'>
                <label>Password</label>
                <input
                    type = "password"
                    placeholder = "Enter password (min 6 characters)"
                    value = {password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <div className='FormDiv'>
                <label>Confirm Password</label>
                <input
                    type = "password"
                    placeholder = "Confirm password"
                    value = {confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
            </div>

            <button onClick={onSubmit}>Sign Up</button>

            <p>Already have an account? <Link to="/login">Login</Link></p>

        </div>
    );
}

export default Signup;