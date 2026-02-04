const { Enfermedad, EnfermedadSchema } = require("./enfermedades.model");
const { Usuario, UsuarioSchema } = require("./usuario.model");
const { Examen, ExamenSchema } = require("./examen.model");
const { TipoEspecialidad, TipoEspecialidadSchema} = require("./tipo_especialidad.model");
const { Especialidad, EspecialidadSchema } = require("./especialidad.model");
const { Aps, ApsSchema } = require("./atencion.model");
const { PersonalSalud, PersonalSaludSchema } = require("./personalsalud.model");
const { Historia, HistoriaSchema } = require("./historia.model");
const { Paciente, PacienteSchema } = require("./paciente.model");
const { SignosVitales, SignosVitalesSchema } = require("./signosvitales.model");
const { Terapias, TerapiasSchema } = require("./terapias.model");
const { TipoTerapia, TipoTerapiaSchema } = require("./tipo_terapia.model");
const { Auditoria, AuditoriaSchema } = require("./auditoria.model");

function setupHistoriaClinicaModels(sequelize) {
  //models
  Enfermedad.init(EnfermedadSchema, Enfermedad.config(sequelize));
  Examen.init(ExamenSchema, Examen.config(sequelize));
  TipoEspecialidad.init(TipoEspecialidadSchema,TipoEspecialidad.config(sequelize));
  Especialidad.init(EspecialidadSchema, Especialidad.config(sequelize));
  Aps.init(ApsSchema, Aps.config(sequelize));
  PersonalSalud.init(PersonalSaludSchema, PersonalSalud.config(sequelize));
  Historia.init(HistoriaSchema, Historia.config(sequelize));
  Paciente.init(PacienteSchema, Paciente.config(sequelize));
  SignosVitales.init(SignosVitalesSchema, SignosVitales.config(sequelize));
  Terapias.init(TerapiasSchema, Terapias.config(sequelize));
  TipoTerapia.init(TipoTerapiaSchema, TipoTerapia.config(sequelize));
  Usuario.init(UsuarioSchema, Usuario.config(sequelize));
  Auditoria.init(AuditoriaSchema, Auditoria.config(sequelize));

  //association
  Enfermedad.associate({ Historia });
  Usuario.associate({ PersonalSalud, Auditoria });
  Examen.associate({ Historia });
  Aps.associate({ PersonalSalud, Historia });
  TipoEspecialidad.associate({ Especialidad });
  Especialidad.associate({ TipoEspecialidad });
  PersonalSalud.associate({ Especialidad, Usuario });
  Paciente.associate({ SignosVitales, Historia });
  SignosVitales.associate({ Historia });
  Historia.associate({
    Paciente,
    Enfermedad,
    Examen,
    SignosVitales,
    Aps,
    Enfermedad,
  });
  TipoTerapia.associate({ Terapias });
  Terapias.associate({ PersonalSalud, Historia, TipoTerapia });
  Auditoria.associate({ Usuario });
}

module.exports = setupHistoriaClinicaModels;
