const express = require('express');

function createTestApp(routePrefix, router) {
  const app = express();
  app.use(express.json());
  app.use(routePrefix, router);
  return app;
}

module.exports = { createTestApp };
