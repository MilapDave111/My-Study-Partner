import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

const PerformanceGraph = () => {
  const userId = localStorage.getItem('userId');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // 📊 Fetch graph data
  const fetchGraphData = async () => {
    try {
      const res = await axios.get(`https://my-study-partner.onrender.com/api/todos/performance/${userId}`);
      setData(res.data);
    } catch (err) {
      alert('Failed to load graph data');
    }
  };

  // 🔁 Calibrate accuracy (insert/update today's accuracy)
  const handleCalibrate = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`https://my-study-partner.onrender.com/api/todos/calculate/${userId}`);
      setLastUpdated(new Date().toLocaleString());
      alert(`✅ Accuracy updated: ${res.data.accuracy}%`);
      fetchGraphData(); // Refresh graph
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to calculate accuracy');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-700">📈 Accuracy Over Time</h2>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">🔄 Last updated: {lastUpdated}</p>
          )}
        </div>
        <button
          onClick={handleCalibrate}
          disabled={loading}
          className={`px-4 py-2 rounded text-white text-sm font-semibold ${
            loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {loading ? 'Calibrating...' : '🔁 Calibrate Accuracy'}
        </button>
      </div>

      {data.length === 0 ? (
        <p className="text-gray-500 text-sm">No performance data available yet.</p>
      ) : (
        <LineChart width={700} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="accuracy" stroke="#6366f1" activeDot={{ r: 6 }} />
        </LineChart>
      )}
    </div>
  );
};

export default PerformanceGraph;
