export const atencion_data=()=>{
  let data = {};
  data.tabla = "atencion_medica";
  data.id_aps = null;
  data.id_historia = null;
  data.id_personalsalud = null;
  data.problema_actual = "";
  data.fecha_atencion = null;
  data.motivo_consulta = "";
  data.revision_actual_sistema = {};
  data.examen_fisico = {};
  data.plan_tratamiento = "";
  data.prescripciones = {};
  data.diagnostico = {};
  return data;
};

export const auditoria_data = () => {
  let data = {};
  data.tabla = "auditoria";
  data.id_auditoria = null;
  data.id_usuario = null;
  data.modulo = "";
  data.operacion = "";
  data.detalle = "";
  data.fecha = new Date();
  return data;
};

export const enfermedad_data = () => {
  let data = {};
  data.tabla = "enfermedades";
  data.id_enfermedad = null; // Clave primaria, se puede inicializar como null
  data.id_historia = null; // Clave foránea, se puede inicializar como null
  data.codigo_enfermedad = ""; // Tipo STRING(240), ejemplo vacío
  data.tipo_enfermedad = ""; // Tipo STRING(240), ejemplo vacío
  data.nombre_enfermedad = ""; // Tipo STRING(240), ejemplo vacío
  data.descripcion_enfermedad = ""; // Tipo STRING(240), ejemplo vacío
  return data;
};

export const especialidad_data = () => {
  let data = {};
  data.tabla = "especialidad";
  data.id_especialidad = null; // Clave primaria, se puede inicializar como null
  data.id_tipo_especialidad = null; // Clave foránea, se puede inicializar como null
  data.nombre_especialidad = ""; // Tipo STRING(240), ejemplo vacío
  return data;
};


export const examen_data = () => {
  let data = {};
  data.tabla = "examen";
  data.id_examen = null; // Clave primaria, se puede inicializar como null
  data.id_historia = null; // Clave foránea, se puede inicializar como null
  data.fecha_solicitud_examen = null; // Tipo DATE, ejemplo vacío
  data.url_examen = ""; // Tipo TEXT, ejemplo vacío
  data.nombre_examen = ""; // Tipo STRING(240), ejemplo vacío
  data.comentario_examen = ""; // Tipo STRING(240), ejemplo vacío
  data.estado_examen = ""; // Tipo STRING(40), ejemplo vacío
  data.id_aps = null; // Clave foránea, se puede inicializar como null
  return data;
};


export const historia_data = () => {
  let data = {};
  data.tabla = "historia";
  data.id_historia = null; // No puede ser null, ya que es la clave primaria
  data.id_paciente = null; // No puede ser null, debido a la restricción de allowNull: false
  data.codigo_historia = ""; // Tipo STRING, ejemplo vacío
  data.fecha_historia = null; // Tipo DATE, ejemplo vacío
  data.motivo_consulta_historia = ""; // Tipo TEXT, ejemplo vacío
  data.ant_familiares_materno = null; // Tipo JSON, ejemplo vacío
  data.ant_familiares_paterno = null; // Tipo JSON, ejemplo vacío
  data.otros_antecedentes = null; // Tipo JSON, ejemplo vacío
  data.ant_prenatales = null; // Tipo JSON, ejemplo vacío
  data.ant_perinatales = null; // Tipo JSON, ejemplo vacío
  data.ant_postnatales = null; // Tipo JSON, ejemplo vacío
  data.seguro_social = null; // Tipo BOOLEAN, ejemplo vacío
  data.alergias = null; // Tipo ARRAY, ejemplo vacío
  data.medicamentos = null; // Tipo ARRAY, ejemplo vacío
  data.diagnostico_presuntivo = ""; // Tipo TEXT, ejemplo vacío
  data.tratamientos_recibidos = null; // Tipo ARRAY, ejemplo vacío
  data.observaciones = ""; // Tipo TEXT, ejemplo vacío
  return data;
};


export const paciente_data = () => {
  let data = {};
  data.tabla = "paciente";
  data.id_paciente = null; // No puede ser null, ya que es la clave primaria
  data.nombre_paciente = ""; // Tipo STRING(30), ejemplo vacío
  data.apellidos_paciente = ""; // Tipo STRING(30), ejemplo vacío
  data.nacionalidad_paciente = ""; // Tipo STRING(20), ejemplo vacío
  data.tipo_dni_paciente = ""; // Tipo STRING(20), ejemplo vacío
  data.dni_paciente = ""; // Tipo STRING(20), ejemplo vacío
  data.direccion_paciente = ""; // Tipo STRING(240), ejemplo vacío
  data.telefono_paciente = ""; // Tipo STRING(30), ejemplo vacío
  data.email_paciente = ""; // Tipo STRING(120), ejemplo vacío
  data.tiposangre_paciente = ""; // Tipo STRING(240), ejemplo vacío
  data.edad_paciente = null; // Tipo INTEGER, ejemplo vacío
  data.fecha_paciente = null; // Tipo DATE, ejemplo vacío
  data.genero_paciente = ""; // Tipo STRING(15), ejemplo vacío
  data.familiar_cuidador = ""; // Tipo STRING(30), ejemplo vacío
  data.parentesco_familiar = ""; // Tipo STRING(30), ejemplo vacío
  data.telefono_cuidador = ""; // Tipo STRING(30), ejemplo vacío
  data.foto_paciente = ""; // Tipo STRING(120), ejemplo vacío
  data.estado_paciente = true; // Tipo BOOLEAN, por defecto es true
  data.archivo_documentos_cedulas = ""; // Tipo TEXT, ejemplo vacío
  data.archivo_certificado_medico = ""; // Tipo TEXT, ejemplo vacío
  data.biografia_paciente = ""; // Tipo TEXT, ejemplo vacío
  data.fecha_registro_paciente = null; // Tipo DATE, ejemplo vacío
  return data;
};


export const personalSalud_data = () => {
  let data = {};
  data.tabla = "personalsalud";
  data.id_personalsalud = null; // No puede ser null, ya que es la clave primaria
  data.id_especialidad = null; // Clave foránea, se puede inicializar como null
  data.nombres_personal = ""; // Tipo STRING(30), ejemplo vacío
  data.apellidos_personal = ""; // Tipo STRING(30), ejemplo vacío
  data.nacionalidad_personal = ""; // Tipo STRING(30), ejemplo vacío
  data.tipo_dni_personal = ""; // Tipo STRING(20), ejemplo vacío
  data.dni_personal = ""; // Tipo STRING(20), ejemplo vacío
  data.titulos_personal = ""; // Tipo STRING(240), ejemplo vacío
  data.telefono_personal = ""; // Tipo STRING(160), ejemplo vacío
  data.direccion_personal = ""; // Tipo STRING(240), ejemplo vacío
  data.email_personal = ""; // Tipo STRING(240), ejemplo vacío
  data.hdv_personal = ""; // Tipo STRING(240), ejemplo vacío
  data.foto_personal = ""; // Tipo TEXT, ejemplo vacío
  data.estado_personal = true; // Tipo BOOLEAN, por defecto es true
  data.fecha_nacimiento_personal = null; // Tipo DATE, ejemplo vacío
  data.fecha_registro_personal = null; // Tipo DATE, ejemplo vacío
  data.licencia_personal = ""; // Tipo STRING(240), ejemplo vacío
  return data;
};


export const signos_vitales_data = () => {
  let data = {};
  data.tabla = "signos_vitales";
  data.id_signos_vitales = null;
  data.id_historia = null;
  data.id_aps = null;
  data.fecha_medicion = null;
  data.temperatura = null;
  data.presion_arterial = "";
  data.pulso = null;
  data.frecuencia_respiratoria = null;
  data.peso = null;
  data.talla = null;
  return data;
};

  export const terapias_data = () => {
    let data = {};
    data.tabla = "terapias";
    data.id_terapia = null;
    data.id_historia = null;
    data.id_personalsalud = null;
    data.id_tipo_terapia = null;
    data.fecha_hora = null;
    data.notas_evolucion = "";
    data.farmacoterapia_indicaciones = "";
    data.url_adjunto = "";
    return data;
};

export const tipo_especialidad_data = () => {
  let data = {};
  data.tabla = "tipo_especialidad";
  data.id_tipo_especialidad = null;
  data.descripcion_tipo_especialidad = "";
  return data;
};
export const tipo_terapia_data = () => {
  let data = {};
  data.tabla = "tipo_terapia";
  data.id_tipo_terapia = null;
  data.nombre_terapia = "";
  return data;
};


export const usuario_data = () => {
  let data = {};
  data.tabla = "usuario";
  data.id_usuario = null;
  data.id_personal_salud = null;
  data.nombre_usuario = "";
  data.apellido_usuario = "";
  data.correo_usuario = "";
  data.password_usuario = "";
  data.rol_usuario = "";
  data.estado_usuario = null;
  return data;
};
