import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../../../services/apiConfig';
import { getUsuariosAnonimos, createUsuarioAnonimo, updateUsuarioAnonimo, deleteUsuarioAnonimo } from '../../../../services/chatbotAdminServices';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Card, CardContent } from '@mui/material';
import './UsuariosAnonimosTable.css';

const UsuariosAnonimosTable = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', cedula: '' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [userConversations, setUserConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [locationData, setLocationData] = useState({});
  const [locationLoading, setLocationLoading] = useState({});
  const [securityDialog, setSecurityDialog] = useState({ open: false, userData: null });

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const response = await getUsuariosAnonimos();
      const records = Array.isArray(response) ? response : (response?.data || response?.usuarios || []);
      setUsuarios(records);
      
      // Cargar ubicaciones para usuarios con IP
      records.forEach(user => {
        if (user.ip_usuario) {
          getLocationFromIP(user.ip_usuario);
        }
      });
    } catch (err) {
      setError(err?.message || 'Error al cargar los usuarios');
      console.error('Error cargando usuarios visitantes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await createUsuarioAnonimo(formData);
      setFormData({ nombre: '', cedula: '' });
      loadUsuarios();
    } catch (err) {
      alert('Error al crear usuario');
      console.error(err);
    }
  };

  const handleUpdate = async () => {
    try {
      await updateUsuarioAnonimo(editingUser.id_usuario_anonimo, formData);
      setEditingUser(null);
      setFormData({ nombre: '', cedula: '' });
      loadUsuarios();
    } catch (err) {
      alert('Error al actualizar usuario');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await deleteUsuarioAnonimo(id);
        loadUsuarios();
      } catch (err) {
        alert('Error al eliminar usuario');
        console.error(err);
      }
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({ nombre: user.nombre, cedula: user.cedula });
  };

  const handleCancel = () => {
    setEditingUser(null);
    setFormData({ nombre: '', cedula: '' });
  };

  const handleViewConversations = async (user) => {
    setSelectedUser(user);
    setConversationsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_URL}/chatcliente/conversacion-anonima?usuario=${user.id_usuario_anonimo}`, {
        headers: { 'token': token }
      });
      setUserConversations(response.data);
    } catch (err) {
      console.error('Error cargando conversaciones:', err);
      alert('Error al cargar conversaciones');
    } finally {
      setConversationsLoading(false);
    }
  };

  const handleBackToUsers = () => {
    setSelectedUser(null);
    setUserConversations([]);
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

  const handleBlockAnonUser = async (userId) => {
    if (!window.confirm(`¿Bloquear usuario visitante ${userId}?`)) return;
    try {
      const token = localStorage.getItem('auth_token');
      await axios.post(`${API_URL}/chatcliente/usuario-anonimo/block`, { userId }, { headers: { 'token': token } });
      alert('Usuario bloqueado');
      loadUsuarios();
    } catch (err) {
      alert('Error al bloquear');
      console.error(err);
    }
  };

  const handleUnblockAnonUser = async (userId) => {
    if (!window.confirm(`¿Desbloquear usuario visitante ${userId}?`)) return;
    try {
      const token = localStorage.getItem('auth_token');
      await axios.post(`${API_URL}/chatcliente/usuario-anonimo/unblock`, { userId }, { headers: { 'token': token } });
      alert('Usuario desbloqueado');
      loadUsuarios();
    } catch (err) {
      alert('Error al desbloquear');
      console.error(err);
    }
  };

  if (loading) return <div>Cargando usuarios...</div>;
  if (error) return <div>{error}</div>;

  const isArray = Array.isArray(usuarios);

  return (
    <div className="usuarios-anonimos-table">
      <h2>Usuarios Visitantes</h2>
      {!isArray ? (
        <div className="error-message">Respuesta inesperada del servidor. Intenta recargar.</div>
      ) : usuarios.length === 0 ? (
        <div>No hay usuarios registrados.</div>
      ) : null}

      <div className="form-container">
        <h3>{editingUser ? 'Editar Usuario' : 'Crear Usuario'}</h3>
        <div className="form-group">
          <label>Nombre:</label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) => setFormData({...formData, nombre: e.target.value})}
            placeholder="Nombre del usuario"
          />
        </div>
        <div className="form-group">
          <label>Cédula:</label>
          <input
            type="text"
            value={formData.cedula}
            onChange={(e) => setFormData({...formData, cedula: e.target.value})}
            placeholder="Número de cédula"
          />
        </div>
        <div className="form-actions">
          {editingUser ? (
            <>
              <button onClick={handleUpdate}>Actualizar</button>
              <button onClick={handleCancel}>Cancelar</button>
            </>
          ) : (
            <button onClick={handleCreate}>Crear</button>
          )}
        </div>
      </div>

      {selectedUser ? (
        <div>
          <h3>Conversaciones de {selectedUser.nombre}</h3>
          <button onClick={handleBackToUsers}>Volver a Usuarios</button>
          {conversationsLoading ? (
            <div>Cargando conversaciones...</div>
          ) : userConversations.length === 0 ? (
            <div>No hay conversaciones para este usuario.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID Conversación</th>
                  <th>Mensaje Usuario</th>
                  <th>Respuesta Bot</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {userConversations.map(conv => (
                  <tr key={conv.id_conversacion_anonima}>
                    <td>{conv.id_conversacion_anonima}</td>
                    <td>{conv.mensaje_usuario}</td>
                    <td>{conv.respuesta_bot}</td>
                    <td>{new Date(conv.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Cédula</th>
              <th>Ubicación</th>
              <th>Fecha Creación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(usuario => (
              <tr key={usuario.id_usuario_anonimo}>
                <td>{usuario.id_usuario_anonimo}</td>
                <td>{usuario.nombre}</td>
                <td>{usuario.cedula}</td>
                <td>
                  {usuario.ip_usuario ? (
                    locationLoading[usuario.ip_usuario] ? (
                      <span>Cargando...</span>
                    ) : (
                      <span>{locationData[usuario.ip_usuario] || 'Cargando...'}</span>
                    )
                  ) : (
                    'Sin IP disponible'
                  )}
                </td>
                <td>{(usuario.fecha_registro || usuario.created_at || usuario.fecha_creacion) ? new Date(usuario.fecha_registro || usuario.created_at || usuario.fecha_creacion).toLocaleDateString() : '-'}</td>
                <td>
                  <button onClick={() => handleEdit(usuario)}>Editar</button>
                  <button onClick={() => handleDelete(usuario.id_usuario_anonimo)}>Eliminar</button>
                  <button onClick={() => handleViewConversations(usuario)}>Ver Conversaciones</button>
                  <button onClick={() => setSecurityDialog({ open: true, userData: usuario })}>Ver Información</button>
                  <button onClick={() => handleBlockAnonUser(usuario.id_usuario_anonimo)}>Bloquear</button>
                  <button onClick={() => handleUnblockAnonUser(usuario.id_usuario_anonimo)}>Desbloquear</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Diálogo de Información de Seguridad Completa */}
      <Dialog 
        open={securityDialog.open} 
        onClose={() => setSecurityDialog({ open: false, userData: null })} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
          Información Completa de Seguridad - {securityDialog.userData?.nombre}
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
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{securityDialog.userData.id_usuario_anonimo}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Tipo de Usuario</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Usuario Visitante</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Nombre</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{securityDialog.userData.nombre}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Cédula</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{securityDialog.userData.cedula}</Typography>
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
                        {securityDialog.userData.ip_usuario || 'No disponible'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Ubicación Geográfica</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {securityDialog.userData.ip_usuario ? 
                          (locationLoading[securityDialog.userData.ip_usuario] ? 
                            'Cargando...' : 
                            (locationData[securityDialog.userData.ip_usuario] || 'Cargando...')) : 
                          'No disponible'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Información de Registro */}
              <Card sx={{ border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Información de Registro
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Fecha de Registro</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {(securityDialog.userData.fecha_registro || securityDialog.userData.created_at || securityDialog.userData.fecha_creacion) ? 
                          new Date(securityDialog.userData.fecha_registro || securityDialog.userData.created_at || securityDialog.userData.fecha_creacion).toLocaleString() : 
                          'No disponible'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Estado</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {securityDialog.userData.estado || 'Activo'}
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
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => {
                        handleBlockAnonUser(securityDialog.userData.id_usuario_anonimo);
                        setSecurityDialog({ open: false, userData: null });
                      }}
                    >
                      Bloquear Usuario
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="success"
                      onClick={() => {
                        handleUnblockAnonUser(securityDialog.userData.id_usuario_anonimo);
                        setSecurityDialog({ open: false, userData: null });
                      }}
                    >
                      Desbloquear Usuario
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        handleViewConversations(securityDialog.userData);
                        setSecurityDialog({ open: false, userData: null });
                      }}
                    >
                      Ver Conversaciones
                    </Button>
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
    </div>
  );
};

export default UsuariosAnonimosTable;