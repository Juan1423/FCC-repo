const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Directorio base para los archivos de exámenes
const baseUploadDir = path.join(__dirname, '../uploads/examenes');

// Función para verificar y crear el directorio si no existe
const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    console.log(`Directorio ${dir} no existe. Creando...`);
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Directorio ${dir} creado.`);
  } else {
    console.log(`Directorio ${dir} ya existe.`);
  }
};

const multerConfigExamen = {
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const raw = req.body && req.body.id_historia;
      const idHistoria = Number.parseInt(raw, 10);
      if (!Number.isInteger(idHistoria) || idHistoria <= 0) {
        return cb(new Error('id_historia inválido'));
      }
      const uploadPath = path.join(baseUploadDir, String(idHistoria));
      if (!uploadPath.startsWith(baseUploadDir + path.sep)) {
        return cb(new Error('Ruta no permitida'));
      }
      ensureDirExists(uploadPath);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const originalName = path.basename(String(file.originalname || ''));
      const extension = path.extname(originalName).slice(1);
      const stem = extension ? originalName.slice(0, originalName.length - extension.length - 1) : originalName;
      const safeStem = stem.slice(0, 29).replace(/[^A-Za-z0-9._-]/g, '_');
      const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const uniqueFilename = extension ? `${currentDate}-${safeStem}.${extension}` : `${currentDate}-${safeStem}`;
      cb(null, uniqueFilename);
    }
  }),
  fileFilter(req, file, cb) {
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Formato de archivo inválido. Solo se permiten PDF e imágenes.'));
    }
  },
};

module.exports = multerConfigExamen;