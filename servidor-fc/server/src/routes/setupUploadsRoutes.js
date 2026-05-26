const express = require('express');
const path = require('path');

const uploadsPath = path.join(__dirname, '../uploads');

function setupUploadsRoutes(app) {
  // Servir archivos estáticos desde la carpeta 'uploads'
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  // Ruta para las imágenes de perfil de pacientes
  app.get('/uploads/pacientes/perfil/fotos/:img', function(req, res){
    res.sendFile(path.join(uploadsPath, 'pacientes', 'perfil', req.params.img));
  });

  // Ruta para las cédulas de pacientes
  app.get('/uploads/pacientes/cedulas/archivos/:file', function(req, res){
    res.sendFile(path.join(__dirname, `../uploads/pacientes/cedulas/${req.params.file}`));
  });

  // Ruta para los certificados médicos de pacientes
  app.get('/uploads/pacientes/certificados/archivos/:file', function(req, res){
    res.sendFile(path.join(__dirname, `../uploads/pacientes/certificados/${req.params.file}`));
  });

  // Ruta para archivos de historia
  app.get('/uploads/historia/:file', function(req, res){
    res.sendFile(path.join(__dirname, `../uploads/historia/${req.params.file}`));
  });

    // Rutas para personal de salud (nuevas)
    app.get('/uploads/personal/perfil/archivo/:img', function(req, res){
      res.sendFile(path.join(uploadsPath, 'personal', 'perfil', req.params.img));
    });
  
    app.get('/uploads/personal/hdv/archivo/:file', function(req, res){
      res.sendFile(path.join(uploadsPath, 'personal', 'hdv', req.params.file));
    });

    app.get('/uploads/examenes/:id_historia/:file', function(req, res){
      res.sendFile(path.join(uploadsPath, 'examenes', req.params.id_historia, req.params.file));
    });

    app.get('/uploads/terapias/:id_historia/:file', function(req, res){
      res.sendFile(path.join(uploadsPath, 'terapias', req.params.id_historia, req.params.file));
    });

    // Documentación: indicadores, instituciones, normativas, procesos
    app.get('/uploads/documentacion/indicadores/:file', function(req, res){
      res.sendFile(path.join(uploadsPath, 'documentacion', 'indicadores', req.params.file));
    });
    app.get('/uploads/documentacion/instituciones/:file', function(req, res){
      res.sendFile(path.join(uploadsPath, 'documentacion', 'instituciones', req.params.file));
    });
    app.get('/uploads/documentacion/normativas/:file', function(req, res){
      res.sendFile(path.join(uploadsPath, 'documentacion', 'normativas', req.params.file));
    });
    app.get('/uploads/documentacion/procesos/:file', function(req, res){
      res.sendFile(path.join(uploadsPath, 'documentacion', 'procesos', req.params.file));
    });
    app.get('/uploads/documentacion/documentos/:file', function(req, res){
      res.sendFile(path.join(uploadsPath, 'documentacion', 'documentos', req.params.file));
    });
}

module.exports = setupUploadsRoutes;