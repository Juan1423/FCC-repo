const express = require('express');
const path = require('path');

const uploadsPath = path.join(__dirname, '../uploads');

const resolveUpload = (...segments) => {
  const resolvedBase = path.resolve(uploadsPath);
  const full = path.resolve(resolvedBase, ...segments);
  if (!full.startsWith(resolvedBase + path.sep)) return null;
  return full;
};

const safeParam = (value) => {
  if (!value) return null;
  return path.basename(String(value));
};

const sendUpload = (res, filePath) => {
  if (!filePath) {
    return res.status(400).json({ success: false, message: 'Ruta de archivo no válida' });
  }
  return res.sendFile(filePath);
};

function setupUploadsRoutes(app) {
  // Ruta para las imágenes de perfil de pacientes
  app.get('/uploads/pacientes/perfil/fotos/:img', function (req, res) {
    return sendUpload(res, resolveUpload('pacientes', 'perfil', 'fotos', safeParam(req.params.img)));
  });

  // Ruta para las cédulas de pacientes
  app.get('/uploads/pacientes/cedulas/archivos/:file', function (req, res) {
    return sendUpload(res, resolveUpload('pacientes', 'cedulas', safeParam(req.params.file)));
  });

  // Ruta para los certificados médicos de pacientes
  app.get('/uploads/pacientes/certificados/archivos/:file', function (req, res) {
    return sendUpload(res, resolveUpload('pacientes', 'certificados', safeParam(req.params.file)));
  });

  // Ruta para archivos de historia
  app.get('/uploads/historia/:file', function (req, res) {
    return sendUpload(res, resolveUpload('historia', safeParam(req.params.file)));
  });

  // Rutas para personal de salud
  app.get('/uploads/personal/perfil/archivo/:img', function (req, res) {
    return sendUpload(res, resolveUpload('personal', 'perfil', safeParam(req.params.img)));
  });

  app.get('/uploads/personal/hdv/archivo/:file', function (req, res) {
    return sendUpload(res, resolveUpload('personal', 'hdv', safeParam(req.params.file)));
  });

  app.get('/uploads/examenes/:id_historia/:file', function (req, res) {
    return sendUpload(res, resolveUpload('examenes', safeParam(req.params.id_historia), safeParam(req.params.file)));
  });

  app.get('/uploads/terapias/:id_historia/:file', function (req, res) {
    return sendUpload(res, resolveUpload('terapias', safeParam(req.params.id_historia), safeParam(req.params.file)));
  });

  // Comunidad: fotos de personas e interacciones
  app.get('/uploads/comunidad/personas/:file', function (req, res) {
    return sendUpload(res, resolveUpload('comunidad', 'personas', safeParam(req.params.file)));
  });

  app.get('/uploads/comunidad/interacciones/:file', function (req, res) {
    return sendUpload(res, resolveUpload('comunidad', 'interacciones', safeParam(req.params.file)));
  });

  // Documentación: indicadores, instituciones, normativas, procesos
  app.get('/uploads/documentacion/indicadores/:file', function (req, res) {
    return sendUpload(res, resolveUpload('documentacion', 'indicadores', safeParam(req.params.file)));
  });
  app.get('/uploads/documentacion/instituciones/:file', function (req, res) {
    return sendUpload(res, resolveUpload('documentacion', 'instituciones', safeParam(req.params.file)));
  });
  app.get('/uploads/documentacion/normativas/:file', function (req, res) {
    return sendUpload(res, resolveUpload('documentacion', 'normativas', safeParam(req.params.file)));
  });
  app.get('/uploads/documentacion/procesos/:file', function (req, res) {
    return sendUpload(res, resolveUpload('documentacion', 'procesos', safeParam(req.params.file)));
  });
  app.get('/uploads/documentacion/documentos/:file', function (req, res) {
    return sendUpload(res, resolveUpload('documentacion', 'documentos', safeParam(req.params.file)));
  });
}

module.exports = setupUploadsRoutes;