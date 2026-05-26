import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DocumentacionDashboard from './views/DocumentacionDashboard';

const DocumentacionModule = () => (
  <Routes>
    <Route path="/" element={<DocumentacionDashboard />} />
  </Routes>
);

export default DocumentacionModule;
