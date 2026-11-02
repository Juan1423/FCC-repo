'use strict';

const { openaiService, guardrailsService, learningService } = require('../../services/chat.services');
const { models } = require('../../libs/sequelize');
const chatConfig = require('../../config/chatConfig');
const { v4: uuidv4 } = require('uuid');
const { getRequestIp, hashIdentifier } = require('../../utils/request.util');
const { validatePayload, ValidationError } = require('../../utils/security.utils');

const LIMITE_VISITANTE_POR_IP = parseInt(process.env.RATE_LIMIT_VISITANTE_IP_DIARIO || '50', 10);

const resolveSessionId = async ({ sessionId, idUsuario, visitorId }) => {
    if (!sessionId) return null;

    const last = await models.ChatConversacion.findOne({
        where: { session_id: sessionId },
        order: [['id_conversacion', 'DESC']],
    });

    if (!last) return sessionId;

    if (idUsuario) {
        return last.id_usuario != null && String(last.id_usuario) === String(idUsuario) ? sessionId : null;
    }

    if (last.id_usuario_anonimo != null && visitorId && String(last.id_usuario_anonimo) === String(visitorId)) {
        return sessionId;
    }

    return null;
};

const ownsConversation = (conversacion, { idUsuario, visitorId }) => {
    if (!conversacion) return false;
    if (idUsuario) {
        return conversacion.id_usuario != null && String(conversacion.id_usuario) === String(idUsuario);
    }
    if (visitorId) {
        return conversacion.id_usuario_anonimo != null && String(conversacion.id_usuario_anonimo) === String(visitorId);
    }
    return false;
};

const enviarMensaje = async (req, res) => {
    try {
        const { mensaje, promptId = null, consentimiento = false, metadata = {}, sessionId = null, visitorId = null } = req.body;

        if (!mensaje || typeof mensaje !== 'string' || !mensaje.trim()) {
            return res.status(400).json({
                success: false,
                message: 'El mensaje es requerido',
            });
        }

        // ValidaciÃ³n temprana: evita gastar una llamada de embedding + LLM en
        // mensajes que el servicio rechazarÃ¡ igualmente por longitud.
        if (mensaje.length > chatConfig.chat.maxMessageLength) {
            return res.status(400).json({
                success: false,
                message: `El mensaje no puede exceder ${chatConfig.chat.maxMessageLength} caracteres`,
            });
        }

        const isVisitor = req.isVisitor || req.user?.isVisitor || false;
        const idUsuario = isVisitor ? null : (req.user?.user || null);
        let effectiveVisitorId = visitorId || req.user?.visitorId || null;
        const ipHash = hashIdentifier(getRequestIp(req)) || 'sin-ip';

        let effectiveSessionId = await resolveSessionId({ sessionId, idUsuario, visitorId: effectiveVisitorId });
        if (!effectiveSessionId) {
            if (idUsuario) {
                effectiveSessionId = `user-${idUsuario}-${Date.now()}`;
            } else {
                effectiveSessionId = effectiveVisitorId || `anon-${uuidv4()}`;
                if (!effectiveVisitorId) {
                    effectiveVisitorId = effectiveSessionId;
                    req.user = { ...(req.user || {}), visitorId: effectiveSessionId };
                }
            }
        }

        const scope = idUsuario ? 'auth' : 'anon';
        const identifier = (idUsuario ? `u:${idUsuario}` : `v:${effectiveVisitorId || ipHash}`).toString();

        const rateResult = await guardrailsService.checkAndIncrement({ scope, identifier });
        if (!rateResult.allowed) {
            return res.status(rateResult.manuallyBlocked ? 403 : 429).json({
                success: false,
                blocked: !!rateResult.manuallyBlocked,
                message: rateResult.manuallyBlocked
                    ? 'El uso del chat no estÃ¡ disponible desde este dispositivo. Si crees que es un error, contÃ¡ctanos.'
                    : `LÃ­mite de ${rateResult.limit} preguntas alcanzado. Intenta en ${rateResult.retryAfter} segundos.`,
                retryAfter: rateResult.retryAfter,
                rate: rateResult,
            });
        }

        if (!idUsuario) {
            const ipLimit = await guardrailsService.checkAndIncrement({
                scope: 'anon_ip',
                identifier: ipHash,
                limitOverride: LIMITE_VISITANTE_POR_IP,
                windowHoursOverride: 24,
            });
            if (!ipLimit.allowed) {
                return res.status(429).json({
                    success: false,
                    message: `Límite de ${ipLimit.limit} preguntas alcanzado por dirección de red. Intenta en ${ipLimit.retryAfter} segundos.`,
                    retryAfter: ipLimit.retryAfter,
                });
            }
        }

        const evaluacion = await guardrailsService.evaluarEntrada(mensaje);
        // Mensaje con PII enmascarada: es el que se envÃ­a al LLM y se persiste.
        const mensajeProcesado = evaluacion.mensajeSeguro || mensaje;

        if (evaluacion.decision === 'protocolo') {
            const protocolo = evaluacion.protocolo;
            const conversacion = await models.ChatConversacion.create({
                tipo: 'publico',
                id_usuario: idUsuario,
                id_usuario_anonimo: effectiveVisitorId,
                session_id: effectiveSessionId,
                mensaje_usuario: mensajeProcesado,
                respuesta_bot: protocolo.respuesta_canonica,
                consentimiento: !!consentimiento,
                metadata: { ...metadata, protocolo_categoria: protocolo.categoria },
                tiempo_respuesta: 0,
                tokens_usados: 0,
            });

            return res.json({
                success: true,
                decision: 'protocolo',
                respuesta: protocolo.respuesta_canonica,
                categoria: protocolo.categoria,
                accion_requerida: protocolo.accion_requerida,
                id_conversacion: conversacion.id_conversacion,
                responseTime: 0,
                tokensUsed: 0,
            });
        }

        const ragDetalle = await openaiService.obtenerRAGDetalle(mensajeProcesado, 'publico', evaluacion.embeddings);

        const canonical = await learningService.findCanonicalResponse(mensajeProcesado, evaluacion.embeddings, 'publico');
        if (canonical) {
            const conversacion = await models.ChatConversacion.create({
                tipo: 'publico',
                id_usuario: idUsuario,
                id_usuario_anonimo: effectiveVisitorId,
                session_id: effectiveSessionId,
                mensaje_usuario: mensajeProcesado,
                respuesta_bot: canonical.respuesta_canonica,
                consentimiento: !!consentimiento,
                metadata: { ...metadata, canonical_match: true, id_canonica: canonical.id_canonica },
                tiempo_respuesta: 0,
                tokens_usados: 0,
            });

            return res.json({
                success: true,
                decision: 'canonica',
                respuesta: canonical.respuesta_canonica,
                id_conversacion: conversacion.id_conversacion,
                responseTime: 0,
                tokensUsed: 0,
            });
        }

        const result = await openaiService.chatPublico({
            mensaje: mensajeProcesado,
            promptId,
            idUsuario,
            idUsuarioAnonimo: effectiveVisitorId,
            consentimiento,
            sessionId: effectiveSessionId,
            visitorId: effectiveVisitorId,
            ragDetalle,
        });

        res.json({
            success: true,
            decision: 'responder',
            respuesta: result.respuesta,
            id_conversacion: result.id_conversacion,
            responseTime: result.responseTime,
            tokensUsed: result.tokensUsed,
        });
    } catch (error) {
        if (error.code === 'RATE_LIMIT_EXCEEDED') {
            return res.status(429).json({
                success: false,
                message: error.message,
                retryAfter: error.retryAfter,
            });
        }
        console.error('Error en enviarMensaje:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
        });
    }
};

const FEEDBACK_SCHEMA = {
    id_conversacion: { type: 'integer', required: true, min: 1 },
    calificacion: { type: 'integer', required: true, min: 1, max: 5 },
    comentario: { type: 'string', maxLength: 1000 },
};

const enviarFeedback = async (req, res) => {
    try {
        let payload;
        try {
            payload = validatePayload(req.body, FEEDBACK_SCHEMA);
        } catch (validationError) {
            if (validationError instanceof ValidationError) {
                return res.status(400).json({ success: false, message: validationError.message });
            }
            throw validationError;
        }

        const { id_conversacion, calificacion, comentario } = payload;
        const { learningService, configService } = require('../../services/chat.services');

        const isVisitor = req.isVisitor || req.user?.isVisitor || false;
        const idUsuario = isVisitor ? null : (req.user?.user || null);
        const effectiveVisitorId = req.user?.visitorId || req.headers?.['visitor-id'] || null;

        const conversacion = await models.ChatConversacion.findByPk(id_conversacion);
        if (!conversacion) {
            return res.status(404).json({ success: false, message: 'ConversaciÃ³n no encontrada' });
        }

        if (!ownsConversation(conversacion, { idUsuario, visitorId: effectiveVisitorId })) {
            return res.status(404).json({ success: false, message: 'Conversación no encontrada' });
        }

        const feedbackValido = calificacion >= 1 && calificacion <= 5;

        if (!feedbackValido) {
            return res.status(400).json({
                success: false,
                message: 'La calificaciÃ³n debe estar entre 1 y 5',
            });
        }

        const config = await configService.getConfig();
        const feedbackThreshold = config.feedback_threshold !== undefined
            ? config.feedback_threshold
            : 2;

        if (calificacion <= feedbackThreshold) {
            setImmediate(async () => {
                try {
                    await learningService.evaluarConversacion({
                        idConversacion: parseInt(id_conversacion),
                        mensaje: conversacion.mensaje_usuario,
                        respuesta: conversacion.respuesta_bot,
                        feedback: calificacion,
                    });
                } catch (e) {
                    console.error('Learning evaluation error on feedback:', e);
                }
            });
        }

        res.json({
            success: true,
            message: 'Feedback recibido exitosamente',
        });
    } catch (error) {
        console.error('Error en feedback:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

const REGISTRO_ANONIMO_SCHEMA = {
    cedula: { type: 'string', required: true, minLength: 5, maxLength: 20, pattern: /^[A-Za-z0-9-]+$/ },
    nombre: { type: 'string', required: true, minLength: 2, maxLength: 120 },
};

const registrarAnonimo = async (req, res) => {
    try {
        let payload;
        try {
            payload = validatePayload(req.body, REGISTRO_ANONIMO_SCHEMA);
        } catch (validationError) {
            if (validationError instanceof ValidationError) {
                return res.status(400).json({ success: false, message: validationError.message });
            }
            throw validationError;
        }

        const { cedula, nombre } = payload;
        const existing = await models.ChatUsuarioAnonimo.findOne({ where: { cedula } });

        if (existing) {
            return res.json({
                success: true,
                data: {
                    id_usuario_anonimo: existing.id_usuario_anonimo,
                    nombre: nombre,
                },
                isUpdate: false,
            });
        }

        try {
            const usuario = await models.ChatUsuarioAnonimo.create({ cedula, nombre });
            return res.status(201).json({
                success: true,
                data: {
                    id_usuario_anonimo: usuario.id_usuario_anonimo,
                    nombre: nombre,
                },
            });
        } catch (createError) {
            if (createError.name === 'SequelizeUniqueConstraintError') {
                const race = await models.ChatUsuarioAnonimo.findOne({ where: { cedula } });
                return res.json({
                    success: true,
                    data: {
                        id_usuario_anonimo: race ? race.id_usuario_anonimo : null,
                        nombre: nombre,
                    },
                });
            }
            throw createError;
        }
    } catch (error) {
        console.error('Error registrando anónimo:', error);
        res.status(500).json({ success: false, message: 'No fue posible registrar al usuario anónimo' });
    }
};

const PREGUNTA_ANONIMA_SCHEMA = {
    nombre: { type: 'string', maxLength: 120 },
    cedula: { type: 'string', maxLength: 20, pattern: /^[A-Za-z0-9-]+$/ },
    pregunta: { type: 'string', required: true, minLength: 3, maxLength: 2000 },
    id_usuario_anonimo: { type: 'integer', min: 1 },
};

const crearPreguntaAnonima = async (req, res) => {
    try {
        let payload;
        try {
            payload = validatePayload(req.body, PREGUNTA_ANONIMA_SCHEMA);
        } catch (validationError) {
            if (validationError instanceof ValidationError) {
                return res.status(400).json({ success: false, message: validationError.message });
            }
            throw validationError;
        }

        const { nombre, cedula, pregunta, id_usuario_anonimo } = payload;

        const preguntaAn = await models.ChatPreguntaAnonima.create({
            nombre: nombre || null,
            cedula: cedula || null,
            pregunta,
            id_usuario_anonimo: id_usuario_anonimo || null,
        });

        res.status(201).json({
            success: true,
            message: 'Pregunta anÃ³nima enviada exitosamente',
            data: preguntaAn,
        });
    } catch (error) {
        console.error('Error creando pregunta anónima:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

const getLimits = async (req, res) => {
    try {
        const isVisitor = req.isVisitor || req.user?.isVisitor || false;
        const idUsuario = isVisitor ? null : (req.user?.user || null);
        const effectiveVisitorId = req.user?.visitorId || req.headers?.['visitor-id'] || null;
        const ipHash = hashIdentifier(getRequestIp(req)) || 'sin-ip';

        const scope = idUsuario ? 'auth' : 'anon';
        const identifier = (idUsuario ? `u:${idUsuario}` : `v:${effectiveVisitorId || ipHash}`).toString();

        const rate = await guardrailsService.getRateLimitStatus({ scope, identifier });

        res.json({
            success: true,
            data: {
                isVisitor,
                scope,
                identifier,
                limite: rate.limit,
                contador: rate.count,
                restantes: rate.remaining,
                reseteaEnSeg: rate.resetsInSec || 0,
            },
        });
    } catch (error) {
        console.error('Error obteniendo lÃ­mites:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    enviarMensaje,
    enviarFeedback,
    registrarAnonimo,
    crearPreguntaAnonima,
    getLimits,
};
