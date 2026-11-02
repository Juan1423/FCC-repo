const CapacitadorService = require('../../services/capacitaciones.services/capacitador.service');
const { Capacitador } = require('../../models/capacitaciones.models/capacitador.model');
const { pickModelFields, validatePayload, ValidationError } = require('../../utils/security.utils');
const service = new CapacitadorService();

const CAPACITADOR_SCHEMA = {
    apellido_capacitador: { type: 'string', maxLength: 40 },
    nombre_capacitador: { type: 'string', maxLength: 40 },
    direccion_capacitador: { type: 'string', maxLength: 250 },
    correo_capacitador: { type: 'email', maxLength: 250 },
    telefono_capacitador: { type: 'json' },
    foto_capacitador: { type: 'string', maxLength: 250 },
};


const create = async ( req, res ) => {
    try { 
        const body = pickModelFields(Capacitador, validatePayload(req.body, CAPACITADOR_SCHEMA));
        const response = await service.create(body);
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
        const body = pickModelFields(Capacitador, validatePayload(req.body, CAPACITADOR_SCHEMA, { partial: true }));
        const response = await service.update(id,body);
        res.json(response);
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(400).json({ success: false, message: error.message });
        }
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
