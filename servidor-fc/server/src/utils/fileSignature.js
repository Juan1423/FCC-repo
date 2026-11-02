'use strict';

/**
 * Validación de contenido real de archivos subidos (magic bytes).
 *
 * El `mimetype` que envía el cliente en multipart/form-data es controlable por
 * el atacante. Este módulo lee los primeros bytes ya persistidos por multer y
 * comprueba que el contenido coincida con el tipo declarado. Cierra el residual
 * C-06 de la auditoría (hoy solo se valida `mimetype`).
 */

const fsp = require('fs').promises;

const OOXML_TYPES = new Set([
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]);

const OLE_TYPES = new Set([
    'application/msword',
    'application/vnd.ms-excel',
    'application/vnd.ms-powerpoint',
]);

const UNVERIFIABLE_TYPES = new Set([
    'text/plain',
    'text/csv',
    'text/tab-separated-values',
    'application/csv',
]);

const MIME_ALIASES = {
    'image/jpg': 'image/jpeg',
    'image/pjpeg': 'image/jpeg',
    'application/x-pdf': 'application/pdf',
};

const normalizeMime = (mime) => {
    const base = String(mime || '').toLowerCase().split(';')[0].trim();
    return MIME_ALIASES[base] || base;
};

const startsWith = (buffer, bytes) =>
    buffer.length >= bytes.length && bytes.every((byte, index) => buffer[index] === byte);

const ascii = (buffer, offset, length) =>
    buffer.slice(offset, offset + length).toString('ascii');

/**
 * Detecta el tipo real a partir de los primeros bytes. Devuelve un MIME
 * canónico o null si no se reconoce.
 */
const detectMime = (buffer) => {
    if (!Buffer.isBuffer(buffer) || buffer.length < 4) return null;

    if (startsWith(buffer, [0x25, 0x50, 0x44, 0x46, 0x2d])) return 'application/pdf';
    if (startsWith(buffer, [0xff, 0xd8, 0xff])) return 'image/jpeg';
    if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png';
    if (ascii(buffer, 0, 6) === 'GIF87a' || ascii(buffer, 0, 6) === 'GIF89a') return 'image/gif';
    if (ascii(buffer, 0, 4) === 'RIFF' && ascii(buffer, 8, 4) === 'WEBP') return 'image/webp';
    if (startsWith(buffer, [0x42, 0x4d])) return 'image/bmp';
    if (startsWith(buffer, [0x49, 0x49, 0x2a, 0x00]) || startsWith(buffer, [0x4d, 0x4d, 0x00, 0x2a])) return 'image/tiff';

    // ZIP: base de OOXML (docx/xlsx/pptx)
    if (startsWith(buffer, [0x50, 0x4b, 0x03, 0x04]) ||
        startsWith(buffer, [0x50, 0x4b, 0x05, 0x06]) ||
        startsWith(buffer, [0x50, 0x4b, 0x07, 0x08])) {
        return 'application/zip';
    }

    // OLE2: formatos Office antiguos (.doc/.xls/.ppt)
    if (startsWith(buffer, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])) {
        return 'application/x-ole-storage';
    }

    return null;
};

/**
 * true si el contenido detectado es coherente con el MIME declarado.
 */
const isDeclaredTypeCompatible = (declaredMime, detectedMime) => {
    const declared = normalizeMime(declaredMime);
    const detected = normalizeMime(detectedMime);

    if (detected === declared) return true;
    if (detected === 'application/zip' && OOXML_TYPES.has(declared)) return true;
    if (detected === 'application/x-ole-storage' && OLE_TYPES.has(declared)) return true;

    // Tipos de texto no tienen firma binaria; se aceptan cuando el allowlist
    // (mimetype) ya los permitió. El resto de discrepancias se rechaza.
    if (!detected && UNVERIFIABLE_TYPES.has(declared)) return true;

    return false;
};

const readHead = async (filePath, bytes = 16) => {
    const handle = await fsp.open(filePath, 'r');
    try {
        const buffer = Buffer.alloc(bytes);
        const { bytesRead } = await handle.read(buffer, 0, bytes, 0);
        return buffer.slice(0, bytesRead);
    } finally {
        await handle.close();
    }
};

const collectFiles = (req) => {
    const files = [];
    if (req.file) files.push(req.file);
    if (req.files) {
        if (Array.isArray(req.files)) {
            files.push(...req.files);
        } else if (typeof req.files === 'object') {
            for (const value of Object.values(req.files)) {
                if (Array.isArray(value)) files.push(...value);
                else if (value) files.push(value);
            }
        }
    }
    return files.filter((file) => file && (file.path || Buffer.isBuffer(file.buffer)));
};

const removeFiles = (files) =>
    Promise.all(
        files.map((file) => {
            if (!file.path) return Promise.resolve();
            return fsp.unlink(file.path).catch((error) => {
                if (error.code !== 'ENOENT') {
                    console.error('No se pudo eliminar el archivo inválido:', error);
                }
            });
        })
    );

/**
 * Middleware para montar DESPUÉS de multer. Si un archivo no coincide con su
 * tipo declarado, borra TODOS los archivos de la petición y responde 400.
 */
const validateUploadedFileSignatures = async (req, res, next) => {
    const files = collectFiles(req);
    if (files.length === 0) return next();

    const invalid = [];
    for (const file of files) {
        try {
            const head = Buffer.isBuffer(file.buffer)
                ? file.buffer.slice(0, 16)
                : await readHead(file.path);
            const detected = detectMime(head);
            if (!isDeclaredTypeCompatible(file.mimetype, detected)) {
                invalid.push(file);
            }
        } catch (error) {
            console.error('Error validando la firma del archivo:', error);
            invalid.push(file);
        }
    }

    if (invalid.length > 0) {
        await removeFiles(files);
        return res.status(400).json({
            success: false,
            message: 'El contenido del archivo no coincide con su tipo declarado',
        });
    }

    return next();
};

module.exports = {
    detectMime,
    isDeclaredTypeCompatible,
    validateUploadedFileSignatures,
    readHead,
    collectFiles,
    removeFiles,
};
