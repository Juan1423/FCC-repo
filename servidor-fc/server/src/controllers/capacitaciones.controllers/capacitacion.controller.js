const CapacitacionService = require('../../services/capacitaciones.services/capacitacion.service');
const { Capacitacion } = require('../../models/capacitaciones.models/capacitacion.model');
const { pickModelFields } = require('../../utils/security.utils');
const service = new CapacitacionService();

const create = async (req, res) => {
    try {
        const body = pickModelFields(Capacitacion, req.body);
        const response = await service.create(body);
        res.json({ success: true, data: response });
    } catch (error) {
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
        const response = await service.update(id, req.body);
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
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