'use strict';

jest.mock('../src/libs/sequelize', () => ({
    models: {
        ChatConocimiento: {
            findAll: jest.fn(),
            create: jest.fn(),
        },
    },
}));

const { Op } = require('sequelize');
const { models } = require('../src/libs/sequelize');
const RAGService = require('../src/services/chat.services/rag.service');

function fila(id, vector, extra = {}) {
    return {
        id_conocimiento: id,
        tipo: 'segmento',
        tema_principal: `Tema ${id}`,
        pregunta_frecuente: '',
        respuesta_oficial: null,
        contenido: `Contenido ${id}`,
        chunk_index: 0,
        fuente_verificacion: `Fuente ${id}`,
        nivel_prioridad: 1,
        canal: 'ambos',
        embedding: JSON.stringify(vector),
        ...extra,
    };
}

function inyectarCache(svc, filas, canal = 'ambos') {
    const cache = new Map(filas.map((f) => [f.id_conocimiento, f]));
    svc.knowledgeCacheByCanal.set(canal, cache);
    return cache;
}

describe('RAGService — bug de canal', () => {
    beforeEach(() => {
        models.ChatConocimiento.findAll.mockReset();
        models.ChatConocimiento.findAll.mockResolvedValue([]);
    });

    test("canal 'ambos' debe consultar ambos, publico e interno", async () => {
        const svc = new RAGService();
        await svc.loadKnowledgeIntoCache('ambos');
        const where = models.ChatConocimiento.findAll.mock.calls[0][0].where;
        expect(where.canal[Op.in]).toEqual(['ambos', 'publico', 'interno']);
    });

    test("canal 'publico' consulta ambos + publico (no interno)", async () => {
        const svc = new RAGService();
        await svc.loadKnowledgeIntoCache('publico');
        const where = models.ChatConocimiento.findAll.mock.calls[0][0].where;
        expect(where.canal[Op.in]).toEqual(['ambos', 'publico']);
    });

    test('canalesPermitidos cubre los tres valores para ambos', () => {
        const svc = new RAGService();
        expect(svc.canalesPermitidos('ambos')).toEqual(['ambos', 'publico', 'interno']);
        expect(svc.canalesPermitidos(undefined)).toEqual(['ambos', 'publico', 'interno']);
        expect(svc.canalesPermitidos('interno')).toEqual(['ambos', 'interno']);
    });
});

describe('RAGService — carga y salud de embeddings', () => {
    beforeEach(() => {
        models.ChatConocimiento.findAll.mockReset();
    });

    test('descarta embeddings inválidos y vectores cero', async () => {
        const svc = new RAGService();
        models.ChatConocimiento.findAll.mockResolvedValue([
            fila('ok', [1, 0, 0]),
            fila('cero', [0, 0, 0]),
            { ...fila('roto', [1, 0, 0]), embedding: 'no-json' },
        ]);
        const cache = await svc.loadKnowledgeIntoCache('publico', true);
        expect(cache.size).toBe(1);
        expect(cache.has('ok')).toBe(true);
        const stats = svc._knowledgeCacheStats.get('publico');
        expect(stats.invalidos).toBe(2);
    });

    test('detecta dimensiones mezcladas y avisa', async () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
        const svc = new RAGService();
        models.ChatConocimiento.findAll.mockResolvedValue([
            fila('a', [1, 0, 0]),
            fila('b', [1, 0, 0, 0]),
        ]);
        await svc.loadKnowledgeIntoCache('publico', true);
        const stats = svc._knowledgeCacheStats.get('publico');
        expect(stats.dimensionesMixtas).toBe(true);
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('dimensiones mezcladas'));
        warn.mockRestore();
    });

    test('detecta deriva de modelo aunque la dimensión coincida', async () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
        const svc = new RAGService();
        models.ChatConocimiento.findAll.mockResolvedValue([
            fila('a', [1, 0, 0], { embedding_model: 'text-embedding-3-small' }),
            fila('b', [0, 1, 0], { embedding_model: 'text-embedding-ada-002' }),
        ]);
        await svc.loadKnowledgeIntoCache('publico', true);
        const stats = svc._knowledgeCacheStats.get('publico');
        expect(stats.modelosMixtos).toBe(true);
        expect(stats.dimensionesMixtas).toBe(false);
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('modelos distintos'));
        warn.mockRestore();
    });

    test('si la columna embedding_model no existe, reintenta sin ella', async () => {
        const svc = new RAGService();
        models.ChatConocimiento.findAll
            .mockRejectedValueOnce(new Error('column "embedding_model" does not exist'))
            .mockResolvedValueOnce([fila('a', [1, 0, 0])]);
        const cache = await svc.loadKnowledgeIntoCache('publico', true);
        expect(cache.size).toBe(1);
        expect(svc._embeddingModelColumnAvailable).toBe(false);
        const segunda = models.ChatConocimiento.findAll.mock.calls[1][0];
        expect(segunda.attributes).not.toContain('embedding_model');
    });

    test('el cache de conocimiento expira con TTL', async () => {
        const svc = new RAGService();
        svc.cacheExpiryMs = 1000;
        models.ChatConocimiento.findAll.mockResolvedValue([fila('a', [1, 0, 0])]);
        const now = jest.spyOn(Date, 'now');

        now.mockReturnValue(1000);
        await svc.loadKnowledgeIntoCache('publico');
        expect(models.ChatConocimiento.findAll).toHaveBeenCalledTimes(1);

        now.mockReturnValue(1500);
        await svc.loadKnowledgeIntoCache('publico');
        expect(models.ChatConocimiento.findAll).toHaveBeenCalledTimes(1);

        now.mockReturnValue(2500);
        await svc.loadKnowledgeIntoCache('publico');
        expect(models.ChatConocimiento.findAll).toHaveBeenCalledTimes(2);

        now.mockRestore();
    });

    test('comparte la fila normalizada entre caches de canal (sin duplicar Float32Array)', async () => {
        const svc = new RAGService();
        models.ChatConocimiento.findAll.mockResolvedValue([fila('compartida', [1, 0, 0])]);

        const publico = await svc.loadKnowledgeIntoCache('publico');
        const interno = await svc.loadKnowledgeIntoCache('interno');

        const filaPublico = publico.get('compartida');
        const filaInterno = interno.get('compartida');
        expect(filaPublico).toBe(filaInterno); // misma referencia de objeto
        expect(filaPublico.embedding).toBeInstanceOf(Float32Array);
        expect(svc._normalizedRows.size).toBe(1);
    });

    test('force=true limpia las filas normalizadas compartidas', async () => {
        const svc = new RAGService();
        models.ChatConocimiento.findAll.mockResolvedValue([fila('a', [1, 0, 0])]);

        const primera = await svc.loadKnowledgeIntoCache('publico');
        const original = primera.get('a');
        expect(svc._normalizedRows.size).toBe(1);

        const segunda = await svc.loadKnowledgeIntoCache('publico', true);
        const recargada = segunda.get('a');

        expect(recargada).not.toBe(original);
        expect(svc._normalizedRows.size).toBe(1);
    });

    test('invalidateCache limpia las filas normalizadas compartidas', async () => {
        const svc = new RAGService();
        models.ChatConocimiento.findAll.mockResolvedValue([fila('a', [1, 0, 0])]);
        await svc.loadKnowledgeIntoCache('publico');
        expect(svc._normalizedRows.size).toBe(1);

        svc.invalidateCache();
        expect(svc._normalizedRows.size).toBe(0);
    });

    test('poda filas normalizadas que ya no están en ningún cache de canal', () => {
        const svc = new RAGService();
        svc._normalizedRows.set('vigente', { id_conocimiento: 'vigente' });
        svc._normalizedRows.set('borrada', { id_conocimiento: 'borrada' });
        svc.knowledgeCacheByCanal.set('publico', new Map([['vigente', { id_conocimiento: 'vigente' }]]));

        svc._podarFilasNormalizadas();

        expect(svc._normalizedRows.has('vigente')).toBe(true);
        expect(svc._normalizedRows.has('borrada')).toBe(false);
    });

    test('_normalizarFilas con reusar=false no puebla el mapa compartido', () => {
        const svc = new RAGService();
        const { canalCache } = svc._normalizarFilas([fila('a', [1, 0, 0])], { reusar: false });
        expect(canalCache.size).toBe(1);
        expect(svc._normalizedRows.size).toBe(0);
    });

    test('invalidateCache limpia conocimiento y búsquedas', async () => {
        const svc = new RAGService();
        models.ChatConocimiento.findAll.mockResolvedValue([]);
        await svc.loadKnowledgeIntoCache('publico');
        svc.cache.set('x', { result: {}, expiry: Date.now() + 10000 });
        const version = svc.cacheVersion;
        svc.invalidateCache();
        expect(svc.knowledgeCacheByCanal.size).toBe(0);
        expect(svc.cache.size).toBe(0);
        expect(svc.cacheVersion).toBe(version + 1);
    });
});

describe('RAGService — búsqueda y umbrales', () => {
    let svc;
    beforeEach(() => {
        svc = new RAGService();
        svc.configLoader = async () => ({ rag_umbral_estricto: 0.55 });
    });

    test('embedding de consulta inválido => vacío con error explícito', async () => {
        inyectarCache(svc, [fila('a', [1, 0, 0])]);
        const res = await svc.searchSimilarConDetalle('q', [0, 0, 0]);
        expect(res.resultados).toEqual([]);
        expect(res.estadisticas.error).toBe('embedding_consulta_invalido');
    });

    test('dimensiones distintas devuelven score 0 y no recuperan', async () => {
        inyectarCache(svc, [fila('a', [1, 0, 0])]);
        const res = await svc.searchSimilarConDetalle('q', [1, 0, 0, 0]);
        expect(res.resultados).toEqual([]);
        expect(res.estadisticas.candidatosEvaluados).toBe(1);
    });

    test('frontera exacta 0.55 se incluye; 0.5499 se excluye', async () => {
        const y55 = Math.sqrt(1 - 0.55 * 0.55);
        const y5499 = Math.sqrt(1 - 0.5499 * 0.5499);
        inyectarCache(svc, [
            fila('justo', [0.55, y55]),
            fila('casi', [0.5499, y5499]),
        ]);
        const res = await svc.searchSimilarConDetalle('q', [1, 0], { limit: 5 });
        expect(res.estadisticas.umbral).toBeCloseTo(0.55, 6);
        expect(res.resultados.map((r) => r.id_conocimiento)).toEqual(['justo']);
    });

    test('umbral configurado por debajo del piso duro no lo reduce', async () => {
        inyectarCache(svc, [fila('a', [1, 0, 0])]);
        const res = await svc.searchSimilarConDetalle('q', [1, 0], { threshold: 0.1 });
        expect(res.estadisticas.umbral).toBeCloseTo(0.55, 6);
    });

    test('expone margen top1-top2 y confianza', async () => {
        inyectarCache(svc, [
            fila('a', [1, 0]),
            fila('b', [0.9, Math.sqrt(1 - 0.81)]),
        ]);
        const res = await svc.searchSimilarConDetalle('q', [1, 0], { limit: 5 });
        expect(res.estadisticas.similitudMaxima).toBeCloseTo(1, 5);
        expect(res.estadisticas.similitudSegunda).toBeCloseTo(0.9, 5);
        expect(res.estadisticas.margenTop2).toBeCloseTo(0.1, 5);
        expect(res.estadisticas.confianza).toBe('alta');
    });

    test('rescate léxico opcional recupera códigos exactos bajo el umbral', async () => {
        svc.configLoader = async () => ({
            rag_umbral_estricto: 0.55,
            rag_umbral_alto: 0.9,
            rag_lexical_rescue_enabled: true,
            rag_lexical_rescue_floor: 0.2,
        });
        const y = Math.sqrt(1 - 0.3 * 0.3);
        inyectarCache(svc, [
            fila('art148', [0.3, y], { contenido: 'Artículo 148 del código del trabajo sobre sanciones' }),
        ]);
        const res = await svc.searchSimilarConDetalle('¿Qué dice el artículo 148?', [1, 0], { limit: 5 });
        expect(res.resultados).toHaveLength(1);
        expect(res.resultados[0].rescate_lexical).toBe(true);
        expect(res.resultados[0].coincidencia_lexica).toBe(true);
    });

    test('rescate léxico desactivado NO recupera bajo el umbral', async () => {
        inyectarCache(svc, [
            fila('art148', [0.3, Math.sqrt(1 - 0.09)], { contenido: 'Artículo 148 del código del trabajo' }),
        ]);
        const res = await svc.searchSimilarConDetalle('¿Qué dice el artículo 148?', [1, 0], { limit: 5 });
        expect(res.resultados).toEqual([]);
    });

    test('margen mínimo descarta consultas ambiguas', async () => {
        svc.configLoader = async () => ({
            rag_umbral_estricto: 0.3,
            rag_umbral_alto: 0.9,
            rag_margen_top2: 0.2,
        });
        inyectarCache(svc, [
            fila('a', [0.56, Math.sqrt(1 - 0.56 * 0.56)]),
            fila('b', [0.50, Math.sqrt(1 - 0.25)]),
        ]);
        const res = await svc.searchSimilarConDetalle('consulta ambigua', [1, 0], { limit: 5 });
        expect(res.resultados).toEqual([]);
        expect(res.estadisticas.margenTop2).toBeCloseTo(0.06, 4);
        expect(res.estadisticas.confianza).toBe('baja');
    });

    test('el cache de búsqueda está acotado (no crece sin límite)', async () => {
        svc.cacheMaxEntries = 2;
        inyectarCache(svc, [fila('a', [1, 0])]);
        await svc.searchSimilarConDetalle('q1', [1, 0]);
        await svc.searchSimilarConDetalle('q2', [1, 0]);
        await svc.searchSimilarConDetalle('q3', [1, 0]);
        expect(svc.cache.size).toBe(2);
    });

    test('filtra por documento antes de puntuar', async () => {
        inyectarCache(svc, [
            fila('a', [1, 0], { id_documento: 1 }),
            fila('b', [1, 0], { id_documento: 2 }),
        ]);
        const res = await svc.searchSimilarConDetalle('q', [1, 0], { limit: 5, filtros: { id_documento: 2 } });
        expect(res.resultados.map((r) => r.id_conocimiento)).toEqual(['b']);
    });
});

describe('RAGService.searchSimilarByEmbeddings', () => {
    const svc = new RAGService();

    test('usa embedding_trigger de las respuestas canónicas', async () => {
        const rows = [{
            id_canonica: 1,
            patron_trigger: 'saludo',
            embedding_trigger: JSON.stringify([1, 0, 0]),
            respuesta_canonica: 'Hola',
        }];
        const res = await svc.searchSimilarByEmbeddings([1, 0, 0], rows, 0.85, 1);
        expect(res).toHaveLength(1);
        expect(res[0].id_canonica).toBe(1);
        expect(res[0].similarity).toBeCloseTo(1, 5);
    });

    test('usa embedding_keywords de los protocolos sensibles', async () => {
        const rows = [{
            id_protocolo: 2,
            categoria: 'jailbreak',
            embedding_keywords: JSON.stringify([0, 1, 0]),
        }];
        const res = await svc.searchSimilarByEmbeddings([0, 1, 0], rows, 0.9, 1);
        expect(res).toHaveLength(1);
        expect(res[0].id_protocolo).toBe(2);
    });

    test('descarta filas sin vector o con vector cero', async () => {
        const rows = [
            { id_canonica: 1, embedding_trigger: null },
            { id_canonica: 2, embedding_trigger: JSON.stringify([0, 0, 0]) },
        ];
        const res = await svc.searchSimilarByEmbeddings([1, 0, 0], rows, 0.1, 5);
        expect(res).toEqual([]);
    });

    test('respeta el umbral y el límite', async () => {
        const rows = [
            { id_canonica: 1, embedding_trigger: JSON.stringify([1, 0]) },
            { id_canonica: 2, embedding_trigger: JSON.stringify([0.8, 0.6]) },
        ];
        const res = await svc.searchSimilarByEmbeddings([1, 0], rows, 0.9, 1);
        expect(res).toHaveLength(1);
        expect(res[0].id_canonica).toBe(1);
    });
});

describe('RAGService — chunking', () => {
    const svc = new RAGService();

    test('respeta el límite de caracteres', () => {
        const texto = 'palabra '.repeat(200);
        const chunks = svc.crearChunks(texto, 120, 20);
        expect(chunks.every((c) => c.length <= 120)).toBe(true);
    });

    test('no corta en medio de una palabra cuando hay espacios', () => {
        const texto = Array.from({ length: 40 }, (_, i) => `palabra${i}`).join(' ');
        const chunks = svc.crearChunks(texto, 60, 10);
        for (const chunk of chunks) {
            expect(chunk.startsWith('palabra')).toBe(true);
        }
    });

    test('no corta en abreviaturas (Dr., art.)', () => {
        const texto = 'El Dr. Juan Pérez llegó temprano. Después atendió a los pacientes.';
        const corte = svc.encontrarPuntoCorte(texto, 5);
        expect(corte).toBeGreaterThan(0);
        expect(texto.substring(0, corte).trim().endsWith('temprano.')).toBe(true);
    });

    test('fusiona fragmentos huérfanos en lugar de descartarlos', () => {
        const fusionados = svc._fusionarChunksCortos(['x'.repeat(60), 'corto']);
        expect(fusionados).toHaveLength(1);
        expect(fusionados[0]).toContain('corto');
    });

    test('mantiene cobertura completa del texto', () => {
        const piezas = Array.from({ length: 300 }, (_, i) => `token${i}`);
        const texto = piezas.join(' ');
        const chunks = svc.crearChunks(texto, 100, 20);
        const unido = chunks.join(' ');
        for (const pieza of piezas) {
            expect(unido).toContain(pieza);
        }
    });

    test('un texto sin espacios ni puntuación no genera bucle infinito', () => {
        const chunks = svc.crearChunks('a'.repeat(350), 100, 20);
        expect(chunks.length).toBeGreaterThan(1);
        expect(chunks.join('').length).toBeGreaterThanOrEqual(350);
    });
});

describe('RAGService — construcción de texto para embedding', () => {
    const svc = new RAGService();

    test('incluye título y contenido para conservar contexto del chunk', () => {
        const texto = svc.construirTextoEmbedding({
            tema_principal: 'Manual de atención',
            contenido: 'Los horarios son de 8 a 18.',
        });
        expect(texto).toContain('Tema: Manual de atención');
        expect(texto).toContain('Los horarios son de 8 a 18.');
    });

    test('incluye pregunta y respuesta para filas tipo pregunta', () => {
        const texto = svc.construirTextoEmbedding({
            tema_principal: 'Horarios',
            pregunta_frecuente: '¿Cuál es el horario?',
            respuesta_oficial: 'Lunes a viernes de 8 a 18.',
        });
        expect(texto).toContain('Pregunta: ¿Cuál es el horario?');
        expect(texto).toContain('Respuesta: Lunes a viernes de 8 a 18.');
    });

    test('trunca a 8000 caracteres', () => {
        const texto = svc.construirTextoEmbedding({ contenido: 'x'.repeat(9000) });
        expect(texto.length).toBe(8000);
    });
});

describe('RAGService — ingesta con deduplicación', () => {
    beforeEach(() => {
        models.ChatConocimiento.findAll.mockReset();
        models.ChatConocimiento.create.mockReset();
        models.ChatConocimiento.create.mockImplementation(async (data) => ({ ...data }));
    });

    test('omite chunks ya indexados y etiqueta el modelo', async () => {
        const svc = new RAGService();
        const chunkExistente = 'Contenido ya indexado que supera los cincuenta caracteres requeridos.';
        const chunkNuevo = 'Contenido nuevo que también supera los cincuenta caracteres requeridos.';
        svc.crearChunks = () => [chunkExistente, chunkNuevo];
        svc.generateEmbedding = jest.fn().mockResolvedValue([0.1, 0.2, 0.3]);
        models.ChatConocimiento.findAll.mockResolvedValue([{ contenido: chunkExistente }]);

        const res = await svc.ingestDocumento('texto de prueba', 'Manual', 7, 'publico');

        expect(res.total).toBe(2);
        expect(res.inserted).toBe(1);
        expect(res.skipped).toBe(1);
        expect(models.ChatConocimiento.create).toHaveBeenCalledTimes(1);
        const creado = models.ChatConocimiento.create.mock.calls[0][0];
        expect(creado.contenido).toBe(chunkNuevo);
        expect(creado.embedding_model).toBe(svc.getEmbeddingModel());
        expect(creado.id_documento).toBe(7);
    });

    test('un documento más corto que MIN_CHUNK_CHARS se indexa igualmente (no se pierde)', async () => {
        const svc = new RAGService();
        svc.crearChunks = (texto) => [texto];
        svc.generateEmbedding = jest.fn().mockResolvedValue([0.1, 0.2, 0.3]);
        models.ChatConocimiento.findAll.mockResolvedValue([]);

        const res = await svc.ingestDocumento('Atención 24h.', 'Ficha corta', 3, 'publico');

        expect(res.inserted).toBe(1);
        expect(res.skipped).toBe(0);
        const creado = models.ChatConocimiento.create.mock.calls[0][0];
        expect(creado.contenido).toBe('Atención 24h.');
    });

    test('texto vacío no llama a la base de datos', async () => {
        const svc = new RAGService();
        const res = await svc.ingestDocumento('   ', 'Vacío');
        expect(res.inserted).toBe(0);
        expect(models.ChatConocimiento.create).not.toHaveBeenCalled();
    });
});
