'use strict';

const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const { models } = require('../../libs/sequelize');
const { Op } = require('sequelize');

class KnowledgeService {
    constructor(ragService) {
        this.ragService = ragService;
    }

    async create(data) {
        const conocimiento = await models.ChatConocimiento.create(data);
        this.ragService.invalidateCache();
        return conocimiento;
    }

    async findAll(options = {}) {
        const { limit = 10, offset = 0, where = {} } = options;
        const conocimientos = await models.ChatConocimiento.findAll({
            where,
            limit,
            offset,
            order: [['nivel_prioridad', 'DESC'], ['createdAt', 'DESC']],
        });
        return conocimientos;
    }

    async findById(id) {
        return models.ChatConocimiento.findByPk(id);
    }

    async update(id, data) {
        const [updated] = await models.ChatConocimiento.update(data, {
            where: { id_conocimiento: id },
        });
        if (updated) {
            this.ragService.invalidateCache();
            return await models.ChatConocimiento.findByPk(id);
        }
        return null;
    }

    async delete(id) {
        const deleted = await models.ChatConocimiento.destroy({
            where: { id_conocimiento: id },
        });
        if (deleted > 0) {
            this.ragService.invalidateCache();
        }
        return deleted > 0;
    }

    async toggleBloqueo(id) {
        const conocimiento = await this.findById(id);
        if (!conocimiento) return null;

        const newBloqueado = !conocimiento.bloqueado;
        const updateData = { bloqueado: newBloqueado };
        if (newBloqueado) {
            updateData.embedding = null;
        }

        await conocimiento.update(updateData);
        this.ragService.invalidateCache();
        return await this.findById(id);
    }

    async bloquearTodos(ids = null) {
        let where = {};
        if (ids && ids.length > 0) {
            where.id_conocimiento = ids;
        }
        const [affectedCount] = await models.ChatConocimiento.update(
            { bloqueado: true },
            { where }
        );
        this.ragService.invalidateCache();
        return { count: affectedCount };
    }

    async desbloquearTodos(ids = null) {
        let where = {};
        if (ids && ids.length > 0) {
            where.id_conocimiento = ids;
        }
        const [affectedCount] = await models.ChatConocimiento.update(
            { bloqueado: false },
            { where }
        );
        this.ragService.invalidateCache();
        return { count: affectedCount };
    }

    async generarEmbeddings(ids = null) {
        let where = {
            estado_vigencia: true,
            bloqueado: false,
        };
        if (ids && ids.length > 0) {
            where.id_conocimiento = ids;
        }

        const items = await models.ChatConocimiento.findAll({
            where: { ...where, embedding: null },
            attributes: ['id_conocimiento', 'pregunta_frecuente', 'respuesta_oficial', 'contenido', 'tema_principal'],
        });

        let processed = 0;
        let errors = 0;

        for (const item of items) {
            try {
                const textToEmbed = `${item.pregunta_frecuente || ''} ${item.respuesta_oficial || ''} ${item.contenido || ''}`.substring(0, 8000);
                if (!textToEmbed.trim()) continue;

                const embedding = await this.ragService.generateEmbedding(textToEmbed);
                await item.update({ embedding: JSON.stringify(embedding) });
                processed++;
            } catch (error) {
                console.error(`Error generating embedding for ${item.id_conocimiento}:`, error.message);
                errors++;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        this.ragService.invalidateCache();
        return { total: items.length, processed, errors };
    }

    async regenerarMemoria() {
        await models.ChatConocimiento.update(
            { embedding: null },
            { where: {} }
        );
        const result = await this.generarEmbeddings(null);
        return result;
    }

    async ingestirDocumento(file, titulo) {
        const doc = await models.ChatDocumento.create({
            titulo,
            nombre_archivo: file.originalname,
            tipo_mime: file.mimetype,
            tipo: 'conocimiento',
            estado: 'PROCESANDO',
        });

        try {
            const dataBuffer = fs.readFileSync(file.path);
            const data = await pdf(dataBuffer);
            const textoLimpio = data.text.replace(/\n/g, ' ').replace(/\s+/g, ' ');

            if (textoLimpio.trim().length < 10) {
                throw new Error('El PDF no contiene texto legible.');
            }

            const result = await this.ragService.ingestDocumento(textoLimpio, titulo, doc.id_documento);
            await doc.update({ estado: 'LISTO', chunks_count: result.inserted });
            return { success: true, chunks: result.inserted, documento: doc };
        } catch (error) {
            await doc.update({ estado: 'ERROR' });
            throw error;
        }
    }

    async ejecutarBloqueadas(ids = null) {
        let where = { bloqueado: true };
        if (ids && ids.length > 0) {
            where.id_conocimiento = ids;
        }

        const items = await models.ChatConocimiento.findAll({
            where,
            order: [['nivel_prioridad', 'DESC']],
        });

        const resultados = [];
        for (const item of items) {
            resultados.push({
                id: item.id_conocimiento,
                pregunta: item.pregunta_frecuente,
                bloqueada: item.bloqueado,
            });
        }

        return { total: items.length, resultados };
    }

    async getById(id) {
        return this.findById(id);
    }
}

module.exports = KnowledgeService;
