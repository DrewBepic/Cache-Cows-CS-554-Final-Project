import './App.css'
import {Route, Link, Routes} from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';

import Home from './pages/Home';
import Friends from './pages/Friends';
import UserProfile from './pages/UserProfile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Feed from './pages/Feed';
//import Navigation from './components/NavigationvBar';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  return (
    <div>
      <Routes>
        <Route path="/" element={<Home isLoggedIn={isLoggedIn} userId={currentUserId} />}/>
        <Route path="/login" element={<Login />}/>
        <Route path="/signup" element={<Signup />}/>
        <Route path="/feed" element={<Feed />}/>
        <Route path="/friends" element={<Friends />}/>
        <Route path="/profile/:userId" element={<UserProfile />} />
      </Routes>
    </div>
  )
}

export default App
