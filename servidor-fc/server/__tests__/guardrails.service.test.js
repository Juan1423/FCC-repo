'use strict';

jest.mock('../src/libs/sequelize', () => ({
    models: {
        ChatProtocoloSensible: {
            findAll: jest.fn(),
            update: jest.fn(),
        },
        ChatConfiguracion: {
            findAll: jest.fn(),
        },
        ChatRateLimit: {
            findAll: jest.fn().mockResolvedValue([]),
            findByPk: jest.fn(),
            update: jest.fn(),
            destroy: jest.fn(),
        },
    },
}));

const { models } = require('../src/libs/sequelize');
const GuardrailsService = require('../src/services/chat.services/guardrails.service');

function protocolo(overrides = {}) {
    return {
        id_protocolo: 1,
        categoria: 'autolesion',
        palabras_clave: JSON.stringify(['suicidio', 'autolesion']),
        embedding_keywords: null,
        embedding_model: null,
        respuesta_canonica: 'Llama al 911',
        accion_requerida: 'derivar',
        prioridad: 1,
        ...overrides,
    };
}

describe('GuardrailsService — enmascarado de PII', () => {
    const svc = new GuardrailsService();

    test('enmascara cédula de 10 dígitos', () => {
        expect(svc.maskPII('mi cédula 1712345678')).toContain('[CÉDULA]');
    });

    test('enmascara email', () => {
        expect(svc.maskPII('escríbeme a juan.perez@example.com')).toContain('[EMAIL]');
    });

    test('enmascara tarjeta agrupada en bloques de 4', () => {
        expect(svc.maskPII('tarjeta 4111 1111 1111 1111')).toContain('[TARJETA]');
    });

    test('no altera texto sin PII', () => {
        expect(svc.maskPII('¿Cuál es el horario de atención?')).toBe('¿Cuál es el horario de atención?');
    });

    test('entrada nula se devuelve tal cual (sin lanzar)', () => {
        expect(svc.maskPII(null)).toBeNull();
        expect(svc.maskPII(undefined)).toBeUndefined();
    });
});

describe('GuardrailsService.detectSensitiveTopic', () => {
    let svc;

    beforeEach(() => {
        jest.clearAllMocks();
        svc = new GuardrailsService();
        models.ChatConfiguracion.findAll.mockResolvedValue([]);
        models.ChatProtocoloSensible.update.mockResolvedValue([1]);
    });

    test('mensaje vacío no consulta la BD', async () => {
        const res = await svc.detectSensitiveTopic('   ');
        expect(res).toBeNull();
        expect(models.ChatProtocoloSensible.findAll).not.toHaveBeenCalled();
    });

    test('coincidencia por palabra clave no necesita embedding', async () => {
        models.ChatProtocoloSensible.findAll.mockResolvedValue([protocolo()]);
        const res = await svc.detectSensitiveTopic('Quiero hablar de suicidio');
        expect(res).not.toBeNull();
        expect(res.id_protocolo).toBe(1);
    });

    test('coincidencia semántica con embedding_keywords almacenado', async () => {
        models.ChatProtocoloSensible.findAll.mockResolvedValue([
            protocolo({
                palabras_clave: JSON.stringify(['texto que no aparece']),
                embedding_keywords: JSON.stringify([1, 0, 0]),
                embedding_model: svc.getEmbeddingModel(),
            }),
        ]);
        const res = await svc.detectSensitiveTopic('mensaje ambiguo', [1, 0, 0]);
        expect(res).not.toBeNull();
        expect(res.id_protocolo).toBe(1);
    });

    test('descarta embedding de otro modelo y regenera (deriva detectada)', async () => {
        models.ChatProtocoloSensible.findAll.mockResolvedValue([
            protocolo({
                palabras_clave: JSON.stringify(['texto que no aparece']),
                embedding_keywords: JSON.stringify([1, 0, 0]),
                embedding_model: 'text-embedding-ada-002',
            }),
        ]);
        const otro = protocolo({
            palabras_clave: JSON.stringify(['texto que no aparece']),
            embedding_keywords: null,
            embedding_model: 'text-embedding-ada-002',
        });
        models.ChatProtocoloSensible.findAll.mockResolvedValue([otro]);
        svc.generateEmbedding = jest.fn().mockResolvedValue([1, 0, 0]);

        const res = await svc.detectSensitiveTopic('mensaje ambiguo', [1, 0, 0]);

        expect(res).not.toBeNull();
        expect(svc.generateEmbedding).toHaveBeenCalled();
        const updateArg = models.ChatProtocoloSensible.update.mock.calls[0][0];
        expect(updateArg.embedding_model).toBe(svc.getEmbeddingModel());
    });

    test('sin protocolos activos devuelve null', async () => {
        models.ChatProtocoloSensible.findAll.mockResolvedValue([]);
        expect(await svc.detectSensitiveTopic('cualquier cosa')).toBeNull();
    });

    test('eleva un umbral configurado por debajo del piso del modelo', async () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
        // El modelo por defecto en tests es ada-002 (banda 0.82).
        models.ChatConfiguracion.findAll.mockResolvedValue([
            { clave: 'guardrail_sensible_threshold', valor: '0.45', tipo: 'float' },
        ]);
        models.ChatProtocoloSensible.findAll.mockResolvedValue([
            protocolo({
                palabras_clave: JSON.stringify(['texto que no aparece']),
                embedding_keywords: JSON.stringify([0.5, Math.sqrt(0.75), 0]),
                embedding_model: svc.getEmbeddingModel(),
            }),
        ]);
        // Coseno 0.5: con 0.45 dispararía; elevado a 0.82 no debe disparar.
        const res = await svc.detectSensitiveTopic('mensaje ambiguo', [1, 0, 0]);
        expect(res).toBeNull();
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('por debajo del piso'));
        warn.mockRestore();
    });

    test('respeta guardrail_sensible_threshold configurado', async () => {
        models.ChatConfiguracion.findAll.mockResolvedValue([
            { clave: 'guardrail_sensible_threshold', valor: '0.95', tipo: 'float' },
        ]);
        models.ChatProtocoloSensible.findAll.mockResolvedValue([
            protocolo({
                palabras_clave: JSON.stringify(['texto que no aparece']),
                embedding_keywords: JSON.stringify([0.9, 0.43589, 0]),
                embedding_model: svc.getEmbeddingModel(),
            }),
        ]);
        // coseno ≈ 0.9 < 0.95 → no debe activarse por semántica.
        const res = await svc.detectSensitiveTopic('mensaje ambiguo', [1, 0, 0]);
        expect(res).toBeNull();
    });
});

describe('GuardrailsService.evaluarEntrada', () => {
    let svc;

    beforeEach(() => {
        jest.clearAllMocks();
        svc = new GuardrailsService();
        models.ChatConfiguracion.findAll.mockResolvedValue([]);
        models.ChatProtocoloSensible.findAll.mockResolvedValue([]);
        svc.generateEmbedding = jest.fn().mockResolvedValue([0.1, 0.2, 0.3]);
    });

    test('devuelve mensajeSeguro y no bloquea consultas normales', async () => {
        const res = await svc.evaluarEntrada('Mi cédula es 1712345678, ¿tienen turnos?');
        expect(res.decision).toBe('responder');
        expect(res.mensajeSeguro).toContain('[CÉDULA]');
        expect(res.mensajeSeguro).not.toContain('1712345678');
        expect(res.embeddings).toEqual([0.1, 0.2, 0.3]);
    });

    test('si el proveedor de embeddings falla, no rompe la decisión', async () => {
        svc.generateEmbedding = jest.fn().mockRejectedValue(new Error('sin API key'));
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const res = await svc.evaluarEntrada('consulta normal');
        expect(res.decision).toBe('responder');
        expect(res.embeddings).toBeNull();
        errorSpy.mockRestore();
    });
});
