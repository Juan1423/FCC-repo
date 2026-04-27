const PacienteService = require('../../services/historiaclinica.services/paciente.service');
const service = new PacienteService();
const { validarTelefono, validarCorreoElectronico } = require('../../utils/validations');
const multerConfig = require('../../utils/multerConfig');
const multer = require('multer');

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
            return next();
        }
    });
};

const create = async (req, res) => {
  try {
    console.log('REQ.BODY en create:', req.body);
    if (req.files) {
      if (req.files.imagen) {
        req.body.foto_paciente = `/uploads/pacientes/perfil/fotos/${req.files.imagen[0].filename}`;
      }
      if (req.files.archivo_documentos_cedulas) {
        req.body.archivo_documentos_cedulas = `/uploads/pacientes/cedulas/archivos/${req.files.archivo_documentos_cedulas[0].filename}`;
      }
      if (req.files.archivo_certificado_medico) {
        req.body.archivo_certificado_medico = `/uploads/pacientes/certificados/archivos/${req.files.archivo_certificado_medico[0].filename}`;
      }
    }
    
    const response = await service.create(req.body);
    res.json({ success: true, data: response });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

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

const logicalDelete = async (req, res) => {
    try {
      const { id } = req.params;
      var paciente = await service.findOne(id);
      const actualizarPaciente = [];
      actualizarPaciente.estado_paciente = !paciente.estado_paciente;       
      const response = await service.update(id, actualizarPaciente);
      res.json(response); 
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    // Manejar la imagen del perfil
    console.log(req.files);
    console.log(req.body);
    if (req.files && req.files.imagen) {
      console.log('entro');
      body.foto_paciente = `/uploads/pacientes/perfil/fotos/${req.files.imagen[0].filename}`;
    } else if (body.imagen === 'null' ) {
      body.foto_paciente = null; // Eliminar la imagen
    }

    // Manejar los documentos de cédulas
    if (req.files && req.files.archivo_documentos_cedulas) {
      body.archivo_documentos_cedulas = `/uploads/pacientes/cedulas/archivos/${req.files.archivo_documentos_cedulas[0].filename}`;
    } else if (body.archivo_documentos_cedulas === 'null') {
      body.archivo_documentos_cedulas = null; // Eliminar el documento de cédula
    }

    // Manejar el certificado médico
    if (req.files && req.files.archivo_certificado_medico) {
      body.archivo_certificado_medico = `/uploads/pacientes/certificados/archivos/${req.files.archivo_certificado_medico[0].filename}`;
    } else if (body.archivo_certificado_medico === 'null') {
      body.archivo_certificado_medico = null; // Eliminar el certificado médico
    }


    const response = await service.update(id, body);
    res.json(response);
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

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
  create,
  get,
  getById,
  update,
  _delete,
  logicalDelete,
  fileUpload
};