import React, { useState } from 'react';
import Auth from './components/Auth';
import TestList from './pages/TestList';
import Profile from './pages/Profile';
import TestHistory from './pages/TestHistory';
import AdminPanel from './pages/AdminPanel';

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('tests');

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
              <button onClick={() => setCurrentView('tests')}>Tests</button>
              <button onClick={() => setCurrentView('profile')}>Profile</button>
              <button onClick={() => setCurrentView('history')}>History</button>
              {user.is_admin && (
                <button onClick={() => setCurrentView('admin')}>Admin Panel</button>
              )}
            </div>
          )}
          
          {currentView === 'tests' && <TestList token={token} onTestComplete={handleTestComplete} />}
          {currentView === 'profile' && user && <Profile token={token} />}
          {currentView === 'history' && user && <TestHistory token={token} />}
          {currentView === 'admin' && user && user.is_admin && <AdminPanel token={token} />}
        </>
      )}
    </div>
  );
}

export default App;