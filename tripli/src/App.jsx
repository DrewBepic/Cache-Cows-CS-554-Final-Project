import './App.css'
import {Route, Link, Routes} from 'react-router-dom';

//import components here
import Home from './pages/Home';
import Friends from './pages/Friends';
import UserProfile from './pages/UserProfile';
//end of component imports

function App() {
  return (
    <>
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/friends/:userId" element={<Friends />}/>
        <Route path="/profile/:userId" element={<UserProfile />} />
      </Routes>
    </div>
    </>
  )
}

export default App
