const DonacionNacionalService = require('../../services/donaciones.services/donacion_nacional.service');
const { DonacionNacional } = require('../../models/donaciones.models/donacion_nacional.model');
const { pickModelFields } = require('../../utils/security.utils');
const service = new DonacionNacionalService();

const create = async (req, res) => {
    try {
        // M-07: el POST es público; nunca debe fijar estado/IDs internos.
        const data = pickModelFields(DonacionNacional, req.body, { exclude: ['estado'] });
        const response = await service.create(data);
        res.json({ success: true, data: response });
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: 'Error interno del servidor' });
    }
}

const get = async (req, res) => {
    try {
        const response = await service.find();
        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: 'Error interno del servidor' });
    }
}

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await service.findOne(id);
        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: 'Error interno del servidor' });
    }
}

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const body = pickModelFields(DonacionNacional, req.body);
        const response = await service.update(id, body);
        res.json(response);
    } catch (error) {
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
        console.error(error);
        res.status(500).send({ success: false, message: 'Error interno del servidor' });
    }
}

module.exports = {
    create, get, getById, update, _delete
};
