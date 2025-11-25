import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TopicPage = () => {
  const userId = parseInt(localStorage.getItem('userId'));
  const [topics, setTopics] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(0);
  const [subjectId, setSubjectId] = useState('');

  const fetchTopics = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/topics/${userId}`);
      setTopics(res.data);
    } catch {
      alert('Failed to fetch topics');
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/subjects/user/${userId}`);
      setSubjects(res.data);
    } catch {
      alert('Failed to fetch subjects');
    }
  };

  useEffect(() => {
    fetchTopics();
    fetchSubjects();
  }, []);

  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!title || rating < 0 || rating > 5) {
      return alert('Please enter a valid title and rating (0–5)');
    }

    try {
      await axios.post(`http://localhost:5000/api/topics`, {
        user_id: userId,
        subject_id: subjectId || null,
        title,
        description,
        rating: parseInt(rating),
      });
      setTitle('');
      setDescription('');
      setRating(0);
      setSubjectId('');
      fetchTopics();
    } catch {
      alert('Failed to add topic');
    }
  };

  const handleUpdateRating = async (id, newRating) => {
    if (newRating < 0 || newRating > 5) return alert('Rating must be between 0 and 5');
    try {
      await axios.put(`http://localhost:5000/api/topics/${id}`, {
        rating: parseInt(newRating),
      });
      fetchTopics();
    } catch {
      alert('Failed to update rating');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this topic?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/topics/${id}`);
      fetchTopics();
    } catch {
      alert('Failed to delete topic');
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">📚 My Topics</h2>

      <form onSubmit={handleAddTopic} className="space-y-4 mb-6 bg-white p-6 rounded shadow">
        <input
          type="text"
          placeholder="Topic Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full border px-4 py-2 rounded"
        />
        <textarea
          placeholder="Short Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border px-4 py-2 rounded"
        />
        <input
          type="number"
          placeholder="Rating (0–5)"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          min="0"
          max="5"
          required
          className="w-full border px-4 py-2 rounded"
        />

        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="w-full border px-4 py-2 rounded"
        >
          <option value="">-- Select Subject (Optional) --</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>

        <button type="submit" className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700">
          ➕ Add Topic
        </button>
      </form>

      {topics.length === 0 ? (
        <p className="text-center text-gray-500">No topics yet.</p>
      ) : (
        topics.map((topic) => (
          <div
            key={topic.id}
            className="bg-gray-50 border border-gray-200 p-4 rounded shadow mb-4"
          >
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-semibold text-gray-800">{topic.title}</h4>
              <span className="text-yellow-600 font-semibold">⭐ {topic.rating}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
            {topic.subject_name && (
              <p className="text-xs text-gray-500 mt-1">📘 Subject: {topic.subject_name}</p>
            )}
            <div className="mt-3 space-y-2 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
              <div>
                <label className="text-sm mr-2 text-gray-700">Update Rating:</label>
                <input
                  type="number"
                  value={topic.rating}
                  min="0"
                  max="5"
                  onChange={(e) => handleUpdateRating(topic.id, e.target.value)}
                  className="w-20 border px-2 py-1 rounded"
                />
              </div>
              <button
                onClick={() => handleDelete(topic.id)}
                className="mt-2 sm:mt-0 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
              >
                Delete Topic
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default TopicPage;
