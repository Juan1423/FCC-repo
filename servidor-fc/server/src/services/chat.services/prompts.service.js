'use strict';

const fs = require('fs');
const path = require('path');
const { models } = require('../../libs/sequelize');

class PromptsService {
    async create(data, pdfFile = null) {
        const { titulo, descripcion, instrucciones, tipo_prompt, activo = true } = data;

        const tiposPermitidos = ['instrucciones', 'contexto_pdf', 'global'];
        if (!tipo_prompt || !tiposPermitidos.includes(tipo_prompt)) {
            throw new Error(`Tipo de prompt inválido. Valores permitidos: ${tiposPermitidos.join(', ')}`);
        }

        let archivo_pdf = null;
        if (pdfFile) {
            const uploadsDir = path.join(path.resolve(__dirname, '../../'), 'uploads', 'pdfs');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }
            const filePath = path.join(uploadsDir, pdfFile.originalname);
            fs.writeFileSync(filePath, pdfFile.buffer);
            archivo_pdf = pdfFile.originalname;
        }

        const prompt = await models.ChatPrompt.create({
            titulo: titulo || descripcion || 'Sin título',
            descripcion: descripcion || '',
            instrucciones: instrucciones || descripcion || '',
            tipo_prompt,
            activo,
            archivo_pdf,
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
        const { titulo, descripcion, instrucciones, tipo_prompt, activo } = data;

        const updateData = {
            titulo: titulo || descripcion || 'Sin título',
            descripcion: descripcion || '',
            instrucciones: instrucciones || descripcion || '',
            tipo_prompt,
            activo,
        };

        if (pdfFile) {
            const uploadsDir = path.join(path.resolve(__dirname, '../../'), 'uploads', 'pdfs');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }
            const filePath = path.join(uploadsDir, pdfFile.originalname);
            fs.writeFileSync(filePath, pdfFile.buffer);
            updateData.archivo_pdf = pdfFile.originalname;
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
        const uploadsDir = path.join(path.resolve(__dirname, '../../'), 'uploads', 'pdfs');
        const filePath = path.join(uploadsDir, pdfName);
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            return { exists: true, path: filePath, size: stats.size };
        }
        return { exists: false };
    }

    async downloadPdf(pdfName) {
        const uploadsDir = path.join(path.resolve(__dirname, '../../'), 'uploads', 'pdfs');
        const filePath = path.join(uploadsDir, pdfName);

        if (fs.existsSync(filePath)) {
            return { filePath, filename: pdfName };
        }

        const chatbotDir = path.join(path.resolve(__dirname, '../../'), 'uploads', 'chatbot');
        const altPath = path.join(chatbotDir, pdfName);
        if (fs.existsSync(altPath)) {
            return { filePath: altPath, filename: pdfName };
        }

        return null;
    }

    async uploadPdf(file) {
        if (!file) {
            throw new Error('No se proporcionó archivo PDF');
        }

        const uploadsDir = path.join(path.resolve(__dirname, '../../'), 'uploads', 'pdfs');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const filePath = path.join(uploadsDir, file.originalname);
        fs.writeFileSync(filePath, file.buffer);

        return {
            success: true,
            file: {
                name: file.originalname,
                size: file.size,
                path: filePath,
            },
        };
    }
}

module.exports = PromptsService;
