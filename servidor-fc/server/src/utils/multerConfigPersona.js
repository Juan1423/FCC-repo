const multer = require('multer');
const fs = require('fs');
const path = require('path');

const baseUploadDir = path.join(__dirname, '../uploads/comunidad/personas');

const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    console.log(`Directorio ${dir} no existe. Creando...`);
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Directorio ${dir} creado.`);
  }
};

ensureDirExists(baseUploadDir);

const multerConfigPersona = {
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, baseUploadDir);
    },
    filename: (req, file, cb) => {
      const originalName = path.basename(String(file.originalname || ''));
      const extension = path.extname(originalName).slice(1);
      const stem = extension ? originalName.slice(0, originalName.length - extension.length - 1) : originalName;
      const safeStem = stem.slice(0, 29).replace(/[^A-Za-z0-9._-]/g, '_');
      const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const uniqueFilename = extension ? `${currentDate}-${safeStem}-${uniqueSuffix}.${extension}` : `${currentDate}-${safeStem}-${uniqueSuffix}`;
      cb(null, uniqueFilename);
    }
  }),
  fileFilter(req, file, cb) {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp') {
      cb(null, true);
    } else {
      cb(new Error('Formato de imagen inválido. Solo se permiten JPEG, PNG y WEBP.'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
};

module.exports = multerConfigPersona;