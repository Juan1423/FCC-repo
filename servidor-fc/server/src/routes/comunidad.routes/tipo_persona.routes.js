const express = require('express');
const router = express.Router();
const tipoPersonaController = require('../../controllers/comunidad.controllers/tipo_persona.controller');

/**
 * @swagger
 * tags:
 *   name: Tipos de Persona
 *   description: Operaciones relacionadas con los tipos de persona
 */

/**
 * @swagger
 * /api/fcc/tipo_persona:
 *   get:
 *     summary: Obtiene todos los tipos de persona
 *     tags: [Tipos de Persona]
 *     responses:
 *       200:
 *         description: Lista de tipos de persona
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TipoPersona'
 */
router.get('/', tipoPersonaController.get);

/**
 * @swagger
 * /api/fcc/tipo_persona/{id}:
 *   get:
 *     summary: Obtiene un tipo de persona por ID
 *     tags: [Tipos de Persona]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tipo de persona
 *     responses:
 *       200:
 *         description: Tipo de persona encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TipoPersona'
 *       404:
 *         description: Tipo de persona no encontrado
 */
router.get('/:id', tipoPersonaController.getById);

/**
 * @swagger
 * /api/fcc/tipo_persona:
 *   post:
 *     summary: Crea un nuevo tipo de persona
 *     tags: [Tipos de Persona]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TipoPersona'
 *     responses:
 *       201:
 *         description: Tipo de persona creado exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 */
router.post('/', tipoPersonaController.create);

/**
 * @swagger
 * /api/fcc/tipo_persona/{id}:
 *   put:
 *     summary: Actualiza un tipo de persona existente
 *     tags: [Tipos de Persona]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tipo de persona
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TipoPersona'
 *     responses:
 *       200:
 *         description: Tipo de persona actualizado exitosamente
 *       404:
 *         description: Tipo de persona no encontrado
 */
router.put('/:id', tipoPersonaController.update);

/**
 * @swagger
 * /api/fcc/tipo_persona/{id}:
 *   delete:
 *     summary: Elimina un tipo de persona
 *     tags: [Tipos de Persona]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tipo de persona
 *     responses:
 *       200:
 *         description: Tipo de persona eliminado exitosamente
 *       404:
 *         description: Tipo de persona no encontrado
 */
router.delete('/:id', tipoPersonaController._delete);

module.exports = router;
