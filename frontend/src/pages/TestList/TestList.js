import React, { useState, useEffect } from 'react';
import { getTests } from '../../utils/api';
import Test from '../Test/Test';
import { getDifficultyTag } from '../../utils/helpers';
import './TestList.css';

function TestList({ token, onTestComplete }) {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await getTests();
      setTests(response.data);
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  const handleTestComplete = (result) => {
    onTestComplete(result);
    setSelectedTest(null);
  };

  const handleTestSelect = (testId) => {
    setSelectedTest(testId);
  };

  if (tests.length === 0) {
    return <div>Loading tests...</div>;
  }

  return (
    <div className="test-list-container">
      <h2>Доступные тесты</h2>
      {selectedTest ? (
        <Test 
          testId={selectedTest} 
          token={token} 
          onTestComplete={handleTestComplete} 
        />
      ) : (
        <div className="test-grid">
          {tests.map(test => {
            const difficultyTag = getDifficultyTag(test.difficulty);
            return (
              <div 
                key={test.id} 
                className="test-card" 
                onClick={() => handleTestSelect(test.id)}
              >
                {test.image_url && <img src={test.image_url} alt={test.title} className="test-image" />}
                <div className="test-content">
                  <h3>{test.title}</h3>
                  {difficultyTag && <span className={difficultyTag.className}>{difficultyTag.text}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TestList;