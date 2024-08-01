import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Result from '../components/Result';
import './Test.css';

function Test({ testId, token, onTestComplete }) {
  const [test, setTest] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/tests/${testId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTest(response.data);
      } catch (error) {
        console.error('An error occurred:', error);
      }
    };

    fetchTest();
  }, [testId, token]);

  const handleAnswer = (optionId) => {
    setAnswers({...answers, [currentQuestionIndex]: optionId});
    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        `http://localhost:5000/tests/${testId}/submit`,
        { answers: Object.values(answers).map((optionId, index) => ({ question_id: test.questions[index].id, option_id: optionId })) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(response.data);
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  if (!test) return <div className="loading">Loading test...</div>;
  if (result) return <Result result={result} onFinish={() => onTestComplete(result)} />;

  const currentQuestion = test.questions[currentQuestionIndex];

  return (
    <div className="test-container">
      <h2 className="test-title">{test.title}</h2>
      <div className="question-container">
        <h3 className="question-text">{currentQuestion.content}</h3>
        <div className="options-container">
          {currentQuestion.options.map(option => (
            <button 
              key={option.id} 
              className={`option-button ${answers[currentQuestionIndex] === option.id ? 'selected' : ''}`}
              onClick={() => handleAnswer(option.id)}
            >
              {option.content}
            </button>
          ))}
        </div>
      </div>
      <div className="navigation">
        <span className="question-counter">{currentQuestionIndex + 1} / {test.questions.length}</span>
        {currentQuestionIndex === test.questions.length - 1 && (
          <button className="submit-button" onClick={handleSubmit}>Завершить тест</button>
        )}
      </div>
    </div>
  );
}

export default Test;
