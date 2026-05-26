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

const uploadIndicador = multer({ storage: createStorage('indicadores'), fileFilter: (req, file, cb) => cb(null, true) });
const uploadInstitucion = multer({ storage: createStorage('instituciones'), fileFilter: (req, file, cb) => cb(null, true) });
const uploadNormativa = multer({ storage: createStorage('normativas'), fileFilter: (req, file, cb) => cb(null, true) });
const uploadProceso = multer({ storage: createStorage('procesos'), fileFilter: (req, file, cb) => cb(null, true) });
const uploadDocumento = multer({ storage: createStorage('documentos'), fileFilter: (req, file, cb) => cb(null, true) });

ensureDirExists(path.join(basePath, 'indicadores'));
ensureDirExists(path.join(basePath, 'instituciones'));
ensureDirExists(path.join(basePath, 'normativas'));
ensureDirExists(path.join(basePath, 'procesos'));
ensureDirExists(path.join(basePath, 'documentos'));

module.exports = { uploadIndicador, uploadInstitucion, uploadNormativa, uploadProceso, uploadDocumento };
