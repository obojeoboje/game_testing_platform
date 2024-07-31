import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminPanel({ token }) {
  console.log('Rendering AdminPanel, token:', token);
  const [tests, setTests] = useState([]);
  const [newTest, setNewTest] = useState({ 
    title: '', 
    questions: [{ 
      content: '', 
      options: [{ content: '', is_correct: false }] 
    }] 
  });
  const [editingTest, setEditingTest] = useState(null);

  useEffect(() => {
    console.log('AdminPanel useEffect triggered');
    if (token) {
      fetchTests();
    }
  }, [token]);

  const fetchTests = async () => {
    console.log('Fetching tests...');
    try {
      const response = await axios.get('http://localhost:5000/tests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Fetched tests:', response.data);
      const formattedTests = response.data.map(test => ({
        ...test,
        questions: test.questions || [],
      }));
      setTests(formattedTests);
    } catch (error) {
      console.error('An error occurred while fetching tests:', error);
    }
  };

  const handleCreateTest = async () => {
    try {
      await axios.post('http://localhost:5000/tests', newTest, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewTest({ title: '', questions: [{ content: '', options: [{ content: '', is_correct: false }] }] });
      fetchTests();
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  const handleUpdateTest = async () => {
    try {
      await axios.put(`http://localhost:5000/tests/${editingTest.id}`, editingTest, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingTest(null);
      fetchTests();
    } catch (error) {
      console.error('An error occurred:', error);
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
        console.error('An error occurred:', error);
      }
    }
  };

  const addQuestion = (test, setTest) => {
    setTest({
      ...test,
      questions: [...test.questions, { content: '', options: [{ content: '', is_correct: false }] }]
    });
  };

  const addOption = (test, setTest, questionIndex) => {
    const updatedQuestions = [...test.questions];
    updatedQuestions[questionIndex].options.push({ content: '', is_correct: false });
    setTest({ ...test, questions: updatedQuestions });
  };

  const updateQuestion = (test, setTest, questionIndex, field, value) => {
    const updatedQuestions = [...test.questions];
    updatedQuestions[questionIndex][field] = value;
    setTest({ ...test, questions: updatedQuestions });
  };

  const updateOption = (test, setTest, questionIndex, optionIndex, field, value) => {
    const updatedQuestions = [...test.questions];
    updatedQuestions[questionIndex].options[optionIndex][field] = value;
    setTest({ ...test, questions: updatedQuestions });
  };

  const renderTestForm = (test, setTest, isEditing = false) => (
    <div>
      <input
        type="text"
        placeholder="Test Title"
        value={test.title}
        onChange={(e) => setTest({ ...test, title: e.target.value })}
      />
      {test.questions && test.questions.map((question, qIndex) => (
        <div key={qIndex}>
          <input
            type="text"
            placeholder="Question"
            value={question.content}
            onChange={(e) => updateQuestion(test, setTest, qIndex, 'content', e.target.value)}
          />
          {question.options && question.options.map((option, oIndex) => (
            <div key={oIndex}>
              <input
                type="text"
                placeholder="Option"
                value={option.content}
                onChange={(e) => updateOption(test, setTest, qIndex, oIndex, 'content', e.target.value)}
              />
              <input
                type="checkbox"
                checked={option.is_correct}
                onChange={(e) => updateOption(test, setTest, qIndex, oIndex, 'is_correct', e.target.checked)}
              /> Correct
            </div>
          ))}
          <button onClick={() => addOption(test, setTest, qIndex)}>Add Option</button>
        </div>
      ))}
      <button onClick={() => addQuestion(test, setTest)}>Add Question</button>
      <button onClick={isEditing ? handleUpdateTest : handleCreateTest}>
        {isEditing ? 'Save Changes' : 'Create Test'}
      </button>
      {isEditing && <button onClick={() => setEditingTest(null)}>Cancel</button>}
    </div>
  );

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>
      
      <h3>Create New Test</h3>
      {renderTestForm(newTest, setNewTest)}

      <h3>Existing Tests</h3>
      {tests.map(test => (
        <div key={test.id}>
          <h4>{test.title}</h4>
          <button onClick={() => setEditingTest(test)}>Edit</button>
          <button onClick={() => handleDeleteTest(test.id)}>Delete</button>
        </div>
      ))}

      {editingTest && (
        <div>
          <h3>Edit Test: {editingTest.title}</h3>
          {renderTestForm(editingTest, setEditingTest, true)}
        </div>
      )}
    </div>
  );
}

export default AdminPanel;