const TerapiasService = require('../../services/historiaclinica.services/terapias.service');
const service = new TerapiasService();
const multer = require('multer');
const multerConfigTerapia = require('../../utils/multerConfigTerapia');
const { pickFields } = require('../../utils/security.utils');
const { validateUploadedFileSignatures } = require('../../utils/fileSignature');

const upload = multer(multerConfigTerapia).single('archivo_terapia');

const TERAPIA_FIELDS = [
    'id_historia', 'id_personalsalud', 'id_tipo_terapia', 'fecha_hora',
    'notas_evolucion', 'farmacoterapia_indicaciones', 'url_adjunto',
];

const fileUpload = async (req, res, next) => {
    upload(req, res, function (error) {
        if (error) {
            res.status(400).json({ success: false, message: error.message });
        } else {
            return validateUploadedFileSignatures(req, res, next);
        }
    });
};

const create = async (req, res) => {
    try {
        const body = pickFields(req.body, TERAPIA_FIELDS);
        if (req.file) {
            body.url_adjunto = `/uploads/terapias/${body.id_historia}/${req.file.filename}`;
        }

        const response = await service.create(body);
        res.json({ success: true, data: response });
    } catch (error) {
        console.error('Error creando terapia:', error);
        res.status(500).send({ success: false, message: 'Error interno del servidor' });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const body = pickFields(req.body, TERAPIA_FIELDS);

        if (req.file) {
            body.url_adjunto = `/uploads/terapias/${body.id_historia}/${req.file.filename}`;
        }

        const response = await service.update(id, body);
        res.json(response);
    } catch (error) {
        console.error('Error actualizando terapia:', error);
        res.status(500).send({ success: false, message: 'Error interno del servidor' });
    }
};

const get = async ( req, res ) => {
    try {
        const response = await service.find();
        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: 'Error interno del servidor' });
    }
}

const getByPaciente = async ( req, res ) => {
    try {
        const { id } = req.params;
        const response = await service.findByPaciente(id);
        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: 'Error interno del servidor' });
    }
}

const getUltimaTerapia = async (req, res) => {
    try {
        const { id_historia } = req.params;
        const response = await service.findUltimaTerapia(id_historia);
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
    create, get, getById, update, _delete, getByPaciente, getUltimaTerapia, fileUpload
};
