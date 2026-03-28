// HistorialChat.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../services/apiConfig';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Box,
  Alert,
  Card,
  CardContent,
  TextField,
  Button,
  Chip,
  Checkbox,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Snackbar,
} from '@mui/material';
import {
  Search,
  History,
  Chat,
  Send,
  Delete,
  Edit,
  SelectAll,
  Clear,
  Send as SendIcon,
  SendOutlined,
  Block,
  Security,
} from '@mui/icons-material';
import { getCurrentUserId } from '../utils/userUtils';
import { usarConversacionEspecifico } from '../services/chatbotAdminServices';

const HistorialChat = () => {
  const [conversaciones, setConversaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [sendingToIA, setSendingToIA] = useState(false);
  const [selectedConversaciones, setSelectedConversaciones] = useState([]);
  const [editDialog, setEditDialog] = useState({ open: false, conversacion: null });
  const [editForm, setEditForm] = useState({ mensaje_usuario: '', respuesta_bot: '' });
  const [chatModal, setChatModal] = useState({ open: false, conversacion: null });
  const [chatMensaje, setChatMensaje] = useState('');
  const [chatRespuesta, setChatRespuesta] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [groupedConversations, setGroupedConversations] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [userConversaciones, setUserConversaciones] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [locationData, setLocationData] = useState({});
  const [locationLoading, setLocationLoading] = useState({});
  const [securityDialog, setSecurityDialog] = useState({ open: false, userData: null });

  useEffect(() => {
    fetchConversaciones();
    loadSearchHistory();
  }, []);

  const fetchConversaciones = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/chatcliente/conversacion`, {
        headers: { 'token': token }
      });
      
      console.log('Datos de conversaciones:', response.data.slice(0, 3)); // Ver primeros 3 registros
      
      // Agrupar conversaciones por usuario
      const grouped = response.data.reduce((acc, conv) => {
        const userId = conv.id_usuario || 'visitante';
        const userName = conv.usuario ? `${conv.usuario.nombre_usuario} ${conv.usuario.apellido_usuario}` : 'Usuario Visitante';
        const userKey = `${userId}-${userName}`;
        
        if (!acc[userKey]) {
          acc[userKey] = {
            userId,
            userName,
            ip: null,
            conversations: []
          };
        }
        acc[userKey].conversations.push(conv);
        return acc;
      }, {});
      
      // Obtener una IP válida para cada usuario (buscar la IP más reciente)
      Object.keys(grouped).forEach((userKey) => {
        for (let conv of grouped[userKey].conversations) {
          if (conv.ip_usuario) {
            grouped[userKey].ip = conv.ip_usuario;
            console.log(`IP encontrada para ${userKey}: ${conv.ip_usuario}`);
            break;
          }
        }
        if (!grouped[userKey].ip) {
          console.log(`No se encontró IP para ${userKey}`);
        }
      });
      
      console.log('Usuarios agrupados:', Object.keys(grouped).map(key => ({
        user: key,
        ip: grouped[key].ip,
        conversations: grouped[key].conversations.length
      })));
      
      setConversaciones(response.data);
      setGroupedConversations(grouped);
      setError(null);
      
      // Cargar ubicaciones para todas las IPs disponibles
      const uniqueIPs = [...new Set(Object.values(grouped).map(user => user.ip).filter(ip => ip))];
      uniqueIPs.forEach(ip => getLocationFromIP(ip));
    } catch (error) {
      console.error('Error fetching conversaciones:', error);
      setError('Error al cargar el historial de conversaciones');
    } finally {
      setLoading(false);
    }
  };

  const loadSearchHistory = () => {
    const history = JSON.parse(localStorage.getItem('chatSearchHistory') || '[]');
    setSearchHistory(history);
  };

  const saveSearchHistory = (term) => {
    if (term.trim()) {
      const history = JSON.parse(localStorage.getItem('chatSearchHistory') || '[]');
      const updatedHistory = [term, ...history.filter(h => h !== term)].slice(0, 10); // Máximo 10 búsquedas
      localStorage.setItem('chatSearchHistory', JSON.stringify(updatedHistory));
      setSearchHistory(updatedHistory);
    }
  };

  const getLocationFromIP = async (ip) => {
    if (!ip || locationData[ip]) return locationData[ip];
    
    setLocationLoading(prev => ({ ...prev, [ip]: true }));
    try {
      const response = await axios.get(`https://ipapi.co/${ip}/json/`);
      const location = `${response.data.city || 'Desconocida'}, ${response.data.country_name || 'Desconocido'}`;
      setLocationData(prev => ({ ...prev, [ip]: location }));
      return location;
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      const location = 'Ubicación no disponible';
      setLocationData(prev => ({ ...prev, [ip]: location }));
      return location;
    } finally {
      setLocationLoading(prev => ({ ...prev, [ip]: false }));
    }
  };

  const handleSearch = () => {
    saveSearchHistory(searchTerm);
  };

  const handleSelectUser = (userKey) => {
    const userData = groupedConversations[userKey];
    setSelectedUser(userData);
    setUserConversaciones(userData.conversations);
  };

  const handleEnviarAI = async () => {
    const convsToSend = selectedUser ? userConversaciones : conversaciones;
    if (convsToSend.length === 0) {
      alert('No hay conversaciones para enviar a la IA');
      return;
    }

    if (!window.confirm(`¿Estás seguro de enviar ${convsToSend.length} conversaciones a la base de conocimiento de la IA? Esto mejorará las respuestas futuras del chatbot.`)) {
      return;
    }

    try {
      setSendingToIA(true);
      const token = localStorage.getItem('token');

      // Procesar cada conversación
      for (const conv of convsToSend) {
        await axios.post(`${API_URL}/chatcliente/conocimiento`, {
          tema_principal: 'historial_conversaciones',
          pregunta_frecuente: conv.mensaje_usuario,
          respuesta_oficial: conv.respuesta_bot,
          fuente_verificacion: 'historial_chat_usuario',
          nivel_prioridad: 2, // Prioridad media
          estado_vigencia: true,
          id_conversacion: conv.id_conversacion
        }, {
          headers: { 'token': token }
        });
      }

      alert(`¡Éxito! ${convsToSend.length} conversaciones enviadas a la base de conocimiento. La IA se entrenará automáticamente con esta información.`);

      // Después de enviar, generar embeddings para las nuevas entradas
      await axios.post(`${API_URL}/chatcliente/conocimiento/generate-embeddings`, {}, {
        headers: { 'token': token }
      });

    } catch (error) {
      console.error('Error enviando conversaciones a IA:', error);
      alert('Error al enviar conversaciones a la IA. Revisa la consola para más detalles.');
    } finally {
      setSendingToIA(false);
    }
  };

  // Funciones CRUD
  const handleSelectConversacion = (id) => {
    setSelectedConversaciones(prev =>
      prev.includes(id)
        ? prev.filter(convId => convId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedConversaciones.length === filteredConversaciones.length) {
      setSelectedConversaciones([]);
    } else {
      setSelectedConversaciones(filteredConversaciones.map(conv => conv.id_conversacion));
    }
  };

  const handleEnviarSeleccionadasAI = async () => {
    if (selectedConversaciones.length === 0) {
      alert('Selecciona al menos una conversación para enviar a la IA');
      return;
    }

    if (!window.confirm(`¿Estás seguro de enviar ${selectedConversaciones.length} conversaciones seleccionadas a la base de conocimiento de la IA?`)) {
      return;
    }

    try {
      setSendingToIA(true);
      const token = localStorage.getItem('token');

      const conversacionesSeleccionadas = selectedUser 
        ? userConversaciones.filter(conv => selectedConversaciones.includes(conv.id_conversacion))
        : conversaciones.filter(conv => selectedConversaciones.includes(conv.id_conversacion));

      for (const conv of conversacionesSeleccionadas) {
        await axios.post(`${API_URL}/chatcliente/conocimiento`, {
          tema_principal: 'historial_conversaciones',
          pregunta_frecuente: conv.mensaje_usuario,
          respuesta_oficial: conv.respuesta_bot,
          fuente_verificacion: 'historial_chat_usuario',
          nivel_prioridad: 2,
          estado_vigencia: true,
          id_conversacion: conv.id_conversacion
        }, {
          headers: { 'token': token }
        });
      }

      alert(`¡Éxito! ${selectedConversaciones.length} conversaciones enviadas a la base de conocimiento.`);

      // Generar embeddings
      await axios.post(`${API_URL}/chatcliente/conocimiento/generate-embeddings`, {}, {
        headers: { 'token': token }
      });

      setSelectedConversaciones([]);

    } catch (error) {
      console.error('Error enviando conversaciones seleccionadas:', error);
      alert('Error al enviar conversaciones a la IA.');
    } finally {
      setSendingToIA(false);
    }
  };

  const handleEliminarSeleccionadas = async (idsToDelete = selectedConversaciones) => {
    if (idsToDelete.length === 0) {
      alert('Selecciona al menos una conversación para eliminar');
      return;
    }

    if (!window.confirm(`¿Estás seguro de eliminar ${idsToDelete.length} conversaciones? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      for (const id of idsToDelete) {
        await axios.delete(`${API_URL}/chatcliente/conversacion/${id}`, {
          headers: { 'token': token }
        });
      }

      alert(`¡Éxito! ${idsToDelete.length} conversaciones eliminadas.`);
      setSelectedConversaciones([]);
      fetchConversaciones();

    } catch (error) {
      console.error('Error eliminando conversaciones:', error);
      alert('Error al eliminar conversaciones.');
    }
  };

  const handleEditarConversacion = (conversacion) => {
    setEditForm({
      mensaje_usuario: conversacion.mensaje_usuario,
      respuesta_bot: conversacion.respuesta_bot
    });
    setEditDialog({ open: true, conversacion });
  };

  const handleGuardarEdicion = async () => {
    try {
      const token = localStorage.getItem('token');

      await axios.put(`${API_URL}/chatcliente/conversacion/${editDialog.conversacion.id_conversacion}`, {
        mensaje_usuario: editForm.mensaje_usuario,
        respuesta_bot: editForm.respuesta_bot
      }, {
        headers: { 'token': token }
      });

      alert('Conversación actualizada exitosamente.');
      setEditDialog({ open: false, conversacion: null });
      fetchConversaciones();

    } catch (error) {
      console.error('Error actualizando conversación:', error);
      alert('Error al actualizar la conversación.');
    }
  };

  // Funciones de bloqueo
  const handleBlockUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/chatcliente/seguridad/block-user`, { userId }, { headers: { 'token': token } });
      setSnackbarMessage('✓ Usuario bloqueado exitosamente');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      fetchConversaciones();
    } catch (error) {
      console.error('Error bloqueando usuario:', error);
      setSnackbarMessage('✗ Error al bloquear usuario');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/chatcliente/seguridad/unblock-user`, { userId }, { headers: { 'token': token } });
      setSnackbarMessage('✓ Usuario desbloqueado exitosamente');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      fetchConversaciones();
    } catch (error) {
      console.error('Error desbloqueando usuario:', error);
      setSnackbarMessage('✗ Error al desbloquear usuario');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleBlockIp = async (ip) => {
    if (!ip) {
      setSnackbarMessage('⚠️ No se encontró IP para este usuario');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/chatcliente/seguridad/block-ip`, { ip }, { headers: { 'token': token } });
      setSnackbarMessage('✓ IP bloqueada exitosamente');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      fetchConversaciones();
    } catch (error) {
      console.error('Error bloqueando IP:', error);
      setSnackbarMessage('✗ Error al bloquear IP');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleUnblockIp = async (ip) => {
    if (!ip) {
      setSnackbarMessage('⚠️ No se encontró IP para este usuario');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/chatcliente/seguridad/unblock-ip`, { ip }, { headers: { 'token': token } });
      setSnackbarMessage('✓ IP desbloqueada exitosamente');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      fetchConversaciones();
    } catch (error) {
      console.error('Error desbloqueando IP:', error);
      setSnackbarMessage('✗ Error al desbloquear IP');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleEnviarIndividualAI = async (conversacion) => {
    if (!window.confirm('¿Enviar esta conversación a la base de conocimiento de la IA?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      await axios.post(`${API_URL}/chatcliente/conocimiento`, {
        tema_principal: 'historial_conversaciones',
        pregunta_frecuente: conversacion.mensaje_usuario,
        respuesta_oficial: conversacion.respuesta_bot,
        fuente_verificacion: 'historial_chat_usuario',
        nivel_prioridad: 2,
        estado_vigencia: true,
        id_conversacion: conversacion.id_conversacion
      }, {
        headers: { 'token': token }
      });

      alert('Conversación enviada a la base de conocimiento.');

      // Generar embeddings
      await axios.post(`${API_URL}/chatcliente/conocimiento/generate-embeddings`, {}, {
        headers: { 'token': token }
      });

    } catch (error) {
      console.error('Error enviando conversación individual:', error);
      alert('Error al enviar conversación a la IA.');
    }
  };

  const handleEnviarMensajeChat = async () => {
    if (!chatMensaje.trim()) {
      alert('Por favor ingresa un mensaje para consultar');
      return;
    }

    try {
      setChatLoading(true);
      const response = await usarConversacionEspecifico(chatModal.conversacion.id_conversacion, chatMensaje);
      setChatRespuesta(response.data.respuesta);
    } catch (error) {
      console.error('Error consultando con conversación específica:', error);
      alert('Error al consultar con la conversación específica: ' + error.message);
    } finally {
      setChatLoading(false);
    }
  };

  const filteredConversaciones = conversaciones.filter(conv =>
    conv.mensaje_usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.respuesta_bot.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Typography
        variant="h5"
        component="h2"
        sx={{
          fontWeight: 'bold',
          mb: 3,
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <History />
        Historial de Conversaciones del Chatbot
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Sección de Búsqueda */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Buscar en Conversaciones
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="Buscar en mensajes del usuario o respuestas del bot"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button
              variant="contained"
              startIcon={<Search />}
              onClick={handleSearch}
            >
              Buscar
            </Button>
          </Box>

          {searchHistory.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Búsquedas recientes:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {searchHistory.map((term, index) => (
                  <Button
                    key={index}
                    size="small"
                    variant="outlined"
                    onClick={() => setSearchTerm(term)}
                  >
                    {term}
                  </Button>
                ))}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas y Acciones */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Chip
          label={`Total Usuarios: ${Object.keys(groupedConversations).length}`}
          color="primary"
          variant="outlined"
        />
        <Chip
          label={`Total Conversaciones: ${conversaciones.length}`}
          color="secondary"
          variant="outlined"
        />
        {selectedUser && (
          <Chip
            label={`Usuario Seleccionado: ${selectedUser.userName} (${userConversaciones.length} conv.)`}
            color="info"
            variant="outlined"
            onDelete={() => setSelectedUser(null)}
          />
        )}
      </Box>

      {/* Tabla de Usuarios */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress size={60} />
        </Box>
      ) : selectedUser ? (
        // Mostrar conversaciones del usuario seleccionado
        <Box>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Conversaciones de {selectedUser.userName} (ID: {selectedUser.userId})
            </Typography>
            <Button variant="outlined" onClick={() => setSelectedUser(null)}>
              Volver a Usuarios
            </Button>
          </Box>
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                  <TableCell sx={{ color: 'text.primary', fontWeight: 'bold', width: 50 }}>
                    <Checkbox
                      checked={selectedConversaciones.length === userConversaciones.length && userConversaciones.length > 0}
                      indeterminate={selectedConversaciones.length > 0 && selectedConversaciones.length < userConversaciones.length}
                      onChange={() => {
                        if (selectedConversaciones.length === userConversaciones.length) {
                          setSelectedConversaciones([]);
                        } else {
                          setSelectedConversaciones(userConversaciones.map(conv => conv.id_conversacion));
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Mensaje Usuario</TableCell>
                  <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Respuesta Bot</TableCell>
                  <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Fecha</TableCell>
                  <TableCell sx={{ color: 'text.primary', fontWeight: 'bold', width: 150 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userConversaciones.map((conv) => (
                  <TableRow key={conv.id_conversacion} hover>
                    <TableCell>
                      <Checkbox
                        checked={selectedConversaciones.includes(conv.id_conversacion)}
                        onChange={() => handleSelectConversacion(conv.id_conversacion)}
                      />
                    </TableCell>
                    <TableCell>{conv.id_conversacion}</TableCell>
                    <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <Tooltip title={conv.mensaje_usuario}>
                        <span>{conv.mensaje_usuario}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <Tooltip title={conv.respuesta_bot}>
                        <span>{conv.respuesta_bot}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{new Date(conv.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Enviar a IA">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleEnviarIndividualAI(conv)}
                            disabled={sendingToIA}
                          >
                            <Send fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditarConversacion(conv)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              if (window.confirm('¿Eliminar esta conversación?')) {
                                handleEliminarSeleccionadas([conv.id_conversacion]);
                              }
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ) : (
        // Mostrar lista de usuarios
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Usuario</TableCell>
                <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>ID Usuario</TableCell>
                <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Ubicación</TableCell>
                <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Total Conversaciones</TableCell>
                <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Última Conversación</TableCell>
                <TableCell sx={{ color: 'text.primary', fontWeight: 'bold', width: 300 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.keys(groupedConversations).map((userKey) => {
                const userData = groupedConversations[userKey];
                const lastConv = userData.conversations[0]; // Ya ordenadas por fecha DESC
                return (
                  <TableRow key={userKey} hover>
                    <TableCell>{userData.userName}</TableCell>
                    <TableCell>{userData.userId}</TableCell>
                    <TableCell>
                      {userData.ip ? (
                        locationLoading[userData.ip] ? (
                          <CircularProgress size={20} />
                        ) : (
                          <span>{locationData[userData.ip] || 'Cargando...'}</span>
                        )
                      ) : (
                        'Sin IP disponible'
                      )}
                    </TableCell>
                    <TableCell>{userData.conversations.length}</TableCell>
                    <TableCell>{new Date(lastConv.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleSelectUser(userKey)}
                        >
                          Ver Conversaciones
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="info"
                          onClick={() => setSecurityDialog({ open: true, userData })}
                        >
                          Ver Información
                        </Button>
                        {userData.userId !== 'visitante' && (
                          <>
                            <Tooltip title="Bloquear Usuario">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleBlockUser(userData.userId)}
                              >
                                <Block fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Desbloquear Usuario">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleUnblockUser(userData.userId)}
                              >
                                <Security fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        {userData.ip ? (
                          <>
                            <Tooltip title="Bloquear IP">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleBlockIp(userData.ip)}
                              >
                                <Block fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Desbloquear IP">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleUnblockIp(userData.ip)}
                              >
                                <Security fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : (
                          <Tooltip title="No hay IP disponible para este usuario">
                            <IconButton
                              size="small"
                              disabled
                            >
                              <Block fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Diálogo de Edición */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, conversacion: null })} maxWidth="md" fullWidth>
        <DialogTitle>Editar Conversación</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Mensaje del Usuario"
              multiline
              rows={3}
              fullWidth
              value={editForm.mensaje_usuario}
              onChange={(e) => setEditForm(prev => ({ ...prev, mensaje_usuario: e.target.value }))}
            />
            <TextField
              label="Respuesta del Bot"
              multiline
              rows={5}
              fullWidth
              value={editForm.respuesta_bot}
              onChange={(e) => setEditForm(prev => ({ ...prev, respuesta_bot: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, conversacion: null })}>
            Cancelar
          </Button>
          <Button onClick={handleGuardarEdicion} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Chat con Conversación Específica */}
      <Dialog
        open={chatModal.open}
        onClose={() => setChatModal({ open: false, conversacion: null })}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            height: '80vh',
            maxHeight: '600px'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chat color="primary" />
          Consultar con Conversación Específica
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
            {/* Información de la conversación utilizada */}
            {chatModal.conversacion && (
              <Card sx={{ backgroundColor: 'grey.50', border: '1px solid', borderColor: 'primary.light' }}>
                <CardContent sx={{ pb: 2 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Conversación utilizada como conocimiento:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Usuario: {chatModal.conversacion.mensaje_usuario}
                  </Typography>
                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                    Bot: {chatModal.conversacion.respuesta_bot}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Campo de entrada para la consulta */}
            <TextField
              label="Escribe tu consulta usando esta conversación como referencia"
              multiline
              rows={3}
              fullWidth
              value={chatMensaje}
              onChange={(e) => setChatMensaje(e.target.value)}
              placeholder="Ej: ¿Cómo puedo aplicar esta solución a mi caso?"
              disabled={chatLoading}
            />

            <Button
              variant="contained"
              onClick={handleEnviarMensajeChat}
              disabled={!chatMensaje.trim() || chatLoading}
              startIcon={chatLoading ? <CircularProgress size={20} /> : <Send />}
              sx={{ alignSelf: 'flex-start' }}
            >
              {chatLoading ? 'Consultando...' : 'Enviar Consulta'}
            </Button>

            {/* Respuesta del chat */}
            {chatRespuesta && (
              <Card sx={{ backgroundColor: 'success.light', border: '1px solid', borderColor: 'success.main' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="success.dark" gutterBottom>
                    Respuesta de la IA (con conocimiento específico):
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {chatRespuesta}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChatModal({ open: false, conversacion: null })}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Información de Seguridad Completa */}
      <Dialog 
        open={securityDialog.open} 
        onClose={() => setSecurityDialog({ open: false, userData: null })} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
          Información Completa de Seguridad - {securityDialog.userData?.userName}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {securityDialog.userData && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Información Básica */}
              <Card sx={{ border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Información Básica
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">ID Usuario</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{securityDialog.userData.userId}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Tipo de Usuario</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {securityDialog.userData.userId === 'visitante' ? 'Usuario Visitante' : 'Usuario Registrado'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Total de Conversaciones</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{securityDialog.userData.conversations.length}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Información de Red */}
              <Card sx={{ border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Información de Red y Ubicación
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Dirección IP</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                        {securityDialog.userData.ip || 'No disponible'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Ubicación Geográfica</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {securityDialog.userData.ip ? 
                          (locationLoading[securityDialog.userData.ip] ? 
                            <CircularProgress size={16} /> : 
                            (locationData[securityDialog.userData.ip] || 'Cargando...')) : 
                          'No disponible'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Estadísticas de Conversaciones */}
              <Card sx={{ border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Estadísticas de Conversaciones
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Primera Conversación</Typography>
                      <Typography variant="body2">
                        {new Date(securityDialog.userData.conversations[securityDialog.userData.conversations.length - 1]?.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Última Conversación</Typography>
                      <Typography variant="body2">
                        {new Date(securityDialog.userData.conversations[0]?.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Conversaciones en las últimas 24h</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {securityDialog.userData.conversations.filter(conv => {
                          const convDate = new Date(conv.createdAt);
                          const yesterday = new Date();
                          yesterday.setDate(yesterday.getDate() - 1);
                          return convDate > yesterday;
                        }).length}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Acciones de Seguridad */}
              <Card sx={{ border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Acciones de Seguridad Disponibles
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {securityDialog.userData.userId !== 'visitante' && (
                      <>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<Block />}
                          onClick={() => {
                            handleBlockUser(securityDialog.userData.userId);
                            setSecurityDialog({ open: false, userData: null });
                          }}
                        >
                          Bloquear Usuario
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="success"
                          startIcon={<Security />}
                          onClick={() => {
                            handleUnblockUser(securityDialog.userData.userId);
                            setSecurityDialog({ open: false, userData: null });
                          }}
                        >
                          Desbloquear Usuario
                        </Button>
                      </>
                    )}
                    {securityDialog.userData.ip && (
                      <>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<Block />}
                          onClick={() => {
                            handleBlockIp(securityDialog.userData.ip);
                            setSecurityDialog({ open: false, userData: null });
                          }}
                        >
                          Bloquear IP
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="success"
                          startIcon={<Security />}
                          onClick={() => {
                            handleUnblockIp(securityDialog.userData.ip);
                            setSecurityDialog({ open: false, userData: null });
                          }}
                        >
                          Desbloquear IP
                        </Button>
                      </>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSecurityDialog({ open: false, userData: null })}>
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

export default HistorialChat;