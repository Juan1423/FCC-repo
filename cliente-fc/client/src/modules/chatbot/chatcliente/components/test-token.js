const jwt = require('jsonwebtoken');

const JWT_SECRET = 'FundacionChristo1232024PROD';
const testToken = jwt.sign({ user: 1, rol: 'paciente' }, JWT_SECRET, { expiresIn: '1h' });

console.log('Token para prueba en Postman o curl:');
console.log('');
console.log('Token:', testToken);
console.log('');
console.log('Comando curl:');
console.log(`curl -X POST http://localhost:5000/api/fcc/openai/chat \\`);
console.log(`  -H "Content-Type: application/json" \\`);
console.log(`  -H "token: ${testToken}" \\`);
console.log(`  -d '{"mensaje":"¿Cuáles son los servicios?","promptId":null}'`);
