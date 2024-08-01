import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Statistics.css'; // Создадим этот файл позже

function Statistics({ token }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/admin/statistics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
      setLoading(false);
    } catch (err) {
      setError('Ошибка при загрузке статистики');
      setLoading(false);
    }
  };

  if (loading) return <div>Загрузка статистики...</div>;
  if (error) return <div>{error}</div>;
  if (!stats) return null;

  return (
    <div className="statistics">
      <h2>Статистика платформы</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Пользователи</h3>
          <p>Всего: {stats.totalUsers}</p>
          <p>Активные: {stats.activeUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Тесты</h3>
          <p>Всего: {stats.totalTests}</p>
          <p>Пройдено: {stats.completedTests}</p>
        </div>
        <div className="stat-card">
          <h3>Средний балл</h3>
          <p>{stats.averageScore.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Топ тест</h3>
          <p>{stats.topTest}</p>
        </div>
      </div>
    </div>
  );
}

export default Statistics;