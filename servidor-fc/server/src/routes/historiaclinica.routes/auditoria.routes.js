const express = require("express");
const router = express.Router();
const auditoriaController = require("../../controllers/historiaclinica.controllers/auditoria.controller");
const { requireRole } = require("../../middleware/verifyToken");
const multer = require("multer");
const upload = multer();

/**
 * @swagger
 * tags:
 *   name: Auditorías
 *   description: Operaciones relacionadas con las auditorias
 */

/**
 * @swagger
 * /api/fcc/auditoria:
 *   get:
 *     summary: Obtiene todas las auditorias
 *     tags: [Auditorías]
 *     responses:
 *       200:
 *         description: Lista de auditorias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Auditoria'
 */
router.get("/", requireRole(["admin"]), auditoriaController.get);

/**
 * @swagger
 * /api/fcc/auditoria/{id}:
 *   get:
 *     summary: Obtiene una auditoria por ID
 *     tags: [Auditorías]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la auditoria
 *     responses:
 *       200:
 *         description: Auditoria encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Auditoria'
 *       404:
 *         description: Auditoria no encontrada
 */
router.get("/:id", requireRole(["admin"]), auditoriaController.getById);

/**
 * @swagger
 * /api/fcc/auditoria:
 *   post:
 *     summary: Crea una nueva auditoria
 *     tags: [Auditorías]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Auditoria'
 *     responses:
 *       201:
 *         description: Auditoria creada exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 */
router.post("/", auditoriaController.create);

/**
 * @swagger
 * /api/fcc/auditoria/{id}:
 *   put:
 *     summary: Actualiza una auditoria existente
 *     tags: [Auditorías]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la auditoria
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Auditoria'
 *     responses:
 *       200:
 *         description: Auditoria actualizada exitosamente
 *       404:
 *         description: Auditoria no encontrada
 */
router.put("/:id", requireRole(["admin"]), upload.none(), auditoriaController.update);

/**
 * @swagger
 * /api/fcc/auditoria/{id}:
 *   delete:
 *     summary: Elimina una auditoria
 *     tags: [Auditorías]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la auditoria
 *     responses:
 *       200:
 *         description: Auditoria eliminada exitosamente
 *       404:
 *         description: Auditoria no encontrada
 */
router.delete("/:id", requireRole(["admin"]), auditoriaController._delete);

module.exports = router;
