require('dotenv').config();
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

// Almacenar IDs de archivos en OpenAI en memoria
global.uploadedPdfFileIds = global.uploadedPdfFileIds || {};

const uploadPdfToOpenAI = async (pdfBuffer, originalFilename) => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY no está configurada en .env');
  }

  try {
    const form = new FormData();
    form.append('file', pdfBuffer, originalFilename);
    form.append('purpose', 'assistants');

    console.log(`📤 Subiendo PDF a OpenAI: ${originalFilename}`);

    const response = await fetch('https://api.openai.com/v1/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: form
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error al subir PDF a OpenAI:', data);
      throw new Error(data.error?.message || `Error OpenAI: ${response.status}`);
    }

    console.log(`✓ PDF subido exitosamente. File ID: ${data.id}`);

    // Guardar el ID del archivo en memoria
    global.uploadedPdfFileIds[originalFilename] = data.id;

    return data;
  } catch (error) {
    console.error('Error en uploadPdfToOpenAI:', error);
    throw error;
  }
};

const savePdfToFileSystem = (pdfBuffer, originalFilename) => {
  try {
    // Usar ruta consistente: carpeta uploads/pdfs en la raíz del proyecto (servidor)
    const serverRoot = path.resolve(__dirname, '../');
    const uploadsDir = path.join(serverRoot, 'uploads', 'pdfs');
    
    console.log(`📁 Directorio base (serverRoot)=${serverRoot}`);
    console.log(`📁 Directorio PDFs=${uploadsDir}`);
    
    // Crear directorio si no existe
    if (!fs.existsSync(uploadsDir)) {
      console.log(`📂 Creando directorio: ${uploadsDir}`);
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log(`✓ Directorio creado exitosamente`);
    } else {
      console.log(`📂 Directorio ya existe`);
    }

    const filePath = path.join(uploadsDir, originalFilename);
    
    // Validar que no hay path traversal
    if (!filePath.startsWith(uploadsDir)) {
      throw new Error('Intento de acceso fuera del directorio permitido (path traversal)');
    }
    
    // Escribir archivo
    console.log(`✍️ Escribiendo archivo: ${filePath}`);
    fs.writeFileSync(filePath, pdfBuffer);
    
    // Validar que el archivo se escribió correctamente
    if (!fs.existsSync(filePath)) {
      throw new Error(`El archivo no se guardó correctamente en ${filePath}`);
    }
    
    const stats = fs.statSync(filePath);
    console.log(`✓ PDF guardado exitosamente: ${filePath} (${stats.size} bytes)`);
    
    return filePath;
  } catch (error) {
    console.error('❌ Error al guardar PDF en filesystem:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
};

const getPdfFileId = (originalFilename) => {
  return global.uploadedPdfFileIds[originalFilename] || null;
};

const getAllUploadedPdfFileIds = () => {
  return global.uploadedPdfFileIds;
};

const clearPdfMemory = () => {
  global.uploadedPdfFileIds = {};
  console.log('✓ Memoria de PDFs limpiada');
};

module.exports = {
  uploadPdfToOpenAI,
  savePdfToFileSystem,
  getPdfFileId,
  getAllUploadedPdfFileIds,
  clearPdfMemory
};
