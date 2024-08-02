import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Test from '../pages/Test/Test';
import './TestList.css';

function TestList({ token, onTestComplete }) {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await axios.get('http://localhost:5000/tests', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTests(response.data);
      } catch (error) {
        console.error('An error occurred:', error);
      }
    };

    fetchTests();
  }, [token]);

  const handleTestComplete = (result) => {
    onTestComplete(result);
    setSelectedTest(null);
  };

const getDifficultyTag = (difficulty) => {
  if (!difficulty) return null; // Добавляем эту проверку

  switch(difficulty.toLowerCase()) {
    case 'junior':
      return <span className="tag junior">Junior</span>;
    case 'middle':
      return <span className="tag middle">Middle</span>;
    case 'senior':
      return <span className="tag senior">Senior</span>;
    default:
      return null;
  }
};

  return (
    <div className="test-list-container">
      <div className="test-list-header">
        <h2>Доступные тесты</h2>
        <button className="next-lesson-btn">Next lesson</button>
      </div>
      {selectedTest ? (
        <Test 
          testId={selectedTest} 
          token={token} 
          onTestComplete={handleTestComplete} 
        />
      ) : (
        <div className="test-grid">
          {tests.map(test => (
          <div key={test.id} className="test-card">
            <img src={test.image_url} alt={test.title} className="test-image" />
            <div className="test-content">
              <h3>{test.title}</h3>
              {getDifficultyTag(test.difficulty)}
              <button onClick={() => setSelectedTest(test.id)}>Начать тест</button>
            </div>
          </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TestList;