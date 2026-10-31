const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Directorio donde se guardarán los archivos
const uploadDir = path.join(__dirname, '../uploads/historia');

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

// Asegurarse de que el directorio exista al inicio
ensureDirExists(uploadDir);

const multerConfig = {
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // Verificar y crear el directorio antes de guardar el archivo
      ensureDirExists(uploadDir);
      cb(null, uploadDir);
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
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
  fileFilter(req, file, cb) {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Formato de imagen inválido'));
    }
  },
}

module.exports = multerConfig;
