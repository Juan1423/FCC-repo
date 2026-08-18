const { OpenAI } = require('openai');
const { models } = require('../../libs/sequelize'); 
const sequelize = require('../../libs/sequelize');
const { v4: uuidv4 } = require('uuid');

class BotInternoService {
    constructor() {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    async procesarPregunta(pregunta, sessionId = null, usuarioId = null) {
        const currentSession = sessionId || uuidv4();

        let textoContexto = '';
        try {
            // 1. Vectorizar pregunta
            const embeddingResp = await this.openai.embeddings.create({
                model: "text-embedding-3-small",
                input: pregunta
            });
            const vectorPregunta = `[${embeddingResp.data[0].embedding.join(',')}]`;

            // 2. Buscar en BD (tablas en esquema fcc_historiaclinica)
            const contextos = await models.SegmentoVector.findAll({
                attributes: ['contenido', 'documento_id'],
                order: [sequelize.literal(`embedding <-> ${sequelize.escape(vectorPregunta)}`)],
                limit: 4
            });

            textoContexto = contextos.map(c => c.contenido).join("\n---\n");
        } catch (vectorError) {
            console.warn('Error en búsqueda vectorial (pgvector no disponible o tabla vacía):', vectorError.message);
            // Continuar sin contexto vectorial — el chatbot responderá con conocimiento base
        }

        // 3. Prompt para Personal Interno
        const systemPrompt = `
            Eres un asistente de soporte para el personal de la Fundación Con Cristo.
            Usa la siguiente documentación interna para responder con precisión.
            
            DOCUMENTACIÓN:
            ${textoContexto || '(No hay documentación disponible en este momento)'}
        `;

        const chatCompletion = await this.openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: pregunta }
            ],
            temperature: 0.3
        });

        const respuesta = chatCompletion.choices[0].message.content;

        // 4. Auditoría (Registrando el ID del empleado)
        try {
            await models.HistorialIA.create({
                session_id: currentSession,
                input_usuario: pregunta,
                output_ia: respuesta,
                contexto_fuente: '[]',
                usuario_id: usuarioId
            });
        } catch (auditError) {
            console.warn('Error guardando historial IA:', auditError.message);
        }

        return { respuesta, sessionId: currentSession };
    }
}

module.exports = BotInternoService;
