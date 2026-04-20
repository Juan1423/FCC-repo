const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;
const JWT_SECRET = 'FundacionChristo1232024PROD';

// Crear un token válido para prueba
const testToken = jwt.sign({ user: 1, rol: 'paciente' }, JWT_SECRET, { expiresIn: '1h' });
console.log('Token de prueba generado:', testToken);

async function testChat() {
  try {
    console.log('\n=== INICIANDO PRUEBA DE CHAT ===');
    console.log('URL:', `${BASE_URL}/api/fcc/openai/chat`);
    console.log('Token:', testToken);
    
    const response = await fetch(`${BASE_URL}/api/fcc/openai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': testToken
      },
      body: JSON.stringify({
        mensaje: '¿Cuáles son los servicios de la Fundación?',
        promptId: null
      })
    });

    console.log('\nRespuesta HTTP Status:', response.status);
    const data = await response.json();
    console.log('Respuesta:', JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('ERROR:', error.message);
  }
}

// Ejecutar prueba
testChat();
