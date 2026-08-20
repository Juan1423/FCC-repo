'use strict';

const { openaiService, guardrailsService, learningService, conversationsService } = require('../../services/chat.services');
const { models } = require('../../libs/sequelize');
const { v4: uuidv4 } = require('uuid');

const enviarMensaje = async (req, res) => {
    try {
        const { mensaje, sessionId = null } = req.body;

        if (!mensaje || !mensaje.trim()) {
            return res.status(400).json({
                success: false,
                message: 'El mensaje es requerido',
            });
        }

        const idUsuario = req.user.user;
        const effectiveSessionId = sessionId || `asistente-${idUsuario}-${Date.now()}`;

        const rateResult = guardrailsService.checkRateLimit({ scope: 'auth', identifier: idUsuario });
        if (!rateResult.allowed) {
            return res.status(429).json({
                success: false,
                message: `Has alcanzado el límite de ${rateResult.limit} mensajes. Intenta en ${rateResult.retryAfter} segundos.`,
                retryAfter: rateResult.retryAfter,
                remaining: 0,
            });
        }

        const evaluacion = await guardrailsService.evaluadorEntrada(mensaje);

        if (evaluacion.decision === 'protocolo') {
            const protocolo = evaluacion.protocolo;
            const conversacion = await models.ChatConversacion.create({
                tipo: 'interno',
                id_usuario: idUsuario,
                session_id: effectiveSessionId,
                mensaje_usuario: mensaje,
                respuesta_bot: protocolo.respuesta_canonica,
                consentimiento: true,
                metadata: { protocolo_categoria: protocolo.categoria },
                flag_revision: true,
                motivo_revision: 'tema_sensible',
                tiempo_respuesta: 0,
                tokens_usados: 0,
            });

            setImmediate(async () => {
                try {
                    await learningService.addToRevision({
                        idConversacion: conversacion.id_conversacion,
                        triggerType: 'tema_sensible',
                        mensajeUsuario: mensaje,
                        respuestaIa: protocolo.respuesta_canonica,
                        sugerencia: null,
                    });
                } catch (e) {
                    console.warn('Learning addToRevision error:', e.message);
                }
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
                tipo: 'interno',
                id_usuario: idUsuario,
                session_id: effectiveSessionId,
                mensaje_usuario: mensaje,
                respuesta_bot: offlineResponse,
                consentimiento: true,
                metadata: { off_topic: true, matchTema: evaluacion.matchTema?.tema || null },
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
                tipo: 'interno',
                id_usuario: idUsuario,
                session_id: effectiveSessionId,
                mensaje_usuario: mensaje,
                respuesta_bot: canonical.respuesta_canonica,
                consentimiento: true,
                metadata: { canonical_match: true, id_canonica: canonical.id_canonica },
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

        const result = await openaiService.chatInterno({
            mensaje,
            idUsuario,
            sessionId: effectiveSessionId,
        });

        res.json({
            success: true,
            respuesta: result.respuesta,
            id_conversacion: result.id_conversacion,
            sessionId: effectiveSessionId,
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
        console.error('Error en chat interno:', error.message);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const listarHistorial = async (req, res) => {
    try {
        const { page = 1, limit = 50, tipo = 'interno', id_usuario, fecha_desde, fecha_hasta } = req.query;
        const offset = (page - 1) * limit;

        const where = { tipo: tipo || 'interno' };
        if (id_usuario) where.id_usuario = id_usuario;

        if (fecha_desde || fecha_hasta) {
            where.fecha_conversacion = {};
            const { Op } = require('sequelize');
            if (fecha_desde) where.fecha_conversacion[Op.gte] = new Date(fecha_desde);
            if (fecha_hasta) where.fecha_conversacion[Op.lte] = new Date(fecha_hasta);
        }

        const rows = await models.ChatConversacion.findAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [['fecha_conversacion', 'DESC']],
        });

        res.json({
            success: true,
            data: rows,
            pagination: { page: parseInt(page), limit: parseInt(limit) },
        });
    } catch (error) {
        console.error('Error listando historial interno:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const exportarCSV = async (req, res) => {
    try {
        const { startDate, endDate, tipo = 'interno' } = req.query;
        const csv = await conversationsService.exportCSV({ startDate, endDate, tipo });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=historial_ia_${new Date().toISOString().slice(0, 10)}.csv`);
        res.send(csv);
    } catch (error) {
        console.error('Error exportando CSV:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    enviarMensaje,
    listarHistorial,
    exportarCSV,
};
