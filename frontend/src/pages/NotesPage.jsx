import React, { useEffect, useState } from 'react';
import axios from 'axios';

const NotesPage = () => {
  const userId = parseInt(localStorage.getItem('userId'));
  const [topics, setTopics] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [content, setContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);

  const fetchTopics = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/topics/${userId}`);
      setTopics(res.data);
    } catch {
      console.error('Failed to load topics');
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/notes/${userId}`);
      setNotes(res.data);
    } catch {
      console.error('Failed to load notes');
    }
  };

  useEffect(() => {
    fetchTopics();
    fetchNotes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTopic || !content) return alert('All fields are required');

    try {
      if (editingNoteId) {
        await axios.put(`http://localhost:5000/api/notes/${editingNoteId}`, { content });
      } else {
        await axios.post(`http://localhost:5000/api/notes`, {
          user_id: userId,
          topic_id: selectedTopic,
          content,
        });
      }
      setSelectedTopic('');
      setContent('');
      setEditingNoteId(null);
      fetchNotes();
    } catch {
      alert('Error saving note');
    }
  };

  const handleEdit = (note) => {
    setSelectedTopic(note.topic_id);
    setContent(note.content);
    setEditingNoteId(note.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/notes/${id}`);
      fetchNotes();
    } catch {
      alert('Error deleting note');
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-indigo-700 mb-6">📝 Notes</h2>

      <form onSubmit={handleSubmit} className="mb-6 bg-white p-6 shadow-md rounded-lg">
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          required
          className="w-full mb-4 p-3 border border-gray-300 rounded focus:ring-indigo-500"
        >
          <option value="">-- Select Topic --</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>

        <textarea
          placeholder="Write your note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full mb-4 p-3 border border-gray-300 rounded focus:ring-indigo-500"
          required
        />

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-all"
        >
          {editingNoteId ? 'Update Note' : 'Add Note'}
        </button>
      </form>

      <h3 className="text-xl font-semibold text-indigo-600 mb-4">My Notes</h3>
      {notes.map((note) => (
        <div key={note.id} className="bg-white shadow-md rounded-lg p-4 mb-4">
          <p className="text-indigo-700 font-medium">📚 Topic: {note.topic_title}</p>
          <p className="text-gray-700 mt-2">{note.content}</p>
          <div className="mt-4 flex gap-2">
            <button onClick={() => handleEdit(note)} className="text-sm text-white bg-violet-500 px-3 py-1 rounded hover:bg-violet-600">
              Edit
            </button>
            <button onClick={() => handleDelete(note.id)} className="text-sm text-white bg-red-500 px-3 py-1 rounded hover:bg-red-600">
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotesPage;
