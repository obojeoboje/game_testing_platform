import React, { useState, useEffect } from 'react';
import './TestModal.css';

function TestModal({ test, onSave, onClose }) {
  const [testData, setTestData] = useState(test || { title: '', questions: [] });

  useEffect(() => {
    if (test) {
      setTestData(test);
    }
  }, [test]);

  const addQuestion = () => {
    setTestData({
      ...testData,
      questions: [...testData.questions, { content: '', options: [] }]
    });
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...testData.questions];
    updatedQuestions[index][field] = value;
    setTestData({ ...testData, questions: updatedQuestions });
  };

  const addOption = (questionIndex) => {
    const updatedQuestions = [...testData.questions];
    updatedQuestions[questionIndex].options.push({ content: '', is_correct: false });
    setTestData({ ...testData, questions: updatedQuestions });
  };

  const updateOption = (questionIndex, optionIndex, field, value) => {
    const updatedQuestions = [...testData.questions];
    updatedQuestions[questionIndex].options[optionIndex][field] = value;
    setTestData({ ...testData, questions: updatedQuestions });
  };

  const removeQuestion = (index) => {
    const updatedQuestions = testData.questions.filter((_, i) => i !== index);
    setTestData({ ...testData, questions: updatedQuestions });
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...testData.questions];
    updatedQuestions[questionIndex].options = updatedQuestions[questionIndex].options.filter((_, i) => i !== optionIndex);
    setTestData({ ...testData, questions: updatedQuestions });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{test ? 'Редактировать тест' : 'Создать новый тест'}</h2>
        <input
          type="text"
          className="test-title-input"
          value={testData.title}
          onChange={(e) => setTestData({ ...testData, title: e.target.value })}
          placeholder="Название теста"
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
                    checked={option.is_correct}
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