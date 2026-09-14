'use strict';

jest.mock('../src/libs/sequelize', () => ({ models: {} }));

const RagMonitorService = require('../src/services/chat.services/ragMonitor.service');

describe('RagMonitorService.clasificar', () => {
    const svc = new RagMonitorService();

    test('contexto útil (sim >= umbral) + respuesta insuficiente => flag_modelo_ignoro=true', () => {
        const flags = svc.clasificar({
            similitudMaxima: 0.83,
            umbral: 0.7,
            contextoIncluido: true,
            respuesta: 'No tengo información suficiente para responder esa pregunta.',
        });
        expect(flags.flag_modelo_ignoro).toBe(true);
        expect(flags.flag_busqueda_pobre).toBe(false);
        expect(flags.respuesta_insuficiente).toBe(true);
    });

    test('similitud baja con contexto pegado => flag_busqueda_pobre=true', () => {
        const flags = svc.clasificar({
            similitudMaxima: 0.4,
            umbral: 0.7,
            contextoIncluido: true,
            respuesta: 'No tengo información suficiente.',
        });
        expect(flags.flag_modelo_ignoro).toBe(false);
        expect(flags.flag_busqueda_pobre).toBe(true);
    });

    test('sin contexto => flag_busqueda_pobre=true', () => {
        const flags = svc.clasificar({
            similitudMaxima: 0,
            umbral: 0.7,
            contextoIncluido: false,
            respuesta: 'No tengo información suficiente.',
        });
        expect(flags.flag_modelo_ignoro).toBe(false);
        expect(flags.flag_busqueda_pobre).toBe(true);
    });

    test('respuesta normal con contexto útil => sin flags', () => {
        const flags = svc.clasificar({
            similitudMaxima: 0.86,
            umbral: 0.7,
            contextoIncluido: true,
            respuesta: 'La salud pública en Ecuador es competencia del MSP.',
        });
        expect(flags.flag_modelo_ignoro).toBe(false);
        expect(flags.flag_busqueda_pobre).toBe(false);
        expect(flags.respuesta_insuficiente).toBe(false);
    });

    test('acentos y mayúsculas no evaden la detección', () => {
        const flags = svc.clasificar({
            similitudMaxima: 0.9,
            umbral: 0.7,
            contextoIncluido: true,
            respuesta: 'NO TENGO INFORMACIÓN SUFICIENTE',
        });
        expect(flags.flag_modelo_ignoro).toBe(true);
    });
});

describe('RagMonitorService.registrar', () => {
    test('falla silenciosamente sin BD pero aplica flags y no lanza', async () => {
        const svc = new RagMonitorService();
        const result = await svc.registrar({
            tipo: 'publico',
            pregunta: '¿hay información?',
            respuesta: 'No tengo información suficiente.',
            resultados: [{ id_conocimiento: 1, similarity: 0.9, contenido: 'x' }],
            similitudMaxima: 0.9,
            umbral: 0.7,
            contextoIncluido: true,
        });
        expect(result.registro).toBeNull();
        expect(result.flags.flag_modelo_ignoro).toBe(true);
    });
});