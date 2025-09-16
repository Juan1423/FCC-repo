const express = require('express');
const setupHistoriaClinicaRoutes = require('./historiaclinica.routes');
const setupCie11Routes = require('./cie11.routes');
const path = require('path');
const setupAuthRoutes = require('./auth.routes');
const setupUploadsRoutes = require('./setupUploadsRoutes');

const setupOpenAiRoutes = require('./openai.routes'); // Chatbot IA

function routerApi(app) {
  const router = express.Router();

  /**
   * @swagger
   * /uploads:
   *   get:
   *     summary: Sirve archivos estáticos desde la carpeta 'uploads'
   *     description: Esta ruta permite acceder a archivos estáticos almacenados en la carpeta 'uploads'.
   *     responses:
   *       200:
   *         description: Archivo estático servido exitosamente
   *       404:
   *         description: Archivo no encontrado
   */
  app.use('/uploads', express.static('uploads'));

  /**
   * @swagger
   * /uploads/pacientes/{img}:
   *   get:
   *     summary: Obtiene una imagen de paciente
   *     parameters:
   *       - in: path
   *         name: img
   *         required: true
   *         schema:
   *           type: string
   *         description: Nombre del archivo de imagen del paciente
   *     responses:
   *       200:
   *         description: Imagen del paciente
   *         content:
   *           image/*:
   *             schema:
   *               type: string
   *               format: binary
   *       404:
   *         description: Imagen no encontrada
   */
  app.get('/uploads/pacientes/:img', function(req, res){
    res.sendFile(path.join(__dirname, `../uploads/pacientes/${req.params.img}`));
  });

  /**
   * @swagger
   * /uploads/pacientes/{filetype}/{file}:
   *   get:
   *     summary: Obtiene un archivo de paciente de un tipo específico
   *     parameters:
   *       - in: path
   *         name: filetype
   *         required: true
   *         schema:
   *           type: string
   *         description: Tipo de archivo (ej. 'documentos', 'examenes')
   *       - in: path
   *         name: file
   *         required: true
   *         schema:
   *           type: string
   *         description: Nombre del archivo
   *     responses:
   *       200:
   *         description: Archivo del paciente
   *         content:
   *           application/octet-stream:
   *             schema:
   *               type: string
   *               format: binary
   *       404:
   *         description: Archivo no encontrado
   */
  app.get('/uploads/pacientes/:filetype/:file', function(req, res){
    res.sendFile(path.join(__dirname, `../uploads/pacientes/${req.params.filetype}${req.params.file}`));
  });

  /**
   * @swagger
   * /uploads/historia/{file}:
   *   get:
   *     summary: Obtiene un archivo de historia clínica
   *     parameters:
   *       - in: path
   *         name: file
   *         required: true
   *         schema:
   *           type: string
   *         description: Nombre del archivo de historia clínica
   *     responses:
   *       200:
   *         description: Archivo de historia clínica
   *         content:
   *           application/octet-stream:
   *             schema:
   *               type: string
   *               format: binary
   *       404:
   *         description: Archivo no encontrado
   */
  app.get('/uploads/historia/:file', function(req, res){
    res.sendFile(path.join(__dirname, `../uploads/historia/${req.params.file}`));
  });

  /**
   * @swagger
   * /uploads/personal/{img}:
   *   get:
   *     summary: Obtiene una imagen del personal
   *     parameters:
   *       - in: path
   *         name: img
   *         required: true
   *         schema:
   *           type: string
   *         description: Nombre del archivo de imagen del personal
   *     responses:
   *       200:
   *         description: Imagen del personal
   *         content:
   *           image/*:
   *             schema:
   *               type: string
   *               format: binary
   *       404:
   *         description: Imagen no encontrada
   */
  app.get('/uploads/personal/:img', function(req, res){
    res.sendFile(path.join(__dirname, `../uploads/personal/${req.params.img}`));
  });

  /**
   * @swagger
   * /api/fcc:
   *   get:
   *     summary: Ruta base para la API de FCC
   *     description: Esta es la ruta base para todas las operaciones de la API de Fundación con Cristo.
   *     responses:
   *       200:
   *         description: Operación exitosa
   */
  app.use('/api/fcc', router);

  // Nota: Las siguientes funciones de configuración necesitarán sus propias anotaciones Swagger
  // en sus respectivos archivos de rutas.

  /**
   * @swagger
   * tags:
   *   - name: Uploads
   *     description: Operaciones relacionadas con la carga y descarga de archivos
   *   - name: Historia Clínica
   *     description: Operaciones relacionadas con historias clínicas
   *   - name: Autenticación
   *     description: Operaciones de autenticación y autorización
   *   - name: CIE-11
   *     description: Operaciones relacionadas con la Clasificación Internacional de Enfermedades (CIE-11)
   */

  setupUploadsRoutes(app);

  setupHistoriaClinicaRoutes(router);
  setupAuthRoutes(router);
  setupCie11Routes(router);
  setupOpenAiRoutes(router);
}

module.exports = routerApi;