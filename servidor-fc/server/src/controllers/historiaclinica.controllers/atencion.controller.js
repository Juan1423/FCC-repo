const AtencionService = require('../../services/historiaclinica.services/atencion.service');
const { Aps } = require('../../models/historiaclinica.models/atencion.model');
const { pickModelFields } = require('../../utils/security.utils');
const service = new AtencionService();

const create = async (req, res) => {
    try {
        const body = pickModelFields(Aps, req.body);
        if (body.revision_actual_sistema) {
            try {
                body.revision_actual_sistema = JSON.stringify(JSON.parse(body.revision_actual_sistema));
            } catch (parseError) {
                return res.status(400).json({ success: false, message: 'Formato inválido en revisión actual del sistema' });
            }
        }
        if (body.examen_fisico) {
            try {
                body.examen_fisico = JSON.stringify(JSON.parse(body.examen_fisico));
            } catch (parseError) {
                return res.status(400).json({ success: false, message: 'Formato inválido en examen físico' });
            }
        }
        if (body.diagnostico) {
            try {
                body.diagnostico = JSON.stringify(JSON.parse(body.diagnostico));
            } catch (parseError) {
                return res.status(400).json({ success: false, message: 'Formato inválido en diagnóstico' });
            }
        }
        const response = await service.create(body);
        res.json({ success: true, data: response });
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: 'Error interno del servidor' });
    }
}

const findFirstAtencionByHistoriaId = async (req, res) => {
    const { idHistoria } = req.params;
    try {
        const primeraAtencion = await service.findFirstByHistoria(idHistoria);

        if (primeraAtencion) {
            return res.json(primeraAtencion);
        } else {
            return res.status(404).json({ message: 'No se encontró ninguna atención médica para esta historia' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener la primera atención médica' });
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
    const { id } = req.params;
    try {
        const atencion = await service.findById(id);
        if (!atencion) {
            return res.status(404).json({ message: 'Atención médica no encontrada' });
        }
        return res.json(atencion);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener atención médica' });
    }
}

const getByHistoria = async (req, res) => {
    const { idHistoria } = req.params;
    try {
        const atenciones = await service.findByHistoria(idHistoria);
        if (!atenciones) {
            return res.status(404).json({ message: 'Atenciones médicas no encontradas' });
        }
        return res.json(atenciones);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener atenciones médicas' });
    }
}

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const body = pickModelFields(Aps, req.body);
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

const findLastAtencionByHistoriaId = async (req, res) => {
    const { idHistoria } = req.params;
    try {
        const atencionesPaciente = await service.findByHistoria(idHistoria);
        const lastAtencion = atencionesPaciente[atencionesPaciente.length - 1];

        if (lastAtencion) {
            return res.json(lastAtencion);
        } else {
            return null; // Puedes manejar el caso en que no haya registros
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener atención médica' });
    }
}

module.exports = {
    get,
    getById,
    getByHistoria,
    create,
    update,
    _delete,
    findLastAtencionByHistoriaId,
    findFirstAtencionByHistoriaId
};
