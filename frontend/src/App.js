import React, { useState } from 'react';
import Auth from './components/Auth';
import TestList from './pages/TestList';
import Profile from './pages/Profile/Profile';
import TestHistory from './pages/TestHistory/TestHistory';
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
    <div className="app">
      <h1>Геймифицированное обучение тестированию</h1>
      {!token ? (
        <Auth setToken={setToken} setUser={setUser} />
      ) : (
        <>
          <nav className="navbar">
            <ul>
              <li><a href="#" onClick={() => setCurrentView('tests')}>Тесты</a></li>
              <li><a href="#" onClick={() => setCurrentView('profile')}>Профиль</a></li>
              <li><a href="#" onClick={() => setCurrentView('history')}>История</a></li>
              {user && user.is_admin && <li><a href="#" onClick={() => setCurrentView('admin')}>Админ панель</a></li>}
            </ul>
          </nav>
          {user && (
            <div className="user-info">
              <p>Уровень: {user.level}</p>
              <p>Опыт: {user.experience}</p>
            </div>
          )}
          <div className="container">
            {currentView === 'tests' && <TestList token={token} onTestComplete={handleTestComplete} />}
            {currentView === 'profile' && user && <Profile token={token} />}
            {currentView === 'history' && user && <TestHistory token={token} />}
            {currentView === 'admin' && user && user.is_admin && <AdminPanel token={token} />}
          </div>
        </>
      )}
    </div>
  );
}

export default App;