const promptRouter = require('./prompt.route');
const conversacionRouter = require('./conversacion.route');
const feedbackRouter = require('./feedback.routes');
const feedbackUsuarioRouter = require('./feedback_usuario.route');
const seguridadRouter = require('./seguridad.route');
const conocimientoRouter = require('./conocimiento.route');
const conversacionAnonimaRouter = require('./conversacion_anonima.route');
const usuarioAnonimoRouter = require('./usuario_anonimo.route');
const preguntaAnonimaRouter = require('./pregunta_anonima.route');

function setupChatClienteRoutes(router) {
  router.use('/prompt', promptRouter);
  router.use('/conversacion', conversacionRouter);
  router.use('/feedback', feedbackRouter);
  router.use('/feedback-usuario', feedbackUsuarioRouter);
  router.use('/seguridad', seguridadRouter);
  router.use('/conocimiento', conocimientoRouter);
  router.use('/conversacion-anonima', conversacionAnonimaRouter);
  router.use('/usuario-anonimo', usuarioAnonimoRouter);
  router.use('/pregunta-anonima', preguntaAnonimaRouter);
}

module.exports = setupChatClienteRoutes;