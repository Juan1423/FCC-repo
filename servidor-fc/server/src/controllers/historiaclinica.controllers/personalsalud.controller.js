const PersonalSaludService = require('../../services/historiaclinica.services/personalsalud.service');
const service = new PersonalSaludService();
const multer = require('multer');
const multerConfig = require('../../utils/multerConfigPersonal');
const { pickFields } = require('../../utils/security.utils');
const { validateUploadedFileSignatures } = require('../../utils/fileSignature');

// M-07: solo columnas editables de personalsalud.
const PERSONAL_FIELDS = [
    'id_especialidad', 'nombres_personal', 'apellidos_personal',
    'nacionalidad_personal', 'tipo_dni_personal', 'dni_personal',
    'titulos_personal', 'telefono_personal', 'direccion_personal',
    'email_personal', 'hdv_personal', 'foto_personal', 'estado_personal',
    'fecha_nacimiento_personal', 'fecha_registro_personal', 'licencia_personal',
];

const upload = multer(multerConfig).fields([
    { name: 'hdv_personal', maxCount: 1 },
    { name: 'foto_personal', maxCount: 1 },
]);

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
        const body = pickFields(req.body, PERSONAL_FIELDS);
        if (req.files) {
            if (req.files['foto_personal']) {
                body.foto_personal = `/uploads/personal/perfil/archivo/${req.files['foto_personal'][0].filename}`;
            }
            if (req.files['hdv_personal']) {
                body.hdv_personal = `/uploads/personal/hdv/archivo/${req.files['hdv_personal'][0].filename}`;
            }
        }

        const response = await service.create(body);
        res.json({ success: true, data: response });
    } catch (error) {
        console.error('Error creando personal de salud:', error);
        res.status(500).send({ success: false, message: 'Error interno del servidor' });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const raw = req.body || {};
        const body = pickFields(raw, PERSONAL_FIELDS);

        if (req.files) {
            if (req.files['foto_personal']) {
                body.foto_personal = `/uploads/personal/perfil/archivo/${req.files['foto_personal'][0].filename}`;
            } else if (raw.foto_personal === 'null') {
                body.foto_personal = null;
            }
            if (req.files['hdv_personal']) {
                body.hdv_personal = `/uploads/personal/hdv/archivo/${req.files['hdv_personal'][0].filename}`;
            } else if (raw.hdv_personal === 'null') {
                body.hdv_personal = null;
            }
        }

        const response = await service.update(id, body);
        res.json(response);
    } catch (error) {
        console.error('Error actualizando personal de salud:', error);
        res.status(500).send({ success: false, message: 'Error interno del servidor' });
    }
};



const get = async (req, res) => {
    try {
        const response = await service.find();
        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
}

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await service.findOne(id);
        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
}

const logicalDelete = async (req, res) => {
    try {
      const { id } = req.params;
      var personal = await service.findOne(id);
      const actualizarPersonal = [];
      actualizarPersonal.estado_personal = !personal.estado_personal;            
      const response = await service.update(id, actualizarPersonal);
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
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
}

const getEstadisticas = async (req, res) => {
    try {
      const { id } = req.params;
      const response = await service.getEstadisticas(id);
      res.json(response);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

module.exports = {
    fileUpload, create, get, getById, update, _delete, logicalDelete,getEstadisticas
};
