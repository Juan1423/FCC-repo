const { models } = require('../../libs/sequelize');
const { uploadPdfToOpenAI, savePdfToFileSystem, clearPdfMemory } = require('../../services/pdfUploadService');
const path = require('path');
const fs = require('fs');

const create = async (req, res) => {
  try {
    const { tipo_prompt, titulo, descripcion, instrucciones } = req.body;
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📥 [PROMPT CREATE] Request recibido');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 req.body:', req.body);
    console.log('📎 req.file existe:', !!req.file);
    if (req.file) {
      console.log('📄 Archivo:', {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        encoding: req.file.encoding,
        mimetype: req.file.mimetype,
        size: req.file.size
      });
    }
    console.log('🔑 tipo_prompt valor:', tipo_prompt);
    console.log('🔑 tipo_prompt tipo:', typeof tipo_prompt);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Validar que tipo_prompt sea requerido y esté en los valores permitidos
    const tiposPermitidos = ['instrucciones', 'contexto_pdf', 'global', 'otro'];
    
    if (!tipo_prompt) {
      console.error('tipo_prompt is missing or empty:', tipo_prompt);
      return res.status(400).json({ error: 'El tipo de prompt es requerido (no recibido)' });
    }
    
    const tipoTrimmed = String(tipo_prompt).trim();
    
    if (!tipoTrimmed || tipoTrimmed === '') {
      return res.status(400).json({ error: 'El tipo de prompt es requerido (vacío)' });
    }
    
    if (!tiposPermitidos.includes(tipoTrimmed)) {
      return res.status(400).json({ 
        error: `Tipo de prompt inválido '${tipoTrimmed}'. Valores permitidos: ${tiposPermitidos.join(', ')}` 
      });
    }

    let archivo_pdf = null;
    
    // Si hay PDF, guardarlo en filesystem y en OpenAI
    if (req.file) {
      try {
        console.log(`📎 Procesando archivo: ${req.file.originalname} (${req.file.size} bytes)`);
        
        // Validar que el buffer tiene contenido
        if (!req.file.buffer || req.file.buffer.length === 0) {
          throw new Error('El archivo está vacío');
        }
        
        // Guardar en filesystem
        const filePath = savePdfToFileSystem(req.file.buffer, req.file.originalname);
        console.log(`✓ Archivo guardado en: ${filePath}`);
        
        // Verificar que el archivo de verdad se guardó
        const fs = require('fs');
        if (!fs.existsSync(filePath)) {
          throw new Error(`Guardado fallido: El archivo no existe después de crear ${filePath}`);
        }
        
        archivo_pdf = req.file.originalname;

        // Subir a OpenAI si es de tipo contexto_pdf
        if (tipoTrimmed === 'contexto_pdf') {
          console.log(`📤 Procesando PDF para OpenAI: ${req.file.originalname}`);
          const openaiResponse = await uploadPdfToOpenAI(req.file.buffer, req.file.originalname);
          console.log(`✓ PDF subido a OpenAI con ID: ${openaiResponse.id}`);
        }
      } catch (pdfError) {
        console.error('❌ Error al procesar PDF:', pdfError.message);
        return res.status(400).json({ 
          error: 'Error al procesar el PDF: ' + pdfError.message,
          details: pdfError.toString()
        });
      }
    }
    
    const prompt = await models.Prompt.create({ 
      tipo_prompt: tipoTrimmed, 
      titulo: titulo || descripcion || 'Sin título',
      descripcion: descripcion || '',
      instrucciones: instrucciones || descripcion || '',
      archivo_pdf 
    });
    
    // Si es de tipo instrucciones, actualizar global
    if (tipoTrimmed === 'instrucciones') {
      global.additionalInstructions = instrucciones || descripcion;
    }
    
    // Guardar acción en conversacion
    await models.Conversacion.create({
      id_usuario: req.user ? req.user.user : 1,
      mensaje_usuario: `Creó prompt: ${tipoTrimmed}${archivo_pdf ? ' con PDF: ' + archivo_pdf : ''}`,
      respuesta_bot: 'Prompt creado exitosamente.',
    });
    
    // Responder con el prompt directamente (no envuelto)
    res.json(prompt);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const getAll = async (req, res) => {
  try {
    const prompts = await models.Prompt.findAll();
    res.json(prompts);
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const prompt = await models.Prompt.findByPk(id);
    if (!prompt) {
      return res.status(404).json({ success: false, message: 'Prompt not found' });
    }
    res.json(prompt);
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo_prompt, titulo, descripcion, instrucciones } = req.body;
    
    // Validar que tipo_prompt sea requerido y esté en los valores permitidos
    const tiposPermitidos = ['instrucciones', 'contexto_pdf', 'global', 'otro'];
    if (!tipo_prompt || tipo_prompt.trim() === '') {
      return res.status(400).json({ error: 'El tipo de prompt es requerido' });
    }
    if (!tiposPermitidos.includes(tipo_prompt)) {
      return res.status(400).json({ 
        error: `Tipo de prompt inválido. Valores permitidos: ${tiposPermitidos.join(', ')}` 
      });
    }

    let archivo_pdf = undefined;
    
    // Si hay PDF nuevo, guardarlo en filesystem y en OpenAI
    if (req.file) {
      try {
        console.log(`📎 Procesando archivo: ${req.file.originalname} (${req.file.size} bytes)`);
        
        // Validar que el buffer tiene contenido
        if (!req.file.buffer || req.file.buffer.length === 0) {
          throw new Error('El archivo está vacío');
        }
        
        // Guardar en filesystem
        const filePath = savePdfToFileSystem(req.file.buffer, req.file.originalname);
        console.log(`✓ Archivo guardado en: ${filePath}`);
        
        // Verificar que el archivo de verdad se guardó
        const fs = require('fs');
        if (!fs.existsSync(filePath)) {
          throw new Error(`Guardado fallido: El archivo no existe después de crear ${filePath}`);
        }
        
        archivo_pdf = req.file.originalname;

        // Subir a OpenAI si es de tipo contexto_pdf
        if (tipo_prompt === 'contexto_pdf') {
          console.log(`📤 Procesando PDF para OpenAI: ${req.file.originalname}`);
          const openaiResponse = await uploadPdfToOpenAI(req.file.buffer, req.file.originalname);
          console.log(`✓ PDF subido a OpenAI con ID: ${openaiResponse.id}`);
        }
      } catch (pdfError) {
        console.error('❌ Error al procesar PDF:', pdfError.message);
        return res.status(400).json({ 
          error: 'Error al procesar el PDF: ' + pdfError.message,
          details: pdfError.toString()
        });
      }
    }
    
    const updateData = {
      tipo_prompt,
      titulo: titulo || descripcion || 'Sin título',
      descripcion: descripcion || '',
      instrucciones: instrucciones || descripcion || ''
    };
    
    if (archivo_pdf) {
      updateData.archivo_pdf = archivo_pdf;
    }
    
    const [updated] = await models.Prompt.update(updateData, { where: { id_prompt: id } });
    if (updated) {
      const updatedPrompt = await models.Prompt.findByPk(id);
      
      // Si es de tipo instrucciones, actualizar global
      if (tipo_prompt === 'instrucciones') {
        global.additionalInstructions = instrucciones || descripcion;
      }
      
      // Guardar acción
      await models.Conversacion.create({
        id_usuario: req.user ? req.user.user : 1,
        mensaje_usuario: `Actualizó prompt ID: ${id}${archivo_pdf ? ' con PDF: ' + archivo_pdf : ''}`,
        respuesta_bot: 'Prompt actualizado exitosamente.',
      });
      
      // Responder con el prompt actualizado directamente (no envuelto)
      res.json(updatedPrompt);
    } else {
      res.status(404).json({ error: 'Prompt not found' });
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await models.Prompt.destroy({ where: { id_prompt: id } });
    if (deleted) {
      
      // Guardar acción
      await models.Conversacion.create({
        id_usuario: req.user ? req.user.user : 1,
        mensaje_usuario: `Eliminó prompt ID: ${id}`,
        respuesta_bot: 'Prompt eliminado exitosamente.',
      });
      
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Prompt not found' });
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const activate = async (req, res) => {
  try {
    const { id } = req.params;
    const prompt = await models.Prompt.findByPk(id);
    if (!prompt) {
      return res.status(404).json({ success: false, message: 'Prompt not found' });
    }

    // Marcar como activo
    await models.Prompt.update({ activo: true }, { where: { id_prompt: id } });

    // Guardar acción
    await models.Conversacion.create({
      id_usuario: req.user ? req.user.user : 1,
      mensaje_usuario: `Activó prompt ID: ${id}`,
      respuesta_bot: 'Prompt activado exitosamente. El chatbot ahora usará este contenido.',
    });

    const activatedPrompt = await models.Prompt.findByPk(id);
    res.json({ success: true, prompt: activatedPrompt });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// exported at end including clearMemory
// Endpoint para limpiar la memoria en servidor (solo memoria, no BD)
const clearMemory = async (req, res) => {
  try {
    // Limpiar variables globales en memoria relacionadas al chatbot
    if (global.additionalInstructions !== undefined) global.additionalInstructions = null;
    if (global.chatMemory !== undefined) global.chatMemory = [];
    
    // Limpiar PDFs en memoria de OpenAI
    clearPdfMemory();

    // Registrar la acción en Conversacion para auditoría (no borra datos existentes)
    try {
      await models.Conversacion.create({
        id_usuario: req.user ? req.user.user : 1,
        mensaje_usuario: `Limpiada memoria del chatbot por usuario`,
        respuesta_bot: 'Memoria en servidor limpiada (PDFs cargados y respuestas precargadas removidas, pero BD intacta).',
      });
    } catch (e) {
      // No bloquear la operación si falla el logging
      console.error('No se pudo registrar la acción de limpieza de memoria:', e.message);
    }

    res.json({ success: true, message: 'Memoria del chatbot limpiada correctamente' });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Endpoint específico para subir PDF a OpenAI
const uploadPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó archivo PDF' });
    }

    const { tipo_prompt = 'contexto_pdf' } = req.body;
    
    try {
      console.log(`📎 Procesando archivo: ${req.file.originalname} (${req.file.size} bytes)`);
      
      // Validar que el buffer tiene contenido
      if (!req.file.buffer || req.file.buffer.length === 0) {
        throw new Error('El archivo está vacío');
      }
      
      // Guardar en filesystem
      const filePath = savePdfToFileSystem(req.file.buffer, req.file.originalname);
      console.log(`✓ PDF guardado en servidor: ${filePath}`);

      // Verificar que el archivo de verdad se guardó
      const fs = require('fs');
      if (!fs.existsSync(filePath)) {
        throw new Error(`Guardado fallido: El archivo no existe después de crear ${filePath}`);
      }

      // Subir a OpenAI
      console.log(`📤 Subiendo PDF a OpenAI: ${req.file.originalname}`);
      const openaiResponse = await uploadPdfToOpenAI(req.file.buffer, req.file.originalname);
      
      res.json({
        success: true,
        message: '✓ PDF subido exitosamente a OpenAI',
        file: {
          name: req.file.originalname,
          size: req.file.size,
          openaiFileId: openaiResponse.id,
          createdAt: openaiResponse.created_at
        }
      });
    } catch (pdfError) {
      console.error('❌ Error al procesar PDF:', pdfError.message);
      return res.status(400).json({ 
        error: 'Error al procesar el PDF: ' + pdfError.message,
        details: pdfError.toString()
      });
    }
  } catch (error) {
    console.error('❌ Error en uploadPdf:', error.message);
    res.status(500).send({ error: error.message });
  }
};

// Helper para validar folder traversal
const isPathInside = (childPath, parentPath) => {
  const relative = path.relative(parentPath, childPath);
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
};

// Endpoint para descargar un PDF
const downloadPdf = async (req, res) => {
  try {
    const { pdfName } = req.params;
    
    console.log('📥 [DOWNLOAD PDF] Solicitado:', pdfName);
    
    if (!pdfName) {
      return res.status(400).json({ error: 'Nombre de archivo no proporcionado' });
    }

    const serverRoot = path.resolve(__dirname, '../../../');
    const pdfsDir = path.join(serverRoot, 'uploads', 'pdfs');
    const chatbotDir = path.join(serverRoot, 'uploads', 'chatbot');

    const candidatePaths = [
      path.join(pdfsDir, pdfName),
      path.join(chatbotDir, pdfName),
      // Compatibilidad con antigua ruta en src/uploads
      path.join(path.resolve(__dirname, '../../'), 'uploads', 'pdfs', pdfName),
      path.join(path.resolve(__dirname, '../../'), 'uploads', 'chatbot', pdfName)
    ];

    let filePath = null;
    for (const candidate of candidatePaths) {
      const fromDir = path.dirname(candidate);
      if (!isPathInside(candidate, fromDir)) {
        continue;
      }
      if (fs.existsSync(candidate)) {
        filePath = candidate;
        break;
      }
    }

    if (!filePath) {
      console.warn('❌ Archivo no encontrado en ninguna ruta esperada:', pdfName);
      console.warn('📁 rutas probadas:', candidatePaths);
      try {
        if (fs.existsSync(pdfsDir)) {
          console.warn('📋 Archivo en pdfs:', fs.readdirSync(pdfsDir));
        } else {
          console.warn('📋 pdfs_dir no existe:', pdfsDir);
        }
        if (fs.existsSync(chatbotDir)) {
          console.warn('📋 Archivo en chatbot:', fs.readdirSync(chatbotDir));
        } else {
          console.warn('📋 chatbot_dir no existe:', chatbotDir);
        }
      } catch (e) {
        console.warn('Error al listar directorios:', e.message);
      }
      return res.status(404).json({ error: 'Archivo PDF no encontrado' });
    }

    const stats = fs.statSync(filePath);
    console.log(`✓ Descargando: ${filePath} (${stats.size} bytes)`);
    res.download(filePath, pdfName);
  } catch (error) {
    console.error('❌ Error descargando PDF:', error);
    res.status(500).json({ error: 'Error al descargar el archivo: ' + error.message });
  }
};

// Endpoint para ejecutar prompts seleccionados
const executeSelected = async (req, res) => {
  try {
    const { prompt_ids } = req.body;
    
    if (!prompt_ids || !Array.isArray(prompt_ids) || prompt_ids.length === 0) {
      return res.status(400).json({ error: 'prompt_ids debe ser un array no vacío' });
    }

    console.log(`📋 [EXECUTE SELECTED] Ejecutando ${prompt_ids.length} prompts:`, prompt_ids);

    // Obtener los prompts seleccionados
    const selectedPrompts = await models.Prompt.findAll({
      where: { id_prompt: prompt_ids }
    });

    if (selectedPrompts.length === 0) {
      return res.status(404).json({ error: 'No se encontraron prompts con los IDs especificados' });
    }

    // Procesar cada prompt
    for (const prompt of selectedPrompts) {
      if (prompt.tipo_prompt === 'instrucciones') {
        // Actualizar instrucciones globales
        global.additionalInstructions = prompt.instrucciones || prompt.descripcion;
        console.log(`✓ Instrucciones actualizadas para prompt ${prompt.id_prompt}`);
      }
    }

    // Si hay prompts de tipo conocimiento/contexto, regenerar embeddings
    console.log(`📊 Regenerando embeddings para ${selectedPrompts.length} prompts...`);
    
    await models.Conocimiento.update(
      { regenerar: true },
      { where: { id_prompt: prompt_ids } }
    );

    // Registrar la acción
    await models.Conversacion.create({
      id_usuario: req.user ? req.user.user : 1,
      mensaje_usuario: `Ejecutó ${selectedPrompts.length} prompts en memoria del chatbot`,
      respuesta_bot: `${selectedPrompts.length} prompts ejecutados y memoria actualizada exitosamente.`,
    });

    res.json({
      success: true,
      message: `${selectedPrompts.length} prompts ejecutados exitosamente`,
      executedCount: selectedPrompts.length,
      prompts: selectedPrompts.map(p => ({ id_prompt: p.id_prompt, titulo: p.titulo, tipo_prompt: p.tipo_prompt }))
    });
  } catch (error) {
    console.error('❌ Error ejecutando prompts seleccionados:', error);
    res.status(500).json({ error: 'Error al ejecutar los prompts: ' + error.message });
  }
};

// Verificar si un PDF existe en el servidor
const checkPdfExists = async (req, res) => {
  try {
    const { pdfName } = req.params;
    
    if (!pdfName) {
      return res.status(400).json({ exists: false, error: 'Nombre de archivo no proporcionado' });
    }

    const serverRoot = path.resolve(__dirname, '../../../');
    const pdfsDir = path.join(serverRoot, 'uploads', 'pdfs');
    const chatbotDir = path.join(serverRoot, 'uploads', 'chatbot');
    const checks = [
      path.join(pdfsDir, pdfName),
      path.join(chatbotDir, pdfName),
      // Compatibilidad con antigua ruta en src/uploads
      path.join(path.resolve(__dirname, '../../'), 'uploads', 'pdfs', pdfName),
      path.join(path.resolve(__dirname, '../../'), 'uploads', 'chatbot', pdfName)
    ];

    let foundPath = null;
    for (const candidate of checks) {
      const candidateParent = path.dirname(candidate);
      if (!isPathInside(candidate, candidateParent)) {
        continue;
      }
      if (fs.existsSync(candidate)) {
        foundPath = candidate;
        break;
      }
    }

    if (foundPath) {
      const stats = fs.statSync(foundPath);
      console.log(`✓ PDF encontrado: ${pdfName} en ${foundPath} (${stats.size} bytes)`);
      return res.json({ exists: true, name: pdfName, path: foundPath, size: stats.size, message: 'PDF encontrado en el servidor' });
    }

    console.warn(`⚠️ PDF no existe en: ${checks.join(', ')}`);
    return res.json({ exists: false, name: pdfName, paths: checks, message: 'Archivo PDF no encontrado en el servidor' });
  } catch (error) {
    console.error('❌ Error verificando PDF:', error);
    res.status(500).json({ exists: false, error: 'Error al verificar el archivo: ' + error.message });
  }
};

module.exports = { create, getAll, getById, update, remove, activate, clearMemory, uploadPdf, downloadPdf, executeSelected, checkPdfExists };