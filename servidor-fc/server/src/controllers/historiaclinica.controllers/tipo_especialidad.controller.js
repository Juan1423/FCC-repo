const TipoEspecialidadService = require('../../services/historiaclinica.services/tipo_especialidad.service');
const { TipoEspecialidad } = require('../../models/historiaclinica.models/tipo_especialidad.model');
const { pickModelFields, validatePayload, ValidationError } = require('../../utils/security.utils');
const service = new TipoEspecialidadService();

const TIPO_ESPECIALIDAD_SCHEMA = {
    descripcion_tipo_especialidad: { type: 'string', maxLength: 240 },
};


const create = async ( req, res ) => {
    try { 
        const body = validatePayload(req.body, TIPO_ESPECIALIDAD_SCHEMA);
        const response = await service.create(pickModelFields(TipoEspecialidad, body));
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
        const body = pickModelFields(TipoEspecialidad, validatePayload(req.body, TIPO_ESPECIALIDAD_SCHEMA, { partial: true }));
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
