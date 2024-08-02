import React from 'react';
import './Result.css';

function Result({ result, onFinish }) {
  return (
    <div className="result-container">
      <h2 className="result-title">Результаты теста</h2>
      <div className="result-summary">
        <p>Правильные ответы: {result.correct_answers} из {result.total_questions}</p>
        <p>Полученный опыт: +{result.experience_gained} XP</p>
        <p>Текущий опыт: {result.current_experience} XP</p>
        <p>Текущий уровень: {result.current_level}</p>
      </div>
      {result.new_achievements && result.new_achievements.length > 0 && (
        <div className="new-achievements">
          <h3>Новые достижения:</h3>
          <ul>
            {result.new_achievements.map((achievement, index) => (
              <li key={index}>{achievement}</li>
            ))}
          </ul>
        </div>
      )}
      {result.questions && result.questions.map((question, index) => (
        <div key={index} className={`result-question ${question.is_correct ? 'correct' : 'incorrect'}`}>
          <h3>Тест {index + 1}</h3>
          <p>{question.content}</p>
          <p>Ваш ответ: {question.user_answer}</p>
          {!question.is_correct && <p>Правильный ответ: {question.correct_answer}</p>}
        </div>
      ))}
      <button className="next-test-btn" onClick={onFinish}>Вернуться к списку тестов</button>
    </div>
  );
}

export default Result;