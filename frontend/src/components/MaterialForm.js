import React, { useState, useEffect } from 'react';
import './MaterialForm.css';

function MaterialForm({ token, material, onSave, onCancel }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState('');

  useEffect(() => {
    if (material) {
      setTitle(material.title);
      setContent(material.content);
      setTopic(material.topic);
    } else {
      setTitle('');
      setContent('');
      setTopic('');
    }
  }, [material]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ title, content, topic });
  };

  return (
    <form className="material-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Заголовок"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Тема"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        required
      />
      <textarea
        placeholder="Содержание (Markdown)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />
      <div className="form-actions">
        <button type="submit">{material ? 'Обновить' : 'Создать'} материал</button>
        {material && <button type="button" onClick={onCancel}>Отмена</button>}
      </div>
    </form>
  );
}

export default MaterialForm;