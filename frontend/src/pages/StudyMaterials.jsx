import React, { useEffect, useState } from 'react';
import axios from 'axios';

const StudyMaterials = () => {
  const userId = parseInt(localStorage.getItem('userId'));
  const [materials, setMaterials] = useState([]);
  const [topics, setTopics] = useState([]);
  const [form, setForm] = useState({
    title: '',
    topic_id: '',
    file_type: 'pdf',
    description: '',
    file: null,
  });

  const fetchTopics = async () => {
    const res = await axios.get(`http://localhost:5000/api/topics/${userId}`);
    setTopics(res.data);
  };

  const fetchMaterials = async () => {
    const res = await axios.get(`http://localhost:5000/api/materials/${userId}`);
    setMaterials(res.data);
  };

  useEffect(() => {
    fetchTopics();
    fetchMaterials();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({ ...form, [name]: files ? files[0] : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, topic_id, file_type, description, file } = form;
    if (!title || !topic_id || !file) return alert('All fields are required');

    const data = new FormData();
    data.append('user_id', userId);
    data.append('title', title);
    data.append('topic_id', topic_id);
    data.append('file_type', file_type);
    data.append('description', description);
    data.append('file', file);

    try {
      await axios.post('http://localhost:5000/api/materials', data);
      setForm({ title: '', topic_id: '', file_type: 'pdf', description: '', file: null });
      fetchMaterials();
    } catch (err) {
      alert('Failed to upload material');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this material?')) return;
    await axios.delete(`http://localhost:5000/api/materials/${id}`);
    fetchMaterials();
  };

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">📂 Upload Study Material</h2>
        <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
          <input type="text" name="title" placeholder="Title" value={form.title}
            onChange={handleChange} required className="w-full border px-4 py-2 rounded" />
          <select name="topic_id" value={form.topic_id} onChange={handleChange} required className="w-full border px-4 py-2 rounded">
            <option value="">-- Select Topic --</option>
            {topics.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
          <select name="file_type" value={form.file_type} onChange={handleChange} className="w-full border px-4 py-2 rounded">
            <option value="pdf">PDF</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="link">Link</option>
          </select>
          <input type="file" name="file" accept=".pdf,.jpg,.jpeg,.png,.mp4"
            onChange={handleChange} required className="w-full" />
          <textarea name="description" placeholder="Description" value={form.description}
            onChange={handleChange} className="w-full border px-4 py-2 rounded" />
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Upload</button>
        </form>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-bold mb-4">📘 Uploaded Files</h3>
        {materials.map((m) => (
          <div key={m.id} className="border rounded-lg p-4 mb-4 bg-gray-50 shadow-sm">
            <p className="font-bold">{m.title} <span className="text-sm text-gray-500">({m.file_type})</span></p>
            <p className="text-gray-600">Topic: <i>{m.topic_title}</i></p>
            {m.description && <p className="text-sm mt-2">{m.description}</p>}
            <a href={m.file_link} target="_blank" rel="noreferrer" className="text-blue-600 underline block mt-2">View File</a>
            <button onClick={() => handleDelete(m.id)} className="mt-2 text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudyMaterials;
