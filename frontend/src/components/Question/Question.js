import React, { useState, useEffect } from 'react';
import './Question.css';

function Question({ question, onAnswer, userAnswer }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerStatus, setAnswerStatus] = useState(null);

  useEffect(() => {
    setSelectedAnswer(userAnswer ? userAnswer.id : null);
  }, [userAnswer]);

  const handleAnswer = (optionId) => {
    const isCorrect = question.options.find(option => option.id === optionId).is_correct;
    setSelectedAnswer(optionId);
    setAnswerStatus(isCorrect ? 'correct' : 'incorrect');
    
    setTimeout(() => {
      onAnswer(optionId, isCorrect);
      setAnswerStatus(null);
    }, 1000);
  };

  return (
    <div className="question">
      <h3>{question.content}</h3>
      <div className="options">
        {question.options.map(option => (
          <label 
            key={option.id} 
            className={`option ${selectedAnswer === option.id ? 'selected' : ''} ${answerStatus && selectedAnswer === option.id ? answerStatus : ''}`}
          >
            <input
              type="radio"
              name={`question_${question.id}`}
              value={option.id}
              checked={selectedAnswer === option.id}
              onChange={() => handleAnswer(option.id)}
              disabled={answerStatus !== null}
            />
            {option.content}
          </label>
        ))}
      </div>
      {answerStatus && (
        <div className={`feedback ${answerStatus}`}>
          {answerStatus === 'correct' ? 'Правильно!' : 'Неправильно. Попробуйте еще раз.'}
        </div>
      )}
    </div>
  );
}

export default Question;