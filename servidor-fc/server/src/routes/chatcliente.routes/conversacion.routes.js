const express = require('express');
const { getAll, getById, getByUser, clearMemory, getStats } = require('../controllers/conversacion.controller');
const { verifyToken } = require('../../middleware/verifyToken');

const router = express.Router();

router.get('/', verifyToken, getAll);
router.get('/stats', verifyToken, getStats);
router.get('/user', verifyToken, getByUser);
router.post('/clear-memory', verifyToken, clearMemory);
router.get('/:id', verifyToken, getById);

module.exports = router;