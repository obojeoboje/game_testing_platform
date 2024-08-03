import React, { useState, useEffect } from 'react';
import './TestModal.css';

function TestModal({ test, onSave, onClose }) {
  const [testData, setTestData] = useState(null);

  useEffect(() => {
    if (test) {
      console.log('Initializing test data:', JSON.stringify(test, null, 2));
      setTestData(test);
    } else {
      setTestData({ title: '', difficulty: '', image_url: '', questions: [] });
    }
  }, [test]);

  const updateOption = (questionIndex, optionIndex, field, value) => {
    setTestData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData)); // Глубокое клонирование
      if (field === 'is_correct') {
        newData.questions[questionIndex].options.forEach((opt, idx) => {
          opt.is_correct = idx === optionIndex ? value : false;
        });
      } else {
        newData.questions[questionIndex].options[optionIndex][field] = value;
      }
      console.log('Updated test data:', newData); // Отладочный вывод
      return newData;
    });
  };

  const addQuestion = () => {
    setTestData(prevData => ({
      ...prevData,
      questions: [...prevData.questions, { content: '', options: [] }]
    }));
  };

  const updateQuestion = (index, field, value) => {
    setTestData(prevData => {
      const newData = { ...prevData };
      newData.questions[index][field] = value;
      return newData;
    });
  };

  const addOption = (questionIndex) => {
    setTestData(prevData => {
      const newData = { ...prevData };
      newData.questions[questionIndex].options.push({ content: '', is_correct: false });
      return newData;
    });
  };

  const removeQuestion = (index) => {
    setTestData(prevData => ({
      ...prevData,
      questions: prevData.questions.filter((_, i) => i !== index)
    }));
  };

  const removeOption = (questionIndex, optionIndex) => {
    setTestData(prevData => {
      const newData = { ...prevData };
      newData.questions[questionIndex].options = newData.questions[questionIndex].options.filter((_, i) => i !== optionIndex);
      return newData;
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTestData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  if (!testData) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{test ? 'Редактировать тест' : 'Создать новый тест'}</h2>
        <input
          type="text"
          name="title"
          className="test-title-input"
          value={testData.title}
          onChange={handleChange}
          placeholder="Название теста"
        />
        <select
          name="difficulty"
          value={testData.difficulty}
          onChange={handleChange}
          className="test-difficulty-select"
        >
          <option value="">Выберите сложность</option>
          <option value="Junior">Junior</option>
          <option value="Middle">Middle</option>
          <option value="Senior">Senior</option>
        </select>
        <input
          type="url"
          name="image_url"
          className="test-image-input"
          value={testData.image_url}
          onChange={handleChange}
          placeholder="URL изображения теста"
        />
        {testData.questions.map((question, qIndex) => (
          <div key={qIndex} className="question-block">
            <input
              type="text"
              className="question-input"
              value={question.content}
              onChange={(e) => updateQuestion(qIndex, 'content', e.target.value)}
              placeholder="Вопрос"
            />
            <button className="remove-btn" onClick={() => removeQuestion(qIndex)}>Удалить вопрос</button>
            {question.options.map((option, oIndex) => (
              <div key={oIndex} className="option-block">
                <input
                  type="text"
                  className="option-input"
                  value={option.content}
                  onChange={(e) => updateOption(qIndex, oIndex, 'content', e.target.value)}
                  placeholder="Вариант ответа"
                />
                <label>
                  <input
                    type="checkbox"
                    checked={option.is_correct === true}
                    onChange={(e) => updateOption(qIndex, oIndex, 'is_correct', e.target.checked)}
                  />
                  Правильный
                </label>
                <button className="remove-btn" onClick={() => removeOption(qIndex, oIndex)}>Удалить</button>
              </div>
            ))}
            <button className="add-btn" onClick={() => addOption(qIndex)}>Добавить вариант</button>
          </div>
        ))}
        <button className="add-btn" onClick={addQuestion}>Добавить вопрос</button>
        <div className="modal-actions">
          <button className="save-btn" onClick={() => onSave(testData)}>Сохранить</button>
          <button className="cancel-btn" onClick={onClose}>Отмена</button>
        </div>
      </div>
    </div>
  );
}

export default TestModal;