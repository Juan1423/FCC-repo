'use strict';

const {
    ValidationError,
    pickFields,
    pickModelFields,
    sanitizeAuditDetail,
    escapeCsvCell,
    validatePayload,
} = require('../src/utils/security.utils');

describe('security.utils — mass assignment (M-07)', () => {
    test('pickFields conserva solo claves permitidas', () => {
        const result = pickFields(
            { nombre: 'Ana', rol_usuario: 'admin', id_usuario: 9, __proto__: { x: 1 } },
            ['nombre', 'rol_usuario']
        );
        expect(result).toEqual({ nombre: 'Ana', rol_usuario: 'admin' });
        expect(result.id_usuario).toBeUndefined();
    });

    test('pickModelFields excluye la PK y los campos vetados', () => {
        const model = {
            primaryKeyAttribute: 'id_persona',
            rawAttributes: {
                id_persona: {},
                nombre_persona: {},
                estado_persona: {},
            },
        };
        const result = pickModelFields(model, {
            id_persona: 5,
            nombre_persona: 'Ana',
            estado_persona: false,
            campo_inventado: 'x',
        }, { exclude: ['estado_persona'] });

        expect(result).toEqual({ nombre_persona: 'Ana' });
    });
});

describe('security.utils — validación de payload (M-10)', () => {
    const schema = {
        correo_usuario: { type: 'string', required: true, maxLength: 20 },
        rol_usuario: { type: 'string', enum: ['admin', 'doctor'] },
        id: { type: 'integer', min: 1 },
    };

    test('acepta y normaliza campos válidos, descartando desconocidos', () => {
        const result = validatePayload(
            { correo_usuario: '  a@b.co  ', rol_usuario: 'doctor', id: '7', extra: 'x' },
            schema
        );
        expect(result).toEqual({ correo_usuario: 'a@b.co', rol_usuario: 'doctor', id: 7 });
    });

    test('rechaza campos obligatorios ausentes', () => {
        expect(() => validatePayload({}, schema)).toThrow(ValidationError);
    });

    test('rechaza tipos y enums inválidos', () => {
        expect(() => validatePayload({ correo_usuario: 'a@b.co', id: 0 }, schema)).toThrow(ValidationError);
        expect(() => validatePayload({ correo_usuario: 'a@b.co', rol_usuario: 'root' }, schema)).toThrow(ValidationError);
    });
});

describe('security.utils — auditoría sin PII (M-03)', () => {
    test('redacta PII y secretos conservando la estructura', () => {
        const detail = sanitizeAuditDetail({
            endpoint: '/paciente/1',
            id: '1',
            query: { cedula: '0102030405', q: 'Ana', page: '2' },
            params: { nombre: 'Ana' },
            campos: ['nombre_paciente', 'password_usuario'],
            password: 'secreto',
        });
        const parsed = JSON.parse(detail);

        expect(parsed.endpoint).toBe('/paciente/1');
        expect(parsed.id).toBe('1');
        expect(parsed.query.cedula).toBe('[REDACTADO]');
        expect(parsed.query.q).toBe('[REDACTADO]');
        expect(parsed.query.page).toBe('2');
        expect(parsed.params.nombre).toBe('[REDACTADO]');
        expect(parsed.password).toBe('[REDACTADO]');
        // Los nombres de columnas (no valores) se conservan.
        expect(parsed.campos).toEqual(['nombre_paciente', 'password_usuario']);
    });
});

describe('security.utils — CSV seguro (M-04)', () => {
    test('escapa comillas y neutraliza fórmulas', () => {
        expect(escapeCsvCell('hola "mundo"')).toBe('"hola ""mundo"""');
        expect(escapeCsvCell('=SUM(A1:A2)')).toBe(`"'=SUM(A1:A2)"`);
        expect(escapeCsvCell('+1')).toBe(`"'+1"`);
        expect(escapeCsvCell('-1')).toBe(`"'-1"`);
        expect(escapeCsvCell('@cmd')).toBe(`"'@cmd"`);
        expect(escapeCsvCell('  =cmd')).toBe(`"'  =cmd"`);
        expect(escapeCsvCell('texto normal')).toBe('"texto normal"');
    });
});

describe('security.utils — validación extendida (M-10)', () => {
    const schema = {
        titulo: { type: 'string', required: true, maxLength: 10 },
        fecha_inicio: { type: 'date', required: true },
        fecha_fin: { type: 'date' },
        meta: { type: 'json' },
        costo: { type: 'number', min: 0 },
    };

    test('partial permite updates sin campos obligatorios', () => {
        const result = validatePayload({ titulo: 'Curso' }, schema, { partial: true });
        expect(result).toEqual({ titulo: 'Curso' });
    });

    test('partial sigue validando el formato de los campos presentes', () => {
        expect(() => validatePayload({ fecha_inicio: 'no-es-fecha' }, schema, { partial: true }))
            .toThrow(ValidationError);
    });

    test('acepta fechas y JSON válidos', () => {
        const result = validatePayload({
            titulo: 'Curso',
            fecha_inicio: '2026-01-15',
            meta: { cupos: 20 },
        }, schema);
        expect(result.fecha_inicio).toBe('2026-01-15');
        expect(result.meta).toEqual({ cupos: 20 });
    });

    test('rechaza fechas inválidas y JSON no serializable', () => {
        expect(() => validatePayload({ titulo: 'Curso', fecha_inicio: 'x' }, schema))
            .toThrow(ValidationError);
        expect(() => validatePayload({
            titulo: 'Curso',
            fecha_inicio: '2026-01-15',
            meta: () => {},
        }, schema)).toThrow(ValidationError);
    });
});
