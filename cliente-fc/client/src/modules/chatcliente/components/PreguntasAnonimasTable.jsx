import React, { useState, useEffect } from 'react';
import {
  getConversacionesAnonimas,
  createConocimiento
} from '../../../services/chatbotAdminServices';
import axios from 'axios';
import { API_URL } from '../../../services/apiConfig';
import './PreguntasAnonimasTable.css';

const PreguntasAnonimasTable = () => {
  const [conversaciones, setConversaciones] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cedulaFilter, setCedulaFilter] = useState('');
  const [nombreFilter, setNombreFilter] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({ cedula: '', nombre: '' });
  const [sendingIds, setSendingIds] = useState(new Set());
  const [selectedUser, setSelectedUser] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    fetchConversaciones();
  }, []);

  const fetchConversaciones = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getConversacionesAnonimas();
      const records = Array.isArray(response) ? response : response?.data || [];

      setConversaciones(records);
      setSelectedItems([]);
    } catch (err) {
      setError(err?.message || 'Error al cargar las conversaciones');
      console.error('Error cargando conversaciones anónimas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setAppliedFilters({ cedula: cedulaFilter, nombre: nombreFilter });
    fetchConversaciones();
  };

  const filteredConversaciones = conversaciones.filter((c) => {
    const cedula = c.cedula ? String(c.cedula) : '';
    const nombre = c.nombre ? String(c.nombre).toLowerCase() : '';

    const matchesCedula = !appliedFilters.cedula || cedula.includes(appliedFilters.cedula);
    const matchesNombre = !appliedFilters.nombre || nombre.includes(appliedFilters.nombre.toLowerCase());

    const isMissingUserInfo = !cedula && !nombre;

    return (matchesCedula && matchesNombre) || isMissingUserInfo;
  });

  // Agrupar conversaciones por usuario
  const groupedByUser = filteredConversaciones.reduce((acc, conv) => {
    const userKey = `${conv.nombre || '(sin nombre)'}_${conv.cedula || '(sin cédula)'}`;
    if (!acc[userKey]) {
      acc[userKey] = {
        nombre: conv.nombre || '(sin nombre)',
        cedula: conv.cedula || '(sin cédula)',
        ip: conv.ip_usuario || null,
        conversaciones: []
      };
    }
    // Actualizar IP si está disponible y aún no la tenemos
    if (!acc[userKey].ip && conv.ip_usuario) {
      acc[userKey].ip = conv.ip_usuario;
    }
    acc[userKey].conversaciones.push(conv);
    return acc;
  }, {});

  const usersList = Object.values(groupedByUser);

  const handleSelectRow = (id) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const handleSelectAll = () => {
    const currentConversations = selectedUser 
      ? selectedUser.conversaciones 
      : filteredConversaciones;
    
    if (selectedItems.length === currentConversations.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentConversations.map((c) => c.id_conversacion_anonima));
    }
  };

  const handleAlimentarIA = async (itemIds = selectedItems) => {
    if (!itemIds || itemIds.length === 0) {
      alert('Selecciona al menos una conversación para alimentar la IA');
      return;
    }

    try {
      setSendingIds((prev) => new Set([...prev, ...itemIds]));

      for (const id of itemIds) {
        const item = conversaciones.find((c) => c.id_conversacion_anonima === id);
        if (!item) continue;

        await createConocimiento({
          tema_principal: 'conversacion_anonima',
          pregunta_frecuente: item.mensaje_usuario,
          respuesta_oficial: item.respuesta_bot || '',
          fuente_verificacion: 'conversacion_anonima',
          nivel_prioridad: 1,
          estado_vigencia: true,
          id_conversacion_anonima: item.id_conversacion_anonima
        });
      }

      alert('Conversaciones enviadas a la base de conocimiento de la IA');
      setSelectedItems([]);
      fetchConversaciones();
    } catch (err) {
      alert('Error al alimentar la IA');
      console.error(err);
    } finally {
      setSendingIds(new Set());
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSelectedItems([]);
  };

  const handleBlockIp = async (ip) => {
    if (!ip) {
      setSnackbarMessage('⚠️ No se encontró IP para este usuario');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }
    try {
      const token = localStorage.getItem('auth_token');
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
      const token = localStorage.getItem('auth_token');
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

  const handleBackToUsers = () => {
    setSelectedUser(null);
    setSelectedItems([]);
  };

  if (loading) return <div>Cargando conversaciones...</div>;
  if (error) return <div>{error}</div>;

  const isArray = Array.isArray(conversaciones);

  // Vista de usuario seleccionado con sus preguntas
  if (selectedUser) {
    return (
      <div className="preguntas-anonimas-table">
        <div className="table-header">
          <h2>Preguntas de {selectedUser.nombre} - {selectedUser.cedula}</h2>
          <button onClick={handleBackToUsers} className="back-button">← Volver a lista de usuarios</button>
          <div className="actions">
            <button onClick={handleSelectAll}>
              {selectedItems.length === selectedUser.conversaciones.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
            </button>
            <button
              onClick={() => handleAlimentarIA()}
              disabled={selectedItems.length === 0}
              className="alimentar-ia-btn"
            >
              Alimentar IA ({selectedItems.length})
            </button>
          </div>
        </div>

        {selectedUser.conversaciones.length === 0 ? (
          <div>No hay preguntas para este usuario.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedItems.length === selectedUser.conversaciones.length && selectedUser.conversaciones.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>ID</th>
                <th>Pregunta</th>
                <th>Respuesta</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {selectedUser.conversaciones.map((item) => {
                const isSending = sendingIds.has(item.id_conversacion_anonima);
                return (
                  <tr key={item.id_conversacion_anonima}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id_conversacion_anonima)}
                        onChange={() => handleSelectRow(item.id_conversacion_anonima)}
                      />
                    </td>
                    <td>{item.id_conversacion_anonima}</td>
                    <td>{item.mensaje_usuario}</td>
                    <td>{item.respuesta_bot || '-'}</td>
                    <td>
                      {item.fecha_conversacion
                        ? new Date(item.fecha_conversacion).toLocaleString()
                        : '-'}
                    </td>
                    <td>
                      <button
                        onClick={() => handleAlimentarIA([item.id_conversacion_anonima])}
                        disabled={isSending}
                      >
                        {isSending ? 'Enviando...' : 'Enviar a IA'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  // Vista principal - Lista de usuarios con sus preguntas
  return (
    <>
    <div className="preguntas-anonimas-table">
      <div className="table-header">
        <h2>Preguntas Anónimas</h2>
        <div className="filters">
          <div className="filter-row">
            <label>
              Cédula:
              <input
                type="text"
                value={cedulaFilter}
                onChange={(e) => setCedulaFilter(e.target.value)}
                placeholder="Buscar por cédula"
              />
            </label>
            <label>
              Nombre:
              <input
                type="text"
                value={nombreFilter}
                onChange={(e) => setNombreFilter(e.target.value)}
                placeholder="Filtrar por nombre (solo visual)"
              />
            </label>
            <button onClick={handleSearch}>Buscar</button>
          </div>
        </div>
      </div>

      {!isArray ? (
        <div className="error-message">Respuesta inesperada del servidor. Intenta recargar.</div>
      ) : usersList.length === 0 ? (
        <div>No hay conversaciones registradas.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Cédula</th>
              <th>IP</th>
              <th>Total de Preguntas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usersList.map((user, index) => (
              <tr key={index}>
                <td>{user.nombre}</td>
                <td>{user.cedula}</td>
                <td>{user.ip || 'N/A'}</td>
                <td>{user.conversaciones.length}</td>
                <td>
                  <button onClick={() => handleSelectUser(user)}>Ver Preguntas</button>
                  {user.ip ? (
                    <>
                      <button 
                        onClick={() => handleBlockIp(user.ip)}
                        style={{ backgroundColor: '#f44336', color: 'white' }}
                      >
                        Bloquear IP
                      </button>
                      <button 
                        onClick={() => handleUnblockIp(user.ip)}
                        style={{ backgroundColor: '#4caf50', color: 'white' }}
                      >
                        Desbloquear IP
                      </button>
                    </>
                  ) : (
                    <button 
                      disabled
                      style={{ backgroundColor: '#ccc', color: '#666' }}
                      title="No hay IP disponible para este usuario"
                    >
                      Sin IP
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
    {snackbarOpen && (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        padding: '16px',
        backgroundColor: snackbarSeverity === 'success' ? '#4caf50' : snackbarSeverity === 'error' ? '#f44336' : '#ff9800',
        color: 'white',
        borderRadius: '4px',
        zIndex: 1000,
        maxWidth: '500px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        fontWeight: 600,
        fontSize: '14px',
        animation: 'fadeInOut 6s ease-in-out'
      }}>
        {snackbarMessage}
        <button 
          onClick={() => setSnackbarOpen(false)}
          style={{
            marginLeft: '10px',
            background: 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '18px'
          }}
        >
          ✕
        </button>
      </div>
    )}
    <style>{`
      @keyframes fadeInOut {
        0%, 100% { opacity: 0; }
        10%, 90% { opacity: 1; }
      }
    `}</style>
    </>
  );
};

export default PreguntasAnonimasTable;