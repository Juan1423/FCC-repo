'use strict';

/**
 * Utilidades de endurecimiento reutilizables por controladores, middleware y
 * servicios. Se mantienen sin dependencias externas para poder usarse también
 * en pruebas unitarias aisladas.
 */

const SENSITIVE_KEY_PATTERN = /(password|passwd|pass|token|authorization|auth|secret|api[-_]?key|jwt|cookie|session)/i;

// Claves cuyo VALOR puede contener PII. Se usa para la auditoría (M-03) y no
// para las respuestas: el nombre de la clave se conserva, el valor se redacta.
const PII_KEY_PATTERN = /(cedula|dni|documento|document|pasaporte|passport|identificacion|correo|email|e-mail|nombre|apellido|telefono|celular|movil|direccion|domicilio|nacimiento|tarjeta|cuenta|iban|ruc|buscar|search|filtro|q)$/i;

const MAX_AUDIT_STRING = 180;
const MAX_AUDIT_ITEMS = 20;
const MAX_AUDIT_DEPTH = 4;

class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
        this.status = 400;
    }
}

const isPlainObject = (value) =>
    value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date);

/**
 * Devuelve un objeto nuevo con SOLO las claves permitidas que existan en el
 * origen. Evita mass assignment (M-07).
 */
const pickFields = (source, allowedFields) => {
    if (!isPlainObject(source)) return {};
    const allowed = new Set(Array.isArray(allowedFields) ? allowedFields : []);
    const result = {};
    for (const key of Object.keys(source)) {
        if (allowed.has(key) && source[key] !== undefined) {
            result[key] = source[key];
        }
    }
    return result;
};

/**
 * Lista blanca derivada de las columnas reales de un modelo Sequelize.
 * Excluye la PK y cualquier campo indicado en `exclude`.
 */
const pickModelFields = (model, source, { exclude = [] } = {}) => {
    if (!model || !model.rawAttributes) return {};
    const primaryKey = model.primaryKeyAttribute;
    const excluded = new Set([primaryKey, ...exclude].filter(Boolean));
    const allowed = Object.keys(model.rawAttributes).filter((key) => !excluded.has(key));
    return pickFields(source, allowed);
};

const redactValue = (value, key, depth) => {
    if (SENSITIVE_KEY_PATTERN.test(key)) return '[REDACTADO]';
    if (PII_KEY_PATTERN.test(key)) return '[REDACTADO]';

    if (value === null || value === undefined) return value;
    if (depth >= MAX_AUDIT_DEPTH) return '[TRUNCADO]';

    if (Array.isArray(value)) {
        return value.slice(0, MAX_AUDIT_ITEMS).map((item) => redactValue(item, key, depth + 1));
    }

    if (isPlainObject(value)) {
        const result = {};
        const keys = Object.keys(value).slice(0, MAX_AUDIT_ITEMS);
        for (const childKey of keys) {
            result[childKey] = redactValue(value[childKey], childKey, depth + 1);
        }
        return result;
    }

    if (typeof value === 'string' && value.length > MAX_AUDIT_STRING) {
        return `${value.slice(0, MAX_AUDIT_STRING)}…`;
    }

    return value;
};

/**
 * Serializa el detalle de auditoría con PII y secretos redactados y con un
 * tamaño acotado. Pensado para persistirse en `auditoria.detalle` (M-03).
 */
const sanitizeAuditDetail = (detail) => JSON.stringify(redactValue(detail || {}, 'detalle', 0));

/**
 * Neutraliza inyección de fórmulas en CSV/Excel. Un valor que empieza por
 * =, +, -, @, tab o CR se prefija con apóstrofe y SIEMPRE se entrecomilla.
 * (M-04)
 */
const escapeCsvCell = (value) => {
    let text = value === null || value === undefined ? '' : String(value);
    // Un espacio o salto de línea inicial no evita que Excel evalúe la fórmula.
    if (/^[\s]*[=+\-@\t\r]/.test(text)) {
        text = `'${text}`;
    }
    return `"${text.replace(/"/g, '""')}"`;
};

const checkType = (field, value, rule) => {
    const type = rule.type || 'string';

    if (value === null) {
        if (rule.nullable) return null;
        throw new ValidationError(`El campo ${field} no puede ser nulo`);
    }

    if (type === 'string') {
        if (typeof value !== 'string') {
            throw new ValidationError(`El campo ${field} debe ser texto`);
        }
        const text = rule.trim === false ? value : value.trim();
        if (rule.minLength !== undefined && text.length < rule.minLength) {
            throw new ValidationError(`El campo ${field} es demasiado corto`);
        }
        if (rule.maxLength !== undefined && text.length > rule.maxLength) {
            throw new ValidationError(`El campo ${field} excede ${rule.maxLength} caracteres`);
        }
        if (rule.pattern && !rule.pattern.test(text)) {
            throw new ValidationError(`El formato del campo ${field} no es válido`);
        }
        if (rule.enum && !rule.enum.includes(text)) {
            throw new ValidationError(`El valor del campo ${field} no es válido`);
        }
        return text;
    }

    if (type === 'email') {
        if (typeof value !== 'string') {
            throw new ValidationError(`El campo ${field} debe ser un correo`);
        }
        const text = value.trim().toLowerCase();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(text) || text.length > (rule.maxLength || 250)) {
            throw new ValidationError(`El formato del campo ${field} no es válido`);
        }
        return text;
    }

    if (type === 'integer' || type === 'number') {
        const num = typeof value === 'number' ? value : Number(value);
        if (!Number.isFinite(num) || (type === 'integer' && !Number.isInteger(num))) {
            throw new ValidationError(`El campo ${field} debe ser numérico`);
        }
        if (rule.min !== undefined && num < rule.min) {
            throw new ValidationError(`El campo ${field} está fuera de rango`);
        }
        if (rule.max !== undefined && num > rule.max) {
            throw new ValidationError(`El campo ${field} está fuera de rango`);
        }
        return num;
    }

    if (type === 'boolean') {
        if (typeof value === 'boolean') return value;
        if (value === 'true' || value === '1' || value === 1) return true;
        if (value === 'false' || value === '0' || value === 0) return false;
        throw new ValidationError(`El campo ${field} debe ser booleano`);
    }

    throw new ValidationError(`Tipo de validación no soportado para ${field}`);
};

/**
 * Validación de payload sin dependencias (M-10). Devuelve SOLO los campos
 * declarados en el esquema (lista blanca) y lanza ValidationError (status 400)
 * ante datos inválidos.
 *
 * schema = {
 *   correo_usuario: { type: 'email', required: true },
 *   password_usuario: { type: 'string', required: true, minLength: 1, maxLength: 250 },
 *   estado_usuario: { type: 'boolean' },
 * }
 */
const validatePayload = (body, schema) => {
    if (!isPlainObject(body)) {
        throw new ValidationError('El cuerpo de la solicitud no es válido');
    }

    const result = {};
    for (const [field, rule] of Object.entries(schema)) {
        const value = body[field];
        if (value === undefined || value === '') {
            if (rule.required) {
                throw new ValidationError(`El campo ${field} es obligatorio`);
            }
            if (rule.default !== undefined) result[field] = rule.default;
            continue;
        }
        result[field] = checkType(field, value, rule);
    }
    return result;
};

module.exports = {
    ValidationError,
    isPlainObject,
    pickFields,
    pickModelFields,
    sanitizeAuditDetail,
    escapeCsvCell,
    validatePayload,
};
