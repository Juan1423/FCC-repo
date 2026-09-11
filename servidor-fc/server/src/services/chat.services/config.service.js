'use strict';

const { models } = require('../../libs/sequelize');
const chatConfig = require('../../config/chatConfig');
const { FUNDACION_PERFIL_KEY, mergeFundacion } = require('../../utils/chat.fundacion.util');

const typeParsers = {
    string: (v) => v,
    number: (v) => parseInt(v, 10),
    float: (v) => parseFloat(v),
    boolean: (v) => v === 'true',
};

const CONFIG_CONSTRAINTS = {
    feedback_threshold: { min: 1, max: 5, integer: true },
    rate_limit_visitante_diario: { min: 1, integer: true },
    rate_limit_autenticado_diario: { min: 1, integer: true },
    max_respuesta_length: { min: 1, integer: true },
};

function validationError(message) {
    const error = new Error(message);
    error.code = 'CONFIG_VALIDATION';
    return error;
}

function validateValue(clave, valor, tipo) {
    const constraints = CONFIG_CONSTRAINTS[clave];
    if (!constraints || (tipo !== 'number' && tipo !== 'float')) return;

    const num = Number(valor);
    if (valor === '' || Number.isNaN(num)) {
        throw validationError(`El valor de '${clave}' debe ser numérico`);
    }
    if (constraints.integer && !Number.isInteger(num)) {
        throw validationError(`El valor de '${clave}' debe ser un número entero`);
    }

    let within = true;
    if (constraints.min !== undefined && num < constraints.min) within = false;
    if (constraints.max !== undefined && num > constraints.max) within = false;

    if (!within) {
        const range = constraints.min !== undefined && constraints.max !== undefined
            ? `entre ${constraints.min} y ${constraints.max}`
            : constraints.min !== undefined
                ? `mayor o igual a ${constraints.min}`
                : `menor o igual a ${constraints.max}`;
        throw validationError(`El valor de '${clave}' debe ser ${range}`);
    }
}

class ConfigService {
    constructor() {
        this.cache = new Map();
        this.cacheExpiry = null;
        this.ttlMs = 60 * 1000;
    }

    async loadConfig() {
        try {
            if (this.cache.size > 0 && this.cacheExpiry && Date.now() < this.cacheExpiry) {
                return this.cache;
            }

            const rows = await models.ChatConfiguracion.findAll({ raw: true, order: [['clave', 'ASC']] });
            const config = new Map();
            for (const row of rows) {
                config.set(row.clave, {
                    valor: row.valor,
                    tipo: row.tipo,
                    raw: row,
                });
            }
            this.cache = config;
            this.cacheExpiry = Date.now() + this.ttlMs;
            return this.cache;
        } catch (error) {
            console.error('Error loading chat config:', error);
            this.cache.clear();
            return this.cache;
        }
    }

    async getConfig() {
        await this.loadConfig();
        const result = {};
        for (const [clave, entry] of this.cache.entries()) {
            result[clave] = typeParsers[entry.tipo]
                ? typeParsers[entry.tipo](entry.valor)
                : entry.valor;
        }
        return result;
    }

    async get(clave) {
        await this.loadConfig();
        const entry = this.cache.get(clave);
        if (!entry) return null;
        return typeParsers[entry.tipo] ? typeParsers[entry.tipo](entry.valor) : entry.valor;
    }

    async getAll() {
        return this.getConfig();
    }

    async update(clave, valor) {
        await this.loadConfig();
        const entry = this.cache.get(clave);
        if (!entry) {
            throw new Error(`Config key '${clave}' not found`);
        }
        validateValue(clave, valor, entry.tipo);
        await models.ChatConfiguracion.update(
            { valor },
            { where: { clave } }
        );
        this.cache.set(clave, { ...entry, valor });
        return { clave, valor };
    }

    invalidate() {
        this.cache.clear();
        this.cacheExpiry = null;
    }

    async getFundacion() {
        const config = await this.getConfig();
        let stored = null;
        if (config[FUNDACION_PERFIL_KEY]) {
            try {
                stored = JSON.parse(config[FUNDACION_PERFIL_KEY]);
            } catch (error) {
                console.warn('Error parseando fundacion_perfil:', error.message);
            }
        }
        return mergeFundacion(stored);
    }

    async updateFundacion(perfil) {
        if (!perfil || typeof perfil !== 'object') {
            throw new Error('Perfil de fundación inválido');
        }
        const valor = JSON.stringify(perfil);
        await models.ChatConfiguracion.upsert({
            clave: FUNDACION_PERFIL_KEY,
            valor,
            tipo: 'string',
            descripcion: 'Perfil completo de la fundación (JSON) usado por el chatbot',
        });
        this.cache.set(FUNDACION_PERFIL_KEY, { valor, tipo: 'string', raw: {} });
        return mergeFundacion(perfil);
    }

    getClientConfig() {
        return chatConfig;
    }
}

module.exports = ConfigService;
