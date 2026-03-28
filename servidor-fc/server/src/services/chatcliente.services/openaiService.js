require('dotenv').config();
const fetch = require('node-fetch');
const { Sequelize } = require('sequelize');
const { models } = require('../../libs/sequelize');
const chatConfig = require('../../../../../cliente-fc/client/src/modules/chatcliente/components/chatConfig');
const RAGService = require('./ragService');

async function construirPromptCompleto(mensajeUsuario) {
  const ragService = new RAGService();

  // Instrucción Base (Siempre presente)
  let prompt = chatConfig.systemPrompt.base + "\n\n";

  // IMPORTANTE: Instrucción para usar SOLO el contexto proporcionado
  prompt += "INSTRUCCIONES CRÍTICAS:\n";
  prompt += "- Responde ÚNICAMENTE basado en la información proporcionada en este prompt.\n";
  prompt += "- Si la pregunta no puede responderse con la información disponible, di: 'No tengo información suficiente para responder esa pregunta.'\n";
  prompt += "- No inventes información ni uses conocimientos externos.\n";
  prompt += "- Sé amable y profesional en tus respuestas.\n\n";

  // INFORMACIÓN DE LA FUNDACIÓN (contexto para respuestas inteligentes)
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
Lunes a Viernes: ${fundacion.horarios.atencionGeneral.lunesViernes}
Sábados: ${fundacion.horarios.atencionGeneral.sabados}
Domingos: ${fundacion.horarios.atencionGeneral.domingos}
Emergencias: ${fundacion.horarios.emergencias.disponible ? 'Disponible 24/7' : 'No disponible fuera de horarios'}

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

  prompt += informacionFundacion + "\n\n";

  // CONOCIMIENTO DE LA BASE DE DATOS (RAG - Retrieval Augmented Generation)
  try {
    const ragContext = await ragService.buildRAGContext(mensajeUsuario, 3); // Máximo 3 items más relevantes
    prompt += ragContext + "\n\n";
  } catch (error) {
    console.warn('Error obteniendo contexto RAG:', error);
    prompt += "No se pudo acceder a la base de conocimientos en este momento.\n\n";
  }
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
Lunes a Viernes: ${fundacion.horarios.atencionGeneral.lunesViernes}
Sábados: ${fundacion.horarios.atencionGeneral.sabados}
Domingos: ${fundacion.horarios.atencionGeneral.domingos}
Emergencias: ${fundacion.horarios.emergencias.disponible ? 'Disponible 24/7' : 'No disponible fuera de horarios'}

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

  prompt += informacionFundacion + "\n\n";

  // Instrucciones Adicionales (Dinámicas)
  // Prompts Específicos: tipo_prompt 'instrucciones'
  const promptsEspecificos = await models.Prompt.findAll({
    where: { activo: true, tipo_prompt: chatConfig.prompts.types.INSTRUCTIONS },
    limit: chatConfig.prompts.maxPromptsPerRequest
  });

  if (promptsEspecificos.length > 0) {
    prompt += chatConfig.systemPrompt.instructionFormat.instructions;
    promptsEspecificos.forEach(promptItem => {
      prompt += `- ${promptItem.instrucciones}\n`;
    });
    prompt += "\n";
  }

  // Contexto de PDFs: tipo_prompt 'instrucciones' (incluyendo subidos)
  const contextoPDFs = await models.Prompt.findAll({
    where: { 
      activo: true, 
      tipo_prompt: chatConfig.prompts.types.INSTRUCTIONS, 
      archivo_pdf: { [Sequelize.Op.ne]: null } 
    },
    limit: chatConfig.prompts.maxPromptsPerRequest
  });

  if (contextoPDFs.length > 0) {
    prompt += chatConfig.systemPrompt.instructionFormat.pdfContext;
    contextoPDFs.forEach(pdf => {
      prompt += `${pdf.descripcion}\n\n`;
    });
  }

  // Instrucciones Globales: último PDF subido (tipo_prompt 'global')
  const globalInstructions = await models.Prompt.findOne({
    where: { activo: true, tipo_prompt: chatConfig.prompts.types.GLOBAL },
    order: [['updatedAt', 'DESC']]
  });

  if (globalInstructions) {
    prompt += `${chatConfig.systemPrompt.instructionFormat.globalContext} ${globalInstructions.instrucciones}\n\n`;
  }

  // Agregar la pregunta del usuario
  prompt += `${chatConfig.systemPrompt.userMessageFormat} ${mensajeUsuario}`;

  if (chatConfig.logging.enableDetailedLogging && chatConfig.logging.logPrompts) {
    console.log('📝 Prompt construido:', prompt.substring(0, 200) + '...');
  }

  return prompt;
}

async function chat(mensaje, idUsuario, promptId = null, consentimiento = false, metadata = null) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY no está configurada en .env');
  }

  // Validar mensaje
  if (!mensaje || mensaje.trim().length < chatConfig.chat.minMessageLength) {
    throw new Error(`El mensaje debe tener al menos ${chatConfig.chat.minMessageLength} carácter(es)`);
  }

  if (mensaje.length > chatConfig.chat.maxMessageLength) {
    throw new Error(`El mensaje no puede exceder ${chatConfig.chat.maxMessageLength} caracteres`);
  }

  const startTime = Date.now();
  let promptCompleto;

  if (chatConfig.logging.enableDetailedLogging) {
    console.log(`🔧 Preparando prompt...`);
  }

  if (promptId) {
    const prompt = await models.Prompt.findByPk(promptId);
    if (!prompt) throw new Error('Prompt not found');
    // Construir prompt con instrucciones + texto del PDF
    promptCompleto = `${prompt.instrucciones}\n\n`;
    if (prompt.archivo_pdf) {
      promptCompleto += `Información adicional:\n${prompt.descripcion}\n\n`;
    }
    promptCompleto += `${chatConfig.systemPrompt.userMessageFormat} ${mensaje}`;
    
    if (chatConfig.logging.enableDetailedLogging) {
      console.log(`📎 Usando prompt específico ID: ${promptId}`);
    }
  } else {
    promptCompleto = await construirPromptCompleto(mensaje);
  }

  try {
    if (chatConfig.logging.enableDetailedLogging) {
      console.log(`🤖 Enviando solicitud a OpenAI...`);
      console.log(`📊 Configuración: Modelo=${chatConfig.openai.model}, Temp=${chatConfig.openai.temperature}, MaxTokens=${chatConfig.openai.maxTokens}`);
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: chatConfig.openai.model,
        messages: [{ role: 'user', content: promptCompleto }],
        max_tokens: chatConfig.openai.maxTokens,
        temperature: chatConfig.openai.temperature,
        top_p: chatConfig.openai.topP,
        frequency_penalty: chatConfig.openai.frequencyPenalty,
        presence_penalty: chatConfig.openai.presencePenalty
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Error de OpenAI:', data);
      throw new Error(data.error?.message || `Error OpenAI: ${response.status}`);
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Respuesta inválida de OpenAI');
    }

    const respuesta = data.choices[0].message.content;
    const responseTime = Date.now() - startTime;

    if (chatConfig.logging.enableDetailedLogging && chatConfig.logging.logPerformance) {
      console.log(`\n📊 ESTADÍSTICAS DE RESPUESTA:`);
      console.log(`  ⏱️ Tiempo total: ${responseTime}ms`);
      console.log(`  🔢 Tokens usados: ${data.usage?.total_tokens || 0}`);
      console.log(`  📥 Tokens input: ${data.usage?.prompt_tokens || 0}`);
      console.log(`  📤 Tokens output: ${data.usage?.completion_tokens || 0}`);
    }

    // Guardar conversación si está habilitado
    if (chatConfig.conversations.saveToDatabase) {
      const conversacionPayload = {
        id_usuario: idUsuario,
        mensaje_usuario: chatConfig.conversations.storeUserMessages ? mensaje : null,
        respuesta_bot: chatConfig.conversations.storeBotResponses ? respuesta : null,
        id_prompt: promptId || null,
        tiempo_respuesta: responseTime,
        tokens_usados: data.usage?.total_tokens || 0,
        consentimiento: !!consentimiento,
      };

      if (metadata) {
        try {
          conversacionPayload.metadata = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
        } catch (e) {
          conversacionPayload.metadata = { raw: metadata };
        }
      }

      const conversacion = await models.Conversacion.create(conversacionPayload);

      if (chatConfig.logging.enableDetailedLogging) {
        console.log(`💾 Conversación guardada en BD - ID: ${conversacion.id_conversacion}\n`);
      }

      return { 
        respuesta, 
        id_conversacion: conversacion.id_conversacion,
        responseTime,
        tokensUsed: data.usage?.total_tokens || 0
      };
    }

    return { respuesta };
  } catch (error) {
    if (chatConfig.logging.enableDetailedLogging && chatConfig.logging.logErrors) {
      console.error(`\n🚨 Error en servicio de OpenAI: ${error.message}\n`);
    }
    throw error;
  }
}

module.exports = { chat };