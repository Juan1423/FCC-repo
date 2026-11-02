const TipoTerapiaService = require('../../services/historiaclinica.services/tipo_terapia.service');
const { TipoTerapia } = require('../../models/historiaclinica.models/tipo_terapia.model');
const { pickModelFields, validatePayload, ValidationError } = require('../../utils/security.utils');
const service = new TipoTerapiaService();

const TIPO_TERAPIA_SCHEMA = {
    nombre_terapia: { type: 'string', required: true, minLength: 1, maxLength: 50 },
};


const create = async ( req, res ) => {
    try { 
        const body = validatePayload(req.body, TIPO_TERAPIA_SCHEMA);
        const response = await service.create(pickModelFields(TipoTerapia, body));
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
        const body = pickModelFields(TipoTerapia, validatePayload(req.body, TIPO_TERAPIA_SCHEMA, { partial: true }));
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
