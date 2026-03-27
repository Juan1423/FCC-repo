'use strict';

const fetch = require('node-fetch');
const { models } = require('../../libs/sequelize');
const { Op } = require('sequelize');

class RAGService {
    constructor() {
        this.embeddingModel = 'text-embedding-ada-002'; // Modelo de embeddings de OpenAI
        this.apiKey = process.env.OPENAI_API_KEY;
        this.maxTokens = 8000; // Límite de tokens para el contexto
    }

    /**
     * Genera embedding para un texto usando OpenAI
     * @param {string} text - Texto a convertir en embedding
     * @returns {Array<number>} - Vector de embedding
     */
    async generateEmbedding(text) {
        if (!this.apiKey) {
            throw new Error('OPENAI_API_KEY no está configurada');
        }

        try {
            const response = await fetch('https://api.openai.com/v1/embeddings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    input: text,
                    model: this.embeddingModel
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(`Error OpenAI Embeddings: ${data.error?.message || response.status}`);
            }

            return data.data[0].embedding;
        } catch (error) {
            console.error('Error generando embedding:', error);
            throw error;
        }
    }

    /**
     * Calcula similitud coseno entre dos vectores
     * @param {Array<number>} vecA - Primer vector
     * @param {Array<number>} vecB - Segundo vector
     * @returns {number} - Similitud coseno (-1 a 1)
     */
    cosineSimilarity(vecA, vecB) {
        if (vecA.length !== vecB.length) {
            throw new Error('Los vectores deben tener la misma dimensión');
        }

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }

        if (normA === 0 || normB === 0) {
            return 0;
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Busca conocimientos similares usando embeddings
     * @param {string} query - Pregunta del usuario
     * @param {number} limit - Número máximo de resultados
     * @param {number} threshold - Umbral mínimo de similitud (0-1)
     * @returns {Array} - Conocimientos relevantes con similitud
     */
    async searchSimilarKnowledge(query, limit = 5, threshold = 0.7) {
        try {
            // Generar embedding de la consulta
            const queryEmbedding = await this.generateEmbedding(query);

            // Obtener todos los conocimientos con embeddings
            const conocimientos = await models.Conocimiento.findAll({
                where: {
                    estado_vigencia: true,
                    bloqueado: false,
                    embedding: { [Op.ne]: null }
                },
                attributes: ['id_conocimiento', 'pregunta_frecuente', 'respuesta_oficial', 'tema_principal', 'fuente_verificacion', 'nivel_prioridad', 'embedding']
            });

            // Calcular similitudes
            const similarities = conocimientos.map(conocimiento => {
                try {
                    const embedding = JSON.parse(conocimiento.embedding);
                    const similarity = this.cosineSimilarity(queryEmbedding, embedding);
                    return {
                        ...conocimiento.toJSON(),
                        similarity
                    };
                } catch (error) {
                    console.warn(`Error procesando embedding para conocimiento ${conocimiento.id_conocimiento}:`, error);
                    return null;
                }
            }).filter(item => item !== null);

            // Filtrar por umbral y ordenar por similitud
            const relevantResults = similarities
                .filter(item => item.similarity >= threshold)
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, limit);

            return relevantResults;
        } catch (error) {
            console.error('Error en búsqueda semántica:', error);
            throw error;
        }
    }

    /**
     * Genera embeddings para conocimientos sin ellos
     * @param {Array<string>} ids - IDs específicos (opcional, si no se especifica, procesa todos)
     * @returns {Object} - Estadísticas del proceso
     */
    async generateEmbeddingsForKnowledge(ids = null, additionalFilters = {}) {
        try {
            let whereCondition = {
                estado_vigencia: true,
                embedding: null,
                ...additionalFilters
            };

            if (ids && ids.length > 0) {
                whereCondition.id_conocimiento = ids;
            }

            const conocimientos = await models.Conocimiento.findAll({
                where: whereCondition,
                attributes: ['id_conocimiento', 'pregunta_frecuente', 'respuesta_oficial', 'tema_principal']
            });

            let processed = 0;
            let errors = 0;

            for (const conocimiento of conocimientos) {
                try {
                    // Combinar pregunta y respuesta para mejor contexto
                    const textToEmbed = `${conocimiento.pregunta_frecuente} ${conocimiento.respuesta_oficial}`.substring(0, 8000); // Limitar longitud

                    const embedding = await this.generateEmbedding(textToEmbed);

                    await models.Conocimiento.update(
                        { embedding: JSON.stringify(embedding) },
                        { where: { id_conocimiento: conocimiento.id_conocimiento } }
                    );

                    processed++;
                    console.log(`✅ Embedding generado para conocimiento ${conocimiento.id_conocimiento}`);
                } catch (error) {
                    console.error(`❌ Error generando embedding para ${conocimiento.id_conocimiento}:`, error);
                    errors++;
                }

                // Pequeña pausa para no exceder rate limits
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            return {
                total: conocimientos.length,
                processed,
                errors,
                success: processed - errors
            };
        } catch (error) {
            console.error('Error generando embeddings masivos:', error);
            throw error;
        }
    }

    /**
     * Construye contexto RAG para el prompt
     * @param {string} query - Pregunta del usuario
     * @param {number} maxItems - Máximo número de items a incluir
     * @returns {string} - Contexto formateado para el prompt
     */
    async buildRAGContext(query, maxItems = 3) {
        try {
            const relevantKnowledge = await this.searchSimilarKnowledge(query, maxItems, 0.7);

            if (relevantKnowledge.length === 0) {
                return "No se encontró información relevante en la base de conocimientos.";
            }

            let context = "INFORMACIÓN RELEVANTE DE LA BASE DE CONOCIMIENTOS:\n\n";

            relevantKnowledge.forEach((item, index) => {
                context += `${index + 1}. PREGUNTA: ${item.pregunta_frecuente}\n`;
                context += `   RESPUESTA: ${item.respuesta_oficial}\n`;
                context += `   TEMA: ${item.tema_principal}\n`;
                context += `   FUENTE: ${item.fuente_verificacion || 'No especificada'}\n`;
                context += `   SIMILITUD: ${(item.similarity * 100).toFixed(1)}%\n\n`;
            });

            return context;
        } catch (error) {
            console.error('Error construyendo contexto RAG:', error);
            return "Error al acceder a la base de conocimientos.";
        }
    }
}

module.exports = RAGService;