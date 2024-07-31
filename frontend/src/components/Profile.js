import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

  if (!profile) return <div>Loading profile...</div>;

  const experiencePercentage = (profile.experience / 500) * 100;

const getAccuracyColor = (accuracy) => {
  if (accuracy >= 80) return '#4caf50';  // зеленый
  if (accuracy >= 60) return '#ffc107';  // желтый
  return '#f44336';  // красный
};

  return (
    <div className="profile">
      <h2>User Profile</h2>
      <p>Username: {profile.username}</p>
      <p>Level: <span className="level">{profile.level}</span></p>
      <div className="experience-bar">
        <div className="experience-progress" style={{ width: `${experiencePercentage}%` }}></div>
        <span className="experience-text">Experience: {profile.experience}/500</span>
      </div>
      <p>Tests Completed: {profile.tests_completed}</p>
      <p>Correct Answers: {profile.correct_answers}</p>
      <p>Total Answers: {profile.total_answers}</p>
      <p>Accuracy: <span style={{ color: getAccuracyColor(profile.accuracy) }}>{profile.accuracy.toFixed(2)}%</span></p>
    </div>
  );
}

export default Profile;