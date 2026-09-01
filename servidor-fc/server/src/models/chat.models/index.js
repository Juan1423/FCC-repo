'use strict';

const { DataTypes } = require('sequelize');

const { ChatConversacion, ChatConversacionSchema } = require('./conversacion.model');
const { ChatConocimiento, ChatConocimientoSchema } = require('./conocimiento.model');
const { ChatDocumento, ChatDocumentoSchema } = require('./documento.model');
const { ChatPrompt, ChatPromptSchema } = require('./prompt.model');
const { ChatUsuarioAnonimo, ChatUsuarioAnonimoSchema } = require('./usuario_anonimo.model');
const { ChatPreguntaAnonima, ChatPreguntaAnonimaSchema } = require('./pregunta_anonima.model');
const { ChatTemaValido, ChatTemaValidoSchema } = require('./tema_valido.model');
const { ChatProtocoloSensible, ChatProtocoloSensibleSchema } = require('./protocolo_sensible.model');
const { ChatRespuestaCanonica, ChatRespuestaCanonicaSchema } = require('./respuesta_canonica.model');
const { ChatConversacionRevision, ChatConversacionRevisionSchema } = require('./conversacion_revision.model');
const { ChatConfiguracion, ChatConfiguracionSchema } = require('./configuracion.model');
const { ChatRateLimit, ChatRateLimitSchema } = require('./rate_limit.model');

function setupChatModels(sequelize) {
    ChatConversacion.init(ChatConversacionSchema, ChatConversacion.config(sequelize));
    sequelize.models.ChatConversacion = ChatConversacion;

    ChatConocimiento.init(ChatConocimientoSchema, ChatConocimiento.config(sequelize));
    sequelize.models.ChatConocimiento = ChatConocimiento;

    ChatDocumento.init(ChatDocumentoSchema, ChatDocumento.config(sequelize));
    sequelize.models.ChatDocumento = ChatDocumento;

    ChatPrompt.init(ChatPromptSchema, ChatPrompt.config(sequelize));
    sequelize.models.ChatPrompt = ChatPrompt;

    ChatUsuarioAnonimo.init(ChatUsuarioAnonimoSchema, ChatUsuarioAnonimo.config(sequelize));
    sequelize.models.ChatUsuarioAnonimo = ChatUsuarioAnonimo;

    ChatPreguntaAnonima.init(ChatPreguntaAnonimaSchema, ChatPreguntaAnonima.config(sequelize));
    sequelize.models.ChatPreguntaAnonima = ChatPreguntaAnonima;

    ChatTemaValido.init(ChatTemaValidoSchema, ChatTemaValido.config(sequelize));
    sequelize.models.ChatTemaValido = ChatTemaValido;

    ChatProtocoloSensible.init(ChatProtocoloSensibleSchema, ChatProtocoloSensible.config(sequelize));
    sequelize.models.ChatProtocoloSensible = ChatProtocoloSensible;

    ChatRespuestaCanonica.init(ChatRespuestaCanonicaSchema, ChatRespuestaCanonica.config(sequelize));
    sequelize.models.ChatRespuestaCanonica = ChatRespuestaCanonica;

    ChatConversacionRevision.init(ChatConversacionRevisionSchema, ChatConversacionRevision.config(sequelize));
    sequelize.models.ChatConversacionRevision = ChatConversacionRevision;

    ChatConfiguracion.init(ChatConfiguracionSchema, ChatConfiguracion.config(sequelize));
    sequelize.models.ChatConfiguracion = ChatConfiguracion;

    ChatRateLimit.init(ChatRateLimitSchema, ChatRateLimit.config(sequelize));
    sequelize.models.ChatRateLimit = ChatRateLimit;

    ChatConversacion.associate(sequelize.models);
    ChatConocimiento.associate(sequelize.models);
    ChatDocumento.associate(sequelize.models);
    ChatPrompt.associate(sequelize.models);
    ChatUsuarioAnonimo.associate(sequelize.models);
    ChatPreguntaAnonima.associate(sequelize.models);
    ChatTemaValido.associate(sequelize.models);
    ChatProtocoloSensible.associate(sequelize.models);
    ChatRespuestaCanonica.associate(sequelize.models);
    ChatConversacionRevision.associate(sequelize.models);
    ChatConfiguracion.associate(sequelize.models);
    ChatRateLimit.associate(sequelize.models);
}

module.exports = setupChatModels;
