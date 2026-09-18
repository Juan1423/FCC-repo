'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const sequelize = require('../libs/sequelize');
const { models } = sequelize;
const { OpenAI } = require('openai');
const chatConfig = require('../config/chatConfig');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const EMBEDDING_MODEL = chatConfig.embeddingModel || 'text-embedding-ada-002';

async function generateEmbedding(text) {
    if (!text || text.trim().length === 0) return null;
    const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: text.substring(0, 8000),
    });
    return response.data[0].embedding;
}

async function regenerateChatConocimiento() {
    console.log('\n=== Regenerando embeddings para chat_conocimiento ===');
    const rows = await models.ChatConocimiento.findAll({
        where: { estado_vigencia: true, bloqueado: false },
        attributes: ['id_conocimiento', 'contenido', 'respuesta_oficial', 'pregunta_frecuente'],
        raw: true,
    });

    let updated = 0;
    for (const row of rows) {
        const text = row.contenido || row.respuesta_oficial || row.pregunta_frecuente || '';
        if (!text.trim()) continue;

        const embedding = await generateEmbedding(text);
        if (embedding) {
            await models.ChatConocimiento.update(
                { embedding: JSON.stringify(embedding) },
                { where: { id_conocimiento: row.id_conocimiento } }
            );
            updated++;
            if (updated % 50 === 0) console.log(`  Procesados ${updated}/${rows.length}...`);
        }
    }
    console.log(`✓ chat_conocimiento: ${updated} embeddings actualizados`);
    return updated;
}

async function regenerateChatRespuestaCanonica() {
    console.log('\n=== Regenerando embeddings para chat_respuesta_canonica ===');
    const rows = await models.ChatRespuestaCanonica.findAll({
        where: { activo: true },
        attributes: ['id_canonica', 'patron_trigger', 'respuesta_canonica'],
        raw: true,
    });

    let updated = 0;
    for (const row of rows) {
        const text = row.patron_trigger || row.respuesta_canonica || '';
        if (!text.trim()) continue;

        const embedding = await generateEmbedding(text);
        if (embedding) {
            await models.ChatRespuestaCanonica.update(
                { embedding_trigger: JSON.stringify(embedding) },
                { where: { id_canonica: row.id_canonica } }
            );
            updated++;
        }
    }
    console.log(`✓ chat_respuesta_canonica: ${updated} embeddings actualizados`);
    return updated;
}

async function regenerateChatProtocoloSensible() {
    console.log('\n=== Regenerando embeddings para chat_protocolos_sensibles ===');
    const rows = await models.ChatProtocoloSensible.findAll({
        where: { activo: true },
        attributes: ['id_protocolo', 'categoria', 'palabras_clave', 'respuesta_canonica'],
        raw: true,
    });

    let updated = 0;
    for (const row of rows) {
        let keywords = [];
        try {
            keywords = JSON.parse(row.palabras_clave || '[]');
        } catch (e) {
            keywords = [];
        }
        const textoRepresentativo = `${row.categoria} ${keywords.join(' ')}`.trim();
        if (!textoRepresentativo) continue;

        const embedding = await generateEmbedding(textoRepresentativo);
        if (embedding) {
            await models.ChatProtocoloSensible.update(
                { embedding_keywords: JSON.stringify(embedding) },
                { where: { id_protocolo: row.id_protocolo } }
            );
            updated++;
        }
    }
    console.log(`✓ chat_protocolos_sensibles: ${updated} embeddings actualizados`);
    return updated;
}

async function main() {
    console.log('🔄 Iniciando regeneración completa de embeddings...');
    console.log(`Modelo de embeddings: ${EMBEDDING_MODEL}`);

    try {
        await sequelize.authenticate();
        console.log('✓ Conexión a BD establecida');

        const results = await Promise.all([
            regenerateChatConocimiento(),
            regenerateChatRespuestaCanonica(),
            regenerateChatProtocoloSensible(),
        ]);

        const total = results.reduce((a, b) => a + b, 0);
        console.log(`\n✅ Regeneración completada. Total embeddings actualizados: ${total}`);

    } catch (error) {
        console.error('❌ Error durante la regeneración:', error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

if (require.main === module) {
    main();
}

module.exports = { main, generateEmbedding };