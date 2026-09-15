'use strict';

jest.mock('openai', () => {
    const create = jest.fn();
    return {
        OpenAI: jest.fn().mockImplementation(() => ({
            chat: { completions: { create } },
        })),
        __sharedCreate: create,
    };
});

jest.mock('../src/libs/sequelize', () => ({
    models: {
        ChatPrompt: { findAll: jest.fn(), findOne: jest.fn(), findByPk: jest.fn() },
        ChatConversacion: { create: jest.fn() },
    },
}));

const openaiApi = require('openai');
const { models } = require('../src/libs/sequelize');
const OpenAIService = require('../src/services/chat.services/openai.service');

const DETALLE_RAG = {
    context: 'INFORMACIÓN RELEVANTE DE LA BASE DE CONOCIMIENTOS:\n\n1. PREGUNTA: salud publica\n   RESPUESTA: El MSP es la autoridad sanitaria.\n   TEMA: salud\n   FUENTE: sesion\n   SIMILITUD: 86.0%\n\n',
    resultados: [{ id_conocimiento: 5, tipo: 'segmento', tema_principal: 'salud', chunk_index: 0, similarity: 0.86, fuente_verificacion: 'sesion' }],
    similitudMaxima: 0.86,
    umbral: 0.7,
    nResultados: 1,
    contextoIncluido: true,
};

function makeService({ respuesta = 'Respuesta normal.', opciones = {} } = {}) {
    const svc = new OpenAIService();
    openaiApi.__sharedCreate.mockResolvedValue({
        choices: [{ message: { content: respuesta } }],
        usage: { total_tokens: 40 },
    });
    svc.setDependencies({
        ragService: { buildRAGContextDetalle: jest.fn().mockResolvedValue(DETALLE_RAG) },
        guardrailsService: { checkRateLimit: jest.fn().mockReturnValue({ allowed: true }) },
        learningService: null,
        configService: { getConfig: jest.fn().mockResolvedValue({ max_contexto_rag_items: 3, rag_similarity_threshold: 0.7 }) },
        ragMonitorService: { registrar: jest.fn().mockResolvedValue({ registro: { id: 1 } }) },
        ...opciones,
    });
    return { svc, createMock: openaiApi.__sharedCreate };
}

beforeEach(() => {
    jest.clearAllMocks();
    models.ChatPrompt.findAll.mockResolvedValue([]);
    models.ChatPrompt.findOne.mockResolvedValue(null);
    models.ChatPrompt.findByPk.mockResolvedValue(null);
    models.ChatConversacion.create.mockResolvedValue({ id_conversacion: 99 });
});

describe('OpenAIService.construirPromptCompleto', () => {
    test('incrementa las instrucciones de prioridad del RAG (mejora anti-regresión)', async () => {
        const { svc } = makeService();
        const prompt = await svc.construirPromptCompleto('¿tienen información sobre salud publica?', { tipo: 'publico' });

        expect(prompt).toContain('INSTRUCCIONES CRÍTICAS');
        expect(prompt).toContain('es tu fuente principal');
        expect(prompt).toContain('INSTRUCCIÓN FINAL');
        expect(prompt).toContain('haz UNA RESPUESTA BASADA EN ESE CONTENIDO');
        expect(prompt).toContain('INFORMACIÓN RELEVANTE DE LA BASE DE CONOCIMIENTOS');
    });

    test('guardar _ultimoRAGDetalle para alimentar el monitor', async () => {
        const { svc } = makeService();
        await svc.construirPromptCompleto('test', { tipo: 'interno' });
        expect(svc._ultimoRAGDetalle).not.toBeNull();
        expect(svc._ultimoRAGDetalle.similitudMaxima).toBeCloseTo(0.86, 3);
        expect(svc._ultimoRAGDetalle.contextoIncluido).toBe(true);
    });
});

describe('OpenAIService.construirHistorialContexto', () => {
    const rowsHistorial = [
        { mensaje_usuario: '¿hay una rifa?', respuesta_bot: 'El número para participar es 140586.' },
        { mensaje_usuario: '¿en qué horario es?', respuesta_bot: 'De 08:00 a 18:00.' },
    ];

    function withHistory() {
        const svc = new OpenAIService();
        svc.setDependencies({
            ragService: { buildRAGContextDetalle: jest.fn().mockResolvedValue(DETALLE_RAG) },
            guardrailsService: { checkRateLimit: jest.fn().mockReturnValue({ allowed: true }) },
            learningService: null,
            configService: { getConfig: jest.fn().mockResolvedValue({ memory_enabled: true, memory_max_turnos: 4 }) },
            conversationsService: {
                getRecentBySessionId: jest.fn().mockResolvedValue([...rowsHistorial]),
            },
        });
        return svc;
    }

    test('incluye historial en público cuando hay consentimiento', async () => {
        const svc = withHistory();
        const ctx = await svc.construirHistorialContexto({ sessionId: 's-1', tipo: 'publico', consentimiento: true });
        expect(ctx).toContain('HISTORIAL RECIENTE DE LA CONVERSACIÓN');
        expect(ctx).toContain('140586');
        expect(ctx).toContain('08:00 a 18:00');
    });

    test('NO incluye historial en público sin consentimiento', async () => {
        const svc = withHistory();
        const ctx = await svc.construirHistorialContexto({ sessionId: 's-1', tipo: 'publico', consentimiento: false });
        expect(ctx).toBe('');
        expect(svc.conversationsService.getRecentBySessionId).not.toHaveBeenCalled();
    });

    test('incluye historial en interno sin requerir consentimiento', async () => {
        const svc = withHistory();
        const ctx = await svc.construirHistorialContexto({ sessionId: 's-1', tipo: 'interno', consentimiento: false });
        expect(ctx).toContain('HISTORIAL RECIENTE DE LA CONVERSACIÓN');
    });

    test('memoria deshabilitada => no incluye historial', async () => {
        const svc = new OpenAIService();
        svc.setDependencies({
            configService: { getConfig: jest.fn().mockResolvedValue({ memory_enabled: false }) },
            conversationsService: { getRecentBySessionId: jest.fn() },
        });
        const ctx = await svc.construirHistorialContexto({ sessionId: 's-1', tipo: 'interno', consentimiento: true });
        expect(ctx).toBe('');
    });

    test('construirPromptCompleto inyecta el bloque de historial', async () => {
        const svc = withHistory();
        const prompt = await svc.construirPromptCompleto('¿y en qué horario es eso?', { sessionId: 's-1', tipo: 'publico', consentimiento: true });
        expect(prompt).toContain('HISTORIAL RECIENTE DE LA CONVERSACIÓN');
        expect(prompt).toContain('140586');
    });
});

describe('OpenAIService.tieneContextoRelevante', () => {
    test('true cuando hay resultados RAG', async () => {
        const svc = new OpenAIService();
        svc.setDependencies({
            ragService: { buildRAGContextDetalle: jest.fn().mockResolvedValue({ resultados: [{ id_conocimiento: 'x' }] }) },
            configService: { getConfig: jest.fn().mockResolvedValue({ rag_similarity_threshold: 0.55, max_contexto_rag_items: 3 }) },
        });
        expect(await svc.tieneContextoRelevante('pregunta', 'publico')).toBe(true);
    });

    test('false cuando RAG devuelve sin resultados', async () => {
        const svc = new OpenAIService();
        svc.setDependencies({
            ragService: { buildRAGContextDetalle: jest.fn().mockResolvedValue({ resultados: [] }) },
            configService: { getConfig: jest.fn().mockResolvedValue({}) },
        });
        expect(await svc.tieneContextoRelevante('pregunta', 'publico')).toBe(false);
    });

    test('false si el RAG falla (no lanza)', async () => {
        const svc = new OpenAIService();
        svc.setDependencies({
            ragService: { buildRAGContextDetalle: jest.fn().mockRejectedValue(new Error('boom')) },
            configService: { getConfig: jest.fn().mockResolvedValue({}) },
        });
        expect(await svc.tieneContextoRelevante('pregunta', 'publico')).toBe(false);
    });
});

describe('OpenAIService.chatInterno', () => {
    test('registra el diagnóstico RAG aun con respuesta insuficiente del modelo', async () => {
        const oldKey = process.env.OPENAI_API_KEY;
        process.env.OPENAI_API_KEY = 'test-key';
        try {
            const { svc } = makeService({
                respuesta: 'No tengo información suficiente para responder esa pregunta.',
            });
            const result = await svc.chatInterno({ mensaje: '¿hay una rifa?', idUsuario: 1, sessionId: 's1' });

            expect(result.respuesta).toContain('No tengo información suficiente');

            await new Promise((r) => setTimeout(r, 80));

            const ragMonitorService = svc.ragMonitorService;
            expect(ragMonitorService.registrar).toHaveBeenCalledTimes(1);
            const args = ragMonitorService.registrar.mock.calls[0][0];
            expect(args.similitudMaxima).toBeCloseTo(0.86, 3);
            expect(args.contextoIncluido).toBe(true);
            expect(args.respuesta).toContain('No tengo información suficiente');
            expect(args.idConversacion).toBe(99);
        } finally {
            if (oldKey === undefined) delete process.env.OPENAI_API_KEY;
            else process.env.OPENAI_API_KEY = oldKey;
        }
    });
});

describe('OpenAIService.chatPublico', () => {
    test('registra el diagnóstico RAG en canal público con contexto válido', async () => {
        const oldKey = process.env.OPENAI_API_KEY;
        process.env.OPENAI_API_KEY = 'test-key';
        try {
            const { svc } = makeService();
            const result = await svc.chatPublico({
                mensaje: '¿tienen información sobre salud publica?',
                sessionId: 's-pub',
                consentimiento: true,
            });

            expect(result.respuesta).toBe('Respuesta normal.');

            await new Promise((r) => setTimeout(r, 80));

            expect(svc.ragMonitorService.registrar).toHaveBeenCalledTimes(1);
            const args = svc.ragMonitorService.registrar.mock.calls[0][0];
            expect(args.tipo).toBe('publico');
            expect(args.pregunta).toContain('salud publica');
            expect(args.similitudMaxima).toBeCloseTo(0.86, 3);
        } finally {
            if (oldKey === undefined) delete process.env.OPENAI_API_KEY;
            else process.env.OPENAI_API_KEY = oldKey;
        }
    });

    test('el flujo con promptId requiere OPENAI_API_KEY y no lanza por DB', async () => {
        const oldKey = process.env.OPENAI_API_KEY;
        process.env.OPENAI_API_KEY = 'test-key';
        try {
            const { svc } = makeService();
            models.ChatPrompt.findByPk.mockResolvedValue({
                canal: 'publico',
                instrucciones: 'Instrucción del prompt guardado',
                archivo_pdf: null,
            });
            const result = await svc.chatPublico({
                mensaje: 'Hola',
                promptId: 7,
                sessionId: 's-pub-2',
                consentimiento: true,
            });
            expect(result.respuesta).toBe('Respuesta normal.');
            expect(svc.ragMonitorService.registrar).not.toHaveBeenCalled();
        } finally {
            if (oldKey === undefined) delete process.env.OPENAI_API_KEY;
            else process.env.OPENAI_API_KEY = oldKey;
        }
    });
});