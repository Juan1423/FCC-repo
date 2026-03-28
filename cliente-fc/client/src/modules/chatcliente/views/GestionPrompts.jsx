import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Card, CardHeader, CardContent, Grid, Paper, List, ListItem, ListItemText, Snackbar, Alert } from '@mui/material';
import { Chat as ChatIcon } from '@mui/icons-material';
import NavbarAdmin from '../../../components/NavbarAdmin';
import Drawer from '../../../components/Drawer';
import { subirPDF } from '../../../services/openaiService';
import { getPrompts, createPrompt, updatePrompt, deletePrompt, clearPromptMemory, uploadPdfToOpenAI } from '../../../services/chatbotServices';
import { ChatBotIA } from '../../../components/ChatBotIA';
import restricciones from '../components/restricciones';

const GestionPrompts = () => {
  const [prompts, setPrompts] = useState([]);
  const [newPrompt, setNewPrompt] = useState({ 
    titulo: '', 
    descripcion: '', 
    instrucciones: '', 
    tipo_prompt: '',
    activo: true 
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [selectedPromptIds, setSelectedPromptIds] = useState([]);
  const [chatbotKey, setChatbotKey] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });

  useEffect(() => {
    fetchPrompts();
    // Cargar todos los PDFs al iniciar
    loadAllPdfs();
  }, []);

  const fetchPrompts = async () => {
    const data = await getPrompts();
    setPrompts(data);
  };

  const loadAllPdfs = async () => {
    // Cargar todos los PDFs de los prompts en contexto
    try {
      const data = await getPrompts();
      if (data && data.length > 0) {
        // Filtrar prompts que tienen PDFs asociados
        const promptsWithPdfs = data.filter(p => p.archivo_pdf && p.tipo_prompt === 'contexto_pdf');
        if (promptsWithPdfs.length > 0) {
          // Notificar al chatbot que cargue estos PDFs
          console.log(`📚 Cargando ${promptsWithPdfs.length} PDF(s) en contexto del chatbot`);
          // Aquí se podría enviar al servidor para que cargue los PDFs en memoria
          // localStorage.setItem('uploadedPdfs', JSON.stringify(promptsWithPdfs));
        }
      }
    } catch (error) {
      console.error('Error al cargar PDFs:', error);
    }
  };

  const handleExecutePrompt = async (promptData) => {
    try {
      // Si hay un PDF en el prompt, enviarlo a OpenAI primero
      if (pdfFile && promptData.tipo_prompt === 'contexto_pdf') {
        console.log('📤 Enviando PDF a OpenAI...');
        await subirPDF(pdfFile);
        setSnackbar({ open: true, message: '✓ PDF enviado a OpenAI', type: 'success' });
      }
      
      // Establecer el prompt seleccionado y abrir el chatbot
      setSelectedPrompt({ ...promptData });
      setShowChatbot(true);
    } catch (error) {
      setSnackbar({ open: true, message: 'Error al ejecutar el prompt: ' + error.message, type: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validacion = restricciones.validarPrompt(newPrompt);
    if (!validacion.valido) {
      const errorMsg = validacion.errores[0] || 'Error al crear el prompt';
      setSnackbar({ 
        open: true, 
        message: errorMsg, 
        type: 'error' 
      });
      return;
    }
    try {
      // Crear prompt con PDF si existe
      await createPrompt(newPrompt, pdfFile);
      setNewPrompt({ titulo: '', descripcion: '', instrucciones: '', tipo_prompt: '', activo: true });
      setPdfFile(null);
      setSnackbar({ open: true, message: '✓ Prompt creado exitosamente', type: 'success' });
      fetchPrompts();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error al crear el prompt: ' + error.message, type: 'error' });
    }
  };

  const handlePdfUpload = async () => {
    if (pdfFile) {
      try {
        await subirPDF(pdfFile);
        setPdfFile(null);
        setSnackbar({ open: true, message: '✓ PDF subido correctamente', type: 'success' });
        fetchPrompts();
      } catch (error) {
        setSnackbar({ open: true, message: 'Error al subir el PDF', type: 'error' });
      }
    } else {
      setSnackbar({ open: true, message: 'Por favor selecciona un archivo PDF', type: 'error' });
    }
  };

  const handleEdit = (prompt) => {
    setEditingPrompt(prompt);
    setNewPrompt({ 
      titulo: prompt.titulo, 
      descripcion: prompt.descripcion, 
      instrucciones: prompt.instrucciones, 
      tipo_prompt: prompt.tipo_prompt || 'instrucciones',
      activo: prompt.activo 
    });
  };

  const handleUpdate = async () => {
    if (editingPrompt) {
      const validacion = restricciones.validarPrompt(newPrompt);
      if (!validacion.valido) {
        setSnackbar({ 
          open: true, 
          message: validacion.errores[0] || 'Error al actualizar el prompt', 
          type: 'error' 
        });
        return;
      }
      try {
        // Actualizar prompt con PDF si existe
        await updatePrompt(editingPrompt.id_prompt, newPrompt, pdfFile);
        setEditingPrompt(null);
        setNewPrompt({ titulo: '', descripcion: '', instrucciones: '', tipo_prompt: '', activo: true });
        setPdfFile(null);
        setSnackbar({ open: true, message: '✓ Prompt actualizado exitosamente', type: 'success' });
        fetchPrompts();
      } catch (error) {
        setSnackbar({ open: true, message: 'Error al actualizar el prompt', type: 'error' });
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este prompt?')) {
      try {
        await deletePrompt(id);
        setSnackbar({ open: true, message: '✓ Prompt eliminado exitosamente', type: 'success' });
        fetchPrompts();
      } catch (error) {
        setSnackbar({ open: true, message: 'Error al eliminar el prompt', type: 'error' });
      }
    }
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const togglePromptSelection = (id) => {
    setSelectedPromptIds(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const selectAllPrompts = () => {
    if (selectedPromptIds.length === prompts.length) {
      setSelectedPromptIds([]);
    } else {
      setSelectedPromptIds(prompts.map(p => p.id_prompt));
    }
  };

  const executeSelectedPrompts = () => {
    if (selectedPromptIds.length === 0) {
      setSnackbar({ open: true, message: 'Selecciona al menos un prompt para ejecutar', type: 'warning' });
      return;
    }

    const selected = prompts.filter(p => selectedPromptIds.includes(p.id_prompt));
    const combinedText = selected
      .map((p, idx) => `PROMPT ${idx + 1}: ${p.titulo}\n${p.instrucciones}`)
      .join('\n\n');

    setSelectedPrompt({
      id_prompt: null,
      titulo: `Prompts seleccionados (${selected.length})`,
      promptText: combinedText
    });
    setShowChatbot(true);
    setChatbotKey(prev => prev + 1);
  };

  const executeAllPrompts = () => {
    if (!prompts || prompts.length === 0) {
      setSnackbar({ open: true, message: 'No hay prompts disponibles para ejecutar', type: 'warning' });
      return;
    }

    const combinedText = prompts
      .map((p, idx) => `PROMPT ${idx + 1}: ${p.titulo}\n${p.instrucciones}`)
      .join('\n\n');

    setSelectedPrompt({
      id_prompt: null,
      titulo: `Todos los prompts (${prompts.length})`,
      promptText: combinedText
    });
    setShowChatbot(true);
    setChatbotKey(prev => prev + 1);
  };

  const handleClearMemory = async () => {
    try {
      // Limpiar solo respuestas precargadas, no los PDFs
      await clearPromptMemory();
      setSnackbar({ 
        open: true, 
        message: '✓ Respuestas precargadas borradas (PDFs mantenidos en contexto)', 
        type: 'success' 
      });
      // No limpiar prompts ni setear showChatbot a false para mantener contexto de PDFs
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Error al limpiar la memoria: ' + error.message, 
        type: 'error' 
      });
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <NavbarAdmin onDrawerToggle={handleDrawerToggle} />
      <Drawer open={drawerOpen} onClose={handleDrawerToggle} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ flexGrow: 1 }}>
            Gestión de Prompts del Chatbot
          </Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ boxShadow: 6, borderRadius: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 32 }}>🤖</span>
                    <span>{editingPrompt ? "Editar Prompt" : "Crear Nuevo Prompt"}</span>
                  </Box>
                }
                sx={{ textAlign: 'center', background: '#1976d2', color: 'white', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
              />
              <CardContent>
                <form onSubmit={editingPrompt ? (e) => { e.preventDefault(); handleUpdate(); } : handleSubmit}>
                  <TextField
                    fullWidth
                    label="Título"
                    value={newPrompt.titulo}
                    onChange={(e) => setNewPrompt({...newPrompt, titulo: e.target.value})}
                    margin="normal"
                    sx={{ background: '#e3eafc', borderRadius: 2 }}
                  />
                  <Typography variant="body2" sx={{ mt: 2, mb: 1, color: '#333', fontWeight: 600 }}>
                    Tipo de Prompt *
                  </Typography>
                  <Box
                    component="select"
                    value={newPrompt.tipo_prompt}
                    onChange={(e) => setNewPrompt(prev => ({...prev, tipo_prompt: e.target.value}))}
                    required
                    sx={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      backgroundColor: '#fff',
                      fontSize: '16px',
                      cursor: 'pointer',
                      fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
                      marginBottom: '16px',
                      '& option': {
                        padding: '8px',
                        fontSize: '14px',
                        color: '#333'
                      },
                      '&:focus': {
                        outline: 'none',
                        borderColor: '#1976d2',
                        boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)'
                      }
                    }}
                  >
                    <option value="" disabled>Selecciona una categoría...</option>
                    <option value="instrucciones">📝 Instrucciones</option>
                    <option value="contexto_pdf">📄 Contexto PDF</option>
                    <option value="global">🌍 Global</option>
                    <option value="otro">🔖 Otro</option>
                  </Box>
                  <TextField
                    fullWidth
                    label="Descripción"
                    multiline
                    rows={3}
                    value={newPrompt.descripcion}
                    onChange={(e) => setNewPrompt({...newPrompt, descripcion: e.target.value})}
                    margin="normal"
                    sx={{ background: '#e3eafc', borderRadius: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Instrucciones"
                    multiline
                    rows={5}
                    value={newPrompt.instrucciones}
                    onChange={(e) => setNewPrompt({...newPrompt, instrucciones: e.target.value})}
                    margin="normal"
                    sx={{ background: '#e3eafc', borderRadius: 2 }}
                  />
                  <Box sx={{ my: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setPdfFile(e.target.files[0])}
                      style={{ marginBottom: 0 }}
                    />
                    <Button onClick={handlePdfUpload} variant="contained" color="secondary" sx={{ height: 40 }}>
                      Subir PDF
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, mt: 2, mb: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button type="submit" variant="contained" color="primary">
                      {editingPrompt ? "Actualizar Prompt" : "Crear Prompt"}
                    </Button>
                    {!editingPrompt && newPrompt.titulo && newPrompt.descripcion && newPrompt.instrucciones && (
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<ChatIcon />}
                        onClick={() => handleExecutePrompt(newPrompt)}
                      >
                        ▶ Ejecutar
                      </Button>
                    )}
                    <Button variant="contained" color="error" onClick={handleClearMemory}>
                      Borrar Memoria Chatbot
                    </Button>
                    {editingPrompt && (
                      <Button onClick={() => { setEditingPrompt(null); setNewPrompt({ titulo: '', descripcion: '', instrucciones: '', tipo_prompt: '', activo: true }); }} variant="outlined">
                        Cancelar
                      </Button>
                    )}
                  </Box>
                </form>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <span style={{ fontSize: 28 }}>🤖</span>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Prompts Existentes</Typography>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, alignItems: 'center' }}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={selectAllPrompts}
                  disabled={!prompts || prompts.length === 0}
                >
                  {selectedPromptIds.length === prompts.length && prompts.length > 0 ? 'Deseleccionar todos' : 'Seleccionar todos'}
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={executeSelectedPrompts}
                  disabled={selectedPromptIds.length === 0}
                >
                  Ejecutar seleccionadas ({selectedPromptIds.length})
                </Button>
                <Button
                  variant="contained"
                  color="info"
                  onClick={executeAllPrompts}
                  disabled={!prompts || prompts.length === 0}
                >
                  Ejecutar todas ({prompts.length})
                </Button>
              </Box>

              <List>
                {prompts.map(prompt => (
                  <ListItem key={prompt.id_prompt} divider sx={{ flexWrap: 'wrap', gap: 1 }}>
                    <Checkbox
                      checked={selectedPromptIds.includes(prompt.id_prompt)}
                      onChange={() => togglePromptSelection(prompt.id_prompt)}
                    />
                    <ListItemText
                      primary={prompt.titulo}
                      secondary={`${prompt.descripcion} - ${prompt.activo ? 'Activo' : 'Inactivo'}`}
                      sx={{ flex: '1 1 auto', minWidth: 200 }}
                    />
                    <Box sx={{ display: 'flex', gap: 1, flex: '1 1 auto', justifyContent: 'flex-end' }}>
                      <Button onClick={() => handleEdit(prompt)} variant="outlined" size="small">
                        Editar
                      </Button>
                      <Button onClick={() => handleDelete(prompt.id_prompt)} variant="outlined" color="error" size="small">
                        Eliminar
                      </Button>
                      <Button
                        onClick={() => {
                          if (localStorage.getItem('token')) {
                            handleExecutePrompt(prompt);
                          } else {
                            setSnackbar({ open: true, message: 'Debes iniciar sesión para usar el chatbot', type: 'error' });
                          }
                        }}
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<ChatIcon />}
                        disabled={!localStorage.getItem('token')}
                      >
                        ▶ Ejecutar
                      </Button>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={4000} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.type}
            sx={{ width: '100%', fontSize: '16px', fontWeight: 'bold' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
      {showChatbot && selectedPrompt && (
        <ChatBotIA
          key={chatbotKey}
          onClose={() => setShowChatbot(false)}
          selectedPrompt={selectedPrompt}
          forceClearMemory={false}
        />
      )}
    </Box>
  );
};

export default GestionPrompts;
