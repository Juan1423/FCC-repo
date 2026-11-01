'use strict';

const path = require('path');

let pdfjsLoaded = false;

async function getPdfjs() {
    if (!pdfjsLoaded) {
        const canvasModule = require('@napi-rs/canvas');
        if (!globalThis.DOMMatrix) globalThis.DOMMatrix = canvasModule.DOMMatrix;
        if (!globalThis.DOMPoint) globalThis.DOMPoint = canvasModule.DOMPoint;
        if (typeof globalThis.navigator === 'undefined') {
            globalThis.navigator = { userAgent: 'node' };
        }

        const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
        const { pathToFileURL } = require('node:url');
        const workerPath = path.join(
            path.dirname(require.resolve('pdfjs-dist/package.json')),
            'legacy', 'build', 'pdf.worker.mjs'
        );
        pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;
        pdfjsLoaded = true;
        return pdfjs;
    }
    return await import('pdfjs-dist/legacy/build/pdf.mjs');
}

async function getTesseract() {
    return require('tesseract.js');
}

function limpiarTexto(texto) {
    return String(texto || '')
        .replace(/\r\n?/g, '\n')
        .replace(/[ \t\f\v]+/g, ' ')
        .replace(/[ \t]*\n[ \t]*/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

/**
 * Reconstruye el texto de una página agrupando fragmentos por línea (eje Y de
 * pdfjs) y ordenándolos por X. Sin esto, `join(' ')` mezcla celdas de tablas y
 * columnas, y el chunk resultante pierde la estructura que da sentido al dato.
 */
function reconstruirTextoPorLineas(items, toleranciaY = 2.5) {
    const fragmentos = (items || [])
        .filter((item) => item && typeof item.str === 'string' && item.str.length > 0)
        .map((item) => {
            const transform = item.transform || [];
            return {
                texto: item.str,
                x: Number(transform[4]) || 0,
                y: Number(transform[5]) || 0,
            };
        });

    if (fragmentos.length === 0) return '';

    const lineas = [];
    for (const fragmento of fragmentos) {
        let linea = lineas.find((l) => Math.abs(l.y - fragmento.y) <= toleranciaY);
        if (!linea) {
            linea = { y: fragmento.y, fragmentos: [] };
            lineas.push(linea);
        }
        linea.fragmentos.push(fragmento);
    }

    lineas.sort((a, b) => b.y - a.y);
    return lineas
        .map((linea) => linea.fragmentos
            .sort((a, b) => a.x - b.x)
            .map((f) => f.texto)
            .join(' ')
            .replace(/[ \t]+/g, ' ')
            .trim())
        .filter(Boolean)
        .join('\n');
}

async function ocrPage(pdfjs, page, scale = 2) {
    const canvasModule = require('@napi-rs/canvas');
    const viewport = page.getViewport({ scale });
    const canvas = canvasModule.createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext('2d');
    await page.render({ canvasContext: context, viewport }).promise;
    return canvas.toBuffer('image/png');
}

async function extraerTextoConOCR(bufferPdf, { scale = 2 } = {}) {
    const pdfjs = await getPdfjs();
    const tesseract = await getTesseract();

    let textoTotal = [];
    let worker = null;
    let pdfDoc = null;
    try {
        pdfDoc = await pdfjs.getDocument({ data: new Uint8Array(bufferPdf), useSystemFonts: true }).promise;
        worker = await tesseract.createWorker(['spa', 'eng'], 1, { logger: () => {} });

        const total = pdfDoc.numPages;
        for (let p = 1; p <= total; p++) {
            const page = await pdfDoc.getPage(p);
            try {
                const imageBuffer = await ocrPage(pdfjs, page, scale);
                const result = await worker.recognize(imageBuffer);
                const pageText = limpiarTexto(result.data.text || '');
                if (pageText) textoTotal.push(`[Página ${p}] ${pageText}`);
            } catch (pageError) {
                console.warn(`OCR error en página ${p}:`, pageError.message);
            } finally {
                page.cleanup();
            }
        }
    } finally {
        if (worker) await worker.terminate();
        if (pdfDoc) {
            try { await pdfDoc.destroy(); } catch (e) { /* ignore */ }
        }
    }

    return { texto: textoTotal.join('\n\n'), paginasOCR: textoTotal.length };
}

async function extraerTextoCompletoConOCR(bufferPdf, { ocrHabilitado = false, ocrForzado = false, minTextoPagina = 5, scale = 2 } = {}) {
    const pdfjs = await getPdfjs();
    let worker = null;
    let pdfDoc = null;
    let totalPaginas = 0;
    const paginasConOCR = [];
    const partes = [];

    const ensureWorker = async () => {
        if (!worker) {
            const tesseract = await getTesseract();
            worker = await tesseract.createWorker(['spa', 'eng'], 1, { logger: () => {} });
        }
        return worker;
    };

    try {
        pdfDoc = await pdfjs.getDocument({ data: new Uint8Array(bufferPdf), useSystemFonts: true }).promise;
        totalPaginas = pdfDoc.numPages;

        for (let p = 1; p <= totalPaginas; p++) {
            const page = await pdfDoc.getPage(p);
            let pageText = '';
            try {
                const tc = await page.getTextContent();
                pageText = limpiarTexto(reconstruirTextoPorLineas(tc.items));
            } catch (te) {
                console.warn(`Error extrayendo texto nativo de la página ${p}:`, te.message);
            }

            const sinTexto = pageText.length < minTextoPagina;
            const necesitaOCR = ocrForzado || (sinTexto && ocrHabilitado);
            if (necesitaOCR) {
                try {
                    const w = await ensureWorker();
                    const imageBuffer = await ocrPage(pdfjs, page, scale);
                    const result = await w.recognize(imageBuffer);
                    const ocrText = limpiarTexto(result.data.text || '');
                    if (ocrText) {
                        paginasConOCR.push(p);
                        if (ocrForzado) {
                            pageText = ocrText;
                        } else {
                            pageText = pageText ? `${pageText} ${ocrText}` : ocrText;
                        }
                    }
                } catch (pe) {
                    console.warn(`OCR error en página ${p}:`, pe.message);
                }
            }

            // El marcador de página sobrevive al chunking: permite citar de qué
            // página salió cada fragmento y detectar pérdida de contenido.
            if (pageText.trim()) partes.push(`[Página ${p}] ${pageText.trim()}`);
            try { page.cleanup(); } catch (e) { /* ignore */ }
        }
    } finally {
        if (worker) await worker.terminate();
        if (pdfDoc) {
            try { await pdfDoc.destroy(); } catch (e) { /* ignore */ }
        }
    }

    return {
        texto: partes.join('\n\n'),
        totalPaginas,
        paginasOCR: paginasConOCR.length,
        paginasConOCR,
    };
}

module.exports = {
    extraerTextoConOCR,
    extraerTextoCompletoConOCR,
    limpiarTexto,
    reconstruirTextoPorLineas,
};