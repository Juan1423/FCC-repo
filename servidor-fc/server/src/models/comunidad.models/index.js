const { Geo, GeoSchema } = require('./geo.model');
const { TipoPersona, TipoPersonaSchema } = require('./tipo_persona.model');
const { Persona, PersonaSchema } = require('./persona.model');
const { Interaccion, InteraccionSchema } = require('./interaccion.model');
const { PersonaInteraccion, PersonaInteraccionSchema } = require('./persona_interaccion.model');
const { DocumentoInteraccion, DocumentoInteraccionSchema } = require('./documento_interaccion.model');

function setupComunidadModels(sequelize) {

   Geo.init(GeoSchema, Geo.config(sequelize));
   TipoPersona.init(TipoPersonaSchema, TipoPersona.config(sequelize));
   Persona.init(PersonaSchema, Persona.config(sequelize));
   Interaccion.init(InteraccionSchema, Interaccion.config(sequelize));
   PersonaInteraccion.init(PersonaInteraccionSchema, PersonaInteraccion.config(sequelize));
   DocumentoInteraccion.init(DocumentoInteraccionSchema, DocumentoInteraccion.config(sequelize));

   Geo.associate({ Geo, Persona });
   TipoPersona.associate({ Persona});
   Persona.associate({ Geo, TipoPersona, Interaccion, PersonaInteraccion});
   DocumentoInteraccion.associate(sequelize.models);
   Interaccion.associate({ Persona, PersonaInteraccion});
}

module.exports = setupComunidadModels;