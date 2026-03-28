const { models } = require('./src/libs/sequelize');

async function testDB() {
  try {
    console.log('Conectando a la base de datos...');

    // Verificar usuarios
    const users = await models.Usuario.findAll({ limit: 2 });
    console.log(`Usuarios encontrados: ${users.length}`);
    if (users.length > 0) {
      users.forEach((user, index) => {
        console.log(`Usuario ${index + 1}: ID=${user.id_usuario}, Email=${user.correo_usuario}, Nombre=${user.nombre_usuario}`);
      });
    }

    // Verificar prompts
    const prompts = await models.Prompt.findAll({ limit: 2 });
    console.log(`Prompts encontrados: ${prompts.length}`);
    if (prompts.length > 0) {
      prompts.forEach((prompt, index) => {
        console.log(`Prompt ${index + 1}: ID=${prompt.id_prompt}, Titulo=${prompt.titulo}, Activo=${prompt.activo}`);
      });
    } else {
      console.log('No hay prompts. Creando uno de prueba...');
      try {
        const nuevoPrompt = await models.Prompt.create({
          titulo: 'Asistente de Prueba',
          descripcion: 'Prompt de prueba para verificar el funcionamiento del chatbot',
          instrucciones: 'Eres un asistente de prueba. Responde de manera amable y útil a las preguntas del usuario. Si no sabes algo, di que no tienes información al respecto.',
          tipo_prompt: 'instrucciones',
          activo: true
        });
        console.log('Prompt de prueba creado:', nuevoPrompt.id_prompt);
      } catch (error) {
        console.error('Error creando prompt de prueba:', error.message);
      }
    }

    console.log('Prueba completada exitosamente');
  } catch (error) {
    console.error('Error en la prueba:', error.message);
  }
  process.exit(0);
}

testDB();
