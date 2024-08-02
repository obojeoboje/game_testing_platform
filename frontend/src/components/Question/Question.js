import React from 'react';
import './Question.css';

function Question({ question, onAnswer, userAnswer }) {
  return (
    <div className="question">
      <h3>{question.content}</h3>
      <div className="options">
        {question.options.map(option => (
          <label key={option.id} className={`option ${userAnswer === option.id ? 'selected' : ''}`}>
            <input
              type="radio"
              name={`question_${question.id}`}
              value={option.id}
              checked={userAnswer === option.id}
              onChange={() => onAnswer(option.id)}
            />
            {option.content}
          </label>
        ))}
      </div>
    </div>
  );
}

export default Question;