'use strict';

const { OpenAI } = require('openai');
const { models } = require('../../libs/sequelize');
const { Op } = require('sequelize');
const chatConfig = require('../../config/chatConfig');
const vectorMath = require('../../utils/vector.math');

const DEFAULT_RAG_UMBRAL_ESTRICTO = 0.55;
const MAX_EMBEDDING_INPUT_CHARS = 8000;
// Reserva para el prefijo de contexto ("Tema: <título>") que se añade al texto
// que se embebe. Evita que el prefijo desplace contenido del chunk por la
// truncación de 8000 caracteres del modelo de embeddings.
const EMBEDDING_PREFIX_RESERVE = 200;
const MIN_CHUNK_CHARS = 50;
const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;
const DEFAULT_SEARCH_CACHE_MAX_ENTRIES = 500;
const DEFAULT_UMBRAL_ALTO = 0.75;
const DEFAULT_MARGEN_TOP2 = 0;
const DEFAULT_RESCUE_FLOOR = 0.30;

/**
 * Bandas de umbral recomendadas por modelo de embeddings. El coseno NO es
 * comparable entre modelos: ada-002 comprime las similitudes hacia valores
 * altos (pares no relacionados ~0.70-0.80) mientras que 3-small reparte el
 * rango completo (pares no relacionados ~0.00-0.25). Un único 0.55 global
 * produce falsos positivos masivos con ada-002 y falsos negativos con 3-small.
 *
 * El valor configurado en BD (`rag_umbral_estricto`) sigue teniendo prioridad;
 * esta tabla se usa para (a) el default cuando no hay configuración y
 * (b) avisar cuando el valor configurado queda fuera de la banda del modelo.
 */
const UMBRALES_RECOMENDADOS_POR_MODELO = {
    'text-embedding-3-small': { piso: 0.35, alto: 0.55 },
    'text-embedding-3-large': { piso: 0.32, alto: 0.52 },
    'text-embedding-ada-002': { piso: 0.75, alto: 0.88 },
};

class RAGService {
    constructor() {
        this.cache = new Map();
        this.knowledgeCacheByCanal = new Map();
        this.knowledgeCacheExpiry = new Map();
        this.cacheExpiryMs = DEFAULT_CACHE_TTL_MS;
        this.cacheMaxEntries = DEFAULT_SEARCH_CACHE_MAX_ENTRIES;
        this.cacheVersion = 0;
        // Filas normalizadas compartidas entre caches de canal: evita duplicar
        // el Float32Array de 1536 dims para filas 'ambos' en publico/interno.
        this._normalizedRows = new Map();
        this.openai = null;
        this.configLoader = null;
        this._embeddingModelColumnAvailable = null;
        this._knowledgeCacheStats = new Map();
        this._avisoUmbralEmitido = new Set();
        this.cacheHits = 0;
        this.cacheMisses = 0;
    }

    getEmbeddingModel() {
        return chatConfig.embeddingModel || 'text-embedding-ada-002';
    }

    getUmbralRecomendado(modelo = this.getEmbeddingModel()) {
        return UMBRALES_RECOMENDADOS_POR_MODELO[modelo] || {
            piso: DEFAULT_RAG_UMBRAL_ESTRICTO,
            alto: DEFAULT_UMBRAL_ALTO,
        };
    }

    async getRagUmbralEstricto() {
        const recomendado = this.getUmbralRecomendado();
        let configurado = null;
        if (this.configLoader) {
            try {
                const cfg = await this.configLoader();
                const val = cfg?.rag_umbral_estricto;
                if (val !== undefined && val !== null) {
                    const parsed = parseFloat(val);
                    if (!Number.isNaN(parsed)) configurado = parsed;
                }
            } catch (error) {
                console.warn('Error reading rag_umbral_estricto from config:', error.message);
            }
        }

        if (configurado === null) return recomendado.piso;

        if (configurado < recomendado.piso || configurado > recomendado.alto) {
            const clave = `${this.getEmbeddingModel()}:${configurado}`;
            if (!this._avisoUmbralEmitido.has(clave)) {
                this._avisoUmbralEmitido.add(clave);
                console.warn(
                    `[RAG] rag_umbral_estricto=${configurado} está fuera de la banda recomendada ` +
                    `[${recomendado.piso}, ${recomendado.alto}] para ${this.getEmbeddingModel()}. ` +
                    'Revisa src/scripts/calibracion-umbrales.js.'
                );
            }
        }

        return configurado;
    }

    async obtenerConfigRAG() {
        if (!this.configLoader) return {};
        try {
            const cfg = await this.configLoader();
            return cfg || {};
        } catch (error) {
            console.warn('Error cargando config RAG desde loader:', error.message);
            return {};
        }
    }

    getOpenAI() {
        if (!this.openai) {
            this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        }
        return this.openai;
    }

    generateCacheKey(text, params) {
        return `${text}:${JSON.stringify(params)}`;
    }

    async generateEmbedding(text) {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY no está configurada');
        }
        const input = String(text || '').substring(0, MAX_EMBEDDING_INPUT_CHARS);
        const response = await this.getOpenAI().embeddings.create({
            model: this.getEmbeddingModel(),
            input,
        });
        const embedding = vectorMath.parseEmbedding(response.data[0].embedding);
        if (!embedding) {
            throw new Error('El proveedor devolvió un embedding inválido');
        }
        return Array.from(embedding);
    }

    /**
     * Texto canónico que se embebe para una fila de conocimiento. Debe usarse
     * tanto en la ingesta como en la regeneración, de lo contrario los vectores
     * de una misma fila cambian según el camino (inconsistencia silenciosa).
     */
    construirTextoEmbedding(row = {}) {
        const partes = [];
        const tema = row.tema_principal ? String(row.tema_principal).trim() : '';
        const tipo = row.tipo || 'segmento';

        if (tema) partes.push(`Tema: ${tema}`);
        if (row.pregunta_frecuente) partes.push(`Pregunta: ${String(row.pregunta_frecuente).trim()}`);
        if (row.respuesta_oficial) partes.push(`Respuesta: ${String(row.respuesta_oficial).trim()}`);
        if (row.contenido) partes.push(String(row.contenido).trim());

        if (partes.length === 0 && tema) partes.push(tema);
        return partes.join('\n').substring(0, MAX_EMBEDDING_INPUT_CHARS);
    }

    cosineSimilarity(vecA, vecB) {
        return vectorMath.cosineSimilarity(vecA, vecB);
    }

    canalesPermitidos(canal = 'ambos') {
        if (!canal || canal === 'ambos') return ['ambos', 'publico', 'interno'];
        return ['ambos', canal];
    }

    _crearCacheBusqueda(cacheKey, result) {
        this.cache.set(cacheKey, { result, expiry: Date.now() + this.cacheExpiryMs });
        while (this.cache.size > this.cacheMaxEntries) {
            const oldest = this.cache.keys().next().value;
            this.cache.delete(oldest);
        }
    }

    _filtrarFila(row, filtros = {}) {
        if (!filtros) return true;
        if (filtros.id_documento !== undefined && filtros.id_documento !== null) {
            if (row.id_documento !== filtros.id_documento) return false;
        }
        if (filtros.tipo && row.tipo !== filtros.tipo) return false;
        if (filtros.tema_principal && row.tema_principal !== filtros.tema_principal) return false;
        if (filtros.excluirIds) {
            const ids = filtros.excluirIds instanceof Set ? filtros.excluirIds : new Set(filtros.excluirIds);
            if (ids.has(row.id_conocimiento)) return false;
        }
        return true;
    }

    /**
     * Convierte filas crudas en filas con vector unitario Float32Array.
     *
     * `reusar` (default true) permite compartir el mismo objeto entre caches de
     * distintos canales: una fila 'ambos' aparece en publico, interno y ambos,
     * y sin reuso se guardarían 3 copias del mismo Float32Array de 1536 dims.
     * Un `force` de carga limpia el mapa compartido para no servir vectores
     * obsoletos tras una re-ingesta.
     */
    _normalizarFilas(rows, { reusar = true } = {}) {
        const canalCache = new Map();
        const dimensiones = {};
        const modelos = {};
        let invalidos = 0;

        for (const row of rows) {
            const clave = row.id_conocimiento;
            const reutilizable = reusar && clave !== undefined && clave !== null;
            let normalizada = reutilizable ? this._normalizedRows.get(clave) : null;
            if (!normalizada) {
                const unit = vectorMath.toUnitVector(row.embedding);
                if (!unit) {
                    invalidos++;
                    continue;
                }
                normalizada = {
                    ...row,
                    embedding: unit,
                    _dim: unit.length,
                    _unit: true,
                };
                if (reutilizable) this._normalizedRows.set(clave, normalizada);
            }
            const unit = normalizada.embedding;
            dimensiones[unit.length] = (dimensiones[unit.length] || 0) + 1;
            const modelo = row.embedding_model || 'desconocido';
            modelos[modelo] = (modelos[modelo] || 0) + 1;
            canalCache.set(row.id_conocimiento, normalizada);
        }

        const dimsDistintas = Object.keys(dimensiones).length;
        const modelosDistintos = Object.keys(modelos).filter((m) => m !== 'desconocido');
        return {
            canalCache,
            stats: {
                filas: rows.length,
                indexadas: canalCache.size,
                invalidos,
                dimensiones,
                dimensionesMixtas: dimsDistintas > 1,
                modelos,
                modelosMixtos: modelosDistintos.length > 1,
            },
        };
    }

    async _findAllConEmbeddingModel(where, attributes) {
        const baseAttributes = attributes.filter((attr) => attr !== 'embedding_model');
        if (this._embeddingModelColumnAvailable === false) {
            return models.ChatConocimiento.findAll({ where, attributes: baseAttributes, raw: true });
        }
        try {
            const rows = await models.ChatConocimiento.findAll({
                where,
                attributes: [...baseAttributes, 'embedding_model'],
                raw: true,
            });
            this._embeddingModelColumnAvailable = true;
            return rows;
        } catch (error) {
            const mensaje = String(error && error.message ? error.message : error);
            if (/embedding_model/i.test(mensaje)) {
                this._embeddingModelColumnAvailable = false;
                console.warn('[RAG] Columna embedding_model ausente; se omite el chequeo de modelo por fila.');
                return models.ChatConocimiento.findAll({ where, attributes: baseAttributes, raw: true });
            }
            throw error;
        }
    }

    async loadKnowledgeIntoCache(canal = 'ambos', force = false) {
        const cached = this.knowledgeCacheByCanal.get(canal);
        const tieneExpiracion = this.knowledgeCacheExpiry.has(canal);
        const expiry = this.knowledgeCacheExpiry.get(canal) || 0;
        // Compatibilidad: caches inyectadas manualmente (tests) no tienen
        // expiración registrada y deben considerarse válidas.
        if (!force && cached && (!tieneExpiracion || Date.now() < expiry)) {
            return cached;
        }

        // Fuerza = re-lectura desde BD: los vectores normalizados compartidos
        // pueden haber cambiado (re-ingesta, backfill) y no deben reutilizarse.
        if (force) this._normalizedRows.clear();

        try {
            const rows = await this._findAllConEmbeddingModel(
                {
                    estado_vigencia: true,
                    bloqueado: false,
                    canal: { [Op.in]: this.canalesPermitidos(canal) },
                    embedding: { [Op.ne]: null },
                },
                [
                    'id_conocimiento',
                    'tipo',
                    'tema_principal',
                    'pregunta_frecuente',
                    'respuesta_oficial',
                    'contenido',
                    'chunk_index',
                    'fuente_verificacion',
                    'nivel_prioridad',
                    'canal',
                    'id_documento',
                    'embedding',
                ]
            );

            const { canalCache, stats } = this._normalizarFilas(rows);
            this.knowledgeCacheByCanal.set(canal, canalCache);
            this.knowledgeCacheExpiry.set(canal, Date.now() + this.cacheExpiryMs);
            this._knowledgeCacheStats.set(canal, stats);
            this._podarFilasNormalizadas();

            if (stats.dimensionesMixtas) {
                console.warn(
                    `[RAG] Embeddings con dimensiones mezcladas en canal '${canal}': ` +
                    JSON.stringify(stats.dimensiones) + '. Regenera los embeddings con un único modelo.'
                );
            }
            if (stats.modelosMixtos) {
                console.warn(
                    `[RAG] Embeddings de modelos distintos en canal '${canal}': ` +
                    JSON.stringify(stats.modelos) + '. Regenera con el modelo actual: ' + this.getEmbeddingModel() + '.'
                );
            }

            return canalCache;
        } catch (error) {
            console.error('Error loading knowledge into cache:', error.message);
            return new Map();
        }
    }

    /**
     * Elimina del mapa compartido las filas que ya no están en ningún cache de
     * canal (filas borradas, bloqueadas o con embedding regenerado). Sin esta
     * poda el mapa crecería indefinidamente en procesos de larga vida.
     */
    _podarFilasNormalizadas() {
        if (this._normalizedRows.size === 0) return;
        const vigentes = new Set();
        for (const cache of this.knowledgeCacheByCanal.values()) {
            for (const id of cache.keys()) vigentes.add(id);
        }
        for (const id of this._normalizedRows.keys()) {
            if (!vigentes.has(id)) this._normalizedRows.delete(id);
        }
    }

    invalidateCache() {
        this.cache.clear();
        this.knowledgeCacheByCanal.clear();
        this.knowledgeCacheExpiry.clear();
        this._knowledgeCacheStats.clear();
        // Las filas normalizadas se comparten entre canales: si no se limpian,
        // una ingesta/bloqueo seguiría sirviendo vectores y contenido obsoletos.
        this._normalizedRows.clear();
        this.cacheVersion++;
    }

    getEmbeddingHealth() {
        const canales = {};
        for (const [canal, stats] of this._knowledgeCacheStats.entries()) {
            canales[canal] = stats;
        }
        const cacheConocimiento = {};
        for (const [canal, filas] of this.knowledgeCacheByCanal.entries()) {
            cacheConocimiento[canal] = {
                entradas: filas.size,
                expiraEnMs: Math.max(0, (this.knowledgeCacheExpiry.get(canal) || 0) - Date.now()),
            };
        }

        return {
            modelo: this.getEmbeddingModel(),
            umbralRecomendado: this.getUmbralRecomendado(),
            canales,
            cacheConocimiento,
            filasNormalizadasCompartidas: this._normalizedRows.size,
            cacheBusqueda: { entradas: this.cache.size, maximo: this.cacheMaxEntries, hits: this.cacheHits, misses: this.cacheMisses },
        };
    }

    _firmaEmbedding(unit) {
        if (!unit || unit.length === 0) return 'vacio';
        return `${unit.length}:${unit[0].toFixed(4)}:${unit[unit.length - 1].toFixed(4)}`;
    }

    _extraerTokensLexicos(query) {
        const texto = String(query || '');
        const tokens = new Set();
        const numeros = texto.match(/\b\d{2,}\b/g) || [];
        for (const n of numeros) tokens.add(n);
        const citas = texto.match(/"([^"]{3,})"/g) || [];
        for (const c of citas) tokens.add(c.replace(/"/g, '').toLowerCase());
        return tokens;
    }

    _coincideLexicamente(tokens, row) {
        if (!tokens || tokens.size === 0) return false;
        const contenido = String(
            `${row.tema_principal || ''} ${row.pregunta_frecuente || ''} ${row.respuesta_oficial || ''} ${row.contenido || ''}`
        )
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
        for (const token of tokens) {
            const t = String(token).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            if (t && contenido.includes(t)) return true;
        }
        return false;
    }

    async _leerPoliticaUmbral() {
        const cfg = await this.obtenerConfigRAG();
        const leerFloat = (valor) => {
            if (valor === undefined || valor === null || valor === '') return null;
            const n = parseFloat(valor);
            return Number.isNaN(n) ? null : n;
        };
        const booleano = (valor) => valor === true || valor === 'true' || valor === 1 || valor === '1';

        // `rag_umbral_alto` depende del modelo: el coseno de 3-small y ada-002 no
        // es comparable. Si no está configurado se usa el borde alto de la banda
        // del modelo actual, no un 0.75 global.
        return {
            umbralAlto: leerFloat(cfg.rag_umbral_alto) ?? this.getUmbralRecomendado().alto ?? DEFAULT_UMBRAL_ALTO,
            margenTop2: leerFloat(cfg.rag_margen_top2) ?? DEFAULT_MARGEN_TOP2,
            rescateLexical: booleano(cfg.rag_lexical_rescue_enabled),
            rescueFloor: leerFloat(cfg.rag_lexical_rescue_floor) ?? DEFAULT_RESCUE_FLOOR,
        };
    }

    /**
     * Recuperación con metadatos de confianza. Devuelve las filas aceptadas y
     * estadísticas para el monitor RAG (margen top1-top2, confianza, modelo y
     * dimensiones de los embeddings indexados).
     */
    async searchSimilarConDetalle(query, queryEmbedding, { limit = 3, threshold = null, canal = 'ambos', filtros = {} } = {}) {
        const base = {
            resultados: [],
            estadisticas: {
                umbral: threshold,
                similitudMaxima: 0,
                margenTop2: 0,
                confianza: 'baja',
                candidatosEvaluados: 0,
                aceptados: 0,
                canal,
                modeloEmbedding: this.getEmbeddingModel(),
                desdeCache: false,
                error: null,
            },
        };

        try {
            const umbralEstricto = await this.getRagUmbralEstricto();
            const umbralEfectivo = Math.max(threshold ?? umbralEstricto, umbralEstricto);
            const politica = await this._leerPoliticaUmbral();
            const queryUnit = vectorMath.toUnitVector(queryEmbedding);

            if (!queryUnit) {
                return {
                    ...base,
                    estadisticas: { ...base.estadisticas, umbral: umbralEfectivo, error: 'embedding_consulta_invalido' },
                };
            }

            const cacheKey = this.generateCacheKey('search', {
                query,
                limit,
                threshold: umbralEfectivo,
                canal,
                filtros,
                firma: this._firmaEmbedding(queryUnit),
                version: this.cacheVersion,
            });
            const cached = this.cache.get(cacheKey);
            if (cached && Date.now() < cached.expiry) {
                this.cacheHits++;
                return { ...cached.result, estadisticas: { ...cached.result.estadisticas, desdeCache: true } };
            }
            this.cacheMisses++;

            const knowledgeCache = await this.loadKnowledgeIntoCache(canal);
            const stats = this._knowledgeCacheStats.get(canal);
            const tokens = this._extraerTokensLexicos(query);

            // Bucle caliente: se puntúa con estructuras mínimas y se materializan
            // objetos completos solo para los aceptados. Evita copiar/sprear una
            // fila por cada entrada del cache en cada consulta (presión de GC
            // proporcional al tamaño de la base de conocimiento).
            const puntuados = [];
            for (const row of knowledgeCache.values()) {
                if (!this._filtrarFila(row, filtros)) continue;
                // Las filas cargadas por loadKnowledgeIntoCache ya están
                // normalizadas (_unit). Las caches inyectadas externamente
                // (tests/calibración) pueden traer vectores crudos: se
                // normalizan aquí para que el coseno sea correcto.
                const rowUnit = row._unit ? row.embedding : vectorMath.toUnitVector(row.embedding);
                if (!rowUnit) continue;
                const similarity = vectorMath.dotSimilarity(queryUnit, rowUnit);
                puntuados.push({
                    row,
                    rowUnit,
                    similarity,
                    // El chequeo léxico recorre y normaliza el texto de cada fila:
                    // solo se calcula cuando el rescate está habilitado.
                    coincidencia_lexica: politica.rescateLexical
                        ? this._coincideLexicamente(tokens, row)
                        : false,
                });
            }

            puntuados.sort((a, b) => b.similarity - a.similarity);

            const top1 = puntuados[0]?.similarity ?? 0;
            const top2 = puntuados[1]?.similarity ?? 0;
            const margenTop2 = top1 - top2;

            let aceptados = puntuados.filter((item) => item.similarity >= umbralEfectivo);

            if (politica.rescateLexical) {
                const yaAceptados = new Set(aceptados.map((r) => r.row.id_conocimiento));
                const rescatados = puntuados.filter((item) =>
                    !yaAceptados.has(item.row.id_conocimiento) &&
                    item.coincidencia_lexica &&
                    item.similarity >= politica.rescueFloor
                );
                if (rescatados.length > 0) {
                    aceptados = aceptados.concat(rescatados.map((r) => ({ ...r, rescate_lexical: true })));
                    aceptados.sort((a, b) => b.similarity - a.similarity);
                }
            }

            if (politica.margenTop2 > 0 && aceptados.length > 0) {
                const confianzaAlta = top1 >= politica.umbralAlto;
                if (!confianzaAlta && margenTop2 < politica.margenTop2) {
                    aceptados = [];
                }
            }

            let confianza = 'baja';
            if (top1 >= politica.umbralAlto) confianza = 'alta';
            else if (aceptados.length > 0 && margenTop2 >= politica.margenTop2) confianza = 'media';

            // Solo aquí se materializan las filas completas (top-k).
            const sliced = aceptados.slice(0, limit).map((item) => ({
                ...item.row,
                embedding: item.rowUnit,
                _unit: true,
                similarity: item.similarity,
                coincidencia_lexica: item.coincidencia_lexica,
                ...(item.rescate_lexical ? { rescate_lexical: true } : {}),
            }));
            const result = {
                resultados: sliced,
                estadisticas: {
                    umbral: umbralEfectivo,
                    umbralSolicitado: threshold,
                    umbralAlto: politica.umbralAlto,
                    margenTop2,
                    confianza,
                    similitudMaxima: top1,
                    similitudSegunda: top2,
                    candidatosEvaluados: puntuados.length,
                    aceptados: aceptados.length,
                    canal,
                    modeloEmbedding: this.getEmbeddingModel(),
                    dimensiones: stats ? stats.dimensiones : null,
                    dimensionesMixtas: stats ? stats.dimensionesMixtas : false,
                    desdeCache: false,
                    error: null,
                },
            };

            this._crearCacheBusqueda(cacheKey, result);
            return result;
        } catch (error) {
            console.error('Error in searchSimilar:', error.message);
            return { ...base, estadisticas: { ...base.estadisticas, error: error.message } };
        }
    }

    async searchSimilar(query, queryEmbedding, options = {}) {
        const detalle = await this.searchSimilarConDetalle(query, queryEmbedding, options);
        return detalle.resultados;
    }

    async searchSimilarKnowledge(query, { limit = 3, threshold = null, bloqueados = false, canal = 'ambos', queryEmbedding = null, filtros = {} } = {}) {
        const embedding = queryEmbedding || await this.generateEmbedding(query);
        const detalle = await this.searchSimilarConDetalle(query, embedding, { limit, threshold, canal, filtros });
        return detalle.resultados;
    }

    async searchSimilarByEmbeddings(queryEmbedding, rows, threshold = 0.7, limit = 3) {
        const queryUnit = vectorMath.toUnitVector(queryEmbedding);
        if (!queryUnit) return [];

        const results = (rows || []).map((row) => {
            // Las respuestas canónicas guardan el vector en `embedding_trigger`
            // y los protocolos en `embedding_keywords`. Leer solo `embedding`
            // hacía que el match semántico de canónicas nunca funcionara.
            const vectorCrudo = row.embedding !== undefined && row.embedding !== null
                ? row.embedding
                : (row.embedding_trigger !== undefined && row.embedding_trigger !== null
                    ? row.embedding_trigger
                    : row.embedding_keywords);
            const unit = vectorMath.toUnitVector(vectorCrudo);
            if (!unit) return null;
            return { ...row, similarity: vectorMath.dotSimilarity(queryUnit, unit) };
        }).filter(Boolean);

        return results
            .filter((item) => item.similarity >= threshold)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit);
    }

    async buildRAGContext(query, maxItems = 3, threshold = null, canal = 'ambos') {
        try {
            const detalle = await this.buildRAGContextDetalle(query, maxItems, threshold, canal);
            return detalle.context;
        } catch (error) {
            console.error('Error building RAG context:', error.message);
            return 'No se pudo acceder a la base de conocimientos en este momento.\n\n';
        }
    }

    async buildRAGContextDetalle(query, maxItems = 3, threshold = null, canal = 'ambos', opts = {}) {
        try {
            const umbralEstricto = await this.getRagUmbralEstricto();
            const umbralEfectivo = threshold !== null && threshold !== undefined
                ? Math.max(threshold, umbralEstricto)
                : umbralEstricto;

            const busqueda = await this.searchSimilarConDetalle(query, opts.queryEmbedding || await this.generateEmbedding(query), {
                limit: maxItems,
                threshold,
                canal,
                filtros: opts.filtros,
            });
            const relevant = busqueda.resultados;

            const detalle = {
                resultados: relevant.map((item) => ({
                    id_conocimiento: item.id_conocimiento,
                    id_documento: item.id_documento ?? null,
                    tipo: item.tipo,
                    tema_principal: item.tema_principal,
                    chunk_index: item.chunk_index,
                    similarity: item.similarity,
                    fuente_verificacion: item.fuente_verificacion,
                    coincidencia_lexica: !!item.coincidencia_lexica,
                    rescate_lexical: !!item.rescate_lexical,
                    contenido: (item.respuesta_oficial || item.contenido || '').substring(0, 300),
                })),
                similitudMaxima: busqueda.estadisticas.similitudMaxima,
                similitudSegunda: busqueda.estadisticas.similitudSegunda,
                margenTop2: busqueda.estadisticas.margenTop2,
                confianza: busqueda.estadisticas.confianza,
                umbral: umbralEfectivo,
                umbralAlto: busqueda.estadisticas.umbralAlto,
                nResultados: relevant.length,
                candidatosEvaluados: busqueda.estadisticas.candidatosEvaluados,
                contextoIncluido: relevant.length > 0,
                modeloEmbedding: busqueda.estadisticas.modeloEmbedding,
                dimensiones: busqueda.estadisticas.dimensiones,
            };

            if (relevant.length === 0) {
                detalle.context = '';
                return detalle;
            }

            let context = 'INFORMACIÓN RELEVANTE DE LA BASE DE CONOCIMIENTOS:\n\n';
            relevant.forEach((item, index) => {
                context += `${index + 1}. PREGUNTA: ${item.pregunta_frecuente || ''}\n`;
                context += `   RESPUESTA: ${item.respuesta_oficial || item.contenido || ''}\n`;
                context += `   TEMA: ${item.tema_principal || ''}\n`;
                context += `   FUENTE: ${item.fuente_verificacion || 'No especificada'}\n`;
                context += `   SIMILITUD: ${(item.similarity * 100).toFixed(1)}%\n\n`;
            });

            detalle.context = context;
            return detalle;
        } catch (error) {
            console.error('Error building RAG context detail:', error.message);
            return {
                context: 'No se pudo acceder a la base de conocimientos en este momento.\n\n',
                resultados: [],
                similitudMaxima: 0,
                similitudSegunda: 0,
                margenTop2: 0,
                confianza: 'baja',
                umbral: threshold,
                nResultados: 0,
                candidatosEvaluados: 0,
                contextoIncluido: false,
                error: error.message,
            };
        }
    }

    _fusionarChunksCortos(chunks, minChars = MIN_CHUNK_CHARS) {
        if (!chunks || chunks.length <= 1) return chunks || [];
        const fusionados = [];
        let pendiente = '';
        for (const chunk of chunks) {
            const actual = pendiente ? `${pendiente} ${chunk}` : chunk;
            if (actual.length < minChars) {
                pendiente = actual;
                continue;
            }
            fusionados.push(actual);
            pendiente = '';
        }
        if (pendiente) {
            if (fusionados.length > 0) {
                fusionados[fusionados.length - 1] = `${fusionados[fusionados.length - 1]} ${pendiente}`;
            } else {
                fusionados.push(pendiente);
            }
        }
        return fusionados;
    }

    async ingestDocumento(textoExtraido, titulo, idDocumento = null, canal = 'ambos', opciones = {}) {
        let chunkSize = 1000;
        let chunkOverlap = 200;
        const cfg = await this.obtenerConfigRAG();
        const limiteChunk = MAX_EMBEDDING_INPUT_CHARS - EMBEDDING_PREFIX_RESERVE;

        if (cfg.chunk_size !== undefined && cfg.chunk_size !== null) {
            const parsed = parseInt(cfg.chunk_size, 10);
            if (!isNaN(parsed) && parsed >= 100) chunkSize = Math.min(parsed, limiteChunk);
        }
        chunkSize = Math.min(Math.max(chunkSize, 100), limiteChunk);

        if (cfg.chunk_overlap !== undefined && cfg.chunk_overlap !== null) {
            const parsed = parseInt(cfg.chunk_overlap, 10);
            if (!isNaN(parsed) && parsed >= 0) chunkOverlap = parsed;
        }
        // Un solapamiento mayor a la mitad del chunk duplica el almacenamiento
        // sin mejorar el contexto recuperable.
        chunkOverlap = Math.max(0, Math.min(chunkOverlap, Math.floor(chunkSize / 2)));

        const fuente = String(textoExtraido || '');
        if (!fuente.trim()) {
            return { total: 0, inserted: 0, skipped: 0, chunkSize, chunkOverlap };
        }

        const chunksBrutos = this.crearChunks(fuente, chunkSize, chunkOverlap);
        let chunks = this._fusionarChunksCortos(chunksBrutos).filter((c) => c.trim().length >= MIN_CHUNK_CHARS);

        // Un documento corto (p. ej. una ficha de 30 caracteres) producía cero
        // chunks y se perdía en silencio. Si hay texto, se indexa igualmente:
        // mejor un chunk pequeño que ningún conocimiento recuperable.
        if (chunks.length === 0 && fuente.trim().length > 0) {
            chunks = [fuente.trim().substring(0, limiteChunk)];
        }

        const inserted = [];
        let skipped = 0;

        // Deduplicación exacta contra contenido ya indexado en el mismo canal.
        // Evita que subir dos veces el mismo PDF duplique el contexto y sesgue
        // el ranking hacia documentos repetidos.
        let existentes = new Set();
        if (opciones.dedupe !== false && chunks.length > 0) {
            // Postgres limita ~65535 parámetros por consulta: se consulta por
            // lotes para documentos grandes sin romper el ingest.
            const LOTE = 500;
            try {
                for (let i = 0; i < chunks.length; i += LOTE) {
                    const lote = chunks.slice(i, i + LOTE);
                    const filas = await models.ChatConocimiento.findAll({
                        where: {
                            estado_vigencia: true,
                            bloqueado: false,
                            contenido: { [Op.in]: lote },
                            canal: { [Op.in]: this.canalesPermitidos(canal) },
                        },
                        attributes: ['contenido'],
                        raw: true,
                    });
                    for (const fila of filas) existentes.add(fila.contenido);
                }
            } catch (error) {
                console.warn('No se pudo deduplicar el documento:', error.message);
            }
        }

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i].trim();
            if (!chunk || existentes.has(chunk)) {
                skipped++;
                continue;
            }

            const textoEmbedding = this.construirTextoEmbedding({
                tipo: 'segmento',
                tema_principal: titulo,
                contenido: chunk,
            });
            const embedding = await this.generateEmbedding(textoEmbedding);
            const data = {
                tipo: 'segmento',
                id_documento: idDocumento,
                tema_principal: titulo,
                contenido: chunk,
                chunk_index: i,
                embedding: JSON.stringify(embedding),
                fuente_verificacion: titulo,
                nivel_prioridad: 1,
                estado_vigencia: true,
                bloqueado: false,
                canal,
            };
            if (this._embeddingModelColumnAvailable !== false) {
                data.embedding_model = this.getEmbeddingModel();
            }

            let record;
            try {
                record = await models.ChatConocimiento.create(data);
                this._embeddingModelColumnAvailable = true;
            } catch (error) {
                if (data.embedding_model && /embedding_model/i.test(String(error.message))) {
                    this._embeddingModelColumnAvailable = false;
                    delete data.embedding_model;
                    record = await models.ChatConocimiento.create(data);
                } else {
                    throw error;
                }
            }
            inserted.push(record);
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        this.invalidateCache();
        return {
            total: chunks.length,
            inserted: inserted.length,
            skipped,
            chunkSize,
            chunkOverlap,
            modeloEmbedding: this.getEmbeddingModel(),
        };
    }

    crearChunks(text, size = 1000, overlap = 200) {
        const source = String(text || '');
        const chunks = [];
        if (!source) return chunks;

        const chunkSize = Math.max(100, Math.min(parseInt(size, 10) || 1000, MAX_EMBEDDING_INPUT_CHARS));
        const maxOverlap = Math.floor(chunkSize / 2);
        const chunkOverlap = Math.max(0, Math.min(parseInt(overlap, 10) || 0, maxOverlap));

        let start = 0;
        while (start < source.length) {
            let end = Math.min(start + chunkSize, source.length);
            if (end < source.length) {
                const minBreak = Math.floor(chunkSize * 0.5);
                const cortado = this.encontrarPuntoCorte(source.substring(start, end), minBreak);
                if (cortado > 0) end = start + cortado;
            }
            const chunk = source.substring(start, end).trim();
            if (chunk) chunks.push(chunk);
            const siguiente = end - chunkOverlap;
            start = siguiente > start ? siguiente : end;
        }
        return chunks;
    }

    _esAbreviatura(texto, indicePunto) {
        const prefijo = texto.substring(Math.max(0, indicePunto - 6), indicePunto + 1);
        const coincidencia = prefijo.match(/([A-Za-zÁÉÍÓÚÑáéíóúñ]+)\.$/);
        if (!coincidencia) return false;
        const palabra = coincidencia[1].toLowerCase();
        const abreviaturas = new Set([
            'art', 'dr', 'dra', 'sr', 'sra', 'srta', 'no', 'num', 'etc', 'pag', 'pág',
            'fig', 'inc', 'lit', 'cap', 'tel', 'av', 'calle', 'ej', 'aprox', 'máx', 'min',
        ]);
        return abreviaturas.has(palabra);
    }

    encontrarPuntoCorte(texto, minimo) {
        const patrones = [
            /\n\s*\n/g,
            /\n/g,
            /[.!?…](?=\s+[A-ZÁÉÍÓÚÑ¿¡"'(])/g,
            /\s/g,
        ];
        for (const patron of patrones) {
            let ultimo = -1;
            let match;
            patron.lastIndex = 0;
            while ((match = patron.exec(texto)) !== null) {
                const indice = match.index + match[0].length;
                if (indice < minimo) continue;
                if (patron === patrones[2] && this._esAbreviatura(texto, match.index)) continue;
                ultimo = indice;
            }
            if (ultimo > 0) return ultimo;
        }
        return -1;
    }
}

module.exports = RAGService;
