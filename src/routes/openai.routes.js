const express = require('express');
const { enviarPreguntaOpenAI } = require('../services/openaiService');

module.exports = (router) => {
  router.post('/chat', async (req, res) => {
    try {
      const { mensaje } = req.body;
      const respuesta = await enviarPreguntaOpenAI(mensaje);
      res.json({ respuesta });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
