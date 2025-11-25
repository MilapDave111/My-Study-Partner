import React, { useEffect, useState } from 'react';
import axios from 'axios';

const OverviewCard = () => {
  const [stats, setStats] = useState({
    totalTodos: 0,
    completedTodos: 0,
    missedTodos: 0,
    streak: 0,
  });

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [todoRes, missedRes, streakRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/todos/${userId}`),
          axios.get(`http://localhost:5000/api/todos/missed/${userId}`),
          axios.get(`http://localhost:5000/api/todos/streak/${userId}`)
        ]);

        const todos = todoRes.data;
        const completed = todos.filter(t => t.completed).length;

        setStats({
          totalTodos: todos.length,
          completedTodos: completed,
          missedTodos: missedRes.data.length,
          streak: streakRes.data.streak || 0,
        });
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      }
    };

    fetchData();
  }, [userId]);

  const cardStyle = "p-6 rounded-2xl shadow text-center text-gray-800";
  const label = "text-xl font-semibold mb-2";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className={`${cardStyle} bg-blue-100`}>
        <div className={label}>📌 Total Tasks</div>
        <div className="text-4xl font-bold">{stats.totalTodos}</div>
      </div>
      <div className={`${cardStyle} bg-green-100`}>
        <div className={label}>✅ Completed</div>
        <div className="text-4xl font-bold">{stats.completedTodos}</div>
      </div>
      <div className={`${cardStyle} bg-red-100`}>
        <div className={label}>⏰ Missed</div>
        <div className="text-4xl font-bold">{stats.missedTodos}</div>
      </div>
      <div className={`${cardStyle} bg-yellow-100`}>
        <div className={label}>🔥 Streak</div>
        <div className="text-4xl font-bold">{stats.streak} days</div>
      </div>
    </div>
  );
};

export default OverviewCard;
