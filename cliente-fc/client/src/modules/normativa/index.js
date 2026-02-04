import React from 'react';
import { Routes, Route } from 'react-router-dom';
import NormativaDashboard from './views/NormativaDashboard';
import NormativaDetail from './views/NormativaDetail';
import NormativaEdit from './views/NormativaEdit';

const NormativaModule = () => (
  <Routes>
    <Route path="/" element={<NormativaDashboard />} />
    <Route path=":id/detalles" element={<NormativaDetail />} />
    <Route path=":id/editar" element={<NormativaEdit />} />
  </Routes>
);

export default NormativaModule;
