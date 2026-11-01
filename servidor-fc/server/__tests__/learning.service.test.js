'use strict';

jest.mock('../src/libs/sequelize', () => ({
    models: {
        ChatRespuestaCanonica: {
            findAll: jest.fn(),
            increment: jest.fn(),
        },
        ChatConfiguracion: {
            findAll: jest.fn(),
        },
    },
}));

const { Op } = require('sequelize');
const { models } = require('../src/libs/sequelize');
const LearningService = require('../src/services/chat.services/learning.service');

function canonica(overrides = {}) {
    return {
        id_canonica: 1,
        patron_trigger: 'horario',
        embedding_trigger: null,
        embedding_model: null,
        respuesta_canonica: 'Atendemos de 8 a 18.',
        categoria: 'general',
        prioridad: 1,
        usos_count: 0,
        canal: 'ambos',
        ...overrides,
    };
}

function ragFake(overrides = {}) {
    return {
        getEmbeddingModel: () => 'text-embedding-3-small',
        searchSimilarByEmbeddings: jest.fn().mockResolvedValue([]),
        ...overrides,
    };
}

describe('LearningService.findCanonicalResponse', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        models.ChatConfiguracion.findAll.mockResolvedValue([]);
        models.ChatRespuestaCanonica.increment.mockResolvedValue([1]);
    });

    test("canal 'ambos' expande a ambos, publico e interno", async () => {
        models.ChatRespuestaCanonica.findAll.mockResolvedValue([]);
        const svc = new LearningService(ragFake());

        await svc.findCanonicalResponse('hola', null, 'ambos');

        const where = models.ChatRespuestaCanonica.findAll.mock.calls[0][0].where;
        expect(where.canal[Op.in]).toEqual(['ambos', 'publico', 'interno']);
    });

    test('coincidencia por regex devuelve la canónica sin buscar embedding', async () => {
        models.ChatRespuestaCanonica.findAll.mockResolvedValue([canonica()]);
        const rag = ragFake();
        const svc = new LearningService(rag);

        const res = await svc.findCanonicalResponse('¿Cuál es el horario?', [1, 0], 'publico');

        expect(res.id_canonica).toBe(1);
        expect(rag.searchSimilarByEmbeddings).not.toHaveBeenCalled();
        expect(models.ChatRespuestaCanonica.increment).toHaveBeenCalledWith(
            'usos_count',
            { where: { id_canonica: 1 } }
        );
    });

    test('descarta canónicas con embedding de otro modelo', async () => {
        models.ChatRespuestaCanonica.findAll.mockResolvedValue([
            canonica({
                patron_trigger: 'texto que no aparece',
                embedding_trigger: JSON.stringify([1, 0, 0]),
                embedding_model: 'text-embedding-ada-002',
            }),
        ]);
        const rag = ragFake();
        const svc = new LearningService(rag);

        const res = await svc.findCanonicalResponse('consulta', [1, 0, 0], 'publico');

        expect(res).toBeNull();
        expect(rag.searchSimilarByEmbeddings).not.toHaveBeenCalled();
    });

    test('usa similitud semántica con el umbral configurado', async () => {
        models.ChatConfiguracion.findAll.mockResolvedValue([
            { clave: 'canonical_response_threshold', valor: '0.7', tipo: 'float' },
        ]);
        models.ChatRespuestaCanonica.findAll.mockResolvedValue([
            canonica({
                patron_trigger: 'texto que no aparece',
                embedding_trigger: JSON.stringify([1, 0, 0]),
                embedding_model: 'text-embedding-3-small',
            }),
        ]);
        const rag = ragFake({
            searchSimilarByEmbeddings: jest.fn().mockResolvedValue([canonica({ similarity: 0.72 })]),
        });
        const svc = new LearningService(rag);

        const res = await svc.findCanonicalResponse('consulta', [1, 0, 0], 'publico');

        expect(res).not.toBeNull();
        const args = rag.searchSimilarByEmbeddings.mock.calls[0];
        expect(args[2]).toBe(0.7);
        expect(args[3]).toBe(1);
    });

    test('sin coincidencias devuelve null', async () => {
        models.ChatRespuestaCanonica.findAll.mockResolvedValue([
            canonica({ patron_trigger: 'texto que no aparece' }),
        ]);
        const svc = new LearningService(ragFake());

        expect(await svc.findCanonicalResponse('consulta', [1, 0, 0], 'publico')).toBeNull();
    });
});
