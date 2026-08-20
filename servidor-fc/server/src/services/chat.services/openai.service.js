'use strict';

const { OpenAI } = require('openai');
const { models } = require('../../libs/sequelize');
const { Op } = require('sequelize');
const chatConfig = require('../../config/chatConfig');

class OpenAIService {
    constructor() {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        this.ragService = null;
        this.guardrailsService = null;
        this.learningService = null;
        this.configCache = null;
        this.configExpiry = 0;
    }

    setDependencies({ ragService, guardrailsService, learningService }) {
        this.ragService = ragService;
        this.guardrailsService = guardrailsService;
        this.learningService = learningService;
    }

    async loadConfig() {
        if (this.configCache && Date.now() < this.configExpiry) {
            return this.configCache;
        }
        const rows = await models.ChatConfiguracion.findAll({ raw: true });
        const config = {};
        for (const row of rows) {
            let val = row.valor;
            switch (row.tipo) {
                case 'number': val = parseInt(val, 10); break;
                case 'float': val = parseFloat(val); break;
                case 'boolean': val = val === 'true'; break;
                default: val = row.valor;
            }
            config[row.clave] = val;
        }
        this.configCache = config;
        this.configExpiry = Date.now() + 5 * 60 * 1000;
        return config;
    }

    invalidateConfig() {
        this.configCache = null;
        this.configExpiry = 0;
    }

    async construirPromptCompleto(mensajeUsuario, { promptId = null, sessionId, tipo = 'publico' } = {}) {
        let prompt = chatConfig.systemPrompt.base + '\n\n';

        prompt += 'INSTRUCCIONES CRÍTICAS:\n';
        prompt += '- Responde ÚNICAMENTE basado en la información proporcionada en este prompt.\n';
        prompt += '- Si la pregunta no puede responderse con la información disponible, di: \'No tengo información suficiente para responder esa pregunta.\'\n';
        prompt += '- No inventes información ni uses conocimientos externos.\n';
        prompt += '- Sé amable y profesional en tus respuestas.\n\n';

        const fundacion = chatConfig.fundacion;
        const informacionFundacion = `
📋 INFORMACIÓN DE LA INSTITUCIÓN:
Nombre: ${fundacion.nombre}
Misión: ${fundacion.mision}
Ubicación: ${fundacion.ubicaciones.principal.ciudad}, ${fundacion.ubicaciones.principal.provincia}, ${fundacion.ubicaciones.principal.pais}
Dirección: ${fundacion.ubicaciones.principal.direccion}
Teléfono: ${fundacion.contacto.telefonoPrincipal}
Email: ${fundacion.contacto.email}
Sitio Web: ${fundacion.contacto.sitioWeb}

🕐 HORARIOS DE ATENCIÓN:
Lunes a Viernes: ${fundacion.horarios.atencionGeneral.lunasViernes}
Sábados: ${fundacion.horarios.atencionGeneral.sabados}
Domingos: ${fundacion.horarios.atencionGeneral.domingos}
Emergencias: ${fundacion.horarios.emergencias.estado === 'disponible' ? 'Disponible 24/7' : 'No disponible fuera de horarios'}

🏥 SERVICIOS DISPONIBLES:
- Medicina General: ${fundacion.servicios.medicina.nombre} - ${fundacion.servicios.medicina.descripcion}
- Especialidades: ${fundacion.servicios.especialidades.nombre} - ${fundacion.servicios.especialidades.descripcion}
- Laboratorio: ${fundacion.servicios.laboratorio.nombre} - ${fundacion.servicios.laboratorio.descripcion}
- Terapias: ${fundacion.servicios.terapias.nombre} - ${fundacion.servicios.terapias.descripcion}
- Telemedicina: ${fundacion.servicios.telemedicina.nombre} - ${fundacion.servicios.telemedicina.descripcion}

📱 REDES SOCIALES:
Facebook: ${fundacion.contacto.redesSociales.facebook}
Instagram: ${fundacion.contacto.redesSociales.instagram}
Twitter: ${fundacion.contacto.redesSociales.twitter}
WhatsApp: ${fundacion.contacto.redesSociales.whatsapp}

Utiliza esta información para responder preguntas sobre horarios, servicios, ubicación y contacto. Sé amable y profesional.
`;

        prompt += informacionFundacion + '\n\n';

        if (this.ragService) {
            const config = await this.loadConfig();
            const maxItems = config.max_contexto_rag_items !== undefined ? config.max_contexto_rag_items : 3;
            const threshold = config.rag_similarity_threshold !== undefined ? config.rag_similarity_threshold : 0.7;

            try {
                const ragContext = await this.ragService.buildRAGContext(mensajeUsuario, maxItems, threshold);
                if (ragContext) {
                    prompt += ragContext + '\n\n';
                }
            } catch (error) {
                console.warn('Error obteniendo contexto RAG:', error.message);
                prompt += 'No se pudo acceder a la base de conocimiento en este momento.\n\n';
            }
        }

        const promptsEspecificos = await models.ChatPrompt.findAll({
            where: {
                activo: true,
                tipo_prompt: chatConfig.prompts.types.INSTRUCTIONS,
            },
            limit: chatConfig.prompts.maxPromptsPerRequest,
        });

        if (promptsEspecificos.length > 0) {
            prompt += chatConfig.systemPrompt.instructionFormat.instructions;
            promptsEspecificos.forEach((p) => {
                prompt += `- ${p.instrucciones}\n`;
            });
            prompt += '\n';
        }

        const contextoPDFs = await models.ChatPrompt.findAll({
            where: {
                activo: true,
                tipo_prompt: chatConfig.prompts.types.INSTRUCTIONS,
                archivo_pdf: { [Op.ne]: null },
            },
            limit: chatConfig.prompts.maxPromptsPerRequest,
        });

        if (contextoPDFs.length > 0) {
            prompt += chatConfig.systemPrompt.instructionFormat.pdfContext;
            contextoPDFs.forEach((p) => {
                prompt += `${p.descripcion}\n\n`;
            });
        }

        if (promptId) {
            const promptRecord = await models.ChatPrompt.findByPk(promptId);
            if (promptRecord) {
                prompt += `- Prompt específico: ${promptRecord.instrucciones}\n\n`;
            }
        }

        const globalInstructions = await models.ChatPrompt.findOne({
            where: { activo: true, tipo_prompt: chatConfig.prompts.types.GLOBAL },
            order: [['updatedAt', 'DESC']],
        });

        if (globalInstructions) {
            prompt += `${chatConfig.systemPrompt.instructionFormat.globalContext} ${globalInstructions.instrucciones}\n\n`;
        }

        prompt += `${chatConfig.systemPrompt.userMessageFormat} ${mensajeUsuario}`;

        return prompt;
    }

    async chatPublico({ mensaje, promptId = null, idUsuario = null, idUsuarioAnonimo = null, consentimiento = false, sessionId, visitorId }) {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY no está configurada en .env');
        }

        if (!mensaje || mensaje.trim().length < chatConfig.chat.minMessageLength) {
            throw new Error(`El mensaje debe tener al menos ${chatConfig.chat.minMessageLength} carácter(es)`);
        }

        if (mensaje.length > chatConfig.chat.maxMessageLength) {
            throw new Error(`El mensaje no puede exceder ${chatConfig.chat.maxMessageLength} caracteres`);
        }

        const scope = idUsuario ? 'auth' : 'anon';
        const identifier = idUsuario || visitorId || idUsuarioAnonimo;

        if (this.guardrailsService) {
            const rateResult = this.guardrailsService.checkRateLimit({ scope, identifier });
            if (!rateResult.allowed) {
                const error = new Error(`Límite de preguntas alcanzado. Intenta en ${rateResult.retryAfter} segundos.`);
                error.code = 'RATE_LIMIT_EXCEEDED';
                error.retryAfter = rateResult.retryAfter;
                throw error;
            }
        }

        const startTime = Date.now();
        let promptCompleto;

        if (promptId) {
            const promptRecord = await models.ChatPrompt.findByPk(promptId);
            if (!promptRecord) throw new Error('Prompt not found');
            promptCompleto = `${promptRecord.instrucciones}\n\n`;
            if (promptRecord.archivo_pdf) {
                promptCompleto += `Información adicional:\n${promptRecord.descripcion}\n\n`;
            }
            promptCompleto += `${chatConfig.systemPrompt.userMessageFormat} ${mensaje}`;
        } else {
            promptCompleto = await this.construirPromptCompleto(mensaje, { promptId, sessionId, tipo: 'publico' });
        }

        let responseFromOpenAI;
        try {
            responseFromOpenAI = await this.openai.chat.completions.create({
                model: chatConfig.openai.model,
                messages: [
                    { role: 'system', content: chatConfig.systemPrompt.base },
                    { role: 'user', content: promptCompleto },
                ],
                max_tokens: chatConfig.openai.maxTokens,
                temperature: chatConfig.openai.temperature,
                top_p: chatConfig.openai.topP,
                frequency_penalty: chatConfig.openai.frequencyPenalty,
                presence_penalty: chatConfig.openai.presencePenalty,
            });
        } catch (error) {
            console.error('OpenAI API error:', error.message);
            throw error;
        }

        const respuesta = responseFromOpenAI.choices?.[0]?.message?.content || '';
        const responseTime = Date.now() - startTime;
        const tokensUsed = responseFromOpenAI.usage?.total_tokens || 0;

        if (chatConfig.logging.enableDetailedLogging && chatConfig.logging.logPerformance) {
            console.log(`📊 STATS: ${responseTime}ms, ${tokensUsed} tokens`);
        }

        let conversacion = null;
        if (chatConfig.conversations.saveToDatabase) {
            try {
                conversacion = await models.ChatConversacion.create({
                    tipo: 'publico',
                    id_usuario: idUsuario || null,
                    id_usuario_anonimo: idUsuarioAnonimo || null,
                    session_id: sessionId,
                    id_prompt: promptId || null,
                    mensaje_usuario: chatConfig.conversations.storeUserMessages ? mensaje : null,
                    respuesta_bot: chatConfig.conversations.storeBotResponses ? respuesta : null,
                    consentimiento: !!consentimiento,
                    metadata: {
                        clientTime: new Date().toISOString(),
                        visitorId: visitorId || null,
                    },
                    tiempo_respuesta: responseTime,
                    tokens_usados: tokensUsed,
                });
            } catch (dbError) {
                console.error('Error saving conversation:', dbError.message);
            }
        }

        if (conversacion && this.learningService) {
            try {
                setImmediate(async () => {
                    try {
                        await this.learningService.evaluarConversacion({
                            idConversacion: conversacion.id_conversacion,
                            mensaje,
                            respuesta,
                            feedback: null,
                        });
                    } catch (evalError) {
                        console.warn('Learning evaluation error:', evalError.message);
                    }
                });
            } catch (e) {
                // Silent fail - learning is async
            }
        }

        return {
            respuesta,
            id_conversacion: conversacion?.id_conversacion || null,
            responseTime,
            tokensUsed,
        };
    }

    async chatInterno({ mensaje, idUsuario, sessionId }) {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY no está configurada en .env');
        }

        if (!mensaje || mensaje.trim().length < chatConfig.chat.minMessageLength) {
            throw new Error(`El mensaje debe tener al menos ${chatConfig.chat.minMessageLength} carácter(es)`);
        }

        if (this.guardrailsService) {
            const rateResult = this.guardrailsService.checkRateLimit({ scope: 'auth', identifier: idUsuario });
            if (!rateResult.allowed) {
                const error = new Error(`Límite alcanzado. Intenta en ${rateResult.retryAfter} segundos.`);
                error.code = 'RATE_LIMIT_EXCEEDED';
                error.retryAfter = rateResult.retryAfter;
                throw error;
            }
        }

        const startTime = Date.now();
        const promptCompleto = await this.construirPromptCompleto(mensaje, { sessionId, tipo: 'interno' });

        const responseFromOpenAI = await this.openai.chat.completions.create({
            model: chatConfig.openai.model,
            messages: [
                { role: 'system', content: 'Eres un asistente de soporte para el personal de la Fundación Con Cristo. Usa la documentación interna para responder con precisión.' },
                { role: 'user', content: promptCompleto },
            ],
            max_tokens: chatConfig.openai.maxTokens,
            temperature: 0.3,
            top_p: chatConfig.openai.topP,
        });

        const respuesta = responseFromOpenAI.choices?.[0]?.message?.content || '';
        const responseTime = Date.now() - startTime;
        const tokensUsed = responseFromOpenAI.usage?.total_tokens || 0;

        let conversacion = null;
        if (chatConfig.conversations.saveToDatabase) {
            try {
                conversacion = await models.ChatConversacion.create({
                    tipo: 'interno',
                    id_usuario: idUsuario,
                    id_usuario_anonimo: null,
                    session_id: sessionId,
                    mensaje_usuario: mensaje,
                    respuesta_bot: respuesta,
                    consentimiento: true,
                    metadata: { clientTime: new Date().toISOString() },
                    tiempo_respuesta: responseTime,
                    tokens_usados: tokensUsed,
                });
            } catch (dbError) {
                console.error('Error saving interna conversation:', dbError.message);
            }
        }

        return { respuesta, id_conversacion: conversacion?.id_conversacion || null, responseTime, tokensUsed };
    }

    async generarEmbedding(texto) {
        return this.ragService.generateEmbedding(texto);
    }
}

module.exports = OpenAIService;
