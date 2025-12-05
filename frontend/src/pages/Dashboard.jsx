// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import TodoPage from './TodoPage';
import TopicPage from './TopicPage';
import PerformanceGraph from './Performance';
import StudyMaterials from './StudyMaterials';
import OverviewCard from './OverviewCard';
import { useNavigate } from 'react-router-dom';
import SubjectAnalytics from './SubjectAnalytics';




const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) navigate('/login');
  }, [navigate]);
  
  const handleLogout = () => {
    localStorage.removeItem("token");    
    localStorage.removeItem("userId");    
    window.location.href = "/login";   
  };
  
  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'topics', label: 'Topics' },
    { key: 'todos', label: 'Todos' },
    { key: 'graph', label: 'Accuracy Graph' },
    { key: 'materials', label: 'Study Materials' },
    { key: 'analytics', label: 'Subject-Wise Analytics' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">📚 Study Partner Dashboard</h1>

      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2 rounded-full font-medium transition-all duration-200 
              ${activeTab === tab.key
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white border border-indigo-300 text-indigo-600 hover:bg-indigo-50'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white shadow-md rounded-lg p-4">
        {activeTab === 'overview' && <OverviewCard />}
        {activeTab === 'topics' && <TopicPage />}
        {activeTab === 'todos' && <TodoPage />}
        {activeTab === 'graph' && <PerformanceGraph />}
        {activeTab === 'materials' && <StudyMaterials />}
        {activeTab === 'analytics' && <SubjectAnalytics />}



      </div>
      <button
        onClick={handleLogout}
        className="bg-indigo-600 text-white shadow-md"
      >
        Logout
      </button>

    </div>
  );
};

export default Dashboard;
