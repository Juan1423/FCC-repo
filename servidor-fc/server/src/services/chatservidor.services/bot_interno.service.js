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

        // 1. Vectorizar pregunta
        const embeddingResp = await this.openai.embeddings.create({
            model: "text-embedding-3-small",
            input: pregunta
        });
        const vectorPregunta = `[${embeddingResp.data[0].embedding.join(',')}]`;

        // 2. Buscar en BD (Esquema fcc_ia)
        const contextos = await models.SegmentoVector.findAll({
            attributes: ['contenido', 'documento_id'],
            order: [sequelize.literal(`embedding <-> ${sequelize.escape(vectorPregunta)}`)],
            limit: 4
        });

        const textoContexto = contextos.map(c => c.contenido).join("\n---\n");

        // 3. Prompt para Personal Interno (Tono más técnico o directo)
        const systemPrompt = `
            Eres un asistente de soporte para el personal de la Fundación Con Cristo.
            Usa la siguiente documentación interna para responder con precisión.
            
            DOCUMENTACIÓN:
            ${textoContexto}
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
        await models.HistorialIA.create({
            session_id: currentSession,
            input_usuario: pregunta,
            output_ia: respuesta,
            contexto_fuente: JSON.stringify(contextos.map(c => c.documento_id)),
            usuario_id: usuarioId // Importante: Guarda qué empleado preguntó
        });

        return { respuesta, sessionId: currentSession };
    }
}

module.exports = BotInternoService;
