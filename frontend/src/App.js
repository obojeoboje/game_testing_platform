import React, { useState } from 'react';
import Auth from './components/Auth';
import TestList from './components/TestList';

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

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
            </div>
          )}
          <TestList token={token} onTestComplete={handleTestComplete} />
        </>
      )}
    </div>
  );
}

export default App;