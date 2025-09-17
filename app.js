const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerDefinitions = require('./src/docs/swagger.definitions');


dotenv.config();
require('newrelic');
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

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
  console.log(`Documentación Swagger disponible en ${baseUrl}/api-docs`);
});