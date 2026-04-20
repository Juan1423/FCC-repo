import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProcesoDashboard from './views/ProcesoDashboard';

const ProcesoModule = () => (
  <Routes>
    <Route path="/" element={<ProcesoDashboard />} />
  </Routes>
);

export default ProcesoModule;
