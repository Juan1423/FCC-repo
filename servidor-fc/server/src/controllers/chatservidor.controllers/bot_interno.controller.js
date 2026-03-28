const KnowledgeService = require('../../services/chatservidor.services/knowledge.service');
const BotInternoService = require('../../services/chatservidor.services/bot_interno.service'); // (El servicio RAG)

const kService = new KnowledgeService();
const chatService = new BotInternoService();

// 1. Endpoint: Subir documento a la Base de Conocimiento (Solo Personal)
const subirDocumento = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Falta el archivo PDF' });
        const { titulo } = req.body;
        
        const result = await kService.ingerirDocumento(req.file, titulo || req.file.originalname);
        res.json({ success: true, message: 'Documento procesado para uso interno', data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Endpoint: Chat de Apoyo a la Gestión (Solo Personal)
const consultarAsistente = async (req, res) => {
    try {
        const { mensaje, sessionId } = req.body;
        // Asumimos que aquí llegará el ID del usuario interno gracias al token
        const usuarioId = req.user ? req.user.id : null; 

        const respuesta = await chatService.procesarPregunta(mensaje, sessionId, usuarioId);
        res.json({ success: true, data: respuesta });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { subirDocumento, consultarAsistente };