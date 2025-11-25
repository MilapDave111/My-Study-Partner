import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import TodoPage from './pages/TodoPage';
import NotesPage from './pages/NotesPage';
import TopicPage from './pages/TopicPage';
import StudyMaterials from './pages/StudyMaterials';
import Dashboard from './pages/Dashboard'
import PerformanceGraph from './pages/Performance';
import OverviewCard from './pages/OverviewCard';



const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/todos" element={<TodoPage />} />
         <Route path="/notes" element={<NotesPage/>} />
         <Route path="/topics" element={<TopicPage />} />
         <Route path="/materials" element={<StudyMaterials />} />
         <Route path="/" element={<Dashboard />} />
         <Route path="/dashboard" element={<PerformanceGraph />} />
         <Route path="/overviewcard" element={<OverviewCard />} />



      </Routes>
    </Router>
  );
};

export default App;
