const multer = require('multer');
const path = require('path');
const fs = require('fs');

const basePath = path.join(__dirname, '../uploads/documentacion');

const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const createStorage = (subdir) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(basePath, subdir);
      ensureDirExists(uploadPath);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const ts = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const name = path.basename(file.originalname, ext).slice(0, 30);
      cb(null, `${date}-${name}-${ts}${ext}`);
    },
  });

const ALLOWED_DOC_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',
]);

const docFileFilter = (req, file, cb) => {
  if (ALLOWED_DOC_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no soportado. Solo PDF, Word, Excel, Imágenes y Texto.'), false);
  }
};

const DOC_LIMITS = { fileSize: 10 * 1024 * 1024, files: 1 };

const uploadIndicador = multer({ storage: createStorage('indicadores'), fileFilter: docFileFilter, limits: DOC_LIMITS });
const uploadInstitucion = multer({ storage: createStorage('instituciones'), fileFilter: docFileFilter, limits: DOC_LIMITS });
const uploadNormativa = multer({ storage: createStorage('normativas'), fileFilter: docFileFilter, limits: DOC_LIMITS });
const uploadProceso = multer({ storage: createStorage('procesos'), fileFilter: docFileFilter, limits: DOC_LIMITS });
const uploadDocumento = multer({ storage: createStorage('documentos'), fileFilter: docFileFilter, limits: DOC_LIMITS });

ensureDirExists(path.join(basePath, 'indicadores'));
ensureDirExists(path.join(basePath, 'instituciones'));
ensureDirExists(path.join(basePath, 'normativas'));
ensureDirExists(path.join(basePath, 'procesos'));
ensureDirExists(path.join(basePath, 'documentos'));

module.exports = { uploadIndicador, uploadInstitucion, uploadNormativa, uploadProceso, uploadDocumento };
