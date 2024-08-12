import React from 'react';
import './Sidebar.css';
import { ReactComponent as Check } from '../../icons/Check.svg';
import { ReactComponent as ArrowReload } from '../../icons/Arrow_Reload.svg';
import { ReactComponent as Profile } from '../../icons/User.svg';
import { ReactComponent as BookOpen } from '../../icons/Book_Open.svg';
import { ReactComponent as FileEdit } from '../../icons/File_Edit.svg';
import { ReactComponent as Flag } from '../../icons/Flag.svg';
import { ReactComponent as Settings } from '../../icons/Settings_Future.svg';

function Sidebar({ currentView, setCurrentView, isAdmin }) {
  return (
    <div className="sidebar">
      <div className="sidebar-content">
        <div className="logo">
          <h2>Polynskih</h2>
        </div>
        <nav>
          <ul>
            <li className={currentView === 'tests' ? 'active' : ''} onClick={() => setCurrentView('tests')}>
              <span className="icon"><Check /></span> Тесты
            </li>
            <li className={currentView === 'materials' ? 'active' : ''} onClick={() => setCurrentView('materials')}>
              <span className="icon"><BookOpen /></span> Материалы
            </li>
            <li className={currentView === 'profile' ? 'active' : ''} onClick={() => setCurrentView('profile')}>
              <span className="icon"><Profile /></span> Профиль
            </li>
            <li className={currentView === 'history' ? 'active' : ''} onClick={() => setCurrentView('history')}>
              <span className="icon"><ArrowReload /></span> История
            </li>
            {isAdmin && (
              <li className={currentView === 'admin' ? 'active' : ''} onClick={() => setCurrentView('admin')}>
                <span className="icon"><FileEdit /></span> Админ Панель
              </li>
            )}
          </ul>
        </nav>
      </div>
      <div className="sidebar-footer">Beta Version 0.1.0</div>
      <div className="sidebar-footer">
        <button className="support-btn">
          <span className="icon"><Flag /></span> Поддержка
        </button>
        <button className="settings-btn">
          <span className="icon"><Settings /></span> Настройки
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
