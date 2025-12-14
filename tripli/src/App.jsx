import { Route, Routes } from 'react-router-dom';
import { useState, useEffect } from 'react';

import './App.css';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Friends from './pages/Friends';
import UserProfile from './pages/UserProfile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Feed from './pages/Feed';
import PlaceDetail from './pages/PlaceDetail';
import Search from './pages/Search';
import SearchResults from './pages/SearchResults';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const savedUserId = localStorage.getItem('currentUserId');
    const savedIsLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (savedIsLoggedIn === 'true' && savedUserId) {
      setIsLoggedIn(true);
      setCurrentUserId(savedUserId);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && currentUserId) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentUserId', currentUserId);
    } else {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('currentUserId');
    }
  }, [isLoggedIn, currentUserId]);

  return (
    <div>
      <Navigation 
        isLoggedIn={isLoggedIn} 
        currentUserId={currentUserId}
        setIsLoggedIn={setIsLoggedIn}
        setCurrentUserId={setCurrentUserId}
      />

      <div className="container mt-4">
        <Routes>
          <Route 
            path="/" 
            element={<Home isLoggedIn={isLoggedIn} userId={currentUserId} />}
          />
          <Route 
            path="/login" 
            element={<Login setIsLoggedIn={setIsLoggedIn} setCurrentUserId={setCurrentUserId} />}
          />
          <Route 
            path="/signup" 
            element={<Signup setIsLoggedIn={setIsLoggedIn} setCurrentUserId={setCurrentUserId} />}
          />
          <Route path="/feed" element={<Feed />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/profile/:userId" element={<UserProfile />} />
          <Route path="/place/:placeId" element={<PlaceDetail userId={currentUserId}/>} /> 
          <Route path="/search" element={<Search />} />
          <Route path="/search/results" element={<SearchResults />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;