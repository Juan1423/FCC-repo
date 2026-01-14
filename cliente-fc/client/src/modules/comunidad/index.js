
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ComunidadDashboard from './views/ComunidadDashboard';
import PersonasView from './views/PersonasView';
import InteraccionesView from './views/InteraccionesView';
import AddPersonaView from './views/AddPersonaView';
import AddInteraccionView from './views/AddInteraccionView';
import PersonaInteraccionesView from './views/PersonaInteraccionesView';
import EditInteraccionView from './views/EditInteraccionView';
import DetalleInteraccionView from './views/DetalleInteraccionView';
import PersonaDetalleView from './views/PersonaDetalleView';
import EditPersonaView from './views/EditPersonaView';
import NormativasView from './views/NormativasView';

const ComunidadModule = () => {
  return (
    <Routes>
      <Route path="/" element={<ComunidadDashboard />} />
      <Route path="/personas" element={<PersonasView />} />
      <Route path="/personas/nueva" element={<AddPersonaView />} />
      <Route path="/personas/:id/interacciones" element={<PersonaInteraccionesView />} />
      <Route path="/personas/:id/detalles" element={<PersonaDetalleView />} />
      <Route path="/personas/:id/editar" element={<EditPersonaView />} />
      <Route path="/interacciones" element={<InteraccionesView />} />
      <Route path="/interacciones/nueva" element={<AddInteraccionView />} />
      <Route path="/interacciones/:id/editar" element={<EditInteraccionView />} />
      <Route path="/interacciones/:id/detalles" element={<DetalleInteraccionView />} />
      <Route path="/normativa" element={<NormativasView />} />
    </Routes>
  );
};

export default ComunidadModule;
