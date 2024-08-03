import React, { useState, useEffect } from 'react';
import { getMaterials, getTopics } from '../../utils/api';
import closeIcon from '../../icons/Close_MD.svg';
import '../../styles/pages/MaterialsList.css';

function MaterialsList({ token }) {
  const [materials, setMaterials] = useState([]);
  const [topics, setTopics] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  useEffect(() => {
    fetchMaterials();
    fetchTopics();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await getMaterials(search, selectedTopic);
      setMaterials(response.data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const fetchTopics = async () => {
    try {
      const response = await getTopics();
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

  const handleMaterialSelect = (material) => {
    setSelectedMaterial(material);
  };

  return (
    <div className="materials-list">
      <h2>Учебные материалы</h2>
      <form onSubmit={handleSubmit} className="materials-search">
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
      <div className="materials-grid">
        {materials.map(material => (
          <div 
            key={material.id} 
            className="material-card"
            onClick={() => handleMaterialSelect(material)}
          >
            {material.cover_image && (
              <img src={material.cover_image} alt={material.title} className="material-cover" />
            )}
            <h3>{material.title}</h3>
            <p className="material-topic">Тема: {material.topic}</p>
          </div>
        ))}
      </div>
      {selectedMaterial && (
        <div className="modal" onClick={() => setSelectedMaterial(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="close-button" 
              onClick={() => setSelectedMaterial(null)}
            >
              <img src={closeIcon} alt="Close" />
            </button>
            {selectedMaterial.cover_image && (
              <img src={selectedMaterial.cover_image} alt={selectedMaterial.title} className="material-cover-large" />
            )}
            <h2>{selectedMaterial.title}</h2>
            <p className="material-topic">Тема: {selectedMaterial.topic}</p>
            <div dangerouslySetInnerHTML={{ __html: selectedMaterial.content }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default MaterialsList;