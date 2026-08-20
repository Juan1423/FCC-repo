import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ChatbotDashboard from './ChatbotDashboard';
import AdminView from './views/AdminView';
import HistorialUnificado from './components/HistorialUnificado';

const ChatbotRoutes = () => {
  return (
    <Routes>
      <Route index element={<ChatbotDashboard />} />
      <Route path="admin" element={<AdminView />} />
      <Route path="historial" element={<HistorialUnificado />} />
    </Routes>
  );
};

export default ChatbotRoutes;
