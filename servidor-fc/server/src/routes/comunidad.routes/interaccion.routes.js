const express = require('express');
const router = express.Router();
const interaccionController = require('../../controllers/comunidad.controllers/interaccion.controller');
const multer = require('multer');
const multerConfigInteraccion = require('../../utils/multerConfigInteraccion');
const { validateUploadedFileSignatures } = require('../../utils/fileSignature');

const upload = multer(multerConfigInteraccion);

/**
 * @swagger
 * tags:
 *   name: Interacciones
 *   description: Operaciones relacionadas con las interacciones
 */

/**
 * @swagger
 * /api/fcc/interaccion:
 *   get:
 *     summary: Obtiene todas las interacciones
 *     tags: [Interacciones]
 *     responses:
 *       200:
 *         description: Lista de interacciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Interaccion'
 */
router.get('/', interaccionController.get);

/**
 * @swagger
 * /api/fcc/interaccion/{id}:
 *   get:
 *     summary: Obtiene una interacción por ID
 *     tags: [Interacciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la interacción
 *     responses:
 *       200:
 *         description: Interacción encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Interaccion'
 *       404:
 *         description: Interacción no encontrada
 */
router.get('/:id', interaccionController.getById);

/**
 * @swagger
 * /api/fcc/interaccion:
 *   post:
 *     summary: Crea una nueva interacción con un archivo adjunto
 *     tags: [Interacciones]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               archivo_interaccion:
 *                 type: string
 *                 format: binary
 *               descripcion_interaccion:
 *                 type: string
 *               tipo_interaccion:
 *                 type: string
 *               fecha_inicio_interaccion:
 *                 type: string
 *                 format: date-time
 *               fecha_fin_interaccion:
 *                 type: string
 *                 format: date-time
 *               observciones_interaccion:
 *                 type: string
 *               estado_interaccion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Interacción creada exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 */
router.post('/', upload.single('archivo_interaccion'), validateUploadedFileSignatures, interaccionController.create);

/**
 * @swagger
 * /api/fcc/interaccion/{id}:
 *   put:
 *     summary: Actualiza una interacción existente
 *     tags: [Interacciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la interacción
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Interaccion'
 *     responses:
 *       200:
 *         description: Interacción actualizada exitosamente
 *       404:
 *         description: Interacción no encontrada
 */
router.put('/:id', interaccionController.update);

/**
 * @swagger
 * /api/fcc/interaccion/{id}:
 *   delete:
 *     summary: Elimina una interacción
 *     tags: [Interacciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la interacción
 *     responses:
 *       200:
 *         description: Interacción eliminada exitosamente
 *       404:
 *         description: Interacción no encontrada
 */
router.delete('/:id', interaccionController._delete);

/**
 * @swagger
 * /api/fcc/interaccion/persona/{idPersona}:
 *   get:
 *     summary: Obtiene las interacciones de una persona por ID
 *     tags: [Interacciones]
 *     parameters:
 *       - in: path
 *         name: idPersona
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la persona
 *     responses:
 *       200:
 *         description: Lista de interacciones de la persona
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Interaccion'
 *       404:
 *         description: Persona no encontrada o sin interacciones
 */
router.get('/persona/:idPersona', interaccionController.getByPersonaId);

module.exports = router;
