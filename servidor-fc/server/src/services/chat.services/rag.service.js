'use strict';

const { OpenAI } = require('openai');
const { models } = require('../../libs/sequelize');
const { Op } = require('sequelize');
const chatConfig = require('../../config/chatConfig');

const DEFAULT_RAG_UMBRAL_ESTRICTO = 0.55;

class RAGService {
    constructor() {
        this.cache = new Map();
        this.knowledgeCacheByCanal = new Map();
        this.cacheExpiryMs = 5 * 60 * 1000;
        this.openai = null;
        this.configLoader = null;
    }

    async getRagUmbralEstricto() {
        if (!this.configLoader) return DEFAULT_RAG_UMBRAL_ESTRICTO;
        try {
            const cfg = await this.configLoader();
            const val = cfg?.rag_umbral_estricto;
            if (val !== undefined && val !== null) {
                const parsed = parseFloat(val);
                if (!isNaN(parsed)) return parsed;
            }
        } catch (error) {
            console.warn('Error reading rag_umbral_estricto from config:', error.message);
        }
        return DEFAULT_RAG_UMBRAL_ESTRICTO;
    }

    async obtenerConfigRAG() {
        if (!this.configLoader) return {};
        try {
            const cfg = await this.configLoader();
            return cfg || {};
        } catch (error) {
            console.warn('Error cargando config RAG desde loader:', error.message);
            return {};
        }
    }

    getOpenAI() {
        if (!this.openai) {
            this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        }
        return this.openai;
    }

    generateCacheKey(text, params) {
        return `${text}:${JSON.stringify(params)}`;
    }

    async generateEmbedding(text) {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY no está configurada');
        }
        const response = await this.getOpenAI().embeddings.create({
            model: chatConfig.embeddingModel || 'text-embedding-ada-002',
            input: text.substring(0, 8000),
        });
        return response.data[0].embedding;
    }

    cosineSimilarity(vecA, vecB) {
        if (!vecA || !vecB || vecA.length !== vecB.length) {
            return 0;
        }
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        if (normA === 0 || normB === 0) return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    async loadKnowledgeIntoCache(canal = 'ambos', force = false) {
        if (!force && this.knowledgeCacheByCanal.has(canal)) {
            return this.knowledgeCacheByCanal.get(canal);
        }
        try {
            const rows = await models.ChatConocimiento.findAll({
                where: {
                    estado_vigencia: true,
                    bloqueado: false,
                    canal: { [Op.in]: ['ambos', canal] },
                    embedding: { [Op.ne]: null },
                },
                attributes: ['id_conocimiento', 'tipo', 'tema_principal', 'pregunta_frecuente', 'respuesta_oficial', 'contenido', 
                    'chunk_index', 'fuente_verificacion', 'nivel_prioridad', 'embedding'],
                raw: true,
            });

            const canalCache = new Map();
            for (const row of rows) {
                let parsedEmbedding = null;
                try {
                    parsedEmbedding = row.embedding ? JSON.parse(row.embedding) : null;
                } catch (e) {
                    console.warn(`Error parsing embedding for ${row.id_conocimiento}:`, e.message);
                }
                if (parsedEmbedding) {
                    canalCache.set(row.id_conocimiento, { ...row, embedding: parsedEmbedding });
                }
            }
            this.knowledgeCacheByCanal.set(canal, canalCache);
            return canalCache;
        } catch (error) {
            console.error('Error loading knowledge into cache:', error.message);
            return new Map();
        }
    }

    invalidateCache() {
        this.cache.clear();
        this.knowledgeCacheByCanal.clear();
    }

    async searchSimilar(query, queryEmbedding, { limit = 3, threshold = null, canal = 'ambos' }) {
        try {
            const umbralEstricto = await this.getRagUmbralEstricto();
            const umbralEfectivo = Math.max(threshold ?? umbralEstricto, umbralEstricto);
            const cacheKey = this.generateCacheKey('search', { query, limit, threshold: umbralEfectivo, canal });
            const cached = this.cache.get(cacheKey);
            if (cached && Date.now() < cached.expiry) {
                return cached.result;
            }

            const knowledgeCache = await this.loadKnowledgeIntoCache(canal);

            const results = [];
            for (const [id, row] of knowledgeCache.entries()) {
                const similarity = this.cosineSimilarity(queryEmbedding, row.embedding);
                if (similarity >= umbralEfectivo) {
                    results.push({ ...row, similarity });
                }
            }

            results.sort((a, b) => b.similarity - a.similarity);
            const sliced = results.slice(0, limit);

            this.cache.set(cacheKey, { result: sliced, expiry: Date.now() + this.cacheExpiryMs });
            return sliced;
        } catch (error) {
            console.error('Error in searchSimilar:', error.message);
            return [];
        }
    }

    async searchSimilarKnowledge(query, { limit = 3, threshold = null, bloqueados = false, canal = 'ambos', queryEmbedding = null } = {}) {
        const embedding = queryEmbedding || await this.generateEmbedding(query);
        return this.searchSimilar(query, embedding, { limit, threshold, canal });
    }

    async searchSimilarByEmbeddings(queryEmbedding, rows, threshold = 0.7, limit = 3) {
        const results = rows.map((row) => {
            try {
                const embedding = typeof row.embedding === 'string' ? JSON.parse(row.embedding) : row.embedding;
                if (!embedding) return null;
                const similarity = this.cosineSimilarity(queryEmbedding, embedding);
                return { ...row, similarity };
            } catch (e) {
                return null;
            }
        }).filter(Boolean);

        return results
            .filter(item => item.similarity >= threshold)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit);
    }

    async buildRAGContext(query, maxItems = 3, threshold = null, canal = 'ambos') {
        try {
            const detalle = await this.buildRAGContextDetalle(query, maxItems, threshold, canal);
            return detalle.context;
        } catch (error) {
            console.error('Error building RAG context:', error.message);
            return 'No se pudo acceder a la base de conocimientos en este momento.\n\n';
        }
    }

    async buildRAGContextDetalle(query, maxItems = 3, threshold = null, canal = 'ambos', opts = {}) {
        try {
            const relevant = await this.searchSimilarKnowledge(query, { limit: maxItems, threshold, canal, queryEmbedding: opts.queryEmbedding });

            const detalle = {
                resultados: relevant.map((item) => ({
                    id_conocimiento: item.id_conocimiento,
                    tipo: item.tipo,
                    tema_principal: item.tema_principal,
                    chunk_index: item.chunk_index,
                    similarity: item.similarity,
                    fuente_verificacion: item.fuente_verificacion,
                    contenido: (item.respuesta_oficial || item.contenido || '').substring(0, 300),
                })),
                similitudMaxima: relevant.length > 0 ? relevant[0].similarity : 0,
                umbral: threshold,
                nResultados: relevant.length,
                contextoIncluido: relevant.length > 0,
            };

            if (relevant.length === 0) {
                detalle.context = '';
                return detalle;
            }

            let context = 'INFORMACIÓN RELEVANTE DE LA BASE DE CONOCIMIENTOS:\n\n';
            relevant.forEach((item, index) => {
                context += `${index + 1}. PREGUNTA: ${item.pregunta_frecuente || ''}\n`;
                context += `   RESPUESTA: ${item.respuesta_oficial || item.contenido || ''}\n`;
                context += `   TEMA: ${item.tema_principal || ''}\n`;
                context += `   FUENTE: ${item.fuente_verificacion || 'No especificada'}\n`;
                context += `   SIMILITUD: ${(item.similarity * 100).toFixed(1)}%\n\n`;
            });

            detalle.context = context;
            return detalle;
        } catch (error) {
            console.error('Error building RAG context detail:', error.message);
            return {
                context: 'No se pudo acceder a la base de conocimientos en este momento.\n\n',
                resultados: [],
                similitudMaxima: 0,
                umbral: threshold,
                nResultados: 0,
                contextoIncluido: false,
                error: error.message,
            };
        }
    }

    async ingestDocumento(textoExtraido, titulo, idDocumento = null, canal = 'ambos') {
        let chunkSize = 1000;
        let chunkOverlap = 200;
        const cfg = await this.obtenerConfigRAG();
        if (cfg.chunk_size !== undefined && cfg.chunk_size !== null) {
            const parsed = parseInt(cfg.chunk_size, 10);
            if (!isNaN(parsed) && parsed >= 100) chunkSize = parsed;
        }
        if (cfg.chunk_overlap !== undefined && cfg.chunk_overlap !== null) {
            const parsed = parseInt(cfg.chunk_overlap, 10);
            if (!isNaN(parsed) && parsed >= 0 && parsed < chunkSize) chunkOverlap = parsed;
        }

        const chunks = this.crearChunks(textoExtraido, chunkSize, chunkOverlap);
        const inserted = [];

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            if (chunk.length < 50) continue;

            const embedding = await this.generateEmbedding(chunk);
            const record = await models.ChatConocimiento.create({
                tipo: 'segmento',
                id_documento: idDocumento,
                tema_principal: titulo,
                contenido: chunk,
                chunk_index: i,
                embedding: JSON.stringify(embedding),
                fuente_verificacion: titulo,
                nivel_prioridad: 1,
                estado_vigencia: true,
                bloqueado: false,
                canal,
            });
            inserted.push(record);
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        this.invalidateCache();
        return { total: chunks.length, inserted: inserted.length, chunkSize, chunkOverlap };
    }

    crearChunks(text, size = 1000, overlap = 200) {
        const chunks = [];
        let start = 0;
        while (start < text.length) {
            let end = start + size;
            if (end < text.length) {
                const breakPoint = text.lastIndexOf(' ', end);
                if (breakPoint > start + size * 0.5) {
                    end = breakPoint;
                }
            }
            chunks.push(text.substring(start, end));
            start = end - overlap;
            if (start >= text.length) break;
        }
        return chunks;
    }
}

module.exports = RAGService;
