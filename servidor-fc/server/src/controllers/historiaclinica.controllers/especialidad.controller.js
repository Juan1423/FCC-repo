const EspecialidadService = require('../../services/historiaclinica.services/especialidad.service');
const { Especialidad } = require('../../models/historiaclinica.models/especialidad.model');
const { pickModelFields, validatePayload, ValidationError } = require('../../utils/security.utils');
const service = new EspecialidadService();

const ESPECIALIDAD_SCHEMA = {
    id_tipo_especialidad: { type: 'integer', required: true, min: 1 },
    nombre_especialidad: { type: 'string', maxLength: 240 },
};


const create = async ( req, res ) => {
    try { 
        const body = validatePayload(req.body, ESPECIALIDAD_SCHEMA);
        const response = await service.create(pickModelFields(Especialidad, body));
        res.json({ success: true, data: response});
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error(error);
        res.status(500).send({ success: false, message: 'Error interno del servidor' });
    }
}

const get = async ( req, res ) => {
    try {
        const response = await service.find();
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

const getById = async ( req, res ) => {
    try {
        const { id } = req.params;
        const response = await service.findOne(id);
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const body = pickModelFields(Especialidad, validatePayload(req.body, ESPECIALIDAD_SCHEMA, { partial: true }));
        const response = await service.update(id,body);
        res.json(response);
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error(error);
        res.status(500).send({ success: false, message: 'Error interno del servidor' });
    }
}

const _delete = async (req, res) => {
    try {
        const { id } = req.params; 
        const response = await service.delete(id);
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

module.exports = {
    create, get, getById, update, _delete
};
