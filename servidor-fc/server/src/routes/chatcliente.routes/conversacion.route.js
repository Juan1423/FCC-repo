const express = require('express');
const router = express.Router();
const { getAll, getById, getByUser, clearMemory, getStats, update, deleteById, usarConversacionEspecifico } = require('../../controllers/chatcliente.controllers/conversacion.controller');
const { verifyToken } = require('../../middleware/verifyToken');

// POST routes
router.post('/clear-memory', verifyToken, clearMemory);
router.post('/usar-conversacion/:id', verifyToken, usarConversacionEspecifico);

// PUT routes
router.put('/:id', verifyToken, update);

// DELETE routes
router.delete('/:id', verifyToken, deleteById);

// GET routes (specific before generic :id)
router.get('/stats', verifyToken, getStats);
router.get('/usuario/:id_usuario', verifyToken, getByUser);
router.get('/', verifyToken, getAll);
router.get('/:id', verifyToken, getById);

module.exports = router;