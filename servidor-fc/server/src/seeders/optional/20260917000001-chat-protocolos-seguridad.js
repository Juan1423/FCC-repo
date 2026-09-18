'use strict';

const protocolos = [
  {
    categoria: 'inyeccion_prompt_jailbreak',
    palabras_clave: JSON.stringify([
      'olvida tus instrucciones', 'ignora tus instrucciones', 'ignora tu programacion',
      'instrucciones anteriores', 'prompt inicial', 'configuracion del sistema',
      'system prompt', 'rol de sistema', 'revela tus instrucciones', 'revela tu prompt',
      'modo desarrollador', 'modo developer', 'developer mode', 'jailbreak',
      'desbloquea tu programacion', 'accede a tu prompt', 'muestrame tu prompt',
      'actua como chatgpt sin restricciones', 'no tengas filtros'
    ]),
    embedding_keywords: null,
    respuesta_canonica: "No puedo revelar mi configuración interna, mi prompt ni cambiar mis instrucciones. Ese tipo de solicitud no corresponde a los temas de la Fundación Con Cristo (servicios de salud, programas comunitarios, documentación interna). ¿En qué puedo ayudarte con nuestros servicios o programas?",
    accion_requerida: 'derivar_humano_inmediato',
    prioridad: 1,
    activo: true,
  },
  {
    categoria: 'hackeo_acceso_indebido',
    palabras_clave: JSON.stringify([
      'hackear', 'hacking', 'inyeccion sql', 'sql injection', 'inyectar codigo',
      'modificar registros de usuarios', 'acceder sin permiso', 'acceso no autorizado',
      'explotar vulnerabilidad', 'vulnerabilidad del sistema', 'robar credenciales',
      'bypass de autenticacion', 'saltarse la autenticacion', 'forzar la contrasena',
      'phishing', 'troyano', 'malware', 'escaneo de puertos', 'atacar el servidor',
      'métodos de hackeo', 'como hackeo'
    ]),
    embedding_keywords: null,
    respuesta_canonica: "No puedo ayudarte con actividades de hacking, accesos no autorizados ni explotación de vulnerabilidades. Esas acciones son ilegales y van contra la seguridad de la Fundación. Si tienes una inquietud legítima de seguridad informática, repórtala a través de los canales oficiales. ¿Te ayudo con otra consulta sobre nuestros servicios?",
    accion_requerida: 'derivar_humano_inmediato',
    prioridad: 1,
    activo: true,
  },
  {
    categoria: 'pii_datos_personales',
    palabras_clave: JSON.stringify([
      'contrasenas de usuarios', 'numeros de tarjeta', 'tarjetas de credito',
      'datos de tarjetas', 'cedulas de los usuarios', 'correos de los usuarios',
      'datos personales de los usuarios', 'lista de usuarios registrados',
      'extraer informacion personal', 'exfiltrar datos', 'filtracion de datos',
      'robar datos', 'informacion privada de pacientes', 'historiales de otros pacientes',
      'acceder a datos de otros'
    ]),
    embedding_keywords: null,
    respuesta_canonica: "No tengo acceso ni puedo compartir contraseñas, correos, cédulas, historiales clínicos ni datos personales de los usuarios o pacientes. La información personal está protegida y no puede divulgarse. ¿En qué puedo ayudarte con información pública de nuestros servicios?",
    accion_requerida: 'derivar_humano_inmediato',
    prioridad: 2,
    activo: true,
  },
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableName = 'chat_protocolos_sensibles';
    const categorias = protocolos.map(p => p.categoria);

    const rows = await queryInterface.sequelize.query(
      `SELECT COUNT(*) as count FROM fcc_historiaclinica.${tableName} WHERE categoria IN (:categorias)`,
      {
        replacements: { categorias },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    const existingCount = rows.length > 0 ? parseInt(rows[0].count) : 0;
    if (existingCount === 0) {
      await queryInterface.bulkInsert(
        { tableName, schema: 'fcc_historiaclinica' },
        protocolos,
        {}
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete(
      { tableName: 'chat_protocolos_sensibles', schema: 'fcc_historiaclinica' },
      { categoria: protocolos.map(p => p.categoria) }
    );
  },
};