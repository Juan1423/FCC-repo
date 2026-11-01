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

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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
        console.log(`Documentación Swagger disponible en ${baseUrl}/api-docs`);
    });
}

module.exports = app;
