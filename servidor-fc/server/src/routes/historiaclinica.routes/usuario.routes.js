const express = require('express');
const router = express.Router();
const usuarioController = require('../../controllers/historiaclinica.controllers/usuario.controller');
const { verifyToken, requireRole } = require('../../middleware/verifyToken');

const esMismoUsuarioOAdmin = (req, res, next) => {
  const rol = String(req.user?.rol || '').toLowerCase();
  const isAdmin = rol === 'admin' || rol === 'administrador';
  const isOwner = req.user?.user != null && String(req.user.user) === String(req.params.id);
  if (isAdmin || isOwner) return next();
  return res.status(403).json({ success: false, message: 'No tienes permisos para realizar esta acción' });
};

router
    .get('/', verifyToken, requireRole(['admin']), usuarioController.get)
    .get('/:id', verifyToken, esMismoUsuarioOAdmin, usuarioController.getById)
    .post('/', verifyToken, requireRole(['admin']), usuarioController.create)
    .put('/:id', verifyToken, esMismoUsuarioOAdmin, usuarioController.update)
    .delete('/:id', verifyToken, requireRole(['admin']), usuarioController._delete)
    .post('/login', usuarioController.login)
    .post('/logout', usuarioController.logout);

module.exports = router;