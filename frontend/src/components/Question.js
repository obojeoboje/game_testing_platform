import React from 'react';

function Question({ question, onAnswerChange, selectedAnswer }) {
  return (
    <div className="question">
      <p>{question.content}</p>
      <div className="options">
        {question.options.map(option => (
          <label key={option.id} className="option">
            <input
              type="radio"
              name={`question_${question.id}`}
              value={option.id}
              onChange={() => onAnswerChange(question.id, option.id)}
              checked={selectedAnswer === option.id}
            />
            {option.content}
          </label>
        ))}
      </div>
    </div>
  );
}

export default Question;
