import React from 'react';

function TestCard({ test, onEdit, onDelete }) {
  return (
    <div className="test-card">
      <h3>{test.title}</h3>
      <p>Вопросов: {test.questions ? test.questions.length : 0}</p>
      <div className="test-card-actions">
        <button onClick={onEdit}>Редактировать</button>
        <button onClick={onDelete}>Удалить</button>
      </div>
    </div>
  );
}

export default TestCard;