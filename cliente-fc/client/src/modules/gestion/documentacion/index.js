import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DocumentacionView from './views/DocumentacionView';
import IndicadoresDocumentacionView from './views/IndicadoresDocumentacionView';

const DocumentacionModule = () => (
  <Routes>
    <Route path="/" element={<Navigate to="documentos" replace />} />
    <Route path="documentos" element={<DocumentacionView />} />
    <Route path="indicadores" element={<IndicadoresDocumentacionView />} />
  </Routes>
);

export default DocumentacionModule;