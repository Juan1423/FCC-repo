const TipoEspecialidadService = require('../../services/historiaclinica.services/tipo_especialidad.service');
const { TipoEspecialidad } = require('../../models/historiaclinica.models/tipo_especialidad.model');
const { pickModelFields } = require('../../utils/security.utils');
const service = new TipoEspecialidadService();


const create = async ( req, res ) => {
    try { 
        const response = await service.create(pickModelFields(TipoEspecialidad, req.body));
        res.json({ success: true, data: response});
    } catch (error) {
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
        const body = pickModelFields(TipoEspecialidad, req.body);
        const response = await service.update(id,body);
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
        res.status(500).send({ success: false, message: error.message });
    }
}

module.exports = {
    create, get, getById, update, _delete
};
