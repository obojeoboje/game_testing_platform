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
      {selectedTest ? (
        <Test testId={selectedTest} token={token} onTestComplete={handleTestComplete} />
      ) : (
        <>
          <h2>Available Tests</h2>
          <ul className="test-list">
            {tests.map(test => (
              <li key={test.id} className="test-item">
                {test.title}
                <button onClick={() => setSelectedTest(test.id)}>Start Test</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default TestList;