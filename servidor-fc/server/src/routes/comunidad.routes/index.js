const express = require('express'); 

const geoRouter = require('./geo.routes');
const tipo_personaRouter = require('./tipo_persona.routes');
const personaRouter = require('./persona.routes');
const interaccionRouter = require('./interaccion.routes');
const documentoInteraccionRouter = require('./documento_interaccion.routes');

function setupComunidadRoutes(router) {
  router.use('/geo', geoRouter)
  router.use('/tipo_persona', tipo_personaRouter)
  router.use('/persona', personaRouter)
  router.use('/interaccion', interaccionRouter)
  router.use('/comunidad/documentos', documentoInteraccionRouter)
}

module.exports = setupComunidadRoutes;