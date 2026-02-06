const { TipoDocumento, TipoDocumentoSchema } = require('./tipo_documento.model');
const {Documento, DocumentoSchema } = require("./documento.model")


function setupDocumentacionModels(sequelize) {


   //models
   TipoDocumento.init(TipoDocumentoSchema, TipoDocumento.config(sequelize));
   Documento.init(DocumentoSchema, Documento.config(sequelize));

   //association
   TipoDocumento.associate({ Documento});//a inicializar las asociasiones

}

module.exports = setupDocumentacionModels;
