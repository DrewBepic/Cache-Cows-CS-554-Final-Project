import { useMutation } from '@apollo/client';
import { Link, useNavigate  } from 'react-router-dom';
import { LOGOUT } from '../queries';

function Feed() {
    const userId = localStorage.getItem('userId');
    const navigate = useNavigate();
    const [logoutMutation] = useMutation(LOGOUT, {onCompleted: () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        navigate('/');
    }});

    const handleLogout = async () => {
        try {
            await logoutMutation();
        } 
        catch (err) {
            console.error('Logout failed:', err);
        }
    };

    return (
        <div>
            <nav>
                <Link to="/feed">Feed</Link>
                <Link to="/leaderboard">Leaderboard</Link>
                <Link to={`/profile/${userId}`}>User Profile</Link>
                <Link to="/friends">Friends</Link>
                <button onClick={handleLogout}>Logout</button>
            </nav>
        </div>
    );
}

export default Feed;