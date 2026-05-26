import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DonacionesDashboard from './views/DonacionesDashboard';

const DonacionesModule = () => (
  <Routes>
    <Route path="/" element={<DonacionesDashboard />} />
  </Routes>
);

export default DonacionesModule;
