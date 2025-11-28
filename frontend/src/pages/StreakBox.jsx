import React, { useEffect, useState } from 'react';
import axios from 'axios';

const StreakBox = () => {
  const userId = localStorage.getItem('userId');
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    axios.get(`https://my-study-partner.onrender.com/api/todos/streak/${userId}`)
      .then((res) => setStreak(res.data.streak))
      .catch(() => alert('Failed to fetch streak'));
  }, []);

  return (
    <div className="bg-orange-100 border border-orange-300 rounded-xl px-6 py-4 mb-4 shadow text-center">
      <h3 className="text-lg font-bold text-orange-700">🔥 Current Streak</h3>
      <p className="text-3xl font-bold text-orange-900">{streak} day(s)</p>
    </div>
  );
};

export default StreakBox;
