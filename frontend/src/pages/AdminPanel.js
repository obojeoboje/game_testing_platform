import React, { useState, useEffect } from 'react';
import TestManagement from '../components/TestManagement';
import UserManagement from '../components/UserManagement';
import Statistics from '../components/Statistics/Statistics';
import MaterialForm from '../components/MaterialForm';
import axios from 'axios';

function AdminPanel({ token }) {
  const [activeSection, setActiveSection] = useState('tests');
  const [materials, setMaterials] = useState([]);
  const [editingMaterial, setEditingMaterial] = useState(null);

  useEffect(() => {
    if (activeSection === 'materials') {
      fetchMaterials();
    }
  }, [activeSection]);

  const fetchMaterials = async () => {
    try {
      const response = await axios.get('http://localhost:5000/materials', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMaterials(response.data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот материал?')) {
      try {
        await axios.delete(`http://localhost:5000/materials/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchMaterials();
      } catch (error) {
        console.error('Error deleting material:', error);
      }
    }
  };

  const renderContent = () => {
    switch(activeSection) {
      case 'tests':
        return <TestManagement token={token} />;
      case 'users':
        return <UserManagement token={token} />;
      case 'stats':
        return <Statistics token={token} />;
      case 'materials':
        return (
          <div>
            <h3>Управление материалами</h3>
            <MaterialForm token={token} material={editingMaterial} onSave={() => {
              setEditingMaterial(null);
              fetchMaterials();
            }} />
            <div className="materials-list">
              {materials.map(material => (
                <div key={material.id} className="material-item">
                  <h4>{material.title}</h4>
                  <p>Тема: {material.topic}</p>
                  <button onClick={() => setEditingMaterial(material)}>Редактировать</button>
                  <button onClick={() => handleDeleteMaterial(material.id)}>Удалить</button>
                </div>
              ))}
            </div>
          </div>
        );
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
        <button 
          className={activeSection === 'materials' ? 'active' : ''}
          onClick={() => setActiveSection('materials')}
        >
          Материалы
        </button>
      </div>
      <div className="content">
        {renderContent()}
      </div>
    </div>
  );
}

export default AdminPanel;