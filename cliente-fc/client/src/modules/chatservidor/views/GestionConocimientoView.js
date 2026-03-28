import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Paper, Alert, CircularProgress, IconButton,
  List, ListItem, ListItemIcon, ListItemText, Divider
} from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavbarAdmin from "../../../components/NavbarAdmin";
import Drawer from "../../../components/Drawer";
import { useMenu } from '../../../components/base/MenuContext';
import iaService from '../../../services/iaService';
import { useNavigate } from 'react-router-dom';


const GestionConocimientoView = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { setCurrentMenu } = useMenu();
  const navigate = useNavigate();
  
  // Estados de subida
  const [tituloDoc, setTituloDoc] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  useEffect(() => {
    setCurrentMenu('Gestor de Conocimiento');
  }, [setCurrentMenu]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setLoading(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append('archivo', selectedFile);
    formData.append('titulo', tituloDoc || selectedFile.name);

    try {
      const res = await iaService.subirConocimiento(formData);
      if (res.data.success) {
        setFeedback({ type: 'success', msg: 'Documento aprendido y vectorizado correctamente.' });
        setTituloDoc("");
        setSelectedFile(null);
      }
    } catch (error) {
      setFeedback({ type: 'error', msg: 'Error al subir el documento.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <NavbarAdmin onDrawerToggle={handleDrawerToggle} />
      <Drawer open={drawerOpen} onClose={handleDrawerToggle} />
      
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, width: { md: `calc(100% - 240px)` } }}>
        <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <IconButton onClick={() => navigate(-1)} aria-label="Regresar">
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="subtitle1" sx={{ ml: 1, color: 'text.secondary' }}>
              Regresar
            </Typography>
          </Box>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Subir Nuevo Documento
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Al subir un PDF aquí, el Chatbot flotante "leerá" su contenido y podrá usarlo para responder preguntas del personal.
          </Typography>

          <form onSubmit={handleUpload}>
            <TextField
              label="Título o Área (Ej: Recursos Humanos - Reglamento)"
              fullWidth
              value={tituloDoc}
              onChange={(e) => setTituloDoc(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Box sx={{ border: '2px dashed #ccc', borderRadius: 2, p: 3, textAlign: 'center', mb: 3, bgcolor: '#fafafa' }}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
              >
                Seleccionar PDF
                <input type="file" hidden accept=".pdf" onChange={handleFileChange} />
              </Button>
              {selectedFile && (
                <Typography sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <PictureAsPdfIcon color="error" /> {selectedFile.name}
                </Typography>
              )}
            </Box>

            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              fullWidth 
              size="large"
              disabled={loading || !selectedFile}
            >
              {loading ? <CircularProgress size={24} /> : 'Procesar y Aprender'}
            </Button>
          </form>

          {feedback && (
            <Alert severity={feedback.type} sx={{ mt: 3 }}>
              {feedback.msg}
            </Alert>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default GestionConocimientoView;