import React from 'react';
import './Sidebar.css';

function Sidebar({ currentView, setCurrentView, isAdmin }) {
  return (
    <div className="sidebar">
      <div className="sidebar-content">
        <div className="logo">
          <h2>Skillzone</h2>
        </div>
        <nav>
          <ul>
            <li className={currentView === 'tests' ? 'active' : ''} onClick={() => setCurrentView('tests')}>
              <span className="icon">🧩</span> Тесты
            </li>
            <li className={currentView === 'materials' ? 'active' : ''} onClick={() => setCurrentView('materials')}>
              <span className="icon">📚</span> Материалы
            </li>
            <li className={currentView === 'profile' ? 'active' : ''} onClick={() => setCurrentView('profile')}>
              <span className="icon">👤</span> Профиль
            </li>
            <li className={currentView === 'history' ? 'active' : ''} onClick={() => setCurrentView('history')}>
              <span className="icon">📅</span> История
            </li>
            {isAdmin && (
              <li className={currentView === 'admin' ? 'active' : ''} onClick={() => setCurrentView('admin')}>
                <span className="icon">🔧</span> Админ Панель
              </li>
            )}
          </ul>
        </nav>
      </div>
      <div className="sidebar-footer">
        <button className="support-btn">
          <span className="icon">❓</span> Поддержка
        </button>
        <button className="settings-btn">
          <span className="icon">⚙️</span> Настройки
        </button>
      </div>
    </div>
  );
}

export default Sidebar;