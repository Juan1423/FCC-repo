require('dotenv').config();
const fetch = require('node-fetch');

async function enviarPreguntaOpenAI(mensaje) {
  const apiKey = process.env.OPENAI_API_KEY;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: mensaje }],
      temperature: 0.7
    })
  });

  const data = await response.json();
  if (response.ok) {
    return data.choices[0].message.content;
  } else {
    console.error('Error de OpenAI:', data);
    throw new Error(data.error.message || 'Error desconocido');
  }
}

module.exports = { enviarPreguntaOpenAI };
