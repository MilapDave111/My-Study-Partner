import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MissedTasks = () => {
  const userId = localStorage.getItem('userId');
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/todos/missed/${userId}`)
      .then((res) => setTasks(res.data))
      .catch(() => alert('Failed to load missed tasks'));
  }, []);

  return (
    <div className="p-6 bg-gray-50">
      <h3 className="text-xl font-semibold text-indigo-700 mb-4">⏰ Missed Tasks</h3>
      {tasks.length === 0 ? (
        <p className="text-gray-500">No missed tasks.</p>
      ) : (
        tasks.map(task => (
          <div key={task.id} className="bg-white shadow-md rounded-lg p-4 mb-4 border-l-4 border-red-500">
            <h4 className="text-lg font-bold text-red-600">{task.task}</h4>
            <p className="text-gray-600">📚 Topic: <span className="font-semibold">{task.topic_title}</span></p>
            <p className="text-gray-500">❗ Due: {task.due_date}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default MissedTasks;
