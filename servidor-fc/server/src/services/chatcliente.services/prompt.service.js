const { models } = require('../../libs/sequelize');
const pdfUploadService = require('../pdfUploadService');

class PromptService {
    constructor() {}

    async create(data) {
        const res = await models.Prompt.create(data);
        return res;
    }

    async find() {
        const res = await models.Prompt.findAll({
            where: { activo: true }
        });
        return res;
    }

    async findOne(id) {
        const res = await models.Prompt.findByPk(id);
        return res;
    }

    async update(id, data) {
        const model = await this.findOne(id);
        const res = await model.update(data);
        return res;
    }

    async delete(id) {
        const model = await this.findOne(id);
        await model.destroy();
        return { deleted: true };
    }

    async uploadPdfToOpenAI(id_prompt, file) {
        try {
            // Encontrar el prompt
            const prompt = await this.findOne(id_prompt);
            if (!prompt) {
                throw new Error(`Prompt con ID ${id_prompt} no encontrado`);
            }

            // Subir PDF a OpenAI
            const openaiResponse = await pdfUploadService.uploadPdfToOpenAI(file.buffer, file.originalname);

            // Guardar PDF en filesystem
            const savedPath = pdfUploadService.savePdfToFileSystem(file.buffer, file.originalname);

            // Actualizar el prompt con la información del archivo
            await prompt.update({
                archivo_pdf: savedPath,
                tipo_prompt: 'contexto_pdf'
            });

            return {
                prompt: prompt.dataValues,
                openaiFileId: openaiResponse.id,
                savedPath: savedPath
            };
        } catch (error) {
            console.error('Error en uploadPdfToOpenAI:', error);
            throw error;
        }
    }
}

module.exports = PromptService;