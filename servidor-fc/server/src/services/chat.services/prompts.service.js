'use strict';

const fs = require('fs');
const path = require('path');
const { models } = require('../../libs/sequelize');

const UPLOADS_ROOT = path.resolve(__dirname, '../../uploads');
const PDFS_DIR = path.join(UPLOADS_ROOT, 'pdfs');
const CHATBOT_DIR = path.join(UPLOADS_ROOT, 'chatbot');

const safeFileName = (fileName) => {
    if (!fileName) return null;
    const base = path.basename(String(fileName));
    const cleaned = base.replace(/[^A-Za-z0-9._-]/g, '_');
    if (!cleaned || cleaned === '.' || cleaned === '..') return null;
    return cleaned;
};

const resolveWithin = (baseDir, fileName) => {
    const safeName = safeFileName(fileName);
    if (!safeName) return null;
    const resolvedBase = path.resolve(baseDir);
    const fullPath = path.resolve(resolvedBase, safeName);
    if (!fullPath.startsWith(resolvedBase + path.sep)) return null;
    return fullPath;
};

const TIPOS_PERMITIDOS = ['instrucciones', 'contexto_pdf', 'global'];

const TIPOS_ALIAS = {
    instrucciones: 'instrucciones',
    instruction: 'instrucciones',
    instrucciones_generales: 'instrucciones',
    contexto_pdf: 'contexto_pdf',
    context_pdf: 'contexto_pdf',
    contexto: 'contexto_pdf',
    global: 'global',
    general: 'global',
};

const normalizarTipoPrompt = (valor) => {
    if (valor === null || valor === undefined) return null;
    const clave = String(valor).trim().toLowerCase().replace(/[\s-]+/g, '_');
    return TIPOS_ALIAS[clave] || null;
};

class PromptsService {
    async create(data, pdfFile = null) {
        const { titulo, descripcion, instrucciones, tipo_prompt, activo = true, canal = 'ambos' } = data;

        const tiposPermitidos = TIPOS_PERMITIDOS;
        const tipoNormalizado = normalizarTipoPrompt(tipo_prompt);
        if (!tipoNormalizado) {
            throw new Error(`Tipo de prompt inválido. Valores permitidos: ${tiposPermitidos.join(', ')}`);
        }
        if (!['ambos', 'publico', 'interno'].includes(canal)) {
            throw new Error('Canal inválido. Valores permitidos: ambos, publico, interno');
        }

        let archivo_pdf = null;
        if (pdfFile) {
            if (!fs.existsSync(PDFS_DIR)) {
                fs.mkdirSync(PDFS_DIR, { recursive: true });
            }
            const fileName = safeFileName(pdfFile.originalname);
            if (!fileName) {
                throw new Error('Nombre de archivo no válido');
            }
            const filePath = path.join(PDFS_DIR, fileName);
            fs.writeFileSync(filePath, pdfFile.buffer);
            archivo_pdf = fileName;
        }

        const prompt = await models.ChatPrompt.create({
            titulo: titulo || descripcion || 'Sin título',
            descripcion: descripcion || '',
            instrucciones: instrucciones || descripcion || '',
            tipo_prompt: tipoNormalizado,
            activo,
            archivo_pdf,
            canal,
        });

        return prompt;
    }

    async findAll(options = {}) {
        const { limit, offset, where } = options;
        const prompts = await models.ChatPrompt.findAll({
            where,
            limit,
            offset,
            order: [['updatedAt', 'DESC']],
        });
        return prompts;
    }

    async findById(id) {
        return models.ChatPrompt.findByPk(id);
    }

    async update(id, data, pdfFile = null) {
        const { titulo, descripcion, instrucciones, tipo_prompt, activo, canal } = data;

        if (canal !== undefined && !['ambos', 'publico', 'interno'].includes(canal)) {
            throw new Error('Canal inválido. Valores permitidos: ambos, publico, interno');
        }

        const tipoNormalizado = tipo_prompt !== undefined ? normalizarTipoPrompt(tipo_prompt) : undefined;
        if (tipo_prompt !== undefined && !tipoNormalizado) {
            throw new Error(`Tipo de prompt inválido. Valores permitidos: ${TIPOS_PERMITIDOS.join(', ')}`);
        }

        const updateData = {
            titulo: titulo || descripcion || 'Sin título',
            descripcion: descripcion || '',
            instrucciones: instrucciones || descripcion || '',
            activo,
        };
        if (tipoNormalizado !== undefined) updateData.tipo_prompt = tipoNormalizado;
        if (canal !== undefined) updateData.canal = canal;

        if (pdfFile) {
            if (!fs.existsSync(PDFS_DIR)) {
                fs.mkdirSync(PDFS_DIR, { recursive: true });
            }
            const fileName = safeFileName(pdfFile.originalname);
            if (!fileName) {
                throw new Error('Nombre de archivo no válido');
            }
            const filePath = path.join(PDFS_DIR, fileName);
            fs.writeFileSync(filePath, pdfFile.buffer);
            updateData.archivo_pdf = fileName;
        }

        const [updated] = await models.ChatPrompt.update(updateData, {
            where: { id_prompt: id },
        });

        if (updated) {
            return await models.ChatPrompt.findByPk(id);
        }
        return null;
    }

    async delete(id) {
        const deleted = await models.ChatPrompt.destroy({
            where: { id_prompt: id },
        });
        return deleted > 0;
    }

    async activate(id) {
        const [updated] = await models.ChatPrompt.update(
            { activo: true },
            { where: { id_prompt: id } }
        );
        if (updated) {
            return await models.ChatPrompt.findByPk(id);
        }
        return null;
    }

    async checkPdfExists(pdfName) {
        const filePath = resolveWithin(PDFS_DIR, pdfName);
        if (filePath && fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            return { exists: true, path: filePath, size: stats.size };
        }
        return { exists: false };
    }

    async downloadPdf(pdfName) {
        const filePath = resolveWithin(PDFS_DIR, pdfName);
        if (filePath && fs.existsSync(filePath)) {
            return { filePath, filename: path.basename(filePath) };
        }

        const altPath = resolveWithin(CHATBOT_DIR, pdfName);
        if (altPath && fs.existsSync(altPath)) {
            return { filePath: altPath, filename: path.basename(altPath) };
        }

        return null;
    }

    async uploadPdf(file) {
        if (!file) {
            throw new Error('No se proporcionó archivo PDF');
        }

        if (!fs.existsSync(PDFS_DIR)) {
            fs.mkdirSync(PDFS_DIR, { recursive: true });
        }
        const fileName = safeFileName(file.originalname);
        if (!fileName) {
            throw new Error('Nombre de archivo no válido');
        }
        const filePath = path.join(PDFS_DIR, fileName);
        fs.writeFileSync(filePath, file.buffer);

        return {
            success: true,
            file: {
                name: fileName,
                size: file.size,
                path: filePath,
            },
        };
    }
}

module.exports = PromptsService;
