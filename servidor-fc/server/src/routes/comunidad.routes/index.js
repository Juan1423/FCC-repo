const express = require('express');
const { requireRole } = require('../../middleware/verifyToken');

const COMUNIDAD_ROLES = ['admin', 'personal_administrativo'];

const geoRouter = require('./geo.routes');
const tipo_personaRouter = require('./tipo_persona.routes');
const personaRouter = require('./persona.routes');
const interaccionRouter = require('./interaccion.routes');
const documentoInteraccionRouter = require('./documento_interaccion.routes');

function setupComunidadRoutes(router) {
  router.use('/geo', requireRole(COMUNIDAD_ROLES), geoRouter)
  router.use('/tipo_persona', requireRole(COMUNIDAD_ROLES), tipo_personaRouter)
  router.use('/persona', requireRole(COMUNIDAD_ROLES), personaRouter)
  router.use('/interaccion', requireRole(COMUNIDAD_ROLES), interaccionRouter)
  router.use('/comunidad/documentos', requireRole(COMUNIDAD_ROLES), documentoInteraccionRouter)
}

module.exports = setupComunidadRoutes;