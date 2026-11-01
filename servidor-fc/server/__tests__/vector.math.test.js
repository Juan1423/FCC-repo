'use strict';

const {
    parseEmbedding,
    toUnitVector,
    cosineSimilarity,
    dotSimilarity,
    summarizeDimensions,
    clampCosine,
} = require('../src/utils/vector.math');

describe('vector.math.parseEmbedding', () => {
    test('acepta el JSON string que guarda Postgres', () => {
        const vector = parseEmbedding('[0.1, 0.2, 0.3]');
        expect(vector).toBeInstanceOf(Float32Array);
        expect(Array.from(vector)).toEqual([0.1, 0.2, 0.3].map((n) => Math.fround(n)));
    });

    test('acepta arrays y typed arrays', () => {
        expect(Array.from(parseEmbedding([1, 2, 3]))).toHaveLength(3);
        expect(Array.from(parseEmbedding(new Float64Array([1, 2, 3])))).toHaveLength(3);
    });

    test.each([
        ['null', null],
        ['undefined', undefined],
        ['string vacío', ''],
        ['JSON inválido', '[1,2,'],
        ['objeto JSON', '{"a":1}'],
        ['array vacío', '[]'],
        ['NaN serializado', '[1,"x",3]'],
    ])('rechaza %s', (_nombre, valor) => {
        expect(parseEmbedding(valor)).toBeNull();
    });

    test('rechaza valores no finitos', () => {
        expect(parseEmbedding([1, Infinity, 3])).toBeNull();
        expect(parseEmbedding([1, null, 3])).toBeNull();
    });
});

describe('vector.math.toUnitVector', () => {
    test('normaliza a norma 1', () => {
        const unit = toUnitVector([3, 4]);
        expect(Array.from(unit).map((n) => Number(n.toFixed(6)))).toEqual([0.6, 0.8]);
        const norm = Math.sqrt(unit[0] * unit[0] + unit[1] * unit[1]);
        expect(norm).toBeCloseTo(1, 5);
    });

    test('vector cero => null (no tiene dirección)', () => {
        expect(toUnitVector([0, 0, 0])).toBeNull();
    });

    test('NaN/Infinity => null', () => {
        expect(toUnitVector([1, NaN, 2])).toBeNull();
        expect(toUnitVector([1, Infinity])).toBeNull();
    });
});

describe('vector.math.cosineSimilarity', () => {
    test('idénticos => 1', () => {
        expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1, 6);
    });

    test('opuestos => -1', () => {
        expect(cosineSimilarity([1, 0], [-1, 0])).toBeCloseTo(-1, 6);
    });

    test('ortogonales => 0', () => {
        expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0, 6);
    });

    test('es invariante a la escala', () => {
        const a = cosineSimilarity([1, 2, 3], [4, 5, 6]);
        const b = cosineSimilarity([1000, 2000, 3000], [4, 5, 6]);
        expect(a).toBeCloseTo(b, 5);
    });

    test('dimensiones distintas => 0 (defensivo)', () => {
        expect(cosineSimilarity([1, 0, 0], [1, 0])).toBe(0);
    });

    test('norma cero => 0', () => {
        expect(cosineSimilarity([0, 0], [1, 0])).toBe(0);
    });

    test('estabilidad numérica con magnitudes grandes', () => {
        expect(cosineSimilarity([1e6, 2e6], [1e6, 2e6])).toBeCloseTo(1, 5);
        expect(Number.isFinite(cosineSimilarity([1e200, 1e200], [1e200, 1e200]))).toBe(true);
    });

    test('se acota a [-1, 1] ante error de punto flotante', () => {
        expect(clampCosine(1.0000001)).toBe(1);
        expect(clampCosine(-1.0000001)).toBe(-1);
        expect(clampCosine(NaN)).toBe(0);
    });

    test('1536 dimensiones: vector consigo mismo = 1', () => {
        const v = Array.from({ length: 1536 }, (_, i) => Math.sin(i));
        expect(cosineSimilarity(v, v)).toBeCloseTo(1, 5);
    });
});

describe('vector.math.dotSimilarity', () => {
    test('equivale a coseno cuando ambos vectores son unitarios', () => {
        const a = toUnitVector([1, 2, 3]);
        const b = toUnitVector([3, 2, 1]);
        expect(dotSimilarity(a, b)).toBeCloseTo(cosineSimilarity([1, 2, 3], [3, 2, 1]), 5);
    });

    test('dimensiones distintas => 0', () => {
        expect(dotSimilarity(toUnitVector([1, 0]), toUnitVector([1, 0, 0]))).toBe(0);
    });
});

describe('vector.math.summarizeDimensions', () => {
    test('detecta dimensiones mezcladas', () => {
        const resumen = summarizeDimensions([[1, 2], [1, 2, 3], [4, 5]]);
        expect(resumen.total).toBe(3);
        expect(resumen.mixed).toBe(true);
        expect(resumen.dimensions).toEqual({ 2: 2, 3: 1 });
    });

    test('ignora entradas inválidas', () => {
        const resumen = summarizeDimensions([[1, 2], null, 'basura']);
        expect(resumen.total).toBe(1);
        expect(resumen.mixed).toBe(false);
    });
});
