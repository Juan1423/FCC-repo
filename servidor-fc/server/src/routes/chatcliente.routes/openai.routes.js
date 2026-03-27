const express = require('express');
const { enviarMensaje } = require('../controllers/chat.controller');
const { verifyToken } = require('../../middleware/verifyToken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const { models } = require('../../libs/sequelize');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const serverRoot = path.resolve(__dirname, '../../..');
    const uploadPath = path.join(serverRoot, 'uploads', 'pdfs');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

router.post('/chat', verifyToken, enviarMensaje);

router.post('/upload-pdf', verifyToken, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }

    const filePath = req.file.path;
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);

    // Guardar en tabla prompts
    const prompt = await models.Prompt.create({
      titulo: req.file.originalname,
      descripcion: data.text,
      instrucciones: data.text,
      tipo_prompt: 'instrucciones',
      archivo_pdf: req.file.filename,
      activo: true
    });

    // Actualizar instrucciones globales con el último PDF
    await models.Prompt.upsert({
      titulo: 'Instrucciones Globales - Último PDF',
      descripcion: data.text,
      instrucciones: data.text,
      tipo_prompt: 'global',
      activo: true
    }, {
      where: { tipo_prompt: 'global' }
    });

    res.json({ success: true, prompt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;