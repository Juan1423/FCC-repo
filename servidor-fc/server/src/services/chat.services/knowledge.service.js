'use strict';

const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');
const { models } = require('../../libs/sequelize');
const { Op } = require('sequelize');
const ocrUtils = require('../../utils/ocr.service');

class KnowledgeService {
    constructor(ragService) {
        this.ragService = ragService;
    }

    async create(data) {
        const payload = { ...(data || {}) };
        // Si el llamador ya trae un embedding, se etiqueta con el modelo actual
        // para poder detectar deriva de modelos en el futuro.
        if (payload.embedding && !payload.embedding_model && this.ragService.getEmbeddingModel) {
            payload.embedding_model = this.ragService.getEmbeddingModel();
        }
        let conocimiento;
        try {
            conocimiento = await models.ChatConocimiento.create(payload);
        } catch (error) {
            if (payload.embedding_model && /embedding_model/i.test(String(error.message))) {
                delete payload.embedding_model;
                conocimiento = await models.ChatConocimiento.create(payload);
            } else {
                throw error;
            }
        }
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

    async findAllDocumentos(options = {}) {
        const { limit = 10, offset = 0, where = {} } = options;
        return models.ChatDocumento.findAll({
            where,
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            include: [{
                model: models.ChatConocimiento,
                as: 'conocimientos',
                attributes: ['id_conocimiento', 'bloqueado'],
            }],
        });
    }

    async countDocumentos(where = {}) {
        return models.ChatDocumento.count({ where });
    }

    async deleteDocumento(id) {
        const documento = await models.ChatDocumento.findByPk(id);
        if (!documento) return null;
        await models.ChatConocimiento.destroy({ where: { id_documento: id } });
        await documento.destroy();
        this.ragService.invalidateCache();
        return true;
    }

    async toggleBloqueoDocumento(idDocumento, bloqueado) {
        const documento = await models.ChatDocumento.findByPk(idDocumento);
        if (!documento) return null;
        const updateData = bloqueado
            ? { bloqueado: true, embedding: null }
            : { bloqueado: false };
        const [affected] = await models.ChatConocimiento.update(updateData, {
            where: { id_documento: idDocumento },
        });
        this.ragService.invalidateCache();
        if (!bloqueado) {
            await this.regenerarEmbeddingsPendientes({ id_documento: idDocumento });
        }
        return affected;
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

    // Referencia: el atributo 'bloqueado' de BD/API equivale al concepto "ignorado" mostrado en la interfaz.
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
        if (!newBloqueado) {
            await this.regenerarEmbeddingsPendientes({ id_conocimiento: id });
        }
        return await this.findById(id);
    }

    async regenerarEmbeddingsPendientes(whereExtra = {}) {
        const rows = await models.ChatConocimiento.findAll({
            where: {
                ...whereExtra,
                estado_vigencia: true,
                bloqueado: false,
                embedding: null,
            },
            attributes: ['id_conocimiento'],
        });
        const ids = rows.map((row) => row.id_conocimiento);
        if (ids.length === 0) return { total: 0, processed: 0, errors: 0 };
        return this.generarEmbeddings(ids);
    }

    async bloquearTodos(ids = null) {
        let where = {};
        if (ids && ids.length > 0) {
            where.id_conocimiento = ids;
        }
        const [affectedCount] = await models.ChatConocimiento.update(
            { bloqueado: true, embedding: null },
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
        await this.regenerarEmbeddingsPendientes(where);
        return { count: affectedCount };
    }

    async generarEmbeddings(ids = null, { soloFaltantes = true } = {}) {
        let where = {
            estado_vigencia: true,
            bloqueado: false,
        };
        if (ids && ids.length > 0) {
            where.id_conocimiento = ids;
        }

        // `soloFaltantes=false` regenera también vectores existentes: necesario
        // para corregir deriva de modelo (misma dimensión, modelo distinto).
        if (soloFaltantes) where.embedding = null;

        const items = await models.ChatConocimiento.findAll({
            where,
            attributes: ['id_conocimiento', 'tipo', 'pregunta_frecuente', 'respuesta_oficial', 'contenido', 'tema_principal'],
        });

        let processed = 0;
        let errors = 0;
        const modelo = this.ragService.getEmbeddingModel();

        for (const item of items) {
            try {
                // Mismo builder que usa la ingesta: evita que la regeneración
                // genere vectores con un texto distinto al original.
                const textToEmbed = this.ragService.construirTextoEmbedding(item);
                if (!textToEmbed.trim()) continue;

                const embedding = await this.ragService.generateEmbedding(textToEmbed);
                try {
                    await item.update({ embedding: JSON.stringify(embedding), embedding_model: modelo });
                } catch (updateError) {
                    if (!/embedding_model/i.test(String(updateError.message))) throw updateError;
                    await item.update({ embedding: JSON.stringify(embedding) });
                }
                processed++;
            } catch (error) {
                console.error(`Error generating embedding for ${item.id_conocimiento}:`, error.message);
                errors++;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        this.ragService.invalidateCache();
        return { total: items.length, processed, errors, modelo };
    }

    /**
     * Regenera los embeddings cuyo modelo no coincide con el configurado.
     * Cubre el caso en que 3-small y ada-002 comparten dimensión (1536) y la
     * detección por dimensión no alcanza a detectar la deriva.
     */
    async regenerarEmbeddingsIncompatibles() {
        const modelo = this.ragService.getEmbeddingModel();
        let items = [];
        try {
            items = await models.ChatConocimiento.findAll({
                where: {
                    estado_vigencia: true,
                    bloqueado: false,
                    [Op.or]: [
                        { embedding_model: null },
                        { embedding_model: { [Op.ne]: modelo } },
                    ],
                },
                attributes: ['id_conocimiento'],
            });
        } catch (error) {
            if (!/embedding_model/i.test(String(error.message))) throw error;
            return { total: 0, processed: 0, errors: 0, modelo, aviso: 'Columna embedding_model ausente' };
        }

        const ids = items.map((item) => item.id_conocimiento);
        if (ids.length === 0) return { total: 0, processed: 0, errors: 0, modelo };
        const result = await this.generarEmbeddings(ids, { soloFaltantes: false });
        return { ...result, modelo };
    }

    async regenerarMemoria() {
        await models.ChatConocimiento.update(
            { embedding: null },
            { where: {} }
        );
        const result = await this.generarEmbeddings(null);
        return result;
    }

    async ingestirDocumento(file, titulo, canal = 'ambos', opciones = {}) {
        const doc = await models.ChatDocumento.create({
            titulo,
            nombre_archivo: file.originalname,
            tipo_mime: file.mimetype,
            tipo: 'conocimiento',
            estado: 'PROCESANDO',
        });

        try {
            const dataBuffer = file.buffer || fs.readFileSync(file.path);

            const ocrRequested = opciones.ocr === true || opciones.ocr === 'true' || opciones.ocr === 1;
            let ocrHabilitado = ocrRequested;
            if (this.ragService && typeof this.ragService.obtenerConfigRAG === 'function') {
                const cfg = await this.ragService.obtenerConfigRAG();
                if (cfg.ocr_enabled !== false || ocrRequested) {
                    ocrHabilitado = true;
                }
            }

            let textoFinal = '';
            let usadoOCR = false;
            let paginasOCR = 0;

            try {
                const extraido = await ocrUtils.extraerTextoCompletoConOCR(dataBuffer, {
                    ocrHabilitado,
                    ocrForzado: ocrRequested,
                    minTextoPagina: 5,
                });
                textoFinal = ocrUtils.limpiarTexto(extraido.texto);
                usadoOCR = extraido.paginasOCR > 0;
                paginasOCR = extraido.paginasOCR;
            } catch (pdfjsError) {
                console.warn('Falló extracción pdfjs, usando fallback pdf-parse:', pdfjsError.message);
                const parser = new PDFParse({ data: dataBuffer });
                try {
                    await parser.load();
                    const data = await parser.getText();
                    textoFinal = ocrUtils.limpiarTexto(data.text);
                } finally {
                    try { parser.destroy(); } catch (e) { /* ignore */ }
                }
                if (textoFinal.length < 10 && ocrHabilitado) {
                    const ocrResult = await ocrUtils.extraerTextoConOCR(dataBuffer);
                    if (ocrResult.texto && ocrResult.texto.length > textoFinal.length) {
                        textoFinal = ocrResult.texto;
                        usadoOCR = true;
                        paginasOCR = ocrResult.paginasOCR;
                    }
                }
            }

            if (textoFinal.length < 10) {
                if (!ocrHabilitado) {
                    throw new Error('El PDF no contiene texto legible y el OCR está deshabilitado.');
                }
                throw new Error('El PDF no contiene texto legible, ni siquiera tras aplicar OCR.');
            }

            const result = await this.ragService.ingestDocumento(textoFinal, titulo, doc.id_documento, canal);
            await doc.update({ estado: 'LISTO', chunks_count: result.inserted, ocr: usadoOCR, paginas_ocr: paginasOCR });
            return { success: true, chunks: result.inserted, documento: doc, ocr: usadoOCR, paginasOCR };
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
