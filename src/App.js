// App.js
import { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import LoginForm from './components/login-form/LoginForm';

function App() {
  const [user, setUser] = useState({ sicil: '', name: '' ,roles: ''});
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <Router>
      <div className="App">
        {!loggedIn && (
          <>
            <h2>Giriş Formu</h2>
            <LoginForm setUser={setUser} setLoggedIn={setLoggedIn} />
          </>
        )}
         <Routes>
         <Route path="/home" element={<Home user={user} setUser={setUser} loggedIn={loggedIn} setLoggedIn={setLoggedIn} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
