const fetch = require('node-fetch');

async function testChatbot() {
  try {
    console.log('=== PRUEBA COMPLETA DEL CHATBOT ===\n');

    // Paso 1: Login
    console.log('1. Intentando login...');
    const loginResponse = await fetch('http://localhost:5000/api/fcc/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        correo_usuario: 'admin@admin.com',
        password_usuario: '12345678'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    if (!loginData.token) {
      throw new Error('Login falló');
    }

    const token = loginData.token;
    console.log('✅ Login exitoso, token obtenido\n');

    // Paso 2: Probar endpoint /chat
    console.log('2. Probando endpoint /chat...');
    const chatResponse = await fetch('http://localhost:5000/api/fcc/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': token
      },
      body: JSON.stringify({
        mensaje: 'Hola, ¿puedes presentarte?',
        promptId: 1
      })
    });

    const chatData = await chatResponse.json();
    console.log('Chat response:', chatData);

    if (chatData.respuesta) {
      console.log('✅ Chatbot respondió correctamente\n');
      console.log('Respuesta del bot:', chatData.respuesta);
    } else {
      console.log('❌ El chatbot no respondió');
      console.log('Error:', chatData);
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

testChatbot();
