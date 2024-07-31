import React, { useState } from 'react';
import TestManagement from './TestManagement';
import UserManagement from './UserManagement';
import Statistics from './Statistics';

function AdminPanel({ token }) {
  const [activeSection, setActiveSection] = useState('tests');

  const renderContent = () => {
    switch(activeSection) {
      case 'tests':
        return <TestManagement token={token} />;
      case 'users':
        return <UserManagement token={token} />;
      case 'stats':
        return <Statistics token={token} />;
      default:
        return <TestManagement token={token} />;
    }
  };

  return (
    <div className="admin-panel">
      <div className="sidebar">
        <button 
          className={activeSection === 'tests' ? 'active' : ''}
          onClick={() => setActiveSection('tests')}
        >
          Тесты
        </button>
        <button 
          className={activeSection === 'users' ? 'active' : ''}
          onClick={() => setActiveSection('users')}
        >
          Пользователи
        </button>
        <button 
          className={activeSection === 'stats' ? 'active' : ''}
          onClick={() => setActiveSection('stats')}
        >
          Статистика
        </button>
      </div>
      <div className="content">
        {renderContent()}
      </div>
    </div>
  );
}

export default AdminPanel;