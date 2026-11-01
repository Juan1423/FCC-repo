'use strict';

const { barrerUmbral } = require('../src/utils/threshold.calibration');

function fila(categoria, score) {
    return { 'Categoría Esperada': categoria, 'Max Score RAG': score };
}

describe('threshold.calibration.barrerUmbral', () => {
    const dataset = [
        fila('RAG_VALIDO', 0.80),
        fila('RAG_VALIDO', 0.70),
        fila('RAG_VALIDO', 0.60),
        fila('RAG_VALIDO', 0.45),
        fila('RAG_VALIDO', 0.30),
        fila('OFF_TOPIC', 0.20),
        fila('OFF_TOPIC', 0.10),
        fila('OFF_TOPIC', 0.35),
        fila('OFF_TOPIC', 0.50),
        fila('OFF_TOPIC', 0.05),
    ];

    test('elige un umbral con recall alto y mejor F1', () => {
        const resultado = barrerUmbral(dataset, { objetivo: 'RAG_VALIDO', minRecall: 0.85 });
        expect(resultado.mejor).not.toBeNull();
        expect(resultado.mejor.recall).toBeGreaterThanOrEqual(0.85);
        // Con este dataset el único umbral con recall 1.0 y FP acotados es 0.30.
        expect(resultado.mejor.redondeado).toBeCloseTo(0.3, 2);
        expect(resultado.mejor.precision).toBeCloseTo(5 / 7, 2);
    });

    test('devuelve candidatos ordenados por F1', () => {
        const resultado = barrerUmbral(dataset);
        expect(resultado.candidatos.length).toBeGreaterThan(0);
        for (let i = 1; i < resultado.candidatos.length; i++) {
            expect(resultado.candidatos[i - 1].f1).toBeGreaterThanOrEqual(resultado.candidatos[i].f1);
        }
    });

    test('excluye categorías indicadas (p. ej. SENSIBLE)', () => {
        const conSensible = dataset.concat([fila('SENSIBLE', 0.95)]);
        const resultado = barrerUmbral(conSensible, { excluir: ['SENSIBLE'], minRecall: 0.8 });
        expect(resultado.nota).toContain('n=10');
    });

    test('sin filas numéricas devuelve null', () => {
        const resultado = barrerUmbral([fila('RAG_VALIDO', 'ERR')]);
        expect(resultado.mejor).toBeNull();
        expect(resultado.candidatos).toEqual([]);
    });

    test('si ningún umbral alcanza minRecall usa el mejor F1 disponible', () => {
        const resultado = barrerUmbral([
            fila('RAG_VALIDO', 0.40),
            fila('RAG_VALIDO', 0.42),
            fila('OFF_TOPIC', 0.60),
        ], { objetivo: 'RAG_VALIDO', minRecall: 1.1 });
        expect(resultado.mejor).not.toBeNull();
        expect(resultado.mejor.f1).toBeGreaterThan(0);
    });
});
