import React, { useState } from 'react';
import axios from 'axios';
import './MaterialForm.css';

function MaterialForm({ token, material = null, onSave }) {
  const [title, setTitle] = useState(material ? material.title : '');
  const [content, setContent] = useState(material ? material.content : '');
  const [topic, setTopic] = useState(material ? material.topic : '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (material) {
        await axios.put(`http://localhost:5000/materials/${material.id}`, 
          { title, content, topic },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post('http://localhost:5000/materials', 
          { title, content, topic },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      onSave();
    } catch (error) {
      console.error('Error saving material:', error);
    }
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
      <button type="submit">{material ? 'Обновить' : 'Создать'} материал</button>
    </form>
  );
}

export default MaterialForm;