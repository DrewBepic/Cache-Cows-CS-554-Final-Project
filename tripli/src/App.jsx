import './App.css';
import { Route, Routes, NavLink } from 'react-router-dom';
import Home from './components/Home.jsx';
//import MainFeed from './components/MainFeed.jsx';
//import FriendsPage from './components/FriendsPage.jsx';
//import Leaderboard from './components/Leaderboard.jsx';
//import UserPage from './components/UserPage.jsx';
//import Monument from './components/Monument.jsx';
//import NotFound from './components/NotFound.jsx';

function App() {
    return (
        <div>
            <Routes>
                <Route path='/' element={<Home />} />
                {/*<Route path='*' element={<NotFound />} /> */}
            </Routes>
        </div>
    );
}

export default App;