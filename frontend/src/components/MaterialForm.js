import React, { useState, useEffect } from 'react';
import './MaterialForm.css';

function MaterialForm({ token, material, onSave, onCancel }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState('');
  const [coverImage, setCoverImage] = useState('');

  useEffect(() => {
    if (material) {
      setTitle(material.title);
      setContent(material.content);
      setTopic(material.topic);
      setCoverImage(material.cover_image || '');
    } else {
      setTitle('');
      setContent('');
      setTopic('');
      setCoverImage('');
    }
  }, [material]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ title, content, topic, cover_image: coverImage });
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
      <input
        type="url"
        placeholder="URL обложки (необязательно)"
        value={coverImage}
        onChange={(e) => setCoverImage(e.target.value)}
      />
      <textarea
        placeholder="Содержание (Markdown)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />
      <div className="form-preview">
        <h4>Предпросмотр обложки:</h4>
        {coverImage && (
          <img src={coverImage} alt="Предпросмотр обложки" className="cover-preview" />
        )}
      </div>
      <div className="form-actions">
        <button type="submit">{material ? 'Обновить' : 'Создать'} материал</button>
        {material && <button type="button" onClick={onCancel}>Отмена</button>}
      </div>
    </form>
  );
}

export default MaterialForm;