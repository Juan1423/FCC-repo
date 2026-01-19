
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ComunidadDashboard from './views/ComunidadDashboard';
import PersonasView from './persona/view/PersonasView';
import InteraccionesView from './interracion/views/InteraccionesView';
import AddPersonaView from './persona/components/AddPersonaView';
import AddInteraccionView from './interracion/components/AddInteraccionView';
import PersonaInteraccionesView from './persona/components/PersonaInteraccionesView';
import EditInteraccionView from './interracion/components/EditInteraccionView';
import DetalleInteraccionView from './interracion/components/DetalleInteraccionView';
import PersonaDetalleView from './persona/components/PersonaDetalleView';
import EditPersonaView from './persona/components/EditPersonaView';
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
