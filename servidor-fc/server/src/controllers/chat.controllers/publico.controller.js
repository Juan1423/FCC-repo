'use strict';

const { openaiService, guardrailsService, learningService } = require('../../services/chat.services');
const { models } = require('../../libs/sequelize');
const { v4: uuidv4 } = require('uuid');

const enviarMensaje = async (req, res) => {
    try {
        const { mensaje, promptId = null, consentimiento = false, metadata = {}, sessionId = null, visitorId = null } = req.body;

        if (!mensaje || !mensaje.trim()) {
            return res.status(400).json({
                success: false,
                message: 'El mensaje es requerido',
            });
        }

        const isVisitor = req.isVisitor || req.user?.isVisitor || false;
        const idUsuario = isVisitor ? null : (req.user?.user || null);
        const effectiveVisitorId = visitorId || req.user?.visitorId || null;

        let effectiveSessionId = sessionId;
        if (!effectiveSessionId) {
            if (idUsuario) {
                effectiveSessionId = `user-${idUsuario}-${Date.now()}`;
            } else {
                effectiveSessionId = effectiveVisitorId || `anon-${uuidv4()}`;
                if (!effectiveVisitorId) {
                    req.user = { ...(req.user || {}), visitorId: effectiveSessionId };
                }
            }
        }

        const scope = idUsuario ? 'auth' : 'anon';
        const identifier = (idUsuario || effectiveVisitorId || `anon-${uuidv4()}`).toString();

        const rateResult = await guardrailsService.checkAndIncrement({ scope, identifier });
        if (!rateResult.allowed) {
            return res.status(429).json({
                success: false,
                message: `Límite de ${rateResult.limit} preguntas alcanzado. Intenta en ${rateResult.retryAfter} segundos.`,
                retryAfter: rateResult.retryAfter,
                rate: rateResult,
            });
        }

        const evaluacion = await guardrailsService.evaluarEntrada(mensaje);

        if (evaluacion.decision === 'protocolo') {
            const protocolo = evaluacion.protocolo;
            const conversacion = await models.ChatConversacion.create({
                tipo: 'publico',
                id_usuario: idUsuario,
                id_usuario_anonimo: effectiveVisitorId,
                session_id: effectiveSessionId,
                mensaje_usuario: mensaje,
                respuesta_bot: protocolo.respuesta_canonica,
                consentimiento: !!consentimiento,
                metadata: { ...metadata, protocolo_categoria: protocolo.categoria },
                flag_revision: true,
                motivo_revision: 'tema_sensible',
                tiempo_respuesta: 0,
                tokens_usados: 0,
            });

            await require('../../services/chat.services').learningService.addToRevision({
                idConversacion: conversacion.id_conversacion,
                triggerType: 'tema_sensible',
                mensajeUsuario: mensaje,
                respuestaIa: protocolo.respuesta_canonica,
                sugerencia: null,
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

        if (evaluacion.decision === 'off_topic') {
            const offlineResponse = "Agradezco tu consulta, pero solo cuento con información sobre los servicios, programas y actividades de la Fundación con Cristo. Si tienes preguntas sobre nuestros servicios de salud, programas comunitarios, horarios, ubicación o cómo colaborar con nosotros, estaré encantado de ayudarte.";

            const conversacion = await models.ChatConversacion.create({
                tipo: 'publico',
                id_usuario: idUsuario,
                id_usuario_anonimo: effectiveVisitorId,
                session_id: effectiveSessionId,
                mensaje_usuario: mensaje,
                respuesta_bot: offlineResponse,
                consentimiento: !!consentimiento,
                metadata: { ...metadata, off_topic: true, matchTema: evaluacion.matchTema?.tema || null },
                flag_revision: true,
                motivo_revision: 'off_topic',
                tiempo_respuesta: 0,
                tokens_usados: 0,
            });

            return res.json({
                success: true,
                decision: 'off_topic',
                respuesta: offlineResponse,
                id_conversacion: conversacion.id_conversacion,
                responseTime: 0,
                tokensUsed: 0,
            });
        }

        const canonical = await learningService.findCanonicalResponse(mensaje, evaluacion.embeddings);
        if (canonical) {
            const conversacion = await models.ChatConversacion.create({
                tipo: 'publico',
                id_usuario: idUsuario,
                id_usuario_anonimo: effectiveVisitorId,
                session_id: effectiveSessionId,
                mensaje_usuario: mensaje,
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
            mensaje,
            promptId,
            idUsuario,
            idUsuarioAnonimo: effectiveVisitorId,
            consentimiento,
            sessionId: effectiveSessionId,
            visitorId: effectiveVisitorId,
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
        console.error('Error en enviarMensaje:', error.message);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const enviarFeedback = async (req, res) => {
    try {
        const { id_conversacion, calificacion, comentario } = req.body;
        const { learningService } = require('../../services/chat.services');

        if (!id_conversacion) {
            return res.status(400).json({ success: false, message: 'id_conversacion es requerido' });
        }

        const conversacion = await models.ChatConversacion.findByPk(id_conversacion);
        if (!conversacion) {
            return res.status(404).json({ success: false, message: 'Conversación no encontrada' });
        }

        const feedbackValido = calificacion >= 1 && calificacion <= 5;

        if (!feedbackValido || calificacion <= 2) {
            setImmediate(async () => {
                try {
                    await learningService.evaluarConversacion({
                        idConversacion: parseInt(id_conversacion),
                        mensaje: conversacion.mensaje_usuario,
                        respuesta: conversacion.respuesta_bot,
                        feedback: calificacion,
                    });
                } catch (e) {
                    console.warn('Learning evaluation error on feedback:', e.message);
                }
            });
        }

        res.json({
            success: true,
            message: 'Feedback recibido exitosamente',
        });
    } catch (error) {
        console.error('Error en feedback:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const registrarAnonimo = async (req, res) => {
    try {
        const { cedula, nombre } = req.body;
        const { models: seqModels } = require('../../libs/sequelize');

        if (!cedula || !nombre) {
            return res.status(400).json({
                success: false,
                message: 'cedula y nombre son requeridos',
            });
        }

        const existing = await seqModels.ChatUsuarioAnonimo.findOne({ where: { cedula } });
        if (existing) {
            return res.json({
                success: true,
                data: existing,
                isUpdate: false,
            });
        }

        const usuario = await seqModels.ChatUsuarioAnonimo.create({ cedula, nombre });
        res.status(201).json({
            success: true,
            data: usuario,
        });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            const { cedula, nombre } = req.body;
            const existing = await models.ChatUsuarioAnonimo.findOne({ where: { cedula } });
            return res.json({ success: true, data: existing });
        }
        console.error('Error registrando anónimo:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const crearPreguntaAnonima = async (req, res) => {
    try {
        const { nombre, cedula, pregunta, id_usuario_anonimo } = req.body;

        if (!pregunta || !pregunta.trim()) {
            return res.status(400).json({ success: false, message: 'La pregunta es requerida' });
        }

        const preguntaAn = await models.ChatPreguntaAnonima.create({
            nombre: nombre || null,
            cedula: cedula || null,
            pregunta,
            id_usuario_anonimo: id_usuario_anonimo || null,
        });

        res.status(201).json({
            success: true,
            message: 'Pregunta anónima enviada exitosamente',
            data: preguntaAn,
        });
    } catch (error) {
        console.error('Error creando pregunta anónima:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getLimits = async (req, res) => {
    try {
        const isVisitor = req.isVisitor || req.user?.isVisitor || false;
        const idUsuario = isVisitor ? null : (req.user?.user || null);
        const effectiveVisitorId = req.headers['visitor-id'] || req.user?.visitorId || null;

        const scope = idUsuario ? 'auth' : 'anon';
        const identifier = (idUsuario || effectiveVisitorId || `anon-${uuidv4()}`).toString();

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
        console.error('Error obteniendo límites:', error.message);
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
