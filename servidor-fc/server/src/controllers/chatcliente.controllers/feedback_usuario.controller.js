const FeedbackUsuarioService = require('../../services/chatcliente.services/feedback_usuario.service');
const service = new FeedbackUsuarioService();

// Validar datos de entrada
const validateFeedbackInput = (data) => {
    const errors = [];
    if (!data.id_conversacion) errors.push('id_conversacion es requerido');
    if (!data.id_usuario) errors.push('id_usuario es requerido');
    if (!data.calificacion) errors.push('calificación es requerida');
    if (data.calificacion < 1 || data.calificacion > 5) errors.push('calificación debe estar entre 1 y 5');
    return errors;
};

const create = async (req, res) => {
    try {
        const errors = validateFeedbackInput(req.body);
        if (errors.length > 0) {
            return res.status(400).json({ success: false, message: 'Datos inválidos', errors });
        }
        const response = await service.create(req.body);
        res.status(201).json({ success: true, data: response, message: 'Feedback creado exitosamente' });
    } catch (error) {
        console.error('Error crear feedback:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const get = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { id_usuario, id_conversacion, min_calificacion } = req.query;

        let filters = {};
        if (id_usuario) filters.id_usuario = id_usuario;
        if (id_conversacion) filters.id_conversacion = id_conversacion;

        const response = await service.find(filters, page, limit);
        
        // Filtrar por calificación mínima si se proporciona
        let data = response.rows || response;
        if (min_calificacion) {
            data = data.filter(f => f.calificacion >= parseInt(min_calificacion));
        }

        res.json({ 
            success: true, 
            data,
            pagination: { page, limit, total: data.length }
        });
    } catch (error) {
        console.error('Error obtener feedback:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ success: false, message: 'ID requerido' });
        
        const response = await service.findOne(id);
        if (!response) {
            return res.status(404).json({ success: false, message: 'Feedback no encontrado' });
        }
        res.json({ success: true, data: response });
    } catch (error) {
        console.error('Error obtener feedback:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ success: false, message: 'ID requerido' });
        
        // Validar que calificación esté en rango
        if (req.body.calificacion && (req.body.calificacion < 1 || req.body.calificacion > 5)) {
            return res.status(400).json({ success: false, message: 'Calificación debe estar entre 1 y 5' });
        }
        
        const response = await service.update(id, req.body);
        res.json({ success: true, data: response, message: 'Feedback actualizado' });
    } catch (error) {
        console.error('Error actualizar feedback:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const _delete = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ success: false, message: 'ID requerido' });
        
        const response = await service.delete(id);
        res.json({ success: true, data: response, message: 'Feedback eliminado' });
    } catch (error) {
        console.error('Error eliminar feedback:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Nuevo: Obtener promedio de calificaciones por usuario
const getAverageRating = async (req, res) => {
    try {
        const { id_usuario, id_conversacion } = req.query;
        if (!id_usuario && !id_conversacion) {
            return res.status(400).json({ success: false, message: 'id_usuario o id_conversacion requerido' });
        }

        const response = await service.getAverageRating(id_usuario, id_conversacion);
        res.json({ success: true, data: response });
    } catch (error) {
        console.error('Error obtener promedio:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Nuevo: Obtener feedback por conversación
const getByConversation = async (req, res) => {
    try {
        const { id_conversacion } = req.params;
        if (!id_conversacion) {
            return res.status(400).json({ success: false, message: 'id_conversacion requerido' });
        }

        const response = await service.findByConversation(id_conversacion);
        res.json({ success: true, data: response });
    } catch (error) {
        console.error('Error obtener feedback de conversación:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Nuevo: Obtener distribución de calificaciones
const getRatingDistribution = async (req, res) => {
    try {
        const { id_usuario } = req.query;
        const response = await service.getRatingDistribution(id_usuario);
        res.json({ success: true, data: response });
    } catch (error) {
        console.error('Error obtener distribución:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    create,
    get,
    getById,
    update,
    _delete,
    getAverageRating,
    getByConversation,
    getRatingDistribution
};