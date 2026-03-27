const { DataTypes } = require('sequelize');

const { UsuarioAnonimo, UsuarioAnonimoSchema } = require('./usuario_anonimo.model');
const { Prompt, PromptSchema } = require('./prompt.model');
const { Conversacion, ConversacionSchema } = require('./conversacion.model');

function setupChatClienteModels(sequelize) {
   //models
   
   UsuarioAnonimo.init(UsuarioAnonimoSchema, UsuarioAnonimo.config(sequelize));
   sequelize.models.UsuarioAnonimo = UsuarioAnonimo;

   Prompt.init(PromptSchema, Prompt.config(sequelize));
   sequelize.models.Prompt = Prompt;

   
   Conversacion.init(ConversacionSchema, Conversacion.config(sequelize));
   sequelize.models.Conversacion = Conversacion;

   // Conversación anónima (modelo antiguo, con init dentro del propio módulo)
   const ConversacionAnonima = require('./conversacion_anonima.model')(sequelize, DataTypes);
   sequelize.models.ConversacionAnonima = ConversacionAnonima;

   const { CategoriaPregunta, CategoriaPreguntaSchema } = require('./categoria_pregunta.model');
   CategoriaPregunta.init(CategoriaPreguntaSchema, CategoriaPregunta.config(sequelize));
   sequelize.models.CategoriaPregunta = CategoriaPregunta;

   const { PreguntaAnonima, PreguntaAnonimaSchema } = require('./pregunta_anonima.model');
   PreguntaAnonima.init(PreguntaAnonimaSchema, PreguntaAnonima.config(sequelize));
   sequelize.models.PreguntaAnonima = PreguntaAnonima;

   const { FeedbackUsuario, FeedbackUsuarioSchema } = require('./feedback_usuario.model');
   FeedbackUsuario.init(FeedbackUsuarioSchema, FeedbackUsuario.config(sequelize));
   sequelize.models.FeedbackUsuario = FeedbackUsuario;

   // Evitar que Sequelize intente crear las tablas que ya queremos eliminar.
   // Las mantenemos en código solo como referencia, pero no deben existir en BD.
   PreguntaAnonima.sync = async () => Promise.resolve();
   FeedbackUsuario.sync = async () => Promise.resolve();

   const { Conocimiento, ConocimientoSchema } = require('./conocimiento.model');
   Conocimiento.init(ConocimientoSchema, Conocimiento.config(sequelize));
   sequelize.models.Conocimiento = Conocimiento;

   const { Seguridad, SeguridadSchema } = require('./seguridad.model');
   Seguridad.init(SeguridadSchema, Seguridad.config(sequelize));
   sequelize.models.Seguridad = Seguridad;

   // Association
   UsuarioAnonimo.associate(sequelize.models);
   Prompt.associate(sequelize.models);
   Conversacion.associate(sequelize.models);
   if (typeof ConversacionAnonima.associate === 'function') {
     ConversacionAnonima.associate(sequelize.models);
   }
   PreguntaAnonima.associate(sequelize.models);
   CategoriaPregunta.associate(sequelize.models);
   FeedbackUsuario.associate(sequelize.models);
   Conocimiento.associate(sequelize.models);
   Seguridad.associate(sequelize.models);
}

module.exports = setupChatClienteModels;
