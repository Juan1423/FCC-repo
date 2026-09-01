'use strict';

const { models } = require('../../libs/sequelize');
const chatConfig = require('../../config/chatConfig');

class GuardrailsService {
    constructor() {
        this.counters = new Map();
        this.configCache = null;
        this.configExpiry = 0;
    }

    async loadConfig() {
        if (this.configCache && Date.now() < this.configExpiry) {
            return this.configCache;
        }
        const configRows = await models.ChatConfiguracion.findAll({ raw: true });
        const config = {};
        for (const row of configRows) {
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

    getConfig() {
        return this.configCache || {};
    }

    normalize(text) {
        if (!text) return '';
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    async detectSensitiveTopic(mensaje) {
        const normalized = this.normalize(mensaje);
        if (!normalized) return null;

        const protocolos = await models.ChatProtocoloSensible.findAll({
            where: { activo: true },
            attributes: ['id_protocolo', 'categoria', 'palabras_clave', 'embedding_keywords', 'respuesta_canonica', 'accion_requerida', 'prioridad'],
            raw: true,
        });

        if (protocolos.length === 0) return null;

        let bestMatch = null;
        let bestScore = 0;

        for (const protocolo of protocolos) {
            let keywords = [];
            try {
                keywords = JSON.parse(protocolo.palabras_clave);
            } catch (e) {
                continue;
            }

            let matched = false;
            for (const kw of keywords) {
                const kwNorm = this.normalize(kw);
                if (kwNorm && normalized.includes(kwNorm)) {
                    matched = true;
                    break;
                }
            }

            if (matched) {
                if (protocolo.prioridad > bestScore) {
                    bestScore = protocolo.prioridad;
                    bestMatch = protocolo;
                }
            }
        }

        return bestMatch;
    }

    async isOnTopic(mensaje, queryEmbedding) {
        const config = await this.loadConfig();
        const threshold = config.off_topic_threshold !== undefined ? config.off_topic_threshold : chatConfig.security.blockSuspiciousPatterns;

        if (!queryEmbedding) {
            return { onTopic: true, matchedTema: null, score: 0 };
        }

        const temas = await models.ChatTemaValido.findAll({
            where: { activo: true },
            attributes: ['id_tema', 'tema', 'descripcion', 'embedding'],
            raw: true,
        });

        let maxScore = 0;
        let matchedTema = null;

        for (const tema of temas) {
            let temaEmbedding = null;
            if (tema.embedding) {
                try {
                    temaEmbedding = typeof tema.embedding === 'string' ? JSON.parse(tema.embedding) : tema.embedding;
                } catch (e) {
                    continue;
                }
            }

            if (!temaEmbedding && tema.descripcion) {
                try {
                    temaEmbedding = await this.generateEmbedding(tema.descripcion);
                    await models.ChatTemaValido.update(
                        { embedding: JSON.stringify(temaEmbedding) },
                        { where: { id_tema: tema.id_tema } }
                    );
                } catch (e) {
                    continue;
                }
            }

            if (temaEmbedding) {
                const score = this.cosineSimilarity(queryEmbedding, temaEmbedding);
                if (score > maxScore) {
                    maxScore = score;
                    matchedTema = tema;
                }
            }
        }

        const onTopic = maxScore >= (typeof threshold === 'number' ? threshold : 0.65);
        return { onTopic, matchedTema, score: maxScore };
    }

    cosineSimilarity(vecA, vecB) {
        if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
        let dot = 0, normA = 0, normB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dot += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        if (normA === 0 || normB === 0) return 0;
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    async generateEmbedding(text) {
        const { OpenAI } = require('openai');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const response = await openai.embeddings.create({
            model: chatConfig.embeddingModel || 'text-embedding-ada-002',
            input: text.substring(0, 8000),
        });
        return response.data[0].embedding;
    }

    checkRateLimit({ scope, identifier }) {
        const config = this.getConfig();
        const limitKey = scope === 'auth'
            ? 'rate_limit_autenticado_diario'
            : 'rate_limit_visitante_diario';
        const windowKey = 'rate_limit_ventana_horas';

        const limit = config[limitKey] !== undefined
            ? config[limitKey]
            : (scope === 'auth' ? 50 : 5);
        const windowHours = config[windowKey] !== undefined ? config[windowKey] : 24;

        return this._checkInMemory(scope, identifier, limit, windowHours * 60 * 60 * 1000);
    }

    _checkInMemory(scope, identifier, limit, windowMs) {
        const key = `${scope}:${identifier}`;
        const now = Date.now();

        let counter = this.counters.get(key);
        if (!counter || (now - counter.startTime) > windowMs) {
            counter = { count: 1, startTime: now, resetAt: now + windowMs };
        } else {
            counter.count++;
        }

        this.counters.set(key, counter);

        const blocked = counter.count > limit;
        return {
            allowed: !blocked,
            remaining: blocked ? 0 : Math.max(limit - counter.count, 0),
            retryAfter: blocked ? Math.ceil((counter.resetAt - now) / 1000) : 0,
            limit,
            count: counter.count,
        };
    }

    async checkAndIncrement({ scope, identifier }) {
        const config = await this.loadConfig();
        const limitKey = scope === 'auth'
            ? 'rate_limit_autenticado_diario'
            : 'rate_limit_visitante_diario';
        const windowKey = 'rate_limit_ventana_horas';

        const limit = config[limitKey] !== undefined
            ? config[limitKey]
            : (scope === 'auth' ? 50 : 5);
        const windowHours = config[windowKey] !== undefined ? config[windowKey] : 24;
        const windowMs = windowHours * 60 * 60 * 1000;
        const now = Date.now();
        const key = `${scope}:${identifier}`;

        try {
            const row = await models.ChatRateLimit.findByPk(key);

            if (!row) {
                await models.ChatRateLimit.create({
                    id: key,
                    scope,
                    identifier,
                    conteo: 1,
                    ventana_inicio: new Date(now),
                    reset_at: new Date(now + windowMs),
                });
                return {
                    allowed: 1 <= limit,
                    remaining: Math.max(limit - 1, 0),
                    retryAfter: 0,
                    limit,
                    count: 1,
                };
            }

            const windowStart = new Date(row.ventana_inicio).getTime();
            let updated = row;
            if (now - windowStart >= windowMs) {
                updated = await row.update({
                    conteo: 1,
                    ventana_inicio: new Date(now),
                    reset_at: new Date(now + windowMs),
                });
            } else {
                updated = await row.increment('conteo');
                updated = await updated.reload();
            }

            const count = updated.conteo || 0;
            const resetAt = new Date(updated.reset_at).getTime();
            const blocked = count > limit;

            return {
                allowed: !blocked,
                remaining: blocked ? 0 : Math.max(limit - count, 0),
                retryAfter: blocked ? Math.max(0, Math.ceil((resetAt - now) / 1000)) : 0,
                limit,
                count,
            };
        } catch (dbError) {
            console.warn('RateLimit: fallback a memoria:', dbError.message);
            return this._checkInMemory(scope, identifier, limit, windowMs);
        }
    }

    async getRateLimitStatus({ scope, identifier }) {
        const config = await this.loadConfig();
        const limitKey = scope === 'auth'
            ? 'rate_limit_autenticado_diario'
            : 'rate_limit_visitante_diario';
        const windowKey = 'rate_limit_ventana_horas';

        const limit = config[limitKey] !== undefined
            ? config[limitKey]
            : (scope === 'auth' ? 50 : 5);
        const windowHours = config[windowKey] !== undefined ? config[windowKey] : 24;
        const windowMs = windowHours * 60 * 60 * 1000;
        const now = Date.now();
        const key = `${scope}:${identifier}`;

        try {
            const row = await models.ChatRateLimit.findByPk(key);
            if (!row || (now - new Date(row.ventana_inicio).getTime()) >= windowMs) {
                return {
                    allowed: true,
                    remaining: limit,
                    retryAfter: 0,
                    limit,
                    count: 0,
                    resetsInSec: Math.ceil(windowMs / 1000),
                };
            }

            const count = row.conteo || 0;
            const blocked = count > limit;
            const resetAt = new Date(row.reset_at).getTime();

            return {
                allowed: !blocked,
                remaining: blocked ? 0 : Math.max(limit - count, 0),
                retryAfter: blocked ? Math.max(0, Math.ceil((resetAt - now) / 1000)) : 0,
                limit,
                count,
                resetsInSec: Math.max(0, Math.ceil((resetAt - now) / 1000)),
            };
        } catch (dbError) {
            console.warn('RateLimit: estado desde valores por defecto:', dbError.message);
            const counter = this.counters.get(key);
            const count = counter && (now - counter.startTime) <= windowMs ? counter.count : 0;
            const resetAt = counter ? counter.resetAt : now + windowMs;
            const blocked = count > limit;
            return {
                allowed: !blocked,
                remaining: blocked ? 0 : Math.max(limit - count, 0),
                retryAfter: blocked ? Math.max(0, Math.ceil((resetAt - now) / 1000)) : 0,
                limit,
                count,
                resetsInSec: Math.max(0, Math.ceil((resetAt - now) / 1000)),
            };
        }
    }

    async persistCounters() {
        // Snapshot counters to persistent storage (optional - can be extended)
        // Currently a no-op; rate limiting persists in chat_rate_limit table
    }

    invalidateCache() {
        this.configCache = null;
        this.configExpiry = 0;
    }

    async getRateLimitLogs() {
        const logs = [];

        try {
            const rows = await models.ChatRateLimit.findAll({ logging: false });
            for (const row of rows) {
                logs.push({
                    scope: row.scope,
                    identifier: row.identifier,
                    count: row.conteo,
                    firstHit: new Date(row.ventana_inicio).toISOString(),
                    resetAt: new Date(row.reset_at).toISOString(),
                    persisted: true,
                    blocked: false,
                });
            }
        } catch (dbError) {
            console.warn('RateLimit: error leyendo logs de BD:', dbError.message);
        }

        const now = Date.now();
        for (const [key, counter] of this.counters.entries()) {
            const separatorIndex = key.indexOf(':');
            if (separatorIndex === -1) continue;
            const scope = key.slice(0, separatorIndex);
            const identifier = key.slice(separatorIndex + 1);
            logs.push({
                scope,
                identifier,
                count: counter.count,
                firstHit: new Date(counter.startTime).toISOString(),
                resetAt: new Date(counter.resetAt).toISOString(),
                persisted: false,
                blocked: counter.count > (this.getConfig()[scope === 'auth' ? 'rate_limit_autenticado_diario' : 'rate_limit_visitante_diario'] || 50),
            });
        }

        return logs;
    }

    async clearRateLimit(identifier) {
        for (const [key] of this.counters.entries()) {
            if (key.endsWith(`:${identifier}`)) {
                this.counters.delete(key);
            }
        }
        try {
            await models.ChatRateLimit.destroy({ where: { identifier } });
        } catch (dbError) {
            console.warn('RateLimit: error limpiando BD:', dbError.message);
        }
    }

    maskPII(texto) {
        if (!texto) return texto;
        let masked = texto;
        masked = masked.replace(/\b\d{10}\b/g, '[CÉDULA]');
        masked = masked.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[EMAIL]');
        masked = masked.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[TARJETA]');
        masked = masked.replace(/\b\d{10,15}\b/g, (match) => {
            if (match.length >= 10) return '[TELÉFONO]';
            return match;
        });
        return masked;
    }

    async evaluarEntrada(mensaje) {
        const normalized = this.normalize(mensaje);

        const sensitiveCheckFirst = this.getConfig().sensitive_check_first !== undefined
            ? this.getConfig().sensitive_check_first
            : true;

        if (sensitiveCheckFirst) {
            const protocolo = await this.detectSensitiveTopic(mensaje);
            if (protocolo) {
                return {
                    decision: 'protocolo',
                    protocolo,
                    embeddings: null,
                    matchTema: null,
                };
            }
        }

        let queryEmbedding = null;
        try {
            queryEmbedding = await this.generateEmbedding(mensaje);
        } catch (e) {
            console.warn('Could not generate embedding:', e.message);
        }

        const onTopicResult = await this.isOnTopic(mensaje, queryEmbedding);
        if (!onTopicResult.onTopic) {
            return {
                decision: 'off_topic',
                protocolo: null,
                embeddings: queryEmbedding,
                matchTema: onTopicResult.matchedTema,
            };
        }

        return {
            decision: 'responder',
            protocolo: null,
            embeddings: queryEmbedding,
            matchTema: onTopicResult.matchedTema,
        };
    }
}

module.exports = GuardrailsService;
