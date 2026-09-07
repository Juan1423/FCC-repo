const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerDefinitions = require('./src/docs/swagger.definitions');


dotenv.config();
require('newrelic');
const { installConsoleShim } = require('./src/utils/logger');
installConsoleShim();
const app = express();

const routerApi = require('./src/routes/index.routes');

const port = process.env.PORT || 5000;
const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;

const swaggerOptions = {
    definition: swaggerDefinitions,
    apis: ['./src/routes/**/*.js'], // Rutas de tus archivos con anotaciones Swagger
  };

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Back-End system for Fundacion con Cristo');
});

routerApi(app);

app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
    console.error('Error no controlado:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
    console.log(`Documentación Swagger disponible en ${baseUrl}/api-docs`);
});