'use strict';

const { OpenAI } = require('openai');
const { models } = require('../../libs/sequelize');
const { Op } = require('sequelize');
const chatConfig = require('../../config/chatConfig');

class RAGService {
    constructor() {
        this.cache = new Map();
        this.knowledgeCache = new Map();
        this.cacheExpiryMs = 5 * 60 * 1000;
        this.openai = null;
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

    async loadKnowledgeIntoCache(force = false) {
        if (!force && this.knowledgeCache.size > 0) {
            return this.knowledgeCache;
        }
        try {
            const rows = await models.ChatConocimiento.findAll({
                where: {
                    estado_vigencia: true,
                    bloqueado: false,
                    embedding: { [Op.ne]: null },
                },
                attributes: ['id_conocimiento', 'tipo', 'tema_principal', 'pregunta_frecuente', 'respuesta_oficial', 'contenido', 'chunk_index', 'fuente_verificacion', 'nivel_prioridad', 'embedding'],
                raw: true,
            });

            this.knowledgeCache.clear();
            for (const row of rows) {
                let parsedEmbedding = null;
                try {
                    parsedEmbedding = row.embedding ? JSON.parse(row.embedding) : null;
                } catch (e) {
                    console.warn(`Error parsing embedding for ${row.id_conocimiento}:`, e.message);
                }
                if (parsedEmbedding) {
                    this.knowledgeCache.set(row.id_conocimiento, { ...row, embedding: parsedEmbedding });
                }
            }
            return this.knowledgeCache;
        } catch (error) {
            console.error('Error loading knowledge into cache:', error.message);
            return new Map();
        }
    }

    invalidateCache() {
        this.cache.clear();
        this.knowledgeCache.clear();
    }

    async searchSimilar(query, queryEmbedding, { limit = 3, threshold = 0.7 }) {
        try {
            const cacheKey = this.generateCacheKey('search', { query, limit, threshold });
            const cached = this.cache.get(cacheKey);
            if (cached && Date.now() < cached.expiry) {
                return cached.result;
            }

            await this.loadKnowledgeIntoCache();

            const results = [];
            for (const [id, row] of this.knowledgeCache.entries()) {
                const similarity = this.cosineSimilarity(queryEmbedding, row.embedding);
                if (similarity >= threshold) {
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

    async searchSimilarKnowledge(query, { limit = 3, threshold = 0.7, bloqueados = false } = {}) {
        const queryEmbedding = await this.generateEmbedding(query);
        return this.searchSimilar(query, queryEmbedding, { limit, threshold });
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

    async buildRAGContext(query, maxItems = 3, threshold = 0.7) {
        try {
            const relevant = await this.searchSimilarKnowledge(query, { limit: maxItems, threshold });

            if (relevant.length === 0) {
                return '';
            }

            let context = 'INFORMACIÓN RELEVANTE DE LA BASE DE CONOCIMIENTOS:\n\n';
            relevant.forEach((item, index) => {
                context += `${index + 1}. PREGUNTA: ${item.pregunta_frecuente || ''}\n`;
                context += `   RESPUESTA: ${item.respuesta_oficial || item.contenido || ''}\n`;
                context += `   TEMA: ${item.tema_principal || ''}\n`;
                context += `   FUENTE: ${item.fuente_verificacion || 'No especificada'}\n`;
                context += `   SIMILITUD: ${(item.similarity * 100).toFixed(1)}%\n\n`;
            });

            return context;
        } catch (error) {
            console.error('Error building RAG context:', error.message);
            return 'No se pudo acceder a la base de conocimientos en este momento.\n\n';
        }
    }

    async buildTemasContext() {
        try {
            const temas = await models.ChatTemaValido.findAll({
                where: { activo: true },
                attributes: ['tema', 'descripcion'],
                raw: true,
            });
            if (temas.length === 0) return '';

            let context = 'TEMAS VÁLIDOS QUE PUEDES CONSULTAR:\n\n';
            temas.forEach((t, i) => {
                context += `${i + 1}. ${t.tema}: ${t.descripcion}\n`;
            });
            return context;
        } catch (error) {
            console.error('Error building temas context:', error.message);
            return '';
        }
    }

    async ingestDocumento(textoExtraido, titulo, idDocumento = null) {
        const chunks = this.crearChunks(textoExtraido, 1000, 200);
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
            });
            inserted.push(record);
        }

        this.invalidateCache();
        return { total: chunks.length, inserted: inserted.length };
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
