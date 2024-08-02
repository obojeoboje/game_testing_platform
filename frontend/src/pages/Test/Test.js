import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Question from '../../components/Question/Question';
import Result from '../../components/Result/Result';
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

  const handleAnswer = (questionId, answerId) => {
    setAnswers({ ...answers, [questionId]: answerId });
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        `http://localhost:5000/tests/${testId}/submit`,
        { answers: Object.entries(answers).map(([questionId, optionId]) => ({ question_id: parseInt(questionId), option_id: optionId })) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(response.data);
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  if (!test) return <div className="loading">Loading test...</div>;
  if (result) return <Result result={result} onFinish={onTestComplete} />;

  const currentQuestion = test.questions[currentQuestionIndex];

return (
    <div className="test-container">
      <div className="test-header">
        <h2>{test.title}</h2>
        <div className="test-progress">
          <span>Тест {currentQuestionIndex + 1} из {test.questions.length}</span>
          <div className="progress-bar">
            <div className="progress" style={{ width: `${((currentQuestionIndex + 1) / test.questions.length) * 100}%` }}></div>
          </div>
        </div>
      </div>
      <Question
        question={currentQuestion}
        onAnswer={(answerId) => handleAnswer(currentQuestion.id, answerId)}
        userAnswer={answers[currentQuestion.id]}
      />
      <div className="test-navigation">
        {currentQuestionIndex > 0 && (
          <button onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}>Предыдущий</button>
        )}
        {currentQuestionIndex < test.questions.length - 1 ? (
          <button onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}>Следующий</button>
        ) : (
          <button onClick={handleSubmit}>Завершить</button>
        )}
      </div>
    </div>
  );
}

export default Test;