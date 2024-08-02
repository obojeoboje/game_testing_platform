import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaStar, FaTrophy, FaCheckCircle } from 'react-icons/fa';
import '../../styles/pages/Profile.css';

function Profile({ token }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5000/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(response.data);
      } catch (error) {
        console.error('An error occurred:', error);
      }
    };

    fetchProfile();
  }, [token]);

  if (!profile) return <div className="loading">Loading profile...</div>;

  const experiencePercentage = (profile.experience / 500) * 100;

  return (
    <div className="profile">
      <h2>Профиль пользователя</h2>
      <div className="profile-card">
        <div className="profile-header">
          <h3>{profile.username}</h3>
          <div className="level">
            <FaStar className="level-icon" />
            <span>Уровень {profile.level}</span>
          </div>
        </div>
        <div className="experience-bar">
          <div className="experience-progress" style={{ width: `${experiencePercentage}%` }}></div>
          <span className="experience-text">{profile.experience}/500 XP</span>
        </div>
        <div className="profile-stats">
          <div className="stat">
            <FaTrophy className="stat-icon" />
            <span>Тестов пройдено: {profile.tests_completed}</span>
          </div>
          <div className="stat">
            <FaCheckCircle className="stat-icon" />
            <span>Точность: {profile.accuracy.toFixed(2)}%</span>
          </div>
        </div>
        <div className="achievements">
          <h4>Достижения</h4>
          <ul>
            {profile.achievements.map((achievement, index) => (
              <li key={index}>{achievement}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Profile;