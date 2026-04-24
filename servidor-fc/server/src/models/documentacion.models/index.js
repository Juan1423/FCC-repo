const { TipoDocumento, TipoDocumentoSchema } = require('./tipo_documento.model');
const { TipoIndicador, TipoIndicadorSchema } = require('./tipo_indicador.model');
const { TipoInstitucion, TipoInstitucionSchema } = require('./tipo_institucion.model');
const { DocTipoNormativa, DocTipoNormativaSchema } = require('./tipo_normativa.model');
const { DocTipoProceso, DocTipoProcesoSchema } = require('./tipo_proceso.model');
const { Modulo, ModuloSchema } = require('./modulo.model');
const { Proceso, ProcesoSchema } = require('./proceso.model');
const { DocNormativa, DocNormativaSchema } = require('./normativa.model');
const { Indicador, IndicadorSchema } = require('./indicador.model');
const { Institucion, InstitucionSchema } = require('./institucion.model');
const { Documento, DocumentoSchema } = require('./documento.model');
const { RegistrarProcesos, RegistrarProcesosSchema } = require('./registrar_procesos.model');

const { Paciente } = require('../historiaclinica.models/paciente.model');

function setupDocumentacionModels(sequelize) {
    TipoDocumento.init(TipoDocumentoSchema, TipoDocumento.config(sequelize));
    TipoIndicador.init(TipoIndicadorSchema, TipoIndicador.config(sequelize));
    TipoInstitucion.init(TipoInstitucionSchema, TipoInstitucion.config(sequelize));
    DocTipoNormativa.init(DocTipoNormativaSchema, DocTipoNormativa.config(sequelize));
    DocTipoProceso.init(DocTipoProcesoSchema, DocTipoProceso.config(sequelize));
    Modulo.init(ModuloSchema, Modulo.config(sequelize));
    Proceso.init(ProcesoSchema, Proceso.config(sequelize));
    DocNormativa.init(DocNormativaSchema, DocNormativa.config(sequelize));
    Indicador.init(IndicadorSchema, Indicador.config(sequelize));
    Institucion.init(InstitucionSchema, Institucion.config(sequelize));
    Documento.init(DocumentoSchema, Documento.config(sequelize));
    RegistrarProcesos.init(RegistrarProcesosSchema, RegistrarProcesos.config(sequelize));

    TipoDocumento.associate({ Documento });
    TipoIndicador.associate({ Indicador });
    TipoInstitucion.associate({ Institucion });
    DocTipoNormativa.associate({ DocNormativa });
    DocTipoProceso.associate({ Proceso });
    Modulo.associate({ Documento });
    Proceso.associate({ DocTipoProceso, Proceso, Documento, RegistrarProcesos });
    DocNormativa.associate({ DocTipoNormativa, DocNormativa, RegistrarProcesos });
    Indicador.associate({ TipoIndicador, RegistrarProcesos });
    Institucion.associate({ TipoInstitucion });
    Documento.associate({ TipoDocumento, Modulo, Proceso });
    RegistrarProcesos.associate({ Proceso, Indicador, DocNormativa });
}

module.exports = setupDocumentacionModels;