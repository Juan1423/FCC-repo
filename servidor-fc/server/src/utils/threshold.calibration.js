'use strict';

/**
 * Barrido de umbral con métricas de clasificación. Módulo puro (sin BD ni
 * OpenAI) para poder testearlo offline y reutilizarlo desde el script de
 * calibración.
 *
 * Reemplaza la elección intuitiva de 0.55 por un valor derivado de datos
 * etiquetados:
 *   precision = TP / (TP + FP)
 *   recall    = TP / (TP + FN)
 *   F1        = 2PR / (P + R)
 */

function redondearUmbral(n) {
    return Math.round(n * 10000) / 10000;
}

/**
 * @param {Array<object>} filas filas con { 'Categoría Esperada', 'Max Score RAG' }
 * @param {{desde?: number, hasta?: number, paso?: number, objetivo?: string, excluir?: string[], minRecall?: number, campoScore?: string}} opciones
 */
function barrerUmbral(filas, {
    desde = 0.05,
    hasta = 0.95,
    paso = 0.01,
    objetivo = 'RAG_VALIDO',
    excluir = [],
    minRecall = 0.85,
    campoScore = 'Max Score RAG',
} = {}) {
    const validas = (filas || []).filter((fila) => {
        if (!fila || excluir.includes(fila['Categoría Esperada'])) return false;
        const score = fila[campoScore];
        return typeof score === 'number' && Number.isFinite(score);
    });

    if (validas.length === 0) {
        return { mejor: null, candidatos: [], nota: 'Sin filas numéricas para barrer' };
    }

    const candidatos = [];
    for (let t = desde; t <= hasta + 1e-9; t += paso) {
        const umbral = redondearUmbral(t);
        let tp = 0, fp = 0, fn = 0, tn = 0;
        for (const fila of validas) {
            const positiva = fila['Categoría Esperada'] === objetivo;
            const predicha = fila[campoScore] >= umbral;
            if (positiva && predicha) tp++;
            else if (!positiva && predicha) fp++;
            else if (positiva && !predicha) fn++;
            else tn++;
        }
        const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
        const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
        const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
        candidatos.push({ umbral, tp, fp, fn, tn, precision, recall, f1 });
    }

    const cumplenRecall = candidatos.filter((c) => c.recall >= minRecall);
    const base = cumplenRecall.length > 0 ? cumplenRecall : candidatos;
    // Ante empate de F1 se elige el umbral MÁS ALTO: reduce falsos positivos
    // borderline sin sacrificar recall.
    const mejor = base.reduce((best, actual) => (actual.f1 >= best.f1 ? actual : best), base[0]);

    return {
        mejor: mejor ? { ...mejor, redondeado: redondearUmbral(mejor.umbral) } : null,
        candidatos: candidatos
            .sort((a, b) => b.f1 - a.f1)
            .slice(0, 5)
            .map((c) => ({ ...c, umbral: redondearUmbral(c.umbral) })),
        nota: `objetivo=${objetivo}, minRecall=${minRecall}, n=${validas.length}`,
    };
}

module.exports = { barrerUmbral, redondearUmbral };
