const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. Definir dónde se guardarán los archivos
// Se creará una carpeta 'uploads/ia_conocimiento' automáticamente
const uploadDir = path.join(__dirname, '../uploads/conocimiento');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Configurar el motor de almacenamiento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generamos un nombre único: fecha-nombreOriginal
        // Ej: 170568999-normativa_2025.pdf
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

// 3. Filtro de seguridad (Solo aceptar PDFs)
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true); // Aceptar archivo
    } else {
        cb(new Error('Formato no válido. Solo se permiten archivos PDF.'), false);
    }
};

// 4. Exportar la configuración
const uploadIA = multer({ 
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // Límite de 20
    fileFilter: fileFilter
});

module.exports = uploadIA;