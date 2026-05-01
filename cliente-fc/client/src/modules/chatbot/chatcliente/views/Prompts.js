// Prompts.js (moved to modules/chatcliente/views)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../../../services/apiConfig';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  IconButton,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Snackbar,
  MenuItem,
} from '@mui/material';
import { Edit, Delete, Add, PlayArrow, Search, Download, Close, Security, Block } from '@mui/icons-material';
import { getPrompts, createPrompt, updatePrompt, deletePrompt, clearPromptMemory, checkPdfAvailable, activatePrompt, executeSelectedPrompts, executeAllPrompts, downloadPdf } from '../../../../services/chatbotServices';

const Prompts = () => {
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompts, setSelectedPrompts] = useState(new Set());
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ tipo_prompt: '', titulo: '', descripcion: '', instrucciones: '', archivo_pdf: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [success, setSuccess] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [securityOpen, setSecurityOpen] = useState(false);
  const [securityData, setSecurityData] = useState([]);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityFilter, setSecurityFilter] = useState('');
  const [securitySearch, setSecuritySearch] = useState('');
  const [userReportOpen, setUserReportOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userReportData, setUserReportData] = useState(null);
  const [userReportLoading, setUserReportLoading] = useState(false);
  const [pdfAvailability, setPdfAvailability] = useState({});

  useEffect(() => { fetchPrompts(); loadSearchHistory(); }, []);

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const data = await getPrompts();
      setPrompts(data);
      setError(null);
      
      if (data && data.length > 0) {
        const availability = {};
        const promptsWithPdf = data.filter(p => p.archivo_pdf);
        
        for (let i = 0; i < promptsWithPdf.length; i += 5) {
          const batch = promptsWithPdf.slice(i, i + 5);
          const results = await Promise.allSettled(
            batch.map(p => checkPdfAvailable(p.archivo_pdf))
          );
          
          results.forEach((result, idx) => {
            const pdfName = batch[idx].archivo_pdf;
            availability[pdfName] = result.status === 'fulfilled' ? result.value : false;
          });
        }
        
        setPdfAvailability(availability);
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
      setError('Error al cargar los prompts');
    } finally { setLoading(false); }
  };

  const loadSearchHistory = () => { const history = JSON.parse(localStorage.getItem('promptSearchHistory') || '[]'); setSearchHistory(history); };
  const saveSearchHistory = (term) => { if (term.trim()) { const history = JSON.parse(localStorage.getItem('promptSearchHistory') || '[]'); const updatedHistory = [term, ...history.filter(h => h !== term)].slice(0, 10); localStorage.setItem('promptSearchHistory', JSON.stringify(updatedHistory)); setSearchHistory(updatedHistory); } };
  const handleSearch = () => { saveSearchHistory(searchTerm); };

  const filteredPrompts = prompts.filter(prompt => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    const tipo = (prompt.tipo_prompt || '').toString().toLowerCase();
    const descripcion = (prompt.descripcion || '').toString().toLowerCase();
    return tipo.includes(term) || descripcion.includes(term);
  });

  const handleOpen = (prompt = null) => { 
    setEditing(prompt); 
    if (prompt) {
      setForm({ 
        tipo_prompt: prompt.tipo_prompt || '', 
        titulo: prompt.titulo || '', 
        descripcion: prompt.descripcion || '', 
        instrucciones: prompt.instrucciones || '',
        archivo_pdf: prompt.archivo_pdf || ''
      }); 
    } else {
      setForm({ tipo_prompt: '', titulo: '', descripcion: '', instrucciones: '', archivo_pdf: '' });
    }
    setFile(null); 
    setError(null); 
    setOpen(true); 
  };
  const handleClose = () => { setOpen(false); setEditing(null); setError(null); };

const handleSave = async () => {
    const tiposValidos = ['instrucciones', 'contexto_pdf', 'global', 'otro'];
    if (!form.tipo_prompt || !tiposValidos.includes(form.tipo_prompt)) {
      setError('El tipo de prompt es requerido - Por favor selecciona un tipo válido');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const isEditing = editing !== null;
      
      if (isEditing) {
        await updatePrompt(editing.id_prompt, form, file || undefined);
      } else {
        await createPrompt(form, file || undefined);
      }
      
      fetchPrompts(); 
      handleClose(); 
      const mensaje = isEditing ? '✓ Prompt actualizado exitosamente' : '✓ Prompt creado exitosamente'; 
      setSuccess(mensaje); 
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) { 
      console.error('❌ [PROMPTS] Error saving prompt:', error);
      const errorMsg = error.message || 'Error al guardar el prompt'; 
      setError(errorMsg); 
      setSuccess(''); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleDelete = async (id) => { 
    if (window.confirm('¿Estás seguro de que quieres eliminar este prompt?')) { 
      setLoading(true); 
      try { 
        await deletePrompt(id); 
        fetchPrompts(); 
        setError(null); 
        setSuccess('✓ Prompt eliminado exitosamente'); 
        setTimeout(() => setSuccess(''), 3000); 
      } catch (error) { 
        console.error('Error deleting prompt:', error); 
        const errorMsg = error.message || 'Error al eliminar el prompt'; 
        setError(errorMsg); 
        setSuccess(''); 
      } finally { 
        setLoading(false); 
      } 
    } 
  };

  const handleActivate = async (id) => { 
    setLoading(true); 
    try { 
      await activatePrompt(id); 
      setSnackbarMessage('✓ Prompt activado exitosamente. El chatbot ahora usará este contenido.'); 
      setSnackbarSeverity('success'); 
      setSnackbarOpen(true); 
      setError(null); 
    } catch (error) { 
      console.error('Error activating prompt:', error); 
      setSnackbarMessage('✗ Error al activar el prompt'); 
      setSnackbarSeverity('error'); 
      setSnackbarOpen(true); 
    } finally { 
      setLoading(false); 
    } 
  };

  const handleDownloadPdf = async (pdfName) => {
    if (!pdfName || pdfName.trim() === '') {
      setSnackbarMessage('❌ No hay archivo PDF asociado');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    try {
      setLoading(true);
      console.log('📥 Iniciando descarga de PDF:', pdfName);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setSnackbarMessage('❌ Token de autenticación no encontrado');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      
      // Usar el endpoint correcto
      const downloadUrl = `${API_URL}/prompt/download/${encodeURIComponent(pdfName)}`;
      console.log('📥 URL de descarga:', downloadUrl);
      
      const response = await axios.get(downloadUrl, {
        headers: { 
          'token': token,
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob',
        timeout: 30000
      });
      
      // Verificar que es una respuesta válida
      if (!response.data || response.data.size === 0) {
        throw new Error('El servidor devolvió un archivo vacío');
      }
      
      // Crear blob y descargar
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', pdfName || 'documento.pdf');
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      setSnackbarMessage(`✓ PDF descargado correctamente`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      console.log('✓ PDF descargado exitosamente:', pdfName);
      
    } catch (error) {
      console.error('❌ Error descargando PDF:', error);
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      
      let mensaje = 'Error al descargar el archivo PDF';
      if (error.response?.status === 404) {
        mensaje = '❌ El archivo PDF no existe en el servidor. Intenta cargar uno nuevo.';
      } else if (error.response?.status === 401) {
        mensaje = '❌ No tienes permisos para descargar este archivo';
      } else if (error.message === 'timeout of 30000ms exceeded') {
        mensaje = '❌ El servidor tardó demasiado en responder';
      } else if (!error.response) {
        mensaje = '❌ Error de conexión con el servidor';
      }
      
      setSnackbarMessage(mensaje);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClearMemory = async () => { 
    setLoading(true); 
    try { 
      await clearPromptMemory(); 
      setSnackbarMessage('✓ Memoria del chatbot limpiada exitosamente.'); 
      setSnackbarSeverity('success'); 
      setSnackbarOpen(true); 
      setError(null); 
    } catch (error) { 
      console.error('Error clearing memory:', error); 
      setSnackbarMessage('✗ Error al limpiar la memoria'); 
      setSnackbarSeverity('error'); 
      setSnackbarOpen(true); 
    } finally { 
      setLoading(false); 
    } 
  };

  // Manejar selección de checkboxes
  const handleSelectPrompt = (id_prompt) => {
    const newSelected = new Set(selectedPrompts);
    if (newSelected.has(id_prompt)) {
      newSelected.delete(id_prompt);
    } else {
      newSelected.add(id_prompt);
    }
    setSelectedPrompts(newSelected);
  };

  // Seleccionar/deseleccionar todos
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedPrompts(new Set(filteredPrompts.map(p => p.id_prompt)));
    } else {
      setSelectedPrompts(new Set());
    }
  };

  // Ejecutar prompts seleccionados
  const handleExecuteSelectedPrompts = async () => {
    if (selectedPrompts.size === 0) {
      setSnackbarMessage('⚠️ Por favor selecciona al menos un prompt');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);
    try {
      const promptIds = Array.from(selectedPrompts);
      await executeSelectedPrompts(promptIds);
      setSnackbarMessage(`✓ ${selectedPrompts.size} prompt(s) ejecutados exitosamente en la memoria del chatbot`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setSelectedPrompts(new Set());
      fetchPrompts();
    } catch (error) {
      console.error('Error executing prompts:', error);
      setSnackbarMessage('✗ Error al ejecutar los prompts seleccionados');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Ejecutar todos los prompts
  const handleExecuteAllPrompts = async () => {
    setLoading(true);
    try {
      await executeAllPrompts();
      setSnackbarMessage('✓ Todos los prompts ejecutados correctamente - Memoria del chatbot regenerada exitosamente');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      fetchPrompts();
      setSelectedPrompts(new Set());
    } catch (error) {
      console.error('Error executing all prompts:', error);
      setSnackbarMessage('✗ Error al ejecutar todos los prompts. Intenta nuevamente.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Obtener información de seguridad
  const handleOpenSecurity = async (userId = null) => {
    setSecurityOpen(true);
    setSecurityLoading(true);
    setSecurityFilter(userId || '');
    try {
      const token = localStorage.getItem('token');
      const isNumericId = (id) => typeof id === 'string' && /^[0-9]+$/.test(id);
      const url = userId && isNumericId(userId)
        ? `${API_URL}/seguridad?user_id=${userId}&limit=100`
        : `${API_URL}/seguridad?limit=100`;
      const response = await axios.get(url, { headers: { 'token': token } });
      setSecurityData(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching security data:', error);
      setSnackbarMessage('✗ Error al cargar información de seguridad');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setSecurityLoading(false);
    }
  };

  // Ver reporte de usuario (registrado)
  const handleViewUserReport = async (userId) => {
    if (!userId || userId === '(anónimo)') return;

    setUserReportOpen(true);
    setUserReportLoading(true);
    setSelectedUser(userId);
    try {
      const token = localStorage.getItem('token');
      // Obtener datos del usuario
      const userResponse = await axios.get(`${API_URL}/users/${userId}`, { headers: { 'token': token } });
      // Obtener conversaciones del usuario
      const convResponse = await axios.get(`${API_URL}/conversacion/usuario/${userId}`, { headers: { 'token': token } });
      // Obtener registros de seguridad del usuario
      const securityResponse = await axios.get(`${API_URL}/seguridad?user_id=${userId}&limit=50`, { headers: { 'token': token } });

      setUserReportData({
        type: 'registered',
        user: userResponse.data,
        conversations: convResponse.data,
        security: securityResponse.data.data || securityResponse.data
      });
    } catch (error) {
      console.error('Error fetching user report:', error);
      setSnackbarMessage('✗ Error al cargar reporte de usuario');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setUserReportLoading(false);
    }
  };

  // Ver reporte de usuario anónimo
  const handleViewAnonUserReport = async (anonUserId, conversationId) => {
    if (!anonUserId) return;

    setUserReportOpen(true);
    setUserReportLoading(true);
    setSelectedUser(anonUserId);
    try {
      const token = localStorage.getItem('token');
      // Obtener datos del usuario anónimo
      const userResponse = await axios.get(`${API_URL}/usuario-anonimo/${anonUserId}`, { headers: { 'token': token } });
      // Obtener conversaciones del usuario anónimo
      const convResponse = await axios.get(`${API_URL}/conversacion-anonima/usuario/${anonUserId}`, { headers: { 'token': token } });
      // Obtener registros de seguridad asociados a la conversación anónima (si se provee)
      const securityUrl = conversationId
        ? `${API_URL}/seguridad?id_conversacion_anonima=${conversationId}&limit=50`
        : `${API_URL}/seguridad?limit=50`;
      const securityResponse = await axios.get(securityUrl, { headers: { 'token': token } });

      setUserReportData({
        type: 'anonymous',
        user: userResponse.data.data || userResponse.data,
        conversations: convResponse.data.data || convResponse.data,
        security: securityResponse.data.data || securityResponse.data
      });
    } catch (error) {
      console.error('Error fetching anonymous user report:', error);
      setSnackbarMessage('✗ Error al cargar reporte de usuario anónimo');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setUserReportLoading(false);
    }
  };

  // Bloquear usuario registrado
  const handleBlockUser = async (userId) => {
    if (!userId || userId === '(anónimo)') return;

    if (!window.confirm(`¿Estás seguro de bloquear al usuario ${userId}?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/users/${userId}/block`, {}, { headers: { 'token': token } });
      setSnackbarMessage('✓ Usuario bloqueado exitosamente');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      // Recargar datos de seguridad
      handleOpenSecurity(securityFilter);
    } catch (error) {
      console.error('Error blocking user:', error);
      setSnackbarMessage('✗ Error al bloquear usuario');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Desbloquear usuario registrado
  const handleUnblockUser = async (userId) => {
    if (!userId || userId === '(anónimo)') return;

    if (!window.confirm(`¿Estás seguro de desbloquear al usuario ${userId}?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/users/${userId}/unblock`, {}, { headers: { 'token': token } });
      setSnackbarMessage('✓ Usuario desbloqueado exitosamente');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      // Recargar datos de seguridad
      handleOpenSecurity(securityFilter);
    } catch (error) {
      console.error('Error unblocking user:', error);
      setSnackbarMessage('✗ Error al desbloquear usuario');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Bloquear usuario anónimo
  const handleBlockAnonUser = async (anonUserId) => {
    if (!anonUserId) return;

    if (!window.confirm(`¿Estás seguro de bloquear al usuario anónimo ${anonUserId}?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/usuario-anonimo/${anonUserId}/block`, {}, { headers: { 'token': token } });
      setSnackbarMessage('✓ Usuario anónimo bloqueado exitosamente');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      handleOpenSecurity(securityFilter);
    } catch (error) {
      console.error('Error blocking anonymous user:', error);
      setSnackbarMessage('✗ Error al bloquear usuario anónimo');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Desbloquear usuario anónimo
  const handleUnblockAnonUser = async (anonUserId) => {
    if (!anonUserId) return;

    if (!window.confirm(`¿Estás seguro de desbloquear al usuario anónimo ${anonUserId}?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/usuario-anonimo/${anonUserId}/unblock`, {}, { headers: { 'token': token } });
      setSnackbarMessage('✓ Usuario anónimo desbloqueado exitosamente');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      handleOpenSecurity(securityFilter);
    } catch (error) {
      console.error('Error unblocking anonymous user:', error);
      setSnackbarMessage('✗ Error al desbloquear usuario anónimo');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const filteredSecurityData = securityData.filter(record => {
    const anonUserId = record.conversacionAnonima?.usuarioAnonimo?.id_usuario_anonimo;
    const filterLower = securityFilter?.toString().toLowerCase() || '';
    const searchLower = securitySearch?.toString().toLowerCase() || '';

    const matchesFilter = !securityFilter ||
      (record.user_id && record.user_id.toString().includes(securityFilter)) ||
      (anonUserId && anonUserId.toLowerCase().includes(filterLower)) ||
      (securityFilter === '(anónimo)' && !record.user_id && !anonUserId);

    const matchesSearch = !securitySearch ||
      record.action?.toLowerCase().includes(searchLower) ||
      record.ip_address?.toLowerCase().includes(searchLower) ||
      record.browser?.toLowerCase().includes(searchLower) ||
      record.os?.toLowerCase().includes(searchLower) ||
      record.device?.toLowerCase().includes(searchLower) ||
      record.descripcion?.toLowerCase().includes(searchLower);

    return matchesFilter && matchesSearch;
  });

  return (
    <Box>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 3, color: 'primary.main' }}>Gestión de Prompts del Chatbot</Typography>
      {error && (<Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>)}
      {success && (<Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>)}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Buscar Prompts</Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField fullWidth label="Buscar por tipo o descripción" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} />
            <Button variant="contained" startIcon={<Search />} onClick={handleSearch}>Buscar</Button>
          </Box>
          {searchHistory.length > 0 && (<Box><Typography variant="subtitle2" gutterBottom>Búsquedas recientes:</Typography><Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>{searchHistory.map((term, index) => (<Button key={index} size="small" variant="outlined" onClick={() => setSearchTerm(term)}>{term}</Button>))}</Box></Box>)}
        </CardContent>
      </Card>
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button variant="contained" color="primary" startIcon={<Add />} onClick={() => handleOpen()} disabled={loading}>Agregar Prompt</Button>
        <Button variant="outlined" color="secondary" startIcon={<Delete />} onClick={handleClearMemory} disabled={loading}>Limpiar Memoria del Chatbot</Button>
        <Button 
          variant="contained" 
          color="success" 
          startIcon={<PlayArrow />} 
          onClick={handleExecuteSelectedPrompts} 
          disabled={loading || selectedPrompts.size === 0}
        >
          Ejecutar Seleccionados ({selectedPrompts.size})
        </Button>
        <Button 
          variant="contained" 
          color="success" 
          startIcon={<PlayArrow />} 
          onClick={handleExecuteAllPrompts} 
          disabled={loading}
        >
          Ejecutar Todos los Prompts
        </Button>
        <Button 
          variant="outlined" 
          color="info" 
          startIcon={<Security />} 
          onClick={handleOpenSecurity} 
          disabled={loading}
        >
          Ver Información de Seguridad
        </Button>
      </Box>
      {loading ? (<Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress size={60} /></Box>) : (<TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}><Table><TableHead><TableRow sx={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}><TableCell sx={{ color: 'text.primary', fontWeight: 'bold', width: '50px' }}><input type="checkbox" checked={selectedPrompts.size === filteredPrompts.length && filteredPrompts.length > 0} onChange={(e) => handleSelectAll(e.target.checked)} disabled={filteredPrompts.length === 0} title="Seleccionar todos" /></TableCell><TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>ID</TableCell><TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Tipo</TableCell><TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Título</TableCell><TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Descripción</TableCell><TableCell sx={{ color: 'text.primary', fontWeight: 'bold', textAlign: 'center' }}>PDF</TableCell><TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Acciones</TableCell></TableRow></TableHead><TableBody>{filteredPrompts.map((prompt) => {const pdfExists = pdfAvailability[prompt.archivo_pdf]; return (<TableRow key={prompt.id_prompt} hover sx={{ backgroundColor: selectedPrompts.has(prompt.id_prompt) ? '#e3f2fd' : 'inherit' }}><TableCell sx={{ width: '50px', color: 'text.primary' }}><input type="checkbox" checked={selectedPrompts.has(prompt.id_prompt)} onChange={() => handleSelectPrompt(prompt.id_prompt)} title={`Seleccionar prompt ${prompt.id_prompt}`} /></TableCell><TableCell sx={{ color: 'text.primary' }}>{prompt.id_prompt}</TableCell><TableCell sx={{ color: 'text.primary' }}>{prompt.tipo_prompt}</TableCell><TableCell sx={{ color: 'text.primary' }}>{prompt.titulo}</TableCell><TableCell sx={{ color: 'text.primary' }}>{prompt.descripcion}</TableCell><TableCell sx={{ color: 'text.primary', textAlign: 'center' }}>{prompt.archivo_pdf ? (pdfExists ? (<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}><span style={{ fontSize: '16px', color: '#4caf50' }}>✓</span><Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 600 }}>Disponible</Typography></Box>) : (<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}><span style={{ fontSize: '16px', color: '#ff9800' }}>⚠</span><Typography variant="caption" sx={{ color: '#ff9800' }}>No encontrado</Typography></Box>)) : (<Typography variant="caption" sx={{ color: 'text.secondary' }}>—</Typography>)}</TableCell><TableCell sx={{ color: 'text.primary' }}><Box sx={{ display: 'flex', gap: 0.5 }}>{prompt.archivo_pdf && (<IconButton onClick={() => handleDownloadPdf(prompt.archivo_pdf)} title={pdfExists ? `Descargar ${prompt.archivo_pdf}` : 'Archivo no disponible'} color={pdfExists ? 'primary' : 'inherit'} disabled={!pdfExists || loading} size="small"><Download fontSize="small" /></IconButton>)}<IconButton onClick={() => handleActivate(prompt.id_prompt)} title="Activar Prompt" color="primary" disabled={loading} size="small"><PlayArrow fontSize="small" /></IconButton><IconButton onClick={() => handleOpen(prompt)} title="Editar" color="primary" disabled={loading} size="small"><Edit fontSize="small" /></IconButton><IconButton onClick={() => handleDelete(prompt.id_prompt)} title="Eliminar" color="error" disabled={loading} size="small"><Delete fontSize="small" /></IconButton></Box></TableCell></TableRow>)})}</TableBody></Table></TableContainer>)}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ 
          fontWeight: 700, 
          color: 'text.primary',
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0'
        }}>
          {editing ? 'Editar Prompt' : 'Agregar Nuevo Prompt'}
        </DialogTitle>
        <DialogContent sx={{ color: 'text.primary' }}>
          <FormControl fullWidth margin="dense" error={!form.tipo_prompt && open} sx={{ mt: 2 }}>
            <InputLabel sx={{ color: 'text.primary' }}>Tipo de Prompt *</InputLabel>
            <Select
              value={form.tipo_prompt}
              label="Tipo de Prompt *"
              onChange={(e) => {
                console.log('📋 [PROMPTS] MenuItem selected:', e.target.value);
                setForm({ ...form, tipo_prompt: e.target.value });
              }}
              disabled={loading}
              sx={{ color: 'text.primary' }}
            >
              <MenuItem value="">-- Selecciona un tipo --</MenuItem>
              <MenuItem value="instrucciones">Instrucciones</MenuItem>
              <MenuItem value="contexto_pdf">Contexto PDF</MenuItem>
              <MenuItem value="global">Global</MenuItem>
              <MenuItem value="otro">Otro</MenuItem>
            </Select>
            {!form.tipo_prompt && open && <FormHelperText sx={{ color: 'error.main' }}>Selecciona un tipo de prompt</FormHelperText>}
          </FormControl>
          <TextField margin="dense" label="Título" fullWidth value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} disabled={loading} sx={{ '& .MuiOutlinedInput-root': { color: 'text.primary' } }} />
          <TextField margin="dense" label="Descripción" fullWidth multiline rows={3} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} disabled={loading} sx={{ '& .MuiOutlinedInput-root': { color: 'text.primary' } }} />
          <TextField margin="dense" label="Instrucciones" fullWidth multiline rows={4} value={form.instrucciones} onChange={(e) => setForm({ ...form, instrucciones: e.target.value })} disabled={loading} sx={{ '& .MuiOutlinedInput-root': { color: 'text.primary' } }} />
          <Box sx={{ mt: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1, backgroundColor: '#f9f9f9' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                <span style={{ fontSize: '20px' }}>📄</span> Archivo PDF
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', backgroundColor: 'white', px: 1, py: 0.5, borderRadius: 1 }}>
                Opcional
              </Typography>
            </Box>
            
            {form.archivo_pdf && (
              <Box sx={{ mb: 2, p: 2, backgroundColor: 'white', borderRadius: 1, border: pdfAvailability[form.archivo_pdf] ? '2px solid #4caf50' : '2px solid #ff9800', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                  <Box sx={{ fontSize: '20px' }}>
                    {pdfAvailability[form.archivo_pdf] ? '✓' : '⚠'}
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: '600', color: pdfAvailability[form.archivo_pdf] ? '#4caf50' : '#ff9800' }}>
                      {form.archivo_pdf}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>
                      {pdfAvailability[form.archivo_pdf] ? '✓ Archivo disponible' : '⚠ Archivo no encontrado en servidor'}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    size="small" 
                    variant="contained" 
                    color="primary"
                    onClick={() => handleDownloadPdf(form.archivo_pdf)}
                    startIcon={<Download />}
                    disabled={!pdfAvailability[form.archivo_pdf] || loading}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    Descargar
                  </Button>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    color="error"
                    onClick={() => setForm({ ...form, archivo_pdf: '' })}
                    startIcon={<Close />}
                    sx={{ textTransform: 'none' }}
                  >
                    Eliminar
                  </Button>
                </Box>
              </Box>
            )}
            
            <Box sx={{ p: 1.5, backgroundColor: 'white', borderRadius: 1, border: '1px dashed #1976d2' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1, fontWeight: 600 }}>
                {file ? `✓ Nuevo: ${file.name}` : 'Cargar o reemplazar PDF:'}
              </Typography>
              <input 
                type="file" 
                accept=".pdf" 
                onChange={(e) => { 
                  const selectedFile = e.target.files[0]; 
                  setFile(selectedFile);
                  if (selectedFile) {
                    console.log('📋 [PROMPTS] Archivo seleccionado:', selectedFile.name);
                  }
                }} 
                style={{ width: '100%', cursor: 'pointer' }}
                disabled={loading}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
          <Button onClick={handleClose} disabled={loading}>Cancelar</Button>
          <Button onClick={handleSave} color="primary" disabled={loading} variant="contained">{loading ? <CircularProgress size={20} /> : 'Guardar'}</Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog para ver información de Seguridad */}
      <Dialog open={securityOpen} onClose={() => setSecurityOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ 
          fontWeight: 'bold', 
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0',
          py: 2
        }}>
          <Typography 
            variant="h6" 
            component="span"
            sx={{ 
              fontWeight: 700,
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Security sx={{ fontSize: '1.5rem' }} /> 
            Información de Seguridad - Accesos de Usuarios
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                mb: 1.5,
                fontWeight: 600,
                color: 'text.secondary'
              }}
            >
              Filtros de búsqueda
            </Typography>
            <TextField
              fullWidth
              label="Filtrar por Usuario ID (dejar vacío para todos)"
              value={securityFilter}
              onChange={(e) => setSecurityFilter(e.target.value)}
              placeholder="Ej: 123 o (anónimo)"
              size="small"
              variant="outlined"
              margin="dense"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Búsqueda general (IP, acción, navegador, etc.)"
              value={securitySearch}
              onChange={(e) => setSecuritySearch(e.target.value)}
              placeholder="Ej: 192.168 o login"
              size="small"
              variant="outlined"
              margin="dense"
            />
          </Box>
          {securityLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 6, flexDirection: 'column', alignItems: 'center' }}>
              <CircularProgress size={50} sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Cargando información de seguridad...
              </Typography>
            </Box>
          ) : filteredSecurityData.length === 0 ? (
            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                No hay registros de seguridad disponibles {securityFilter && `para el filtro "${securityFilter}"`}
              </Typography>
            </Alert>
          ) : (
            <Box sx={{ mt: 3 }}>
              <Typography 
                variant="subtitle2"
                sx={{ 
                  mb: 2,
                  fontWeight: 600,
                  color: 'text.secondary'
                }}
              >
                {filteredSecurityData.length} registro(s) encontrado(s)
              </Typography>
              <TableContainer sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Table size="small" sx={{ '& tbody tr:hover': { backgroundColor: '#f5f5f5' } }}>
                  <TableHead>
                    <TableRow sx={{ 
                      backgroundColor: '#f5f5f5',
                      '& th': {
                        fontWeight: 700,
                        color: 'text.primary',
                        borderBottom: '2px solid #e0e0e0'
                      }
                    }}>
                      <TableCell>Fecha/Hora</TableCell>
                      <TableCell>Acción</TableCell>
                      <TableCell>Usuario ID</TableCell>
                      <TableCell>IP Address</TableCell>
                      <TableCell>Navegador</TableCell>
                      <TableCell>SO</TableCell>
                      <TableCell>Dispositivo</TableCell>
                      <TableCell align="center">Estado</TableCell>
                      <TableCell>Descripción</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredSecurityData.map((record, index) => (
                      <TableRow key={index} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                        <TableCell sx={{ fontSize: '0.85rem', color: 'text.primary' }}>
                          {new Date(record.createdAt).toLocaleString('es-ES')}
                        </TableCell>
                        <TableCell sx={{ color: 'text.primary' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {record.action}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.85rem', color: 'text.primary' }}>
                          {record.user_id || record.conversacionAnonima?.usuarioAnonimo?.id_usuario_anonimo || '(anónimo)'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'text.primary' }}>
                          {record.ip_address}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.85rem', color: 'text.primary' }}>{record.browser || '-'}</TableCell>
                        <TableCell sx={{ fontSize: '0.85rem', color: 'text.primary' }}>{record.os || '-'}</TableCell>
                        <TableCell sx={{ fontSize: '0.85rem', color: 'text.primary' }}>{record.device || '-'}</TableCell>
                        <TableCell align="center" sx={{ color: 'text.primary' }}>
                          <Box 
                            sx={{ 
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              px: 1.5, 
                              py: 0.5, 
                              borderRadius: 1, 
                              backgroundColor: record.status_code === 200 ? 'success.light' : 'error.light',
                              color: record.status_code === 200 ? 'success.dark' : 'error.dark',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              minWidth: '50px'
                            }}
                          >
                            {record.status_code}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.8rem', color: 'text.primary', maxWidth: '150px' }}>
                          <Typography 
                            variant="caption" 
                            sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                            title={record.descripcion}
                          >
                            {record.descripcion?.substring(0, 50)}...
                          </Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ color: 'text.primary' }}>
                          {(() => {
                            const anonUser = record.conversacionAnonima?.usuarioAnonimo;
                            const registeredUserId = record.user_id;
                            return (registeredUserId || anonUser) ? (
                              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                                {registeredUserId && (
                                  <>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="info"
                                      onClick={() => handleViewUserReport(registeredUserId)}
                                      sx={{ fontSize: '0.7rem' }}
                                    >
                                      Reporte
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="error"
                                      onClick={() => handleBlockUser(registeredUserId)}
                                      startIcon={<Block sx={{ fontSize: '1rem' }} />}
                                      sx={{ fontSize: '0.7rem' }}
                                    >
                                      Bloquear
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="success"
                                      onClick={() => handleUnblockUser(registeredUserId)}
                                      sx={{ fontSize: '0.7rem' }}
                                    >
                                      Desbloquear
                                    </Button>
                                  </>
                                )}

                                {anonUser && (
                                  <>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="info"
                                      onClick={() => handleViewAnonUserReport(anonUser.id_usuario_anonimo, record.id_conversacion_anonima)}
                                      sx={{ fontSize: '0.7rem' }}
                                    >
                                      Reporte
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="error"
                                      onClick={() => handleBlockAnonUser(anonUser.id_usuario_anonimo)}
                                      startIcon={<Block sx={{ fontSize: '1rem' }} />}
                                      sx={{ fontSize: '0.7rem' }}
                                    >
                                      Bloquear
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="success"
                                      onClick={() => handleUnblockAnonUser(anonUser.id_usuario_anonimo)}
                                      sx={{ fontSize: '0.7rem' }}
                                    >
                                      Desbloquear
                                    </Button>
                                  </>
                                )}
                              </Box>
                            ) : null;
                          })()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          p: 2,
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1
        }}>
          <Button 
            onClick={() => setSecurityOpen(false)}
            variant="contained"
            color="primary"
            sx={{ fontWeight: 600 }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para reporte de usuario */}
      <Dialog open={userReportOpen} onClose={() => setUserReportOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ 
          fontWeight: 'bold', 
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0',
          py: 2
        }}>
          <Typography 
            variant="h6" 
            component="span"
            sx={{ 
              fontWeight: 700,
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            📊 Reporte de Usuario - ID: {selectedUser}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {userReportLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 6, flexDirection: 'column', alignItems: 'center' }}>
              <CircularProgress size={50} sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Cargando información del usuario...
              </Typography>
            </Box>
          ) : userReportData ? (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
                Datos del Usuario
              </Typography>
              {userReportData.type === 'registered' ? (
                <Table size="small" sx={{ mb: 3, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <TableBody>
                    <TableRow sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f5f5f5' } }}>
                      <TableCell sx={{ fontWeight: 700, width: '120px' }}>ID:</TableCell>
                      <TableCell>{userReportData.user.id_usuario}</TableCell>
                    </TableRow>
                    <TableRow sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f5f5f5' } }}>
                      <TableCell sx={{ fontWeight: 700 }}>Nombre:</TableCell>
                      <TableCell>{userReportData.user.nombre_usuario}</TableCell>
                    </TableRow>
                    <TableRow sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f5f5f5' } }}>
                      <TableCell sx={{ fontWeight: 700 }}>Apellido:</TableCell>
                      <TableCell>{userReportData.user.apellido_usuario}</TableCell>
                    </TableRow>
                    <TableRow sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f5f5f5' } }}>
                      <TableCell sx={{ fontWeight: 700 }}>Correo:</TableCell>
                      <TableCell sx={{ fontSize: '0.85rem' }}>{userReportData.user.correo_usuario}</TableCell>
                    </TableRow>
                    <TableRow sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f5f5f5' } }}>
                      <TableCell sx={{ fontWeight: 700 }}>Rol:</TableCell>
                      <TableCell>{userReportData.user.rol_usuario}</TableCell>
                    </TableRow>
                    <TableRow sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f5f5f5' } }}>
                      <TableCell sx={{ fontWeight: 700 }}>Estado:</TableCell>
                      <TableCell>
                        <Box 
                          sx={{ 
                            display: 'inline-block',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            backgroundColor: userReportData.user.estado_usuario ? 'success.light' : 'error.light',
                            color: userReportData.user.estado_usuario ? 'success.dark' : 'error.dark',
                            fontWeight: 600,
                            fontSize: '0.85rem'
                          }}
                        >
                          {userReportData.user.estado_usuario ? 'Activo' : 'Bloqueado'}
                        </Box>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              ) : (
                <Table size="small" sx={{ mb: 3, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <TableBody>
                    <TableRow sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f5f5f5' } }}>
                      <TableCell sx={{ fontWeight: 700, width: '120px' }}>ID:</TableCell>
                      <TableCell>{userReportData.user.id_usuario_anonimo}</TableCell>
                    </TableRow>
                    <TableRow sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f5f5f5' } }}>
                      <TableCell sx={{ fontWeight: 700 }}>Nombre:</TableCell>
                      <TableCell>{userReportData.user.nombre}</TableCell>
                    </TableRow>
                    <TableRow sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f5f5f5' } }}>
                      <TableCell sx={{ fontWeight: 700 }}>Cédula:</TableCell>
                      <TableCell>{userReportData.user.cedula}</TableCell>
                    </TableRow>
                    <TableRow sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f5f5f5' } }}>
                      <TableCell sx={{ fontWeight: 700 }}>Estado:</TableCell>
                      <TableCell>
                        <Box 
                          sx={{ 
                            display: 'inline-block',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            backgroundColor: userReportData.user.estado ? 'success.light' : 'error.light',
                            color: userReportData.user.estado ? 'success.dark' : 'error.dark',
                            fontWeight: 600,
                            fontSize: '0.85rem'
                          }}
                        >
                          {userReportData.user.estado ? 'Activo' : 'Bloqueado'}
                        </Box>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}

              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: 'text.primary', mt: 3, mb: 2 }}>
                Estadísticas de Conversaciones
              </Typography>
              <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box 
                    sx={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: 'primary.light',
                      color: 'primary.main',
                      fontWeight: 700,
                      fontSize: '1.25rem'
                    }}
                  >
                    {userReportData.conversations.length}
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Conversaciones Totales
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      En el sistema
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
                Últimas Conversaciones
              </Typography>
              {userReportData.conversations.slice(0, 5).map((conv, index) => (
                <Card key={index} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                      Pregunta:
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1.5, color: 'text.secondary' }}>
                      {conv.mensaje_usuario}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                      Respuesta:
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {conv.respuesta_bot?.substring(0, 100)}...
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                      {new Date(conv.createdAt).toLocaleString('es-ES')}
                    </Typography>
                  </CardContent>
                </Card>
              ))}

              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
                Actividad de Seguridad (Últimas 10)
              </Typography>
              {userReportData.security.slice(0, 10).map((record, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    mb: 1.5, 
                    p: 1.5, 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 1,
                    backgroundColor: '#f9f9f9',
                    '&:hover': { backgroundColor: '#f5f5f5' }
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    <Box component="span" sx={{ display: 'inline-block', mr: 1, px: 1, borderRadius: 0.5, backgroundColor: 'primary.light', color: 'primary.main' }}>
                      {record.action}
                    </Box>
                    {new Date(record.createdAt).toLocaleString('es-ES')}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    IP: <code>{record.ip_address}</code> | {record.browser} | {record.os}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Alert severity="error" sx={{ my: 2 }}>
              <Typography variant="body2">
                Error al cargar datos del reporte
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          p: 2,
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1
        }}>
          <Button 
            onClick={() => setUserReportOpen(false)}
            variant="contained"
            color="primary"
            sx={{ fontWeight: 600 }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%', fontSize: '0.95rem', fontWeight: 600 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Prompts;
