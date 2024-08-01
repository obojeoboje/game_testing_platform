import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Test from './Test';

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

  return (
    <div>
      <h2>Доступные тесты</h2>
      <div className="test-list">
        {tests.map(test => (
          <div key={test.id} className="test-item">
            <h3>{test.title}</h3>
            <button onClick={() => setSelectedTest(test.id)}>Начать тест</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TestList;