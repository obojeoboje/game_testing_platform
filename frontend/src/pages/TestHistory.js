import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle, FaRegClock } from 'react-icons/fa';
import './TestHistory.css';

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
      <h2>История тестов</h2>
      <div className="history-cards">
        {history.map((result, index) => (
          <div key={index} className="history-card">
            <div className="card-header">
              <h3>{result.test_title}</h3>
              <span className="date">
                <FaRegClock /> {new Date(result.date_completed).toLocaleDateString()}
              </span>
            </div>
            <div className="card-body">
              <div className="score">
                {result.score >= result.total_questions / 2 ? (
                  <FaCheckCircle className="icon-pass" />
                ) : (
                  <FaTimesCircle className="icon-fail" />
                )}
                <span>{result.score}/{result.total_questions}</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress" 
                  style={{width: `${(result.score / result.total_questions) * 100}%`}}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TestHistory;