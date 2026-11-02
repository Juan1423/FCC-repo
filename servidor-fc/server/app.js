const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerDefinitions = require('./src/docs/swagger.definitions');
const { apiLimiter, loginLimiter, chatPublicoLimiter } = require('./src/middleware/rateLimit');


dotenv.config();
require('newrelic');
const { installConsoleShim } = require('./src/utils/logger');
installConsoleShim();
const app = express();

const routerApi = require('./src/routes/index.routes');

const port = process.env.PORT || 5000;
const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;

const ALLOWED_ORIGINS = (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const swaggerOptions = {
    definition: swaggerDefinitions,
    apis: ['./src/routes/**/*.js'], // Rutas de tus archivos con anotaciones Swagger
  };

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// M-01: la documentación interactiva solo se publica en desarrollo. En
// producción exige habilitarla explícitamente con ENABLE_API_DOCS=true.
const apiDocsEnabled = process.env.ENABLE_API_DOCS === 'true' ||
  (process.env.NODE_ENV !== 'production' && process.env.ENABLE_API_DOCS !== 'false');

app.disable('x-powered-by');

const trustProxy = process.env.TRUST_PROXY_HOPS;
if (trustProxy) {
  app.set('trust proxy', /^\d+$/.test(trustProxy) ? Number(trustProxy) : trustProxy);
}

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
}));

app.use(cookieParser());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error('Origen no permitido por CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'token', 'visitor-id', 'Authorization'],
  maxAge: 600,
}));

app.use(express.json({ limit: '1mb' }));

// M-09: ninguna respuesta 5xx debe filtrar mensajes internos (SQL, rutas,
// stack, detalles de servicios). Se normaliza antes de enviar. Los 4xx
// conservan sus mensajes de validación para el cliente.
app.use((req, res, next) => {
  const GENERIC_ERROR = { success: false, message: 'Error interno del servidor' };
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  res.json = function jsonSeguro(body) {
    if (this.statusCode >= 500) {
      return originalJson(GENERIC_ERROR);
    }
    return originalJson(body);
  };

  res.send = function sendSeguro(body) {
    if (this.statusCode >= 500) {
      return originalSend(GENERIC_ERROR);
    }
    return originalSend(body);
  };
  next();
});

if (apiDocsEnabled) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
}

app.get('/', (req, res) => {
  res.send('Back-End system for Fundacion con Cristo');
});

app.use('/api/fcc', apiLimiter);
app.use('/api/fcc/users/login', loginLimiter);
app.use('/api/fcc/chat/publico/mensaje', chatPublicoLimiter);

routerApi(app);

app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
    if (err && err.message === 'Origen no permitido por CORS') {
        return res.status(403).json({ success: false, message: 'Origen no permitido' });
    }
    if (err && (err.code === 'ENOENT' || err.status === 404)) {
        return res.status(404).json({ success: false, message: 'Archivo no encontrado' });
    }
    console.error('Error no controlado:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

// Solo se abre el puerto cuando se ejecuta como entrypoint (`node app.js`).
// Al requerirlo desde tests de integración se obtiene la app sin side effects
// de red, lo que permite usar supertest contra el mismo stack de middlewares.
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Servidor escuchando en el puerto ${port}`);
        if (apiDocsEnabled) {
            console.log(`Documentación Swagger disponible en ${baseUrl}/api-docs`);
        } else {
            console.log('Documentación Swagger deshabilitada (ENABLE_API_DOCS=false o producción)');
        }
    });
}

module.exports = app;
