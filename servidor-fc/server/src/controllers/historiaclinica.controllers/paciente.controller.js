const PacienteService = require('../../services/historiaclinica.services/paciente.service');
const service = new PacienteService();
const { validarTelefono, validarCorreoElectronico } = require('../../utils/validations');
const { pickFields } = require('../../utils/security.utils');
const { validateUploadedFileSignatures } = require('../../utils/fileSignature');
const multerConfig = require('../../utils/multerConfig');
const multer = require('multer');

// M-07: lista blanca de columnas editables del paciente. Excluye la PK y
// cualquier campo interno que no deba venir del cliente.
const PACIENTE_FIELDS = [
  'nombre_paciente', 'apellidos_paciente', 'nacionalidad_paciente',
  'tipo_dni_paciente', 'dni_paciente', 'direccion_paciente',
  'telefono_paciente', 'email_paciente', 'tiposangre_paciente',
  'edad_paciente', 'fecha_paciente', 'genero_paciente',
  'familiar_cuidador', 'parentesco_familiar', 'telefono_cuidador',
  'foto_paciente', 'estado_paciente', 'archivo_documentos_cedulas',
  'archivo_certificado_medico', 'biografia_paciente', 'fecha_registro_paciente',
];

const upload = multer(multerConfig).fields([
    { name: 'imagen', maxCount: 1 },
    { name: 'archivo_documentos_cedulas', maxCount: 1 },
    { name: 'archivo_certificado_medico', maxCount: 1 }
]);

const fileUpload = async (req, res, next) => {
    upload(req, res, function (error) {
        if (error) {
            res.status(400).json({ success: false, message: error.message });
        } else {
            // C-06: validar contenido real (magic bytes), no solo el mimetype.
            return validateUploadedFileSignatures(req, res, next);
        }
    });
};

const create = async (req, res) => {
  try {
    const body = pickFields(req.body, PACIENTE_FIELDS);
    if (req.files) {
      if (req.files.imagen) {
        body.foto_paciente = `/uploads/pacientes/perfil/fotos/${req.files.imagen[0].filename}`;
      }
      if (req.files.archivo_documentos_cedulas) {
        body.archivo_documentos_cedulas = `/uploads/pacientes/cedulas/archivos/${req.files.archivo_documentos_cedulas[0].filename}`;
      }
      if (req.files.archivo_certificado_medico) {
        body.archivo_certificado_medico = `/uploads/pacientes/certificados/archivos/${req.files.archivo_certificado_medico[0].filename}`;
      }
    }
    
    const response = await service.create(body);
    res.json({ success: true, data: response });
  } catch (error) {
    console.error('Error creando paciente:', error);
    res.status(500).send({ success: false, message: 'Error interno del servidor' });
  }
};

const get = async ( req, res ) => {
    try {
        const response = await service.find();
        res.json(response);
    } catch (error) {
        console.error(error); res.status(500).send({ success: false, message: 'Error interno del servidor' });
    }
}

const getById = async ( req, res ) => {
    try {
        const { id } = req.params;
        const response = await service.findOne(id);
        res.json(response);
    } catch (error) {
        console.error(error); res.status(500).send({ success: false, message: 'Error interno del servidor' });
    }
}

const logicalDelete = async (req, res) => {
    try {
      const { id } = req.params;
      var paciente = await service.findOne(id);
      const actualizarPaciente = [];
      actualizarPaciente.estado_paciente = !paciente.estado_paciente;       
      const response = await service.update(id, actualizarPaciente);
      res.json(response); 
    } catch (error) {
        console.error(error); res.status(500).send({ success: false, message: 'Error interno del servidor' });
    }
}

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const raw = req.body || {};
    const body = pickFields(raw, PACIENTE_FIELDS);

    // Manejar la imagen del perfil
    if (req.files && req.files.imagen) {
      body.foto_paciente = `/uploads/pacientes/perfil/fotos/${req.files.imagen[0].filename}`;
    } else if (raw.imagen === 'null') {
      body.foto_paciente = null; // Eliminar la imagen
    }

    // Manejar los documentos de cédulas
    if (req.files && req.files.archivo_documentos_cedulas) {
      body.archivo_documentos_cedulas = `/uploads/pacientes/cedulas/archivos/${req.files.archivo_documentos_cedulas[0].filename}`;
    } else if (raw.archivo_documentos_cedulas === 'null') {
      body.archivo_documentos_cedulas = null; // Eliminar el documento de cédula
    }

    // Manejar el certificado médico
    if (req.files && req.files.archivo_certificado_medico) {
      body.archivo_certificado_medico = `/uploads/pacientes/certificados/archivos/${req.files.archivo_certificado_medico[0].filename}`;
    } else if (raw.archivo_certificado_medico === 'null') {
      body.archivo_certificado_medico = null; // Eliminar el certificado médico
    }


    const response = await service.update(id, body);
    res.json(response);
  } catch (error) {
    console.error('Error actualizando paciente:', error);
    res.status(500).send({ success: false, message: 'Error interno del servidor' });
  }
};

const _delete = async (req, res) => {
    try {
        const { id } = req.params; 
        const response = await service.delete(id);
        res.json(response);
    } catch (error) {
        console.error(error); res.status(500).send({ success: false, message: 'Error interno del servidor' });
    }
}

module.exports = {
  create,
  get,
  getById,
  update,
  _delete,
  logicalDelete,
  fileUpload
};