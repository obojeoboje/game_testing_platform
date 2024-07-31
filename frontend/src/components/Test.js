import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

function Test({ testId, token, onTestComplete }) {
  const [test, setTest] = useState(null);
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

  // Используем useMemo для сохранения порядка вариантов ответов
  const memoizedQuestions = useMemo(() => test?.questions || [], [test]);

  const handleAnswerChange = (questionId, optionId) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
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

  const handleFinish = () => {
    if (onTestComplete) {
      onTestComplete(result);
    }
  };

  if (!test) return <div>Loading...</div>;

  if (result) {
    return (
      <div className="result">
        <h3>Test Results:</h3>
        <p>Correct Answers: {result.correct_answers}</p>
        <p>Total Questions: {result.total_questions}</p>
        <p>Experience Gained: {result.experience_gained}</p>
        <p>Current Experience: {result.current_experience}</p>
        <p>Current Level: {result.current_level}</p>
        <button onClick={handleFinish}>Back to Test List</button>
      </div>
    );
  }

  return (
    <div>
      <h2>{test.title}</h2>
      {memoizedQuestions.map(question => (
        <div key={question.id} className="question">
          <p>{question.content}</p>
          <div className="options">
            {question.options.map(option => (
              <label key={option.id} className="option">
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  value={option.id}
                  onChange={() => handleAnswerChange(question.id, option.id)}
                  checked={answers[question.id] === option.id}
                />
                {option.content}
              </label>
            ))}
          </div>
        </div>
      ))}
      <button onClick={handleSubmit}>Submit Test</button>
    </div>
  );
}

export default Test;