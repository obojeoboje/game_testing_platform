import React from 'react';
import './Result.css'; // Убедитесь, что вы создадите этот файл

function Result({ result, onFinish }) {
  return (
    <div className="result-container">
      <h2 className="result-title">Результаты теста</h2>
      <div className="result-stats">
        <div className="stat-item">
          <span className="stat-label">Правильные ответы:</span>
          <span className="stat-value">{result.correct_answers} из {result.total_questions}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Полученный опыт:</span>
          <span className="stat-value">+{result.experience_gained} XP</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Текущий опыт:</span>
          <span className="stat-value">{result.current_experience} XP</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Текущий уровень:</span>
          <span className="stat-value">{result.current_level}</span>
        </div>
      </div>
      {result.new_achievements && result.new_achievements.length > 0 && (
        <div className="achievements">
          <h3>Новые достижения:</h3>
          <ul className="achievement-list">
            {result.new_achievements.map((achievement, index) => (
              <li key={index} className="achievement-item">{achievement}</li>
            ))}
          </ul>
        </div>
      )}
      <button className="finish-button" onClick={onFinish}>Вернуться к списку тестов</button>
    </div>
  );
}

export default Result;