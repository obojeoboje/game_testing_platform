import React, { useState } from 'react';
import Auth from './components/Auth';
import TestList from './components/TestList';
import Profile from './components/Profile';

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  const handleTestComplete = (result) => {
    setUser(prevUser => ({
      ...prevUser,
      experience: result.current_experience,
      level: result.current_level
    }));
  };

  return (
    <div className="container">
      <h1>Геймифицированное обучение тестированию</h1>
      {!token ? (
        <Auth setToken={setToken} setUser={setUser} />
      ) : (
        <>
          {user && (
            <div className="user-info">
              <p>Level: {user.level}</p>
              <p>Experience: {user.experience}</p>
              <button onClick={() => setShowProfile(!showProfile)}>
                {showProfile ? 'Hide Profile' : 'Show Profile'}
              </button>
            </div>
          )}
          {showProfile ? (
            <Profile token={token} />
          ) : (
            <TestList token={token} onTestComplete={handleTestComplete} />
          )}
        </>
      )}
    </div>
  );
}

export default App;