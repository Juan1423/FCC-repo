const { Provincia, ProvinciaSchema } = require('./provincia.model');
const { Canton, CantonSchema} = require('./canton.model');
const { Procesos, ProcesoSchema} = require('./procesos.model');
const { TipoProceso, TipoProcesoSchema} = require('./tipo_proceso.model');
const { Normativa, NormativaSchema} = require('./normativa.model');
const { TipoNormativa, TipoNormativaSchema} = require('./tipo_normativa.model');

const { Parroquia, ParroquiaSchema } = require('./parroquia.model');
const { TipoPersona, TipoPersonaSchema } = require('./tipo_persona.model');
const { Persona, PersonaSchema } = require('./persona.model');
const { Interaccion, InteraccionSchema } = require('./interaccion.model');
const { PersonaInteraccion, PersonaInteraccionSchema } = require('./persona_interaccion.model');
const { DocumentoInteraccion, DocumentoInteraccionSchema } = require('./documento_interaccion.model');

function setupComunidadModels(sequelize) {


   //models
   Provincia.init(ProvinciaSchema, Provincia.config(sequelize));
   Canton.init(CantonSchema, Canton.config(sequelize));
   Parroquia.init(ParroquiaSchema, Parroquia.config(sequelize)); 
   TipoPersona.init(TipoPersonaSchema, TipoPersona.config(sequelize));
   Persona.init(PersonaSchema, Persona.config(sequelize));
   Interaccion.init(InteraccionSchema, Interaccion.config(sequelize));
   PersonaInteraccion.init(PersonaInteraccionSchema, PersonaInteraccion.config(sequelize));
   DocumentoInteraccion.init(DocumentoInteraccionSchema, DocumentoInteraccion.config(sequelize));
   Procesos.init(ProcesoSchema, Procesos.config(sequelize));
   TipoProceso.init(TipoProcesoSchema, TipoProceso.config(sequelize));
   Normativa.init(NormativaSchema, Normativa.config(sequelize));
   TipoNormativa.init(TipoNormativaSchema, TipoNormativa.config(sequelize));

   //association
   Provincia.associate({ Canton });
   Canton.associate({ Provincia, Parroquia });
   Parroquia.associate({ Canton,Persona});
   TipoPersona.associate({ Persona});
   Persona.associate({ Parroquia, TipoPersona, Interaccion, PersonaInteraccion});
   Interaccion.associate({ Persona, PersonaInteraccion});
   DocumentoInteraccion.associate(sequelize.models);
   Interaccion.associate({ Persona, PersonaInteraccion,Procesos});
   Normativa.associate({TipoNormativa, Procesos})
   Procesos.associate({Interaccion,TipoProceso, Normativa});



}

module.exports = setupComunidadModels;
