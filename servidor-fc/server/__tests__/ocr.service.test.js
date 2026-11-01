'use strict';

const {
    limpiarTexto,
    reconstruirTextoPorLineas,
} = require('../src/utils/ocr.service');

describe('ocr.service.limpiarTexto', () => {
    test('normaliza CRLF y CR a LF', () => {
        expect(limpiarTexto('linea1\r\nlinea2\rlinea3')).toBe('linea1\nlinea2\nlinea3');
    });

    test('conserva los saltos de párrafo (no aplasta todo a una línea)', () => {
        const texto = 'Título\n\nPrimer párrafo con detalle.\n\nSegundo párrafo.';
        const limpio = limpiarTexto(texto);
        expect(limpio.split('\n\n')).toHaveLength(3);
        expect(limpio).toContain('Título\n\nPrimer párrafo');
    });

    test('colapsa espacios y tabulaciones múltiples', () => {
        expect(limpiarTexto('a\t\t  b   c')).toBe('a b c');
    });

    test('elimina espacios alrededor de saltos de línea', () => {
        expect(limpiarTexto('a   \n   b')).toBe('a\nb');
    });

    test('limita saltos consecutivos a dos', () => {
        expect(limpiarTexto('a\n\n\n\n\nb')).toBe('a\n\nb');
    });

    test('entradas vacías o nulas devuelven cadena vacía', () => {
        expect(limpiarTexto(null)).toBe('');
        expect(limpiarTexto(undefined)).toBe('');
        expect(limpiarTexto('   \n  \n ')).toBe('');
    });
});

describe('ocr.service.reconstruirTextoPorLineas', () => {
    const fragmento = (str, x, y) => ({ str, transform: [1, 0, 0, 1, x, y] });

    test('agrupa fragmentos de la misma línea y ordena por X', () => {
        const items = [
            fragmento('Mundo', 60, 700),
            fragmento('Hola', 10, 700),
            fragmento('Segunda línea', 10, 680),
        ];
        expect(reconstruirTextoPorLineas(items)).toBe('Hola Mundo\nSegunda línea');
    });

    test('no mezcla celdas de una tabla en una sola línea', () => {
        const items = [
            fragmento('Nombre', 10, 700),
            fragmento('Edad', 200, 700),
            fragmento('Juan', 10, 680),
            fragmento('42', 200, 680),
        ];
        const texto = reconstruirTextoPorLineas(items);
        expect(texto).toBe('Nombre Edad\nJuan 42');
        expect(texto).not.toContain('Nombre Juan');
    });

    test('ignora items sin str y conserva los que tienen texto', () => {
        const items = [
            { str: null, transform: [1, 0, 0, 1, 0, 0] },
            { str: 'Texto', transform: null },
            fragmento('Válido', 0, 0),
        ];
        // Sin transform las coordenadas caen a 0,0: no se descarta el texto.
        expect(reconstruirTextoPorLineas(items)).toBe('Texto Válido');
    });

    test('items vacíos devuelven cadena vacía', () => {
        expect(reconstruirTextoPorLineas([])).toBe('');
        expect(reconstruirTextoPorLineas(null)).toBe('');
    });
});
