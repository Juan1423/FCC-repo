const DocumentoInteraccionService = require('../../services/comunidad.services/documento_interaccion.services');
const service = new DocumentoInteraccionService();

const getByInteraccion = async (req, res) => {
  try {
    const { interaccionId } = req.params;
    const docs = await service.findByInteraccion(interaccionId);
    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const create = async (req, res) => {
  try {
    const { interaccionId } = req.params;
    const file = req.file;
    const { descripcion } = req.body;

    if (!file) {
        return res.status(400).json({ message: 'No se ha subido ningún archivo' });
    }

    const data = {
      interaccion_id: interaccionId,
      nombre_original: file.originalname,
      ruta_archivo: file.filename, 
      tipo_mime: file.mimetype,
      tamanio_bytes: file.size,
      descripcion: descripcion || ''
    };

    const newDoc = await service.create(data);
    res.status(201).json(newDoc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteDoc = async (req, res) => {
    try {
        const { id } = req.params;
        await service.delete(id);
        res.json({ success: true, id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


const downloadFile = async (req, res) => {
    const { filename } = req.params;
    const path = require('path');
    const fs = require('fs');

    const baseDir = path.join(__dirname, '../../uploads/comunidad/documentos_interaccion');
    const resolvedBase = path.resolve(baseDir);
    const safeName = path.basename(String(filename || ''));
    const filePath = path.resolve(resolvedBase, safeName);

    if (!filePath.startsWith(resolvedBase + path.sep)) {
        return res.status(400).json({ message: 'Ruta de archivo no válida' });
    }

    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).json({ message: 'Archivo no encontrado en el servidor' });
    }
};

module.exports = { 
    getByInteraccion, 
    create, 
    deleteDoc,
    downloadFile
};