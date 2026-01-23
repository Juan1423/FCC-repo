const express = require('express'); 

const provinciaRouter = require('./provincia.routes');
const cantonRouter = require('./canton.routes');
const parroquiaRouter = require('./parroquia.routes');
const tipo_personaRouter = require('./tipo_persona.routes');

const personaRouter = require('./persona.routes');
const interaccionRouter = require('./interaccion.routes');
const documentoInteraccionRouter = require('./documento_interaccion.routes');
const normativaRouter = require('./normativa.routes');
const tipoNormativaRouter = require('./tipo_normativa.routes')


function setupComunidadRoutes(router) {
  
//--------- rutas de acceso para las funciones del controlador
//---------- enlazan o referencias desde el index las routes y controller
//-------router.use=funcion router para dirigir el trafico a traves de rutas web
//------- /provincia= http://localhost:5000/api/fcc/  llega a la ruta web222222222
  router.use('/provincia', provinciaRouter)
  router.use('/canton', cantonRouter)
  router.use('/parroquia', parroquiaRouter)
  router.use('/tipo_persona', tipo_personaRouter)
  router.use('/persona', personaRouter)
  router.use('/interaccion', interaccionRouter)
  router.use('/comunidad/documentos', documentoInteraccionRouter)
  router.use('/normativa', normativaRouter)
  router.use('/tipo_normativa', tipoNormativaRouter)

  }

module.exports = setupComunidadRoutes;