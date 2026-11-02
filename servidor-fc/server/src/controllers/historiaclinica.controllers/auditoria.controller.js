const AuditoriaService = require("../../services/historiaclinica.services/auditoria.service");
const { Auditoria } = require("../../models/historiaclinica.models/auditoria.model");
const { pickModelFields } = require("../../utils/security.utils");
const service = new AuditoriaService();

const create = async (req, res) => {
  try {
    const data = pickModelFields(Auditoria, req.body);

    // Enhanced validation
    if (!data.id_usuario || !data.modulo || !data.operacion || !data.detalle) {
      console.error("Missing required fields:", {
        id_usuario: !!data.id_usuario,
        modulo: !!data.modulo,
        operacion: !!data.operacion,
        detalle: !!data.detalle
      });
      return res.status(400).json({
        success: false,
        message: "Faltan campos requeridos",
        missingFields: {
          id_usuario: !data.id_usuario,
          modulo: !data.modulo,
          operacion: !data.operacion,
          detalle: !data.detalle
        }
      });
    }

    const response = await service.create(data);
    res.json({
      success: true,
      data: response,
      message: "Auditoría creada exitosamente"
    });

  } catch (error) {
    console.error("Detailed error in audit creation:", {
      message: error.message,
      stack: error.stack,
      details: error.details || 'No additional details'
    });

    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
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
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await service.findOne(id);
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Error interno del servidor' });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const body = pickModelFields(Auditoria, req.body);
    const response = await service.update(id, body);
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Error interno del servidor' });
  }
};

const _delete = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await service.delete(id);
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Error interno del servidor' });
  }
};

module.exports = { create, get, getById, update, _delete };
