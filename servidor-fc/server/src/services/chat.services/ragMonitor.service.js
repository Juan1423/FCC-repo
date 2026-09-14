'use strict';

const { models } = require('../../libs/sequelize');
const { Op } = require('sequelize');

const FRASES_INSUFICIENTE = [
    'no tengo información suficiente',
    'no tengo informacion suficiente',
    'no encontré información',
    'no encontre informacion',
    'no tengo datos suficientes',
    'no tengo la información necesaria',
];

class RagMonitorService {
    normalize(text) {
        if (!text) return '';
        return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    }

    clasificar({ similitudMaxima = 0, umbral = 0.7, respuesta = '', contextoIncluido = false } = {}) {
        const normalized = this.normalize(respuesta);
        const pareceInsuficiente = FRASES_INSUFICIENTE.some((frase) => normalized.includes(frase));
        const contextoUtil = contextoIncluido && similitudMaxima >= umbral;

        return {
            respuesta_insuficiente: pareceInsuficiente,
            flag_modelo_ignoro: contextoUtil && pareceInsuficiente,
            flag_busqueda_pobre: !contextoUtil && pareceInsuficiente,
        };
    }

    async registrar({
        idConversacion = null,
        tipo = 'publico',
        pregunta,
        respuesta = null,
        resultados = [],
        similitudMaxima = 0,
        umbral = 0.7,
        contextoIncluido = false,
        decision = 'responder',
        modelo = null,
    } = {}) {
        const flags = this.clasificar({
            similitudMaxima,
            umbral,
            respuesta,
            contextoIncluido,
        });

        try {
            const registro = await models.ChatRagMonitor.create({
                id_conversacion: idConversacion,
                tipo,
                pregunta,
                respuesta,
                similitud_maxima: similitudMaxima,
                umbral_usado: umbral,
                n_resultados: resultados.length,
                resultados_json: resultados.map((r) => ({
                    id_conocimiento: r.id_conocimiento || null,
                    tipo: r.tipo || 'segmento',
                    tema: r.tema_principal || r.tema || null,
                    chunk_index: r.chunk_index ?? null,
                    similitud: r.similarity ?? null,
                    fuente: r.fuente_verificacion || r.fuente || null,
                    fragmento: (r.contenido || r.respuesta_oficial || '').substring(0, 300),
                })),
                contexto_rag_incluido: contextoIncluido,
                flag_modelo_ignoro: flags.flag_modelo_ignoro,
                flag_busqueda_pobre: flags.flag_busqueda_pobre,
                respuesta_insuficiente: flags.respuesta_insuficiente,
                decision,
                modelo,
            });
            return { registro, flags };
        } catch (error) {
            console.error('Error registrando diagnóstico RAG:', error.message);
            return { registro: null, flags };
        }
    }

    async listar({ page = 1, limit = 20, soloSospechosos = false, tipo = null, modelo = null, flag = null } = {}) {
        const offset = (page - 1) * limit;
        const where = {};
        if (soloSospechosos === true || soloSospechosos === 'true') {
            where.flag_modelo_ignoro = true;
        } else if (flag) {
            where[flag] = true;
        }
        if (tipo) where.tipo = tipo;
        if (modelo) where.modelo = { [Op.iLike]: `%${modelo}%` };

        const { rows, count } = await models.ChatRagMonitor.findAndCountAll({
            where,
            order: [['fecha_diagnostico', 'DESC'], ['id_diagnostico', 'DESC']],
            limit,
            offset,
            include: [
                {
                    model: models.ChatConversacion,
                    as: 'conversacion',
                    attributes: ['id_conversacion', 'tipo', 'session_id', 'id_usuario', 'id_usuario_anonimo', 'fecha_conversacion'],
                    required: false,
                },
            ],
        });

        return { rows, count, page, limit };
    }

    async stats() {
        const total = await models.ChatRagMonitor.count();
        const modeloIgnoro = await models.ChatRagMonitor.count({ where: { flag_modelo_ignoro: true } });
        const busquedaPobre = await models.ChatRagMonitor.count({ where: { flag_busqueda_pobre: true } });
        const insuficientes = await models.ChatRagMonitor.count({ where: { respuesta_insuficiente: true } });
        const conContexto = await models.ChatRagMonitor.count({ where: { contexto_rag_incluido: true } });

        const avgSimilitud = await models.ChatRagMonitor.findAll({
            attributes: [
                [models.sequelize.fn('AVG', models.sequelize.col('similitud_maxima')), 'promedio'],
                [models.sequelize.fn('MAX', models.sequelize.col('similitud_maxima')), 'maximo'],
            ],
            raw: true,
        });

        const porTipo = await models.ChatRagMonitor.findAll({
            attributes: [
                'tipo',
                [models.sequelize.fn('COUNT', models.sequelize.col('id_diagnostico')), 'count'],
            ],
            group: ['tipo'],
            raw: true,
        });

        const porModelo = await models.ChatRagMonitor.findAll({
            attributes: [
                'modelo',
                [models.sequelize.fn('COUNT', models.sequelize.col('id_diagnostico')), 'count'],
            ],
            where: { modelo: { [Op.ne]: null } },
            group: ['modelo'],
            raw: true,
        });

        return {
            total,
            flag_modelo_ignoro: modeloIgnoro,
            flag_busqueda_pobre: busquedaPobre,
            respuesta_insuficiente: insuficientes,
            con_contexto_rag: conContexto,
            avg_similitud: avgSimilitud[0]?.promedio ?? null,
            max_similitud: avgSimilitud[0]?.maximo ?? null,
            por_tipo: porTipo,
            por_modelo: porModelo,
        };
    }
}

module.exports = RagMonitorService;