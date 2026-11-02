const PersonaService = require('../../services/comunidad.services/persona.services');
const { Persona } = require('../../models/comunidad.models/persona.model');
const { pickModelFields } = require('../../utils/security.utils');
const service = new PersonaService();

const create = async ( req, res ) => {
    try { 
        const response = await service.create(pickModelFields(Persona, req.body));
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

const uploadPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({ success: false, message: 'No se ha proporcionado ningún archivo' });
        }
        const fotoPersona = req.file.filename;
        res.json({ success: true, data: { foto_persona: fotoPersona } });
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: 'Error interno del servidor' });
    }
}

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const body = pickModelFields(Persona, req.body);
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

const getByInteraccionId = async (req, res) => {
    try {
        const { idInteraccion } = req.params;
        const response = await service.findByInteraccionId(idInteraccion);
        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: 'Error interno del servidor' });
    }
}

module.exports = {
    create, get, getById, update, _delete, getByInteraccionId, uploadPhoto
};
