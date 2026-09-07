'use strict';

const chatConfig = require('../config/chatConfig');

const FUNDACION_PERFIL_KEY = 'fundacion_perfil';

function deepMerge(base, override) {
    if (override === null || override === undefined) return base;
    if (Array.isArray(base) || Array.isArray(override)) return override;
    if (typeof base === 'object' && typeof override === 'object') {
        const result = { ...base };
        for (const key of Object.keys(override)) {
            result[key] = deepMerge(base[key], override[key]);
        }
        return result;
    }
    return override;
}

function defaultFundacion() {
    return JSON.parse(JSON.stringify(chatConfig.fundacion));
}

function mergeFundacion(dbJson) {
    const defaults = defaultFundacion();
    if (!dbJson || typeof dbJson !== 'object') {
        return defaults;
    }
    return deepMerge(defaults, dbJson);
}

module.exports = {
    FUNDACION_PERFIL_KEY,
    defaultFundacion,
    mergeFundacion,
    deepMerge,
};