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

  return (
    <div className="profile">
      <h2>User Profile</h2>
      <p>Username: {profile.username}</p>
      <p>Level: {profile.level}</p>
      <p>Experience: {profile.experience}/500</p>
      <p>Tests Completed: {profile.tests_completed}</p>
      <p>Correct Answers: {profile.correct_answers}</p>
      <p>Total Answers: {profile.total_answers}</p>
      <p>Accuracy: {profile.accuracy.toFixed(2)}%</p>
    </div>
  );
}

export default Profile;