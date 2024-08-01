import React from 'react';

function Result({ result, onFinish }) {
  return (
    <div className="result">
      <h3>Test Results:</h3>
      <p>Correct Answers: {result.correct_answers}</p>
      <p>Total Questions: {result.total_questions}</p>
      <p>Experience Gained: {result.experience_gained}</p>
      <p>Current Experience: {result.current_experience}</p>
      <p>Current Level: {result.current_level}</p>
      {result.new_achievements && result.new_achievements.length > 0 && (
        <div>
          <h4>New Achievements:</h4>
          <ul>
            {result.new_achievements.map((achievement, index) => (
              <li key={index} className="achievement">{achievement}</li>
            ))}
          </ul>
        </div>
      )}
      <button onClick={onFinish}>Back to Test List</button>
    </div>
  );
}

export default Result;
