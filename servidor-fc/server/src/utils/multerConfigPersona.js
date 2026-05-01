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
      const extension = file.originalname.split('.').pop();
      const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const baseName = file.originalname.substring(0, file.originalname.lastIndexOf('.'));
      const shortName = baseName.slice(0, 30);
      const uniqueFilename = `${currentDate}-${shortName}-${uniqueSuffix}.${extension}`;
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
};

module.exports = multerConfigPersona;