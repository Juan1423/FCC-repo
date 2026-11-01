'use strict';

// pdf-parse carga @napi-rs/canvas de forma opcional y en Jest imprime un stack
// de error irrelevante. Se mockea: estas pruebas no procesan PDFs.
jest.mock('pdf-parse', () => ({ PDFParse: class PDFParseMock {} }));

jest.mock('../src/libs/sequelize', () => ({
    models: {
        ChatConocimiento: {
            create: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
        },
    },
}));

const { models } = require('../src/libs/sequelize');
const KnowledgeService = require('../src/services/chat.services/knowledge.service');

function ragServiceFake(overrides = {}) {
    return {
        getEmbeddingModel: () => 'text-embedding-3-small',
        construirTextoEmbedding: (row) => `${row.tema_principal || ''} ${row.contenido || ''}`.trim(),
        generateEmbedding: jest.fn().mockResolvedValue([0.1, 0.2, 0.3]),
        invalidateCache: jest.fn(),
        ...overrides,
    };
}

describe('KnowledgeService.create', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('etiqueta embedding_model cuando el llamador ya trae embedding', async () => {
        models.ChatConocimiento.create.mockResolvedValue({ id_conocimiento: 'k1' });
        const svc = new KnowledgeService(ragServiceFake());

        await svc.create({ tema_principal: 'X', embedding: JSON.stringify([1, 0]) });

        expect(models.ChatConocimiento.create).toHaveBeenCalledWith(
            expect.objectContaining({ embedding_model: 'text-embedding-3-small' })
        );
    });

    test('no inventa embedding_model si no hay embedding', async () => {
        models.ChatConocimiento.create.mockResolvedValue({ id_conocimiento: 'k1' });
        const svc = new KnowledgeService(ragServiceFake());

        await svc.create({ tema_principal: 'X' });

        const payload = models.ChatConocimiento.create.mock.calls[0][0];
        expect(payload.embedding_model).toBeUndefined();
    });

    test('reintenta sin embedding_model si la migración no está aplicada', async () => {
        models.ChatConocimiento.create
            .mockRejectedValueOnce(new Error('column "embedding_model" does not exist'))
            .mockResolvedValueOnce({ id_conocimiento: 'k1' });
        const svc = new KnowledgeService(ragServiceFake());

        await svc.create({ tema_principal: 'X', embedding: JSON.stringify([1, 0]) });

        expect(models.ChatConocimiento.create).toHaveBeenCalledTimes(2);
        expect(models.ChatConocimiento.create.mock.calls[1][0].embedding_model).toBeUndefined();
    });
});

describe('KnowledgeService.generarEmbeddings', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('por defecto solo procesa filas sin embedding', async () => {
        models.ChatConocimiento.findAll.mockResolvedValue([]);
        const svc = new KnowledgeService(ragServiceFake());

        await svc.generarEmbeddings();

        const where = models.ChatConocimiento.findAll.mock.calls[0][0].where;
        expect(where.embedding).toBeNull();
        expect(where.estado_vigencia).toBe(true);
        expect(where.bloqueado).toBe(false);
    });

    test('soloFaltantes=false no filtra por embedding nulo (corrige deriva)', async () => {
        models.ChatConocimiento.findAll.mockResolvedValue([]);
        const svc = new KnowledgeService(ragServiceFake());

        await svc.generarEmbeddings([1, 2], { soloFaltantes: false });

        const where = models.ChatConocimiento.findAll.mock.calls[0][0].where;
        expect(where.embedding).toBeUndefined();
        expect(where.id_conocimiento).toEqual([1, 2]);
    });

    test('usa el mismo builder de texto que la ingesta y guarda el modelo', async () => {
        const update = jest.fn().mockResolvedValue(undefined);
        models.ChatConocimiento.findAll.mockResolvedValue([
            { id_conocimiento: 'k1', tema_principal: 'Tema', contenido: 'Cuerpo', update },
        ]);
        const rag = ragServiceFake();
        const builderSpy = jest.spyOn(rag, 'construirTextoEmbedding');
        const svc = new KnowledgeService(rag);

        const res = await svc.generarEmbeddings(['k1']);

        expect(builderSpy).toHaveBeenCalled();
        expect(rag.generateEmbedding).toHaveBeenCalledWith('Tema Cuerpo');
        expect(update).toHaveBeenCalledWith(expect.objectContaining({
            embedding_model: 'text-embedding-3-small',
        }));
        expect(res.processed).toBe(1);
        expect(rag.invalidateCache).toHaveBeenCalled();
    });
});

describe('KnowledgeService.regenerarEmbeddingsIncompatibles', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('selecciona filas con modelo nulo o distinto al actual', async () => {
        models.ChatConocimiento.findAll.mockResolvedValue([]);
        const svc = new KnowledgeService(ragServiceFake());

        const res = await svc.regenerarEmbeddingsIncompatibles();

        const where = models.ChatConocimiento.findAll.mock.calls[0][0].where;
        const clavesSimbolo = Object.getOwnPropertySymbols(where);
        expect(clavesSimbolo.length).toBeGreaterThan(0);
        const condicionOr = where[clavesSimbolo[0]];
        expect(Array.isArray(condicionOr)).toBe(true);
        expect(condicionOr).toHaveLength(2);
        expect(res.total).toBe(0);
    });
});
