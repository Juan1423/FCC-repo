'use strict';

const fs = require('fs');
const path = require('path');

let newrelic = null;
try {
    newrelic = require('newrelic');
} catch (error) {
    // NewRelic es opcional; si no está configurado el logger sigue funcionando.
}

const LOGS_DIR = path.join(__dirname, '..', '..', 'logs');
const LOG_FILE = path.join(LOGS_DIR, 'app.log');
const MAX_BYTES = (parseInt(process.env.LOGGING_MAX_MB, 10) || 5) * 1024 * 1024;

const SENSITIVE_FIELDS = ['token', 'password', 'newPassword', 'confirmPassword', 'oldPassword', 'authorization', 'jwt'];

const LEVELS = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
};

let logsDirReady = false;

const realConsole = {
    log: console.log.bind(console),
    info: console.info.bind(console),
    debug: console.debug.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
};

function ensureLogsDir() {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
}

function rotateIfNeeded() {
    try {
        const stat = fs.statSync(LOG_FILE);
        if (stat.size > MAX_BYTES) {
            const backup = `${LOG_FILE}.1`;
            if (fs.existsSync(backup)) fs.unlinkSync(backup);
            fs.renameSync(LOG_FILE, backup);
        }
    } catch (err) {
        if (err.code !== 'ENOENT') {
            realConsole.error('Error al rotar el archivo de log:', err);
        }
    }
}

function redactValue(value, seen) {
    if (value === null || value === undefined) return value;
    if (typeof value === 'object') {
        if (seen.has(value)) return '[Circular]';
        seen.add(value);
        if (value instanceof Error) return value;
        if (Array.isArray(value)) {
            return value.map(item => redactValue(item, seen));
        }
        const result = {};
        for (const key of Object.keys(value)) {
            if (SENSITIVE_FIELDS.some(f => key.toLowerCase() === f.toLowerCase())) {
                result[key] = '[REDACTADO]';
            } else {
                result[key] = redactValue(value[key], seen);
            }
        }
        return result;
    }
    return value;
}

function redact(value) {
    return redactValue(value, new Set());
}

function serializeForFile(args) {
    return args.map(arg => {
        if (arg instanceof Error) {
            const detail = arg.stack || arg.message;
            return `[${arg.name}] ${detail}`;
        }
        if (typeof arg === 'object' && arg !== null) {
            try {
                return JSON.stringify(redact(arg), null, 2);
            } catch (err2) {
                return String(arg);
            }
        }
        return String(arg);
    }).join(' ');
}

function getCaller() {
    const err = new Error();
    const stackLines = ((err && err.stack) || '').split('\n').slice(1);
    for (const line of stackLines) {
        const match = line.match(/\((.*):(\d+):\d+\)$/);
        const file = match ? match[1] : null;
        if (file) {
            const normalized = file.replace(/\\/g, '/');
            if (normalized.includes('/utils/logger.js')) continue;
            const fileName = normalized.split('/').pop();
            const lineNumber = match[2];
            return `${fileName}:${lineNumber}`;
        }
    }
    return '';
}

function writeToFile(level, caller, message) {
    const line = `[${new Date().toISOString()}] [${level}] [${caller}] ${message}`;
    try {
        if (!logsDirReady) {
            ensureLogsDir();
            logsDirReady = true;
        }
        rotateIfNeeded();
        fs.appendFileSync(LOG_FILE, `${line}\n`);
    } catch (err) {
        realConsole.error('Error al escribir el archivo de log:', err.message);
    }
}

function notifyNewRelic(level, args) {
    if (!newrelic || !newrelic.noticeError) return;
    const error = args.find(a => a instanceof Error);
    if (error) {
        newrelic.noticeError(error);
    } else if (level === 'error') {
        newrelic.noticeError(new Error(serializeForFile(args)));
    }
}

function loggerWrite(level, args) {
    const caller = getCaller();
    const stamp = new Date().toISOString();
    const message = serializeForFile(args);

    writeToFile(level, caller, message);
    notifyNewRelic(level, args);

    const redactedArgs = args.map(arg => redact(arg));
    realConsole[level === 'warn' ? 'warn' : level](`[${stamp}] [${level}] [${caller}]`, ...redactedArgs);
}

const logger = {
    debug: (...args) => loggerWrite('debug', args),
    info: (...args) => loggerWrite('info', args),
    warn: (...args) => loggerWrite('warn', args),
    error: (...args) => loggerWrite('error', args),
};

function installConsoleShim() {
    if (global.__fccLoggerInstalled) return;
    global.__fccLoggerInstalled = true;

    console.debug = (...args) => loggerWrite('debug', args);
    console.log = (...args) => loggerWrite('info', args);
    console.info = (...args) => loggerWrite('info', args);
    console.warn = (...args) => loggerWrite('warn', args);
    console.error = (...args) => loggerWrite('error', args);
}

module.exports = {
    logger,
    installConsoleShim,
    redact,
    getCaller,
    LEVELS,
};