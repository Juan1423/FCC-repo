'use strict';

const { models } = require('../../libs/sequelize');
const { Op } = require('sequelize');
const chatConfig = require('../../config/chatConfig');
const RAGService = require('./rag.service');

class LearningService {
    constructor() {
        this.ragService = new RAGService();
        this.configCache = null;
        this.configExpiry = 0;
    }

    async loadConfig() {
        if (this.configCache && Date.now() < this.configExpiry) {
            return this.configCache;
        }
        const rows = await models.ChatConfiguracion.findAll({ raw: true });
        const config = {};
        for (const row of rows) {
            let val = row.valor;
            switch (row.tipo) {
                case 'number': val = parseInt(val, 10); break;
                case 'float': val = parseFloat(val); break;
                case 'boolean': val = val === 'true'; break;
                default: val = row.valor;
            }
            config[row.clave] = val;
        }
        this.configCache = config;
        this.configExpiry = Date.now() + 5 * 60 * 1000;
        return config;
    }

    normalize(text) {
        if (!text) return '';
        return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    }

    async addToRevision({ idConversacion, triggerType, mensajeUsuario, respuestaIa, sugerencia = null }) {
        try {
            const existing = await models.ChatConversacionRevision.findOne({
                where: { id_conversacion: idConversacion, status: 'pendiente' },
            });

            if (existing) {
                return existing;
            }

            const revision = await models.ChatConversacionRevision.create({
                id_conversacion: idConversacion,
                trigger_type: triggerType,
                mensaje_usuario: mensajeUsuario,
                respuesta_ia: respuestaIa,
                sugerencia_respuesta: sugerencia,
                status: 'pendiente',
            });

            return revision;
        } catch (error) {
            console.error('Error adding to revision:', error.message);
            return null;
        }
    }

    async evaluarConversacion({ idConversacion, mensaje, respuesta, feedback = null }) {
        try {
            const config = await this.loadConfig();
            const minLength = config.min_respuesta_length !== undefined ? config.min_respuesta_length : 50;
            const maxLength = config.max_respuesta_length !== undefined ? config.max_respuesta_length : 2000;
            const feedbackThreshold = config.feedback_threshold !== undefined ? config.feedback_threshold : 2;

            let triggerType = null;

            if (feedback !== null && feedback <= feedbackThreshold) {
                triggerType = 'feedback_negativo';
            }

            if (!triggerType && respuesta) {
                if (respuesta.trim().length < minLength) {
                    triggerType = 'respuesta_corta';
                }
                if (!triggerType && respuesta.trim().length > maxLength) {
                    triggerType = 'respuesta_larga';
                }
            }

            if (!triggerType && respuesta) {
                const normalized = this.normalize(respuesta);
                const errorKeywords = ['incorrecto', 'error', 'no entiendo', 'mal', 'mentira', 'no es correcto'];
                for (const kw of errorKeywords) {
                    if (normalized.includes(kw)) {
                        triggerType = 'palabra_error';
                        break;
                    }
                }
            }

            if (!triggerType && respuesta && mensaje) {
                const mensajeNormalized = this.normalize(mensaje);
                const existing = await models.ChatConversacion.findOne({
                    where: {
                        session_id: { [Op.ne]: null },
                        mensaje_usuario: { [Op.ne]: null },
                    },
                    order: [['fecha_conversacion', 'DESC']],
                    limit: 10,
                    raw: true,
                });
                if (existing) {
                    const similarCount = await models.ChatConversacion.count({
                        where: {
                            mensaje_usuario: { [Op.iLike]: `%${mensajeNormalized}%` },
                            fecha_conversacion: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) },
                        },
                    });
                    if (similarCount >= 3) {
                        triggerType = 'repeticion';
                    }
                }
            }

            if (!triggerType && respuesta) {
                const normalized = this.normalize(respuesta);
                if (normalized.includes('no tengo información suficiente') ||
                    normalized.includes('no encontré información') ||
                    normalized.includes('no tengo datos')) {
                    triggerType = 'sin_info';
                }
            }

            if (triggerType) {
                await this.addToRevision({
                    idConversacion,
                    triggerType,
                    mensajeUsuario: mensaje,
                    respuestaIa: respuesta,
                    sugerencia: null,
                });
            }

            return { triggerType, flagged: !!triggerType };
        } catch (error) {
            console.error('Error evaluating conversation:', error.message);
            return { triggerType: null, flagged: false };
        }
    }

    async findCanonicalResponse(mensaje, queryEmbedding = null) {
        try {
            const config = await this.loadConfig();
            const threshold = config.canonical_response_threshold !== undefined
                ? config.canonical_response_threshold
                : 0.85;

            const items = await models.ChatRespuestaCanonica.findAll({
                where: { activo: true },
                attributes: ['id_canonica', 'patron_trigger', 'embedding_trigger', 'respuesta_canonica', 'categoria', 'prioridad', 'usos_count'],
                raw: true,
            });

            if (items.length === 0) return null;

            const regexMatches = [];
            const embeddingItems = [];

            for (const item of items) {
                try {
                    const regex = new RegExp(item.patron_trigger, 'i');
                    if (regex.test(mensaje)) {
                        regexMatches.push(item);
                    }
                } catch (e) {
                    const normalizedTrigger = this.normalize(item.patron_trigger);
                    if (normalizedTrigger && this.normalize(mensaje).includes(normalizedTrigger)) {
                        regexMatches.push(item);
                    }
                }

                if (item.embedding_trigger) {
                    embeddingItems.push(item);
                }
            }

            if (regexMatches.length > 0) {
                regexMatches.sort((a, b) => b.prioridad - a.prioridad);
                const selected = regexMatches[0];
                await models.ChatRespuestaCanonica.increment('usos_count', {
                    where: { id_canonica: selected.id_canonica },
                });
                return selected;
            }

            if (queryEmbedding && embeddingItems.length > 0) {
                const similares = await this.ragService.searchSimilarByEmbeddings(
                    queryEmbedding,
                    embeddingItems,
                    threshold,
                    1
                );
                if (similares.length > 0) {
                    const selected = similares[0];
                    await models.ChatRespuestaCanonica.increment('usos_count', {
                        where: { id_canonica: selected.id_canonica },
                    });
                    return selected;
                }
            }

            return null;
        } catch (error) {
            console.error('Error finding canonical response:', error.message);
            return null;
        }
    }

    async listPendingRevisions({ page = 1, limit = 20, status = 'pendiente' }) {
        const offset = (page - 1) * limit;
        const where = status ? { status } : {};
        const { rows, count } = await models.ChatConversacionRevision.findAndCountAll({
            where,
            include: [
                {
                    model: models.ChatConversacion,
                    as: 'conversacion',
                    attributes: ['id_conversacion', 'tipo', 'session_id', 'id_usuario', 'id_usuario_anonimo', 'fecha_conversacion'],
                },
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });
        return { rows, count, page, limit };
    }

    async approveRevision({ idRevision, respuestaCanonica, patronTrigger, adminId }) {
        const revision = await models.ChatConversacionRevision.findByPk(idRevision);
        if (!revision) {
            throw new Error('Revisión no encontrada');
        }

        let embeddingTrigger = null;
        try {
            embeddingTrigger = await this.ragService.generateEmbedding(patronTrigger || respuestaCanonica);
        } catch (e) {
            console.warn('Could not generate embedding for trigger:', e.message);
        }

        const canonica = await models.ChatRespuestaCanonica.create({
            patron_trigger: patronTrigger || respuestaCanonica,
            embedding_trigger: embeddingTrigger ? JSON.stringify(embeddingTrigger) : null,
            respuesta_canonica: respuestaCanonica,
            categoria: revision.trigger_type,
            prioridad: 1,
            activo: true,
            creado_por: adminId,
            creado_desde_revision: idRevision,
        });

        await revision.update({
            status: 'aprobado',
            reviewed_by: adminId,
            reviewed_at: new Date(),
        });

        this.ragService.invalidateCache();

        return canonica;
    }

    async rejectRevision({ idRevision, adminId }) {
        const revision = await models.ChatConversacionRevision.findByPk(idRevision);
        if (!revision) {
            throw new Error('Revisión no encontrada');
        }

        await revision.update({
            status: 'rechazado',
            reviewed_by: adminId,
            reviewed_at: new Date(),
        });

        return revision;
    }

    async getStats() {
        const total = await models.ChatConversacionRevision.count();
        const pendientes = await models.ChatConversacionRevision.count({ where: { status: 'pendiente' } });
        const aprobadas = await models.ChatConversacionRevision.count({ where: { status: 'aprobado' } });
        const rechazadas = await models.ChatConversacionRevision.count({ where: { status: 'rechazado' } });

        const triggerDistribution = await models.ChatConversacionRevision.findAll({
            attributes: [
                'trigger_type',
                [require('sequelize').fn('COUNT', require('sequelize').col('trigger_type')), 'count'],
            ],
            group: ['trigger_type'],
            raw: true,
        });

        return { total, pendientes, aprobadas, rechazadas, triggerDistribution };
    }
}

module.exports = LearningService;
