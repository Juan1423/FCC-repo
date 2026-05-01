const express = require('express');
const router = express.Router();
const personaController = require('../../controllers/comunidad.controllers/persona.controller');
const multer = require('multer');
const multerConfigPersona = require('../../utils/multerConfigPersona');

const upload = multer(multerConfigPersona);

/**
 * @swagger
 * tags:
 *   name: Personas
 *   description: Operaciones relacionadas con las personas
 */

/**
 * @swagger
 * /api/fcc/persona:
 *   get:
 *     summary: Obtiene todas las personas
 *     tags: [Personas]
 *     responses:
 *       200:
 *         description: Lista de personas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Persona'
 */
router.get('/', personaController.get);
router.post('/upload-foto', upload.single('foto_persona'), personaController.uploadPhoto);

/**
 * @swagger
 * /api/fcc/persona/{id}:
 *   get:
 *     summary: Obtiene una persona por ID
 *     tags: [Personas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la persona
 *     responses:
 *       200:
 *         description: Persona encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Persona'
 *       404:
 *         description: Persona no encontrada
 */
router.get('/:id', personaController.getById);

/**
 * @swagger
 * /api/fcc/persona:
 *   post:
 *     summary: Crea una nueva persona
 *     tags: [Personas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Persona'
 *     responses:
 *       201:
 *         description: Persona creada exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 */
router.post('/', personaController.create);

/**
 * @swagger
 * /api/fcc/persona/{id}:
 *   put:
 *     summary: Actualiza una persona existente
 *     tags: [Personas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la persona
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Persona'
 *     responses:
 *       200:
 *         description: Persona actualizada exitosamente
 *       404:
 *         description: Persona no encontrada
 */
router.put('/:id', personaController.update);

/**
 * @swagger
 * /api/fcc/persona/{id}:
 *   delete:
 *     summary: Elimina una persona
 *     tags: [Personas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la persona
 *     responses:
 *       200:
 *         description: Persona eliminada exitosamente
 *       404:
 *         description: Persona no encontrada
 */
router.delete('/:id', personaController._delete);

/**
 * @swagger
 * /api/fcc/persona/interaccion/{idInteraccion}:
 *   get:
 *     summary: Obtiene las personas asociadas a una interacción por ID
 *     tags: [Personas]
 *     parameters:
 *       - in: path
 *         name: idInteraccion
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la interacción
 *     responses:
 *       200:
 *         description: Lista de personas asociadas a la interacción
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Persona'
 *       404:
 *         description: Interacción no encontrada o sin personas asociadas
 */
router.get('/interaccion/:idInteraccion', personaController.getByInteraccionId);

module.exports = router;
