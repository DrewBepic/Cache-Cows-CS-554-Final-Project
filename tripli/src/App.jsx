import { Route, Routes } from 'react-router-dom';
import { useState } from 'react';

import Navigation from './components/Navigation';
import Home from './pages/Home';
import Friends from './pages/Friends';
import UserProfile from './pages/UserProfile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Feed from './pages/Feed';
import PlaceDetail from './pages/PlaceDetail';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

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
          {/* Temporaily, not sure yet if we should require users to be logged in to view places */}
          <Route path="/place/:placeId" element={<PlaceDetail setCurrentUserId={setCurrentUserId}/>} /> 
        </Routes>
      </div>
    </div>
  );
}

export default App;