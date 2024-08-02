import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MaterialsList.css';

function MaterialsList({ token }) {
  const [materials, setMaterials] = useState([]);
  const [topics, setTopics] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');

  useEffect(() => {
    fetchMaterials();
    fetchTopics();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/materials?search=${search}&topic=${selectedTopic}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMaterials(response.data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const fetchTopics = async () => {
    try {
      const response = await axios.get('http://localhost:5000/materials/topics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTopics(response.data);
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleTopicChange = (e) => {
    setSelectedTopic(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchMaterials();
  };

  return (
    <div className="materials-list">
      <h2>Учебные материалы</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Поиск материалов..."
          value={search}
          onChange={handleSearch}
        />
        <select value={selectedTopic} onChange={handleTopicChange}>
          <option value="">Все темы</option>
          {topics.map(topic => (
            <option key={topic} value={topic}>{topic}</option>
          ))}
        </select>
        <button type="submit">Поиск</button>
      </form>
      <div className="materials">
        {materials.map(material => (
          <div key={material.id} className="material-card">
            <h3>{material.title}</h3>
            <p>Тема: {material.topic}</p>
            <div dangerouslySetInnerHTML={{ __html: material.content }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default MaterialsList;