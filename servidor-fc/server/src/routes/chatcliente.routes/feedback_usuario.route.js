const express = require('express');
const router = express.Router();
const { create, get, getById, update, _delete, getAverageRating, getByConversation, getRatingDistribution } = require('../../controllers/chatcliente.controllers/feedback_usuario.controller');

// POST routes
router.post('/', create);

// GET routes (specific before generic)
router.get('/average', getAverageRating);
router.get('/distribution', getRatingDistribution);
router.get('/conversacion/:id_conversacion', getByConversation);
router.get('/', get);
router.get('/:id', getById);

// PUT and DELETE routes
router.put('/:id', update);
router.delete('/:id', _delete);

module.exports = router;