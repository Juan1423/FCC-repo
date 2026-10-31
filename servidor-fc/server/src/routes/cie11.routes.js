const express = require('express');
const router = express.Router();
const cie11Service = require('../services/cie11.service');
const { requireRole } = require('../middleware/verifyToken');

const CIE11_ROLES = ['admin', 'doctor', 'personal_salud'];

/**
 * @swagger
 * tags:
 *   name: CIE-11
 *   description: Operaciones relacionadas con la Clasificación Internacional de Enfermedades (CIE-11)
 */

/**
 * @swagger
 * /api/fcc/cie11/search:
 *   get:
 *     summary: Busca enfermedades en CIE-11
 *     tags: [CIE-11]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: Término de búsqueda para enfermedades
 *     responses:
 *       200:
 *         description: Resultados de la búsqueda
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: string
 *                     description: Código CIE-11 de la enfermedad
 *                   title:
 *                     type: string
 *                     description: Nombre de la enfermedad
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
function cie11Routes(router){
router.get('cie11/search', requireRole(CIE11_ROLES), async (req, res) => {
  try {
    const { query } = req.query;
    const results = await cie11Service.searchDiseases(query);
    res.json(results);
    console.log(results);
    console.log(query);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/fcc/cie11/details/{code}:
 *   get:
 *     summary: Obtiene detalles de una enfermedad específica en CIE-11
 *     tags: [CIE-11]
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: Código CIE-11 de la enfermedad
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         required: false
 *         description: Idioma para los detalles de la enfermedad (por defecto en inglés)
 *     responses:
 *       200:
 *         description: Detalles de la enfermedad
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   description: Código CIE-11 de la enfermedad
 *                 title:
 *                   type: string
 *                   description: Nombre de la enfermedad
 *                 description:
 *                   type: string
 *                   description: Descripción detallada de la enfermedad
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get('cie11/details/:code', requireRole(CIE11_ROLES), async (req, res) => {
  try {
    const { code } = req.params;
    const { language } = req.query;
    const details = await cie11Service.getDiseaseDetails(code, language);
    res.json(details);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
}

module.exports = cie11Routes;