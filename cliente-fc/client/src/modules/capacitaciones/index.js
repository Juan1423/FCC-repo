import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CapacitacionesDashboard from './views/CapacitacionesDashboard';

const CapacitacionesModule = () => (
  <Routes>
    <Route path="/" element={<CapacitacionesDashboard />} />
  </Routes>
);

export default CapacitacionesModule;