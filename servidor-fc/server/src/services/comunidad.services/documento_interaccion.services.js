const { models } = require('../../libs/sequelize'); 

class DocumentoInteraccionService {
  
  async findByInteraccion(interaccionId) {
    return await models.DocumentoInteraccion.findAll({
      where: { interaccion_id: interaccionId, estado: 'ACTIVO' },
      order: [['fecha_carga', 'DESC']]
    });
  }

  async create(data) {
    return await models.DocumentoInteraccion.create(data);
  }

  async delete(id) {
    const doc = await models.DocumentoInteraccion.findByPk(id);
    if (!doc) throw new Error('Documento no encontrado');
    // Borrado lógico
    await doc.update({ estado: 'INACTIVO' });
    return { id };
  }
}

module.exports = DocumentoInteraccionService;