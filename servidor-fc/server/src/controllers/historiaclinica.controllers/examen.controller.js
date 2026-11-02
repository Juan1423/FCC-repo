const ExamenService = require('../../services/historiaclinica.services/examen.service');
const service = new ExamenService();
const multer = require('multer');
const multerConfigExamen = require('../../utils/multerConfigExamen');
const { pickFields } = require('../../utils/security.utils');
const { validateUploadedFileSignatures } = require('../../utils/fileSignature');

const upload = multer(multerConfigExamen).single('archivo_examen');

const EXAMEN_FIELDS = [
    'id_historia', 'fecha_solicitud_examen', 'url_examen', 'nombre_examen',
    'comentario_examen', 'estado_examen', 'id_aps',
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
        const body = pickFields(req.body, EXAMEN_FIELDS);
        if (req.file) {
            body.url_examen = `/uploads/examenes/${body.id_historia}/${req.file.filename}`;
        }

        const response = await service.create(body);
        res.json({ success: true, data: response });
    } catch (error) {
        console.error('Error creando examen:', error);
        res.status(500).send({ success: false, message: 'Error interno del servidor' });
    }
};

const changeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado_examen } = req.body;

        if (!['pendiente', 'en proceso', 'completado'].includes(estado_examen)) {
            return res.status(400).json({ success: false, message: 'Estado de examen inválido' });
        }

        let updateData = { estado_examen };

        if (req.file) {
            updateData.url_examen = `/uploads/examenes/${req.body.id_historia}/${req.file.filename}`;
        }

        const response = await service.update(id, updateData);
        res.json({ success: true, data: response });
    } catch (error) {
        console.error('Error cambiando estado de examen:', error);
        res.status(500).send({ success: false, message: 'Error interno del servidor' });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const body = pickFields(req.body, EXAMEN_FIELDS);

        if (req.file) {
            body.url_examen = `/uploads/examenes/${body.id_historia}/${req.file.filename}`;
        }

        const response = await service.update(id, body);
        res.json(response);
    } catch (error) {
        console.error('Error actualizando examen:', error);
        res.status(500).send({ success: false, message: 'Error interno del servidor' });
    }
};

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
        const examen = await service.findById(id);
        if (!examen) {
            return res.status(404).json({ message: 'Examen no encontrado' });
        }
        return res.json(examen);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener examen' });
    }
}

const getByHistoria = async (req, res) => {
    const { idHistoria } = req.params;
    try {
        const examenes = await service.findByHistoria(idHistoria);
        if (!examenes) {
            return res.status(404).json({ message: 'Examenes no encontrados' });
        }
        return res.json(examenes);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener examenes' });
    }
}

const findLastExamenByHistoriaId = async (req, res) => {
    const { idHistoria } = req.params;
    try {
        const examenesPaciente = await service.findByHistoria(idHistoria);
        const lastExamen = examenesPaciente[examenesPaciente.length - 1];

        if (lastExamen) {
            return res.json(lastExamen);
        } else {
            return null; // Puedes manejar el caso en que no haya registros
        }
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener examen' });
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
    fileUpload, create, get, getById, getByHistoria, update, _delete, findLastExamenByHistoriaId, changeStatus
};