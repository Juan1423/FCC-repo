const CapacitacionService = require('../../services/capacitaciones.services/capacitacion.service');
const { Capacitacion } = require('../../models/capacitaciones.models/capacitacion.model');
const { pickModelFields, validatePayload, ValidationError } = require('../../utils/security.utils');
const service = new CapacitacionService();

const CAPACITACION_SCHEMA = {
    titulo: { type: 'string', required: true, minLength: 1, maxLength: 150 },
    descripcion: { type: 'string', maxLength: 10000 },
    tipo: { type: 'string', enum: ['INTERNA', 'EXTERNA'] },
    modalidad: { type: 'string', maxLength: 60 },
    fecha_inicio: { type: 'date', required: true },
    fecha_fin: { type: 'date' },
    lugar: { type: 'string', maxLength: 200 },
    estado: { type: 'string', maxLength: 40 },
    publico_objetivo: { type: 'string', maxLength: 200 },
    costo_estimado: { type: 'number', min: 0 },
    capacitador_id: { type: 'integer', min: 1 },
};

const create = async (req, res) => {
    try {
        const body = pickModelFields(Capacitacion, validatePayload(req.body, CAPACITACION_SCHEMA));
        const response = await service.create(body);
        res.json({ success: true, data: response });
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error(error);
        res.status(500).send({ success: false, message: 'Error interno del servidor' });
    }
};

const get = async (req, res) => {
    try {
        const response = await service.find();
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await service.findOne(id);
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const body = pickModelFields(Capacitacion, validatePayload(req.body, CAPACITACION_SCHEMA, { partial: true }));
        const response = await service.update(id, body);
        res.json(response);
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).send({ success: false, message: 'Error interno del servidor' });
    }
};

const _delete = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await service.delete(id);
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

module.exports = {
    create, get, getById, update, _delete
};