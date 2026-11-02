const IndicadorService = require('../../services/documentacion.services/indicador.services');
const service = new IndicadorService();
const { Indicador } = require('../../models/documentacion.models/indicador.model');
const { pickModelFields } = require('../../utils/security.utils');


const create = async ( req, res ) => {
    try {
        const body = pickModelFields(Indicador, req.body);
        if (req.file) {
            body.archivo_indicador = `/uploads/documentacion/indicadores/${req.file.filename}`;
        }
        const response = await service.create(body);
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
        console.error(error);
        res.status(500).send({ success: false, message: 'Error interno del servidor' });
    }
}

const getById = async ( req, res ) => {
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
        const body = pickModelFields(Indicador, req.body);
        if (req.file) {
            body.archivo_indicador = `/uploads/documentacion/indicadores/${req.file.filename}`;
        }
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
        console.error(error);
        res.status(500).send({ success: false, message: 'Error interno del servidor' });
    }
}

module.exports = {
    create, get, getById, update, _delete
};
