const express = require('express');
const securityAuditMiddleware = require('../middleware/securityAuditMiddleware');
const setupHistoriaClinicaRoutes = require('./historiaclinica.routes');
const setupCie11Routes = require('./cie11.routes');
const setupAuthRoutes = require('./auth.routes');
const setupUploadsRoutes = require('./setupUploadsRoutes');

const setupComunidadRoutes = require('./comunidad.routes');
const setupCapacitacionRoutes = require('./capacitaciones.routes')
const setupChatRoutes = require('./chat.routes')
const setupDocumentacionRoutes = require('./documentacion.routes')
const setupDonacionesRoutes = require('./donaciones.routes');

function routerApi(app) {
  const router = express.Router();

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
  // Middleware global de seguridad y auditoría para todas las rutas /api/fcc
  router.use(securityAuditMiddleware);

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
  setupComunidadRoutes(router);
  setupCapacitacionRoutes(router);
  setupChatRoutes(router);
  setupDocumentacionRoutes(router);
  setupDonacionesRoutes(router);
}

module.exports = routerApi;