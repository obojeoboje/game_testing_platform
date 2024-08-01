import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TestCard from './TestCard';
import TestModal from './TestModal/TestModal';

function TestManagement({ token }) {
  const [tests, setTests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTest, setCurrentTest] = useState(null);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await axios.get('http://localhost:5000/tests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTests(response.data);
    } catch (error) {
      console.error('Error fetching tests:', error);
    }
  };

  const handleCreateTest = () => {
    setCurrentTest(null);
    setIsModalOpen(true);
  };

  const handleEditTest = async (testId) => {
    try {
      const response = await axios.get(`http://localhost:5000/tests/${testId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Fetched test data:', JSON.stringify(response.data, null, 2));
      setCurrentTest(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching test details:', error);
    }
  };

  const handleDeleteTest = async (testId) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      try {
        await axios.delete(`http://localhost:5000/tests/${testId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchTests();
      } catch (error) {
        console.error('Error deleting test:', error);
      }
    }
  };

  const handleSaveTest = async (testData) => {
    try {
      console.log('Saving test data:', testData); // Отладочный вывод
      if (testData.id) {
        await axios.put(`http://localhost:5000/tests/${testData.id}`, testData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5000/tests', testData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setIsModalOpen(false);
      fetchTests();
    } catch (error) {
      console.error('Error saving test:', error);
    }
  };

  const filteredTests = tests.filter(test => 
    test.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="test-management">
      <h2>Управление тестами</h2>
      <div className="test-actions">
        <input
          type="text"
          placeholder="Поиск тестов..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleCreateTest}>Создать новый тест</button>
      </div>
      <div className="test-list">
        {filteredTests.map(test => (
          <TestCard
            key={test.id}
            test={test}
            onEdit={() => handleEditTest(test.id)}
            onDelete={() => handleDeleteTest(test.id)}
          />
        ))}
      </div>
      {isModalOpen && (
        <TestModal
          test={currentTest}
          onSave={handleSaveTest}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

export default TestManagement;