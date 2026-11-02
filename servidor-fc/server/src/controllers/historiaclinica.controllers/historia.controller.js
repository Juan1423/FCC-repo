const HistoriaService = require('../../services/historiaclinica.services/historia.service');
const { Historia } = require('../../models/historiaclinica.models/historia.model');
const { pickModelFields } = require('../../utils/security.utils');
const service = new HistoriaService();

const create = async (req, res) => {
  try {
    const body = pickModelFields(Historia, req.body);

    // Handle JSON fields
    ['ant_familiares_materno', 'ant_familiares_paterno', 'otros_antecedentes',
     'ant_prenatales', 'ant_perinatales', 'ant_postnatales'].forEach(field => {
      if (body[field]) {
        if (typeof body[field] === 'string') {
          try {
            body[field] = JSON.parse(body[field]);
          } catch (error) {
            // If parsing fails, keep the raw value to avoid data loss
          }
        }
        // Ensure the field is a valid object, if not, set to empty object
        if (typeof body[field] !== 'object' || body[field] === null) {
          body[field] = {};
        }
      } else {
        // If the field is not present in the body, set it to an empty object
        body[field] = {};
      }
    });

    // Handle array fields
    ['alergias', 'medicamentos', 'tratamientos_recibidos'].forEach(field => {
      if (body[field]) {
        let newItems;
        if (typeof body[field] === 'string') {
          try {
            newItems = JSON.parse(body[field]);
          } catch (error) {
            newItems = body[field].split(',').map(item => item.trim());
          }
        } else if (Array.isArray(body[field])) {
          newItems = body[field];
        } else {
          newItems = [];
        }
        body[field] = newItems;
      } else {
        body[field] = [];
      }
    });

    // Convert boolean fields
    if (body.seguro_social !== undefined) {
      body.seguro_social = body.seguro_social === true || body.seguro_social === 'true';
    }

    // Handle date field
    if (body.fecha_historia) {
      body.fecha_historia = new Date(body.fecha_historia);
    }

    // Handle text fields
    ['motivo_consulta_historia', 'diagnostico_presuntivo', 'observaciones'].forEach(field => {
      if (body[field] && typeof body[field] !== 'string') {
        body[field] = String(body[field]);
      }
    });

    const response = await service.create(body);
    res.json({ success: true, data: response });
  } catch (error) {
    console.error('Error creating record:', error);
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
    const body = pickModelFields(Historia, req.body);

    const existingRecord = await service.findOne(id);
    if (!existingRecord) {
      return res.status(404).send({ success: false, message: 'Record not found' });
    }

    // Handle JSON fields
    ['ant_familiares_materno', 'ant_familiares_paterno', 'otros_antecedentes',
     'ant_prenatales', 'ant_perinatales', 'ant_postnatales'].forEach(field => {
      if (body[field]) {
        if (typeof body[field] === 'string') {
          try {
            body[field] = JSON.parse(body[field]);
          } catch (error) {
            // Keep raw value on parse failure
          }
        }
        if (typeof body[field] !== 'object' || body[field] === null) {
          body[field] = null;
        }
      }
    });

    // Handle array fields
    ['alergias', 'medicamentos', 'tratamientos_recibidos'].forEach(field => {
      if (body[field]) {
        let newItems;
        if (typeof body[field] === 'string') {
          try {
            newItems = JSON.parse(body[field]);
          } catch (error) {
            newItems = body[field].split(',').map(item => item.trim());
          }
        } else if (Array.isArray(body[field])) {
          newItems = body[field];
        } else {
          newItems = [];
        }
        body[field] = newItems;
      }
    });

    // Convert boolean fields
    if (body.seguro_social !== undefined) {
      body.seguro_social = body.seguro_social === true || body.seguro_social === 'true';
    }

    // Handle date field
    if (body.fecha_historia) {
      body.fecha_historia = new Date(body.fecha_historia);
    }

    // Handle text fields
    ['motivo_consulta_historia', 'diagnostico_presuntivo', 'observaciones'].forEach(field => {
      if (body[field] && typeof body[field] !== 'string') {
        body[field] = String(body[field]);
      }
    });

    const response = await service.update(id, body);
    res.json(response);
  } catch (error) {
    console.error('Error updating record:', error);
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

module.exports = {
  create, get, getById, update, _delete
};
