import React, { useState } from 'react';
import Auth from './components/Auth/Auth';
import TestList from './pages/TestList/TestList';
import Profile from './pages/Profile/Profile';
import TestHistory from './pages/TestHistory/TestHistory';
import AdminPanel from './pages/AdminPanel/AdminPanel';
import MaterialsList from './pages/MaterialsList/MaterialsList';
import Sidebar from './components/Sidebar/Sidebar';
import './App.css';

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
      {!token ? (
        <Auth setToken={setToken} setUser={setUser} />
      ) : (
        <div className="main-container">
          <Sidebar 
            currentView={currentView} 
            setCurrentView={setCurrentView} 
            isAdmin={user && user.is_admin}
          />
          <div className="content">
            <h1>Геймифицированное обучение тестированию</h1>
            {currentView === 'tests' && <TestList token={token} onTestComplete={handleTestComplete} />}
            {currentView === 'profile' && user && <Profile token={token} user={user} />}
            {currentView === 'history' && user && <TestHistory token={token} />}
            {currentView === 'materials' && <MaterialsList token={token} />}
            {currentView === 'admin' && user && user.is_admin && <AdminPanel token={token} />}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;