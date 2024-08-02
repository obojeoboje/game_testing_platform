import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Question from '../../components/Question/Question';
import Result from '../../components/Result/Result';
import '../../styles/pages/Test.css';

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

  const handleAnswer = async (questionId, answerId, isCorrect) => {
    const updatedAnswers = { ...answers, [questionId]: { id: answerId, correct: isCorrect } };
    setAnswers(updatedAnswers);

    try {
      await axios.post(
        `http://localhost:5000/tests/${testId}/check-answer`,
        { question_id: questionId, option_id: answerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Error checking answer:', error);
    }

    if (currentQuestionIndex < test.questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }, 1000);
    } else {
      setTimeout(() => {
        handleSubmit(updatedAnswers);
      }, 1000);
    }
  };

  const handleSubmit = async (finalAnswers) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/tests/${testId}/submit`,
        { 
          answers: Object.entries(finalAnswers).map(([questionId, answer]) => ({
            question_id: parseInt(questionId),
            option_id: answer.id
          }))
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(response.data);
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  const handleNavigateToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  if (!test) return <div className="loading">Loading test...</div>;
  if (result) return <Result result={result} onFinish={onTestComplete} />;

  const currentQuestion = test.questions[currentQuestionIndex];

  return (
    <div className="test-container">
      <div className="test-header">
        <h2>{test.title}</h2>
        <div className="test-progress">
          <span>Вопрос {currentQuestionIndex + 1} из {test.questions.length}</span>
          <div className="progress-bar">
            <div className="progress" style={{ width: `${((currentQuestionIndex + 1) / test.questions.length) * 100}%` }}></div>
          </div>
        </div>
      </div>
      <Question
        question={currentQuestion}
        onAnswer={(answerId, isCorrect) => handleAnswer(currentQuestion.id, answerId, isCorrect)}
        userAnswer={answers[currentQuestion.id]}
      />
      <div className="test-navigation">
        {currentQuestionIndex > 0 && (
          <button onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}>Предыдущий</button>
        )}
        <div className="spacer"></div>
        {currentQuestionIndex < test.questions.length - 1 && (
          <button onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}>Следующий</button>
        )}
        {currentQuestionIndex === test.questions.length - 1 && !answers[currentQuestion.id] && (
          <button onClick={() => handleSubmit(answers)}>Завершить</button>
        )}
      </div>
      <div className="question-navigation">
        {test.questions.map((question, index) => (
          <button
            key={index}
            onClick={() => handleNavigateToQuestion(index)}
            className={`question-nav-button 
              ${index === currentQuestionIndex ? 'active' : ''} 
              ${answers[question.id] ? 
                (answers[question.id].correct ? 'correct' : 'incorrect') 
                : ''
              }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Test;