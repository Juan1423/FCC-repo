const { chat } = require('../../services/chatcliente.services/openaiService');
const chatConfig = require('../../../../../cliente-fc/client/src/modules/chatcliente/components/chatConfig');

const enviarMensaje = async (req, res) => {
  try {
    const { mensaje, promptId, consentimiento, metadata } = req.body;
    const idUsuario = req.user.user;
    
    if (chatConfig.logging.enableDetailedLogging) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📨 NUEVO MENSAJE DE USUARIO`);
      console.log(`${'='.repeat(60)}`);
      console.log(`👤 Usuario ID: ${idUsuario}`);
      console.log(`📝 Mensaje: ${mensaje.substring(0, 100)}${mensaje.length > 100 ? '...' : ''}`);
      if (promptId) console.log(`📌 Prompt ID: ${promptId}`);
      console.log(`⏰ Hora: ${new Date().toLocaleString('es-ES')}`);
      console.log(`${'='.repeat(60)}\n`);
    }
    
    const result = await chat(mensaje, idUsuario, promptId, consentimiento, metadata);
    
    if (chatConfig.logging.enableDetailedLogging && chatConfig.logging.logResponses) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`✅ RESPUESTA GENERADA`);
      console.log(`${'='.repeat(60)}`);
      console.log(`📤 Respuesta: ${result.respuesta.substring(0, 150)}${result.respuesta.length > 150 ? '...' : ''}`);
      if (result.responseTime) console.log(`⏱️ Tiempo: ${result.responseTime}ms`);
      if (result.tokensUsed) console.log(`🔢 Tokens: ${result.tokensUsed}`);
      if (result.id_conversacion) console.log(`💾 Guardado en conversación ID: ${result.id_conversacion}`);
      console.log(`${'='.repeat(60)}\n`);
    }
    
    res.json(result);
  } catch (error) {
    if (chatConfig.logging.enableDetailedLogging && chatConfig.logging.logErrors) {
      console.error(`\n${'='.repeat(60)}`);
      console.error(`❌ ERROR EN CHAT`);
      console.error(`${'='.repeat(60)}`);
      console.error(`🚨 Error: ${error.message}`);
      console.error(`⏰ Hora: ${new Date().toLocaleString('es-ES')}`);
      console.error(`${'='.repeat(60)}\n`);
    }
    res.status(500).json({ error: error.message });
  }
};

module.exports = { enviarMensaje };