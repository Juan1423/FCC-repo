'use strict';

const { models } = require('../../libs/sequelize');
const chatConfig = require('../../config/chatConfig');

const typeParsers = {
    string: (v) => v,
    number: (v) => parseInt(v, 10),
    float: (v) => parseFloat(v),
    boolean: (v) => v === 'true',
};

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

            const rows = await models.ChatConfiguracion.findAll({ raw: true });
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
            console.error('Error loading chat config:', error.message);
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
        const entry = this.cache.get(clave);
        if (!entry) {
            throw new Error(`Config key '${clave}' not found`);
        }
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

    getClientConfig() {
        return chatConfig;
    }
}

module.exports = ConfigService;
