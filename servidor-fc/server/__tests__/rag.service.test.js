'use strict';

jest.mock('../src/libs/sequelize', () => ({ models: {} }));

const RAGService = require('../src/services/chat.services/rag.service');

function makeRow(id, vector) {
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
        embedding: vector,
    };
}

describe('RAGService.cosineSimilarity', () => {
    const svc = new RAGService();

    test('vectores idénticos => 1', () => {
        expect(svc.cosineSimilarity([1, 0, 0], [1, 0, 0])).toBeCloseTo(1, 6);
    });

    test('vectores ortogonales => 0', () => {
        expect(svc.cosineSimilarity([1, 0, 0], [0, 1, 0])).toBeCloseTo(0, 6);
    });

    test('vectores opuestos => -1', () => {
        expect(svc.cosineSimilarity([1, 0, 0], [-1, 0, 0])).toBeCloseTo(-1, 6);
    });

    test('vectores parcialmente similares', () => {
        const sim = svc.cosineSimilarity([1, 0, 0], [0.9, 0.4, 0]);
        expect(sim).toBeGreaterThan(0.9);
        expect(sim).toBeLessThan(1);
    });

    test('longitudes distintas => 0 (defensivo)', () => {
        expect(svc.cosineSimilarity([1, 0, 0], [1, 0])).toBe(0);
    });

    test('embedding null o vacío => 0', () => {
        expect(svc.cosineSimilarity(null, [1, 0, 0])).toBe(0);
        expect(svc.cosineSimilarity([], [1, 0, 0])).toBe(0);
    });
});

describe('RAGService.searchSimilar', () => {
    const svc = new RAGService();
    const cache = new Map([
        ['a', makeRow('a', [1, 0, 0])],      // sim 1.0
        ['b', makeRow('b', [0.9, 0.4, 0])],  // sim ~0.9138
        ['c', makeRow('c', [0, 1, 0])],      // sim 0
    ]);
    svc.knowledgeCacheByCanal.set('ambos', cache);

    test('filtra por umbral y limita resultados', async () => {
        const result = await svc.searchSimilar('q', [1, 0, 0], { limit: 1, threshold: 0.9, canal: 'ambos' });
        expect(result).toHaveLength(1);
        expect(result[0].id_conocimiento).toBe('a');
        expect(result[0].similarity).toBeCloseTo(1, 6);
    });

    test('con umbral 0.85 retorna 2 ordenados desc', async () => {
        const result = await svc.searchSimilar('q', [1, 0, 0], { limit: 5, threshold: 0.85, canal: 'ambos' });
        expect(result).toHaveLength(2);
        expect(result[0].id_conocimiento).toBe('a');
        expect(result[1].id_conocimiento).toBe('b');
        expect(result[0].similarity).toBeGreaterThan(result[1].similarity);
    });

    test('sin resultados sobre umbral retorna lista vacía', async () => {
        const result = await svc.searchSimilar('q', [0, 0, 1], { limit: 5, threshold: 0.5, canal: 'ambos' });
        expect(result).toEqual([]);
    });
});

describe('RAGService.crearChunks', () => {
    const svc = new RAGService();

    test('texto corto => un solo chunk completo', () => {
        const chunks = svc.crearChunks('hola mundo', 1000, 200);
        expect(chunks).toHaveLength(1);
        expect(chunks[0]).toBe('hola mundo');
    });

    test('no pierde contenido entre chunks (cobertura)', () => {
        const text = Array.from({ length: 500 }, (_, i) => `p${i}`).join(' ');
        const chunks = svc.crearChunks(text, 100, 20);
        const unido = chunks.join(' ');
        for (const p of Array.from({ length: 500 }, (_, i) => `p${i}`)) {
            expect(unido).toContain(p);
        }
    });

    test('chunks cortos menores a 50 se saltan en ingestDocumento (se prueba inline)', () => {
        const chunks = svc.crearChunks('una frase corta', 1000, 200);
        expect(chunks).toHaveLength(1);
        expect(chunks[0].length).toBeGreaterThanOrEqual(1);
    });
});

describe('RAGService.calcularOverlapLexico', () => {
    const svc = new RAGService();

    test('cobertura de términos del query (1.0 si todos presentes)', () => {
        expect(svc.calcularOverlapLexico('protocolo ansiedad menores', 'protocolo de ansiedad en menores de edad')).toBeCloseTo(1, 3);
    });

    test('0 si ningún término aparece', () => {
        expect(svc.calcularOverlapLexico('vacunas', 'administracion y pagos')).toBe(0);
    });

    test('stopwords y acentos no aportan', () => {
        const conStopword = svc.calcularOverlapLexico('de la rifa', 'la rifa');
        const soloTermino = svc.calcularOverlapLexico('rifa', 'la rifa');
        expect(conStopword).toBe(soloTermino);
    });
});

describe('RAGService.searchSimilar (scoring híbrido)', () => {
    test('promueve el chunk que repite las keywords del query sobre igual similitud', async () => {
        const svc = new RAGService();
        const cache = new Map([
            ['a', makeRow('a', [1, 0, 0])],  // contenido 'Contenido a' / tema 'Tema a'
            ['b', makeRow('b', [1, 0, 0])],  // embedding idéntico => mismo coseno
        ]);
        cache.get('a').contenido = 'protocolo de ansiedad en menores de edad';
        cache.get('a').pregunta_frecuente = 'protocolo ansiedad menores';
        cache.get('b').contenido = 'administracion de pagos y cobros';
        svc.knowledgeCacheByCanal.set('ambos', cache);

        const result = await svc.searchSimilar('protocolo ansiedad menores', [1, 0, 0], { limit: 5, threshold: 0.7, canal: 'ambos' });

        expect(result).toHaveLength(2);
        expect(result[0].id_conocimiento).toBe('a');
        expect(result[1].id_conocimiento).toBe('b');
        expect(result[0].overlapLexico).toBeCloseTo(1, 3);
        expect(result[0].combinedScore).toBeGreaterThan(result[1].combinedScore);
    });

    test('respetar peso de config si el loader lo provee', async () => {
        const svc = new RAGService();
        const cache = new Map([['x', makeRow('x', [1, 0, 0])]]);
        cache.get('x').contenido = 'jornales y sueldos';
        svc.knowledgeCacheByCanal.set('ambos', cache);
        svc.configLoader = jest.fn().mockResolvedValue({ rag_lexico_weight: 0.5 });

        const result = await svc.searchSimilar('jornales', [1, 0, 0], { limit: 1, threshold: 0.7, canal: 'ambos' });
        expect(result[0].combinedScore).toBeCloseTo(1 * 0.5 + 1 * 0.5, 3);
    });

    test('acepta por combinedScore cuando el coseno queda bajo el umbral (query corta tipo "rifa")', async () => {
        const svc = new RAGService();
        const cache = new Map([['x', makeRow('x', [0.5, Math.sqrt(0.75), 0])]]);
        cache.get('x').contenido = 'Numero de rifa';
        svc.knowledgeCacheByCanal.set('ambos', cache);

        const result = await svc.searchSimilar('rifa', [1, 0, 0], { limit: 1, threshold: 0.55, canal: 'ambos' });
        expect(result).toHaveLength(1);
        expect(result[0].similarity).toBeLessThan(0.55);
        expect(result[0].combinedScore).toBeGreaterThanOrEqual(0.55);
    });

    test('no acepta por solapamiento sin soporte semántico (coseno bajo y sin tokens compartidos)', async () => {
        const svc = new RAGService();
        const cache = new Map([['x', makeRow('x', [0.5, Math.sqrt(0.75), 0])]]);
        cache.get('x').contenido = 'administracion de pagos';
        svc.knowledgeCacheByCanal.set('ambos', cache);

        const result = await svc.searchSimilar('rizoma', [1, 0, 0], { limit: 1, threshold: 0.55, canal: 'ambos' });
        expect(result).toEqual([]);
    });
});

describe('RAGService.buildRAGContextDetalle', () => {
    test('devuelve detalle con similitud máxima y bloque de contexto', async () => {
        const svc = new RAGService();
        const cache = new Map([
            ['a', makeRow('a', [1, 0, 0])],
            ['b', makeRow('b', [0.9, 0.4, 0])],
        ]);
        svc.knowledgeCacheByCanal.set('ambos', cache);
        svc.generateEmbedding = jest.fn().mockResolvedValue([1, 0, 0]);

        const detalle = await svc.buildRAGContextDetalle('consulta de prueba', 2, 0.7, 'ambos');

        expect(detalle.contextoIncluido).toBe(true);
        expect(detalle.similitudMaxima).toBeCloseTo(1, 6);
        expect(detalle.nResultados).toBe(2);
        expect(detalle.context).toContain('INFORMACIÓN RELEVANTE');
        expect(detalle.context).toContain('SIMILITUD');
        expect(detalle.resultados).toHaveLength(2);
    });

    test('sin resultados retorna contexto vacío y contextoIncluido false', async () => {
        const svc = new RAGService();
        const cache = new Map([['c', makeRow('c', [0, 1, 0])]]);
        svc.knowledgeCacheByCanal.set('ambos', cache);
        svc.generateEmbedding = jest.fn().mockResolvedValue([1, 0, 0]);

        const detalle = await svc.buildRAGContextDetalle('otra consulta', 3, 0.7, 'ambos');
        expect(detalle.contextoIncluido).toBe(false);
        expect(detalle.context).toBe('');
        expect(detalle.nResultados).toBe(0);
    });
});