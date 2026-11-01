'use strict';

/**
 * Utilidades matemáticas compartidas para similitud vectorial.
 *
 * Todas las rutas de recuperación (RAG, guardrails, respuestas canónicas y
 * calibración) deben usar estas funciones para que la métrica sea idéntica en
 * todo el sistema. Un cosine distinto por servicio produce umbrales que no son
 * comparables entre sí.
 */

const MAX_DIMENSION_SANE = 8192;

/**
 * Convierte un valor heterogéneo (JSON string de Postgres, array, typed array)
 * en un Float32Array validado. Devuelve null si el valor no representa un
 * vector numérico utilizable.
 *
 * Notas de precisión: OpenAI entrega los embeddings con precisión float32, por
 * lo que almacenarlos en Float32Array no pierde información frente al JSON.
 * El producto punto se acumula en double para evitar deriva numérica.
 *
 * @param {string|Array<number>|Float32Array|Float64Array|null|undefined} value
 * @returns {Float32Array|null}
 */
function parseEmbedding(value) {
    if (value === null || value === undefined) return null;

    let raw = value;
    if (typeof raw === 'string') {
        const trimmed = raw.trim();
        if (!trimmed) return null;
        try {
            raw = JSON.parse(trimmed);
        } catch (error) {
            return null;
        }
    }

    if (ArrayBuffer.isView(raw)) {
        raw = Array.from(raw);
    }
    if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_DIMENSION_SANE) {
        return null;
    }

    const vector = new Float32Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
        const value = raw[i];
        if (value === null || value === undefined || value === '') return null;
        const n = Number(value);
        if (!Number.isFinite(n)) return null;
        vector[i] = n;
    }
    return vector;
}

/**
 * Normaliza un vector a norma L2 = 1. Devuelve null para vectores nulos,
 * vacíos, no numéricos o de norma cero (un vector cero no tiene dirección y
 * su coseno es indefinido, no 0).
 *
 * @param {string|Array<number>|Float32Array|null|undefined} value
 * @returns {Float32Array|null}
 */
function toUnitVector(value) {
    const vector = parseEmbedding(value);
    if (!vector) return null;

    let sumSquares = 0;
    for (let i = 0; i < vector.length; i++) {
        sumSquares += vector[i] * vector[i];
    }
    const norm = Math.sqrt(sumSquares);
    if (!Number.isFinite(norm) || norm === 0) return null;

    const unit = new Float32Array(vector.length);
    for (let i = 0; i < vector.length; i++) {
        unit[i] = vector[i] / norm;
    }
    return unit;
}

function clampCosine(value) {
    if (!Number.isFinite(value)) return 0;
    if (value > 1) return 1;
    if (value < -1) return -1;
    return value;
}

/**
 * Similitud coseno entre dos vectores.
 * - Devuelve 0 ante entradas inválidas, dimensiones distintas o norma cero
 *   (comportamiento defensivo histórico del RAG).
 * - El resultado se acota a [-1, 1] para neutralizar error de punto flotante.
 *
 * @param {string|Array<number>|Float32Array|null} vecA
 * @param {string|Array<number>|Float32Array|null} vecB
 * @returns {number}
 */
function cosineSimilarity(vecA, vecB) {
    const a = parseEmbedding(vecA);
    const b = parseEmbedding(vecB);
    if (!a || !b || a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    if (normA === 0 || normB === 0) return 0;

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    if (!Number.isFinite(denominator) || denominator === 0) return 0;

    return clampCosine(dotProduct / denominator);
}

/**
 * Producto punto entre dos vectores YA normalizados. Equivale a cosineSimilarity
 * pero evita recalcular normas en cada comparación (bucle caliente del RAG).
 *
 * @param {Float32Array} unitA
 * @param {Float32Array} unitB
 * @returns {number}
 */
function dotSimilarity(unitA, unitB) {
    if (!unitA || !unitB || unitA.length !== unitB.length) return 0;
    let dot = 0;
    for (let i = 0; i < unitA.length; i++) {
        dot += unitA[i] * unitB[i];
    }
    return clampCosine(dot);
}

/**
 * Histograma de dimensiones para detectar embeddings de modelos distintos.
 * text-embedding-3-small y text-embedding-ada-002 comparten 1536 dimensiones,
 * por lo que este chequeo es necesario pero NO suficiente: la columna
 * embedding_model cubre el caso restante.
 *
 * @param {Iterable<Float32Array|Array<number>|string>} embeddings
 * @returns {{dimensions: Record<number, number>, total: number, mixed: boolean}}
 */
function summarizeDimensions(embeddings) {
    const dimensions = {};
    let total = 0;
    for (const value of embeddings || []) {
        const vector = parseEmbedding(value);
        if (!vector) continue;
        total++;
        dimensions[vector.length] = (dimensions[vector.length] || 0) + 1;
    }
    const distinct = Object.keys(dimensions).length;
    return { dimensions, total, mixed: distinct > 1 };
}

module.exports = {
    parseEmbedding,
    toUnitVector,
    cosineSimilarity,
    dotSimilarity,
    summarizeDimensions,
    clampCosine,
};
