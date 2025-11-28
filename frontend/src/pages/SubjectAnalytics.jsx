import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SubjectAnalytics = () => {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectName, setSubjectName] = useState('');
  const [refresh, setRefresh] = useState(false);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`https://my-study-partner.onrender.com/api/subjects/analytics/${userId}`);
        setAnalytics(res.data);
      } catch (err) {
        console.error("Error fetching subject analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [userId, refresh]);

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!subjectName.trim()) return;
    try {
      await axios.post('https://my-study-partner.onrender.com/api/subjects/add', {
        user_id: userId,
        name: subjectName
      });
      setSubjectName('');
      setRefresh(!refresh);
    } catch (err) {
      alert('Failed to add subject');
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6 text-indigo-600 text-center">📊 Subject-Wise Analytics</h2>

      {/* Add subject form */}
      <form onSubmit={handleAddSubject} className="mb-6 flex flex-col md:flex-row gap-2 items-center justify-center">
        <input
          type="text"
          placeholder="Enter new subject name"
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
          className="px-4 py-2 rounded-lg border w-full md:w-1/3 shadow-sm"
          required
        />
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
          ➕ Add Subject
        </button>
      </form>

      {loading ? (
        <p className="text-center text-gray-500">Loading analytics...</p>
      ) : analytics.length === 0 ? (
        <p className="text-center text-red-500">No subject data found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {analytics.map((subject) => (
            <div key={subject.subject_id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all">
              <h3 className="text-xl font-semibold text-indigo-700 mb-2">{subject.subject_name}</h3>
              <ul className="space-y-1 text-gray-700 text-sm">
                <li><span className="font-semibold">📘 Total Topics:</span> {subject.total_topics}</li>
                <li><span className="font-semibold">✅ Completed Tasks:</span> {subject.completed_todos}</li>
                <li><span className="font-semibold">📈 Avg. Accuracy:</span> {subject.avg_accuracy ?? 0}%</li>
                <li><span className="font-semibold">⭐ Avg. Rating:</span> {subject.avg_rating ?? 0}/5</li>
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubjectAnalytics;
