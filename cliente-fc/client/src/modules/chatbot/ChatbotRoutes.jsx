import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ChatbotLayout from './components/ChatbotLayout';
import ChatbotDashboard from './ChatbotDashboard';
import AdminView from './views/AdminView';
import HistorialUnificado from './components/HistorialUnificado';

const ChatbotRoutes = () => {
  return (
    <ChatbotLayout>
      <Routes>
        <Route index element={<ChatbotDashboard />} />
        <Route path="admin" element={<AdminView />} />
        <Route path="historial" element={<HistorialUnificado />} />
      </Routes>
    </ChatbotLayout>
  );
};

export default ChatbotRoutes;
