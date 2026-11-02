const SignosVitalesServices = require('../../services/historiaclinica.services/signosvitales.services');
const { SignosVitales } = require('../../models/historiaclinica.models/signosvitales.model');
const { pickModelFields } = require('../../utils/security.utils');
const service = new SignosVitalesServices();


const create = async ( req, res ) => {
    try { 
        const body = pickModelFields(SignosVitales, req.body);
        const response = await service.createSignosVitales(body);
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

async function getById(req, res) {
    const { id } = req.params;
    try {
        const signosVitales = await service.findById(id);
        if (!signosVitales) {
            return res.status(404).json({ message: 'Signos vitales no encontrados' });
        }
        return res.json(signosVitales);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener signos vitales' });
    }
}

async function getByIdAps(req, res) {
    const { id } = req.params;
    try {
        const signosVitales = await service.findByAps(id);
        if (!signosVitales) {
            return res.status(404).json({ message: 'Signos vitales no encontrados' });
        }
        return res.json(signosVitales);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener signos vitales' });
    }
}


async function getByHistoria(req, res) {
    const { idHistoria } = req.params;
    try {
        const signosVitales = await service.findByHistoria(idHistoria);
        if (!signosVitales) {
            return res.status(404).json({ message: 'Signos vitales no encontrados' });
        }
        return res.json(signosVitales);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener signos vitales' });
    }
}

async function findLastSignosVitalesByHistoriaId(req,res) {
    const { idHistoria } = req.params;
    try {
        const signosVitalesPaciente = await service.findByHistoria(idHistoria);
        const lastSignoVital = signosVitalesPaciente[signosVitalesPaciente.length - 1];

        if (lastSignoVital) {
            return res.json(lastSignoVital);
        } else {
            return res.status(404).json({ message: 'Signos vitales no encontrados' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener signos vitales' });
    }
}

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const body = pickModelFields(SignosVitales, req.body);
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
    create, get, getById, update, _delete,getByHistoria, findLastSignosVitalesByHistoriaId, getByIdAps
};
