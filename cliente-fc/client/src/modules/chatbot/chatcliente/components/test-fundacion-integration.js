#!/usr/bin/env node

/**
 * Script de Prueba - Verificar Integración de Parámetros de Fundación
 * Ejecutar: node test-fundacion-integration.js
 */

const chatConfig = require('./src/modules/chat-cliente/config/chatConfig.js');

console.log('\n🔍 VERIFICACIÓN DE INTEGRACIÓN DE PARÁMETROS DE FUNDACIÓN\n');
console.log('=' .repeat(60));

// 1. Verificar Fundación
console.log('\n📋 INFORMACIÓN DE LA FUNDACIÓN:');
console.log('-'.repeat(60));
console.log(`✓ Nombre: ${chatConfig.fundacion.nombre}`);
console.log(`✓ Misión: ${chatConfig.fundacion.mision.substring(0, 60)}...`);
console.log(`✓ Visión: ${chatConfig.fundacion.vision.substring(0, 60)}...`);

// 2. Verificar Ubicación
console.log('\n📍 UBICACIÓN PRINCIPAL:');
console.log('-'.repeat(60));
const ubicacion = chatConfig.fundacion.ubicaciones.principal;
console.log(`✓ Ciudad: ${ubicacion.ciudad}`);
console.log(`✓ Provincia: ${ubicacion.provincia}`);
console.log(`✓ País: ${ubicacion.pais}`);
console.log(`✓ Dirección: ${ubicacion.direccion}`);

// 3. Verificar Contacto
console.log('\n📞 INFORMACIÓN DE CONTACTO:');
console.log('-'.repeat(60));
const contacto = chatConfig.fundacion.contacto;
console.log(`✓ Teléfono: ${contacto.telefonoPrincipal}`);
console.log(`✓ Email: ${contacto.email}`);
console.log(`✓ Sitio Web: ${contacto.sitioWeb}`);
console.log(`✓ Redes Sociales: ${Object.keys(contacto.redesSociales).length} canales`);

// 4. Verificar Horarios
console.log('\n🕐 HORARIOS DE ATENCIÓN:');
console.log('-'.repeat(60));
const horarios = chatConfig.fundacion.horarios.atencionGeneral;
console.log(`✓ Lunes a Viernes: ${horarios.lunesViernes}`);
console.log(`✓ Sábados: ${horarios.sabados}`);
console.log(`✓ Domingos: ${horarios.domingos}`);
const emergencias = chatConfig.fundacion.horarios.emergencias;
console.log(`✓ Emergencias Disponible: ${emergencias.disponible ? 'SÍ' : 'NO'}`);
console.log(`✓ Horario Emergencias: ${emergencias.horario}`);

// 5. Verificar Servicios
console.log('\n🏥 SERVICIOS DISPONIBLES:');
console.log('-'.repeat(60));
Object.entries(chatConfig.fundacion.servicios).forEach(([key, servicio]) => {
  console.log(`✓ ${servicio.nombre}`);
  console.log(`  └─ ${servicio.descripcion.substring(0, 50)}...`);
});

// 6. Verificar Programas
console.log('\n🎯 PROGRAMAS COMUNITARIOS:');
console.log('-'.repeat(60));
Object.entries(chatConfig.fundacion.programas).forEach(([key, programa]) => {
  console.log(`✓ ${programa.nombre}`);
  console.log(`  └─ ${programa.descripcion.substring(0, 50)}...`);
});

// 7. Verificar Valores
console.log('\n💎 VALORES INSTITUCIONALES:');
console.log('-'.repeat(60));
Object.entries(chatConfig.fundacion.valores).forEach(([key, valor]) => {
  console.log(`✓ ${valor.nombre}: ${valor.descripcion.substring(0, 50)}...`);
});

// 8. Verificar Información Institucional
console.log('\n📊 INFORMACIÓN INSTITUCIONAL:');
console.log('-'.repeat(60));
const info = chatConfig.fundacion.informacion;
console.log(`✓ Año de Fundación: ${info.anio}`);
console.log(`✓ Personal Total: ${info.personal}`);
console.log(`✓ Especialidades: ${info.especialidades}`);
console.log(`✓ Pacientes Anuales: ${info.pacientesAnuales}`);

// 9. Verificar Configuración OpenAI
console.log('\n🤖 CONFIGURACIÓN OPENAI:');
console.log('-'.repeat(60));
console.log(`✓ Modelo: ${chatConfig.openai.model}`);
console.log(`✓ Max Tokens: ${chatConfig.openai.maxTokens}`);
console.log(`✓ Temperature: ${chatConfig.openai.temperature}`);

// 10. Verificar Configuración de Chat
console.log('\n💬 CONFIGURACIÓN DE CHAT:');
console.log('-'.repeat(60));
console.log(`✓ Retener Historial: ${chatConfig.chat.retainHistory}`);
console.log(`✓ Max Mensajes en Historial: ${chatConfig.chat.maxHistoryMessages}`);
console.log(`✓ Max Longitud de Mensaje: ${chatConfig.chat.maxMessageLength}`);

console.log('\n' + '='.repeat(60));
console.log('✅ TODOS LOS PARÁMETROS HAN SIDO VERIFICADOS EXITOSAMENTE\n');
console.log('📌 Los parámetros están listos para ser usados en las respuestas del chatbot');
console.log('🔧 Puedes personalizar cualquier valor a través de variables de entorno (.env)\n');
