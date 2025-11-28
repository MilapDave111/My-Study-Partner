import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TodoPage = () => {
  const [todos, setTodos] = useState([]);
  const [topics, setTopics] = useState([]);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [topicId, setTopicId] = useState('');
  const [filter, setFilter] = useState('today');
  const userId = parseInt(localStorage.getItem('userId'));

  // Use Render URL
  const API_URL = 'https://my-study-partner.onrender.com/api';

  useEffect(() => {
    fetchTodos();
    fetchTopics();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await axios.get(`${API_URL}/todos/${userId}`);
      setTodos(res.data);
    } catch (err) {
      alert('Error fetching todos');
    }
  };

  const fetchTopics = async () => {
    try {
      const res = await axios.get(`${API_URL}/topics/${userId}`);
      setTopics(res.data);
    } catch (err) {
      console.error('Error fetching topics');
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title || !dueDate) return alert('Enter title and date');

    try {
      await axios.post(`${API_URL}/todos`, {
        user_id: userId,
        topic_id: topicId || null, 
        title,
        due_date: dueDate,
      });
      setTitle('');
      setDueDate('');
      setTopicId('');
      fetchTodos();
    } catch {
      alert('Error adding task');
    }
  };

  const toggleComplete = async (id, current) => {
    try {
      await axios.put(`${API_URL}/todos/complete/${id}`, {
        completed: !current,
      });
      fetchTodos();
    } catch {
      alert('Error toggling completion');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/todos/${id}`);
      fetchTodos();
    } catch {
      alert('Error deleting task');
    }
  };

  // ✅ FIX: Safely handle date strings without shifting timezones
  const toDateOnly = (dateStr) => {
    if (!dateStr) return '';
    // If it's already a string like "2025-11-28", return it directly
    if (typeof dateStr === 'string') {
        return dateStr.substring(0, 10);
    }
    // Fallback for date objects
    return new Date(dateStr).toISOString().substring(0, 10);
  };

  // ✅ FIX: Get "Today" based on Local Device Time (India), not Server UTC
  const getToday = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const filterTasks = () => {
    const today = getToday();
    return todos.filter(todo => {
      const due = toDateOnly(todo.due_date);
      if (filter === 'today') return due === today;
      if (filter === 'pending') return !todo.completed && due === today;
      if (filter === 'completed') return todo.completed;
      if (filter === 'missed') return !todo.completed && due < today;
      if (filter === 'upcoming') return !todo.completed && due > today;
      return true;
    });
  };

  const formatDate = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <h2 className="text-2xl font-bold text-blue-700 mb-4">📋 My To-Do Tasks</h2>

      {/* Add */}
      <form onSubmit={handleAdd} className="flex flex-col gap-3 mb-6">
        <input
          type="text"
          placeholder="Enter Task"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="px-4 py-2 border rounded w-full"
        />

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="px-4 py-2 border rounded w-full"
        />

        {/* ✅ Topic dropdown */}
        <select
          value={topicId}
          onChange={(e) => setTopicId(e.target.value)}
          className="px-4 py-2 border rounded w-full"
        >
          <option value="">-- Optional: Link Topic --</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          ➕ Add Task
        </button>
      </form>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['today', 'pending', 'missed', 'upcoming', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Task list */}
      <ul className="space-y-4">
        {filterTasks().map((todo) => (
          <li
            key={todo.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded shadow"
          >
            <div>
              <p className={`text-lg font-medium ${todo.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                {todo.title}
              </p>
              {todo.topic_title && (
                <p className="text-sm text-indigo-500">📌 Topic: {todo.topic_title}</p>
              )}
              <small className="text-sm text-gray-500">📅 Due: {formatDate(todo.due_date)}</small>
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <button
                onClick={() => toggleComplete(todo.id, todo.completed)}
                className={`px-3 py-1 text-white rounded text-sm ${
                  todo.completed ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
              >
                {todo.completed ? 'Undo' : 'Done'}
              </button>
              <button
                onClick={() => handleDelete(todo.id)}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoPage;