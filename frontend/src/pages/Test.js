import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Question from '../components/Question';
import Result from '../components/Result';

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
    return <Result result={result} onFinish={handleFinish} />;
  }

  return (
    <div>
      <h2>{test.title}</h2>
      {memoizedQuestions.map(question => (
        <Question
          key={question.id}
          question={question}
          onAnswerChange={handleAnswerChange}
          selectedAnswer={answers[question.id]}
        />
      ))}
      <button onClick={handleSubmit}>Submit Test</button>
    </div>
  );
}

export default Test;
