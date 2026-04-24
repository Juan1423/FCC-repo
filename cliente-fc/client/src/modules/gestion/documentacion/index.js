import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import IndicadoresDocumentacionView from './views/IndicadoresDocumentacionView';

/**
 * Rutas internas bajo /fcc-documentacion/*
 */
const DocumentacionModule = () => (
  <Routes>
    <Route path="/" element={<Navigate to="indicadores" replace />} />
    <Route path="indicadores" element={<IndicadoresDocumentacionView />} />
  </Routes>
);

export default DocumentacionModule;
