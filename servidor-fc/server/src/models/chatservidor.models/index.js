const { DocumentoConocimiento, DocumentoConocimientoSchema } = require('./documento_conocimiento.model');
const { SegmentoVector, SegmentoVectorSchema } = require('./segmento_vector.model');
const { HistorialIA, HistorialIASchema } = require('./historial_ia.model');

function setupIAModels(sequelize) {
    DocumentoConocimiento.init(DocumentoConocimientoSchema, DocumentoConocimiento.config(sequelize));
    SegmentoVector.init(SegmentoVectorSchema, SegmentoVector.config(sequelize));
    HistorialIA.init(HistorialIASchema, HistorialIA.config(sequelize));

    // Configurar asociaciones si las hay
    DocumentoConocimiento.associate(sequelize.models);
    SegmentoVector.associate(sequelize.models);
    HistorialIA.associate(sequelize.models);
}

module.exports = setupIAModels;