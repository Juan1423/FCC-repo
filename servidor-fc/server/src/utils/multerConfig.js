const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Directorio base para todos los archivos de pacientes
const basePath = path.join(__dirname, '../uploads/pacientes');

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

const multerConfig = {
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      let uploadPath = path.join(basePath, 'perfil');
      if (file.fieldname === 'archivo_documentos_cedulas') {
        uploadPath = path.join(basePath, 'cedulas');
      } else if (file.fieldname === 'archivo_certificado_medico') {
        uploadPath = path.join(basePath, 'certificados');
      }
      
      // Verificar y crear el directorio antes de guardar el archivo
      ensureDirExists(uploadPath);
      
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const extension = path.extname(file.originalname);
      const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const shortName = path.basename(file.originalname, extension).slice(0, 30 - extension.length);
      const uniqueFilename = `${currentDate}-${shortName}${extension}`;
      cb(null, uniqueFilename);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024,
    // El formulario de paciente puede enviar hasta 3 archivos:
    // imagen de perfil, documentos de cédula y certificado médico.
    files: 3,
  },
  fileFilter(req, file, cb) {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Formato de archivo inválido'))
    }
  },
};

// Asegurarse de que los directorios existan al inicio
ensureDirExists(path.join(basePath, 'perfil'));
ensureDirExists(path.join(basePath, 'cedulas'));
ensureDirExists(path.join(basePath, 'certificados'));

module.exports = multerConfig;