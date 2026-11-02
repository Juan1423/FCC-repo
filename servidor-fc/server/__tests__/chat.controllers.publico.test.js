'use strict';

/**
 * Tests OFFLINE (sin BD ni OpenAI) de las validaciones de entrada del
 * controlador público. Complementan la suite de integración: aquí se verifica
 * el contrato HTTP y que NO se gaste una llamada de embeddings/LLM en
 * mensajes inválidos o bloqueados.
 */

jest.mock('../src/services/chat.services', () => ({
    openaiService: {
        obtenerRAGDetalle: jest.fn(),
        chatPublico: jest.fn(),
    },
    guardrailsService: {
        checkAndIncrement: jest.fn(),
        evaluarEntrada: jest.fn(),
    },
    learningService: {
        findCanonicalResponse: jest.fn(),
    },
}));

jest.mock('../src/libs/sequelize', () => ({
    models: {
        ChatConversacion: {
            create: jest.fn(),
        },
    },
}));

const { models } = require('../src/libs/sequelize');
const {
    openaiService,
    guardrailsService,
    learningService,
} = require('../src/services/chat.services');
const { enviarMensaje } = require('../src/controllers/chat.controllers/publico.controller');

function crearRes() {
    const res = {
        statusCode: 200,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(payload) {
            this.body = payload;
            return this;
        },
    };
    return res;
}

function crearReq(body = {}) {
    return {
        body,
        headers: {},
        user: { isVisitor: true, visitorId: 'visitante-test' },
        isVisitor: true,
    };
}

describe('publico.controller.enviarMensaje — validaciones offline', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        guardrailsService.checkAndIncrement.mockResolvedValue({
            allowed: true,
            limit: 5,
            count: 1,
            remaining: 4,
            retryAfter: 0,
        });
        guardrailsService.evaluarEntrada.mockResolvedValue({
            decision: 'responder',
            protocolo: null,
            embeddings: [0.1, 0.2, 0.3],
            mensajeSeguro: 'mensaje',
        });
        openaiService.obtenerRAGDetalle.mockResolvedValue({
            resultados: [],
            similitudMaxima: 0,
            contextoIncluido: false,
        });
        learningService.findCanonicalResponse.mockResolvedValue(null);
        openaiService.chatPublico.mockResolvedValue({
            respuesta: 'respuesta simulada',
            id_conversacion: 'conv-1',
            responseTime: 12,
            tokensUsed: 34,
        });
    });

    test('mensaje ausente => 400 sin tocar guardrails ni LLM', async () => {
        const res = crearRes();
        await enviarMensaje(crearReq({}), res);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/requerido/i);
        expect(guardrailsService.checkAndIncrement).not.toHaveBeenCalled();
        expect(guardrailsService.evaluarEntrada).not.toHaveBeenCalled();
        expect(openaiService.chatPublico).not.toHaveBeenCalled();
    });

    test('mensaje solo con espacios => 400', async () => {
        const res = crearRes();
        await enviarMensaje(crearReq({ mensaje: '     ' }), res);

        expect(res.statusCode).toBe(400);
        expect(guardrailsService.evaluarEntrada).not.toHaveBeenCalled();
    });

    test('mensaje no string (objeto) => 400', async () => {
        const res = crearRes();
        await enviarMensaje(crearReq({ mensaje: { texto: 'hola' } }), res);

        expect(res.statusCode).toBe(400);
        expect(guardrailsService.evaluarEntrada).not.toHaveBeenCalled();
    });

    test('mensaje demasiado largo => 400 sin llamada de embedding', async () => {
        const res = crearRes();
        await enviarMensaje(crearReq({ mensaje: 'x'.repeat(20001) }), res);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/exceder/i);
        expect(guardrailsService.evaluarEntrada).not.toHaveBeenCalled();
        expect(openaiService.chatPublico).not.toHaveBeenCalled();
    });

    test('rate limit alcanzado => 429 con retryAfter y sin LLM', async () => {
        guardrailsService.checkAndIncrement.mockResolvedValue({
            allowed: false,
            manuallyBlocked: false,
            limit: 5,
            count: 6,
            remaining: 0,
            retryAfter: 3600,
        });
        const res = crearRes();
        await enviarMensaje(crearReq({ mensaje: 'consulta válida' }), res);

        expect(res.statusCode).toBe(429);
        expect(res.body.retryAfter).toBe(3600);
        expect(openaiService.chatPublico).not.toHaveBeenCalled();
    });

    test('identificador bloqueado manualmente => 403', async () => {
        guardrailsService.checkAndIncrement.mockResolvedValue({
            allowed: false,
            manuallyBlocked: true,
            limit: 5,
            count: 999999,
            remaining: 0,
            retryAfter: 86400,
        });
        const res = crearRes();
        await enviarMensaje(crearReq({ mensaje: 'consulta válida' }), res);

        expect(res.statusCode).toBe(403);
        expect(res.body.blocked).toBe(true);
    });

    test('usa el mensaje con PII enmascarada para persistir y para el LLM', async () => {
        guardrailsService.evaluarEntrada.mockResolvedValue({
            decision: 'responder',
            protocolo: null,
            embeddings: [0.1, 0.2, 0.3],
            mensajeSeguro: 'Mi correo es [EMAIL] y mi cédula [CÉDULA]',
        });
        models.ChatConversacion.create.mockResolvedValue({ id_conversacion: 'conv-2' });
        const res = crearRes();

        await enviarMensaje(crearReq({ mensaje: 'Mi correo es a@b.com y mi cédula 1712345678' }), res);

        expect(res.statusCode).toBe(200);
        expect(openaiService.chatPublico).toHaveBeenCalledWith(
            expect.objectContaining({ mensaje: 'Mi correo es [EMAIL] y mi cédula [CÉDULA]' })
        );
        expect(openaiService.obtenerRAGDetalle).toHaveBeenCalledWith(
            'Mi correo es [EMAIL] y mi cédula [CÉDULA]',
            'publico',
            [0.1, 0.2, 0.3]
        );
        const llamada = openaiService.chatPublico.mock.calls[0][0];
        expect(llamada.mensaje).not.toContain('a@b.com');
        expect(llamada.mensaje).not.toContain('1712345678');
    });

    test('decisión protocolo responde la canónica sin invocar al LLM', async () => {
        guardrailsService.evaluarEntrada.mockResolvedValue({
            decision: 'protocolo',
            protocolo: {
                categoria: 'autolesion',
                respuesta_canonica: 'Estamos para ayudarte. Llama al 911.',
                accion_requerida: 'derivar',
            },
            embeddings: [0.1, 0.2, 0.3],
            mensajeSeguro: 'mensaje sensible',
        });
        models.ChatConversacion.create.mockResolvedValue({ id_conversacion: 'conv-3' });
        const res = crearRes();

        await enviarMensaje(crearReq({ mensaje: 'mensaje sensible' }), res);

        expect(res.statusCode).toBe(200);
        expect(res.body.decision).toBe('protocolo');
        expect(res.body.respuesta).toContain('911');
        expect(openaiService.chatPublico).not.toHaveBeenCalled();
    });

    test('decisión canónica responde la canónica sin invocar al LLM', async () => {
        learningService.findCanonicalResponse.mockResolvedValue({
            id_canonica: 9,
            respuesta_canonica: 'Nuestro horario es de 8 a 18.',
        });
        models.ChatConversacion.create.mockResolvedValue({ id_conversacion: 'conv-4' });
        const res = crearRes();

        await enviarMensaje(crearReq({ mensaje: 'horario?' }), res);

        expect(res.statusCode).toBe(200);
        expect(res.body.decision).toBe('canonica');
        expect(res.body.respuesta).toBe('Nuestro horario es de 8 a 18.');
        expect(openaiService.chatPublico).not.toHaveBeenCalled();
    });

    test('un error interno devuelve 500 genérico, no un 200 vacío ni detalles internos', async () => {
        openaiService.chatPublico.mockRejectedValue(new Error('proveedor caído'));
        const res = crearRes();
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await enviarMensaje(crearReq({ mensaje: 'consulta válida' }), res);

        expect(res.statusCode).toBe(500);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Error interno del servidor');
        expect(res.body.message).not.toContain('proveedor caído');
        expect(errorSpy).toHaveBeenCalled();
        errorSpy.mockRestore();
    });
});
