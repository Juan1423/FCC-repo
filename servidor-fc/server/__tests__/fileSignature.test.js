'use strict';

const {
    detectMime,
    isDeclaredTypeCompatible,
    validateUploadedFileSignatures,
} = require('../src/utils/fileSignature');

describe('fileSignature — detección de contenido (C-06)', () => {
    const head = (bytes) => Buffer.from(bytes);

    test('detecta los formatos permitidos', () => {
        expect(detectMime(head([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31]))).toBe('application/pdf');
        expect(detectMime(head([0xff, 0xd8, 0xff, 0xe0]))).toBe('image/jpeg');
        expect(detectMime(head([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe('image/png');
        expect(detectMime(Buffer.from('GIF89a....', 'ascii'))).toBe('image/gif');
        expect(detectMime(Buffer.from('RIFF0000WEBPVP8 ', 'ascii'))).toBe('image/webp');
        expect(detectMime(head([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]))).toBe('application/zip');
        expect(detectMime(head([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]))).toBe('application/x-ole-storage');
    });

    test('devuelve null para contenido no reconocido o demasiado corto', () => {
        expect(detectMime(Buffer.from('<?php echo 1; ?>', 'ascii'))).toBeNull();
        expect(detectMime(Buffer.from([0x25, 0x50]))).toBeNull();
        expect(detectMime('no es un buffer')).toBeNull();
    });

    test('acepta OOXML/OLE cuando el MIME declarado corresponde', () => {
        expect(isDeclaredTypeCompatible(
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/zip'
        )).toBe(true);
        expect(isDeclaredTypeCompatible('application/msword', 'application/x-ole-storage')).toBe(true);
    });

    test('rechaza discrepancias y polyglots', () => {
        expect(isDeclaredTypeCompatible('image/png', 'image/jpeg')).toBe(false);
        expect(isDeclaredTypeCompatible('application/pdf', 'application/zip')).toBe(false);
        expect(isDeclaredTypeCompatible('image/png', 'application/x-ole-storage')).toBe(false);
        expect(isDeclaredTypeCompatible('text/plain', 'application/pdf')).toBe(false);
    });

    test('text/plain sin firma se acepta; binario desconocido se rechaza', () => {
        expect(isDeclaredTypeCompatible('text/plain', null)).toBe(true);
        expect(isDeclaredTypeCompatible('application/pdf', null)).toBe(false);
    });
});

describe('fileSignature — middleware', () => {
    const createRes = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };

    test('permite archivos coherentes en memoria', async () => {
        const req = {
            file: {
                mimetype: 'application/pdf',
                buffer: Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31]),
            },
        };
        const res = createRes();
        const next = jest.fn();

        await validateUploadedFileSignatures(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    test('responde 400 con archivos incoherentes en memoria', async () => {
        const req = {
            file: {
                mimetype: 'image/png',
                buffer: Buffer.from('<?php system($_GET[cmd]); ?>', 'ascii'),
            },
        };
        const res = createRes();
        const next = jest.fn();

        await validateUploadedFileSignatures(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: false })
        );
    });

    test('sin archivos continúa la cadena', async () => {
        const req = {};
        const res = createRes();
        const next = jest.fn();

        await validateUploadedFileSignatures(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
    });
});
