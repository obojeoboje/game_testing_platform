import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TestHistory({ token }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get('http://localhost:5000/test-history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistory(response.data);
      } catch (error) {
        console.error('An error occurred:', error);
      }
    };

    fetchHistory();
  }, [token]);

  return (
    <div className="test-history">
      <h2>Test History</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Test</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {history.map((result, index) => (
            <tr key={index}>
              <td>{new Date(result.date_completed).toLocaleDateString()}</td>
              <td>{result.test_title}</td>
              <td>{result.score}/{result.total_questions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TestHistory;