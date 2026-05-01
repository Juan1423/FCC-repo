import React, { useState, useEffect } from 'react';
import { getConocimiento, createConocimiento, updateConocimiento, deleteConocimiento, usarConocimientoEspecifico, toggleBloqueoConocimiento, bloquearTodosConocimiento, desbloquearTodosConocimiento, ejecutarBloqueadasConocimiento, regenerarMemoriaConocimiento } from '../../../../services/chatbotAdminServices';
import './ConocimientoTable.css';

const ConocimientoTable = () => {
  const [conocimientos, setConocimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [chatModal, setChatModal] = useState({ open: false, conocimiento: null });
  const [chatMessage, setChatMessage] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [bloquearLoading, setBloquearLoading] = useState(false);
  const [ejecutarLoading, setEjecutarLoading] = useState(false);
  const [formData, setFormData] = useState({
    tema_principal: 'general',
    pregunta_frecuente: '',
    respuesta_oficial: '',
    fuente_verificacion: '',
    nivel_prioridad: 1,
    estado_vigencia: true,
    bloqueado: false,
    id_pregunta_anonima: '',
    id_conversacion_anonima: '',
    id_prompt: ''
  });

  useEffect(() => {
    loadConocimientos();
  }, []);

  const loadConocimientos = async () => {
    try {
      setLoading(true);
      const response = await getConocimiento();
      const records = Array.isArray(response) ? response : (response?.data || response?.conocimientos || []);
      setConocimientos(records);
    } catch (err) {
      setError(err?.message || 'Error al cargar el conocimiento');
      console.error('Error cargando base de conocimiento:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      tema_principal: 'general',
      pregunta_frecuente: '',
      respuesta_oficial: '',
      fuente_verificacion: '',
      nivel_prioridad: 1,
      estado_vigencia: true,
      bloqueado: false,
      id_pregunta_anonima: '',
      id_conversacion_anonima: '',
      id_prompt: ''
    });
  };

  const handleCreate = async () => {
    try {
      await createConocimiento(formData);
      resetForm();
      loadConocimientos();
    } catch (err) {
      alert('Error al crear conocimiento');
      console.error(err);
    }
  };

  const handleUpdate = async () => {
    try {
      await updateConocimiento(editingItem.id_conocimiento || editingItem.id, formData);
      setEditingItem(null);
      resetForm();
      loadConocimientos();
    } catch (err) {
      alert('Error al actualizar conocimiento');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este conocimiento?')) {
      try {
        await deleteConocimiento(id);
        loadConocimientos();
      } catch (err) {
        alert('Error al eliminar conocimiento');
        console.error(err);
      }
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      tema_principal: item.tema_principal || 'general',
      pregunta_frecuente: item.pregunta_frecuente || '',
      respuesta_oficial: item.respuesta_oficial || '',
      fuente_verificacion: item.fuente_verificacion || '',
      nivel_prioridad: item.nivel_prioridad ?? 1,
      estado_vigencia: typeof item.estado_vigencia === 'boolean' ? item.estado_vigencia : true,      bloqueado: item.bloqueado ?? false,      id_pregunta_anonima: item.id_pregunta_anonima || '',
      id_conversacion_anonima: item.id_conversacion_anonima || '',
      id_prompt: item.id_prompt || ''
    });
  };

  const handleCancel = () => {
    setEditingItem(null);
    resetForm();
  };

  const handleUsarEnChat = (conocimiento) => {
    setChatModal({ open: true, conocimiento });
    setChatMessage('');
    setChatResponse('');
  };

  const handleEnviarMensajeChat = async () => {
    if (!chatMessage.trim()) {
      alert('Por favor escribe un mensaje');
      return;
    }

    try {
      setChatLoading(true);
      const response = await usarConocimientoEspecifico(chatModal.conocimiento.id_conocimiento, chatMessage);
      setChatResponse(response.respuesta_ia);
    } catch (error) {
      console.error('Error usando conocimiento específico:', error);
      alert('Error al consultar con el conocimiento específico');
    } finally {
      setChatLoading(false);
    }
  };

  const handleToggleBloqueo = async (id) => {
    try {
      const result = await toggleBloqueoConocimiento(id);
      console.log('Success result:', result);
      loadConocimientos();
      alert(`Pregunta ${result.bloqueado ? 'bloqueada' : 'desbloqueada'} exitosamente`);
    } catch (err) {
      console.error('Error completo:', err);
      alert('Error al cambiar estado de bloqueo: ' + err.message);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === conocimientos.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(conocimientos.map(item => item.id_conocimiento));
    }
  };

  const handleBloquearTodos = async () => {
    if (selectedItems.length === 0) {
      alert('Selecciona al menos un elemento para bloquear');
      return;
    }

    if (!window.confirm(`¿Estás seguro de bloquear ${selectedItems.length} preguntas?`)) {
      return;
    }

    try {
      setBloquearLoading(true);
      const result = await bloquearTodosConocimiento();
      console.log('Success result bloquear-todos:', result);
      alert(result.message || 'Preguntas bloqueadas');
      setSelectedItems([]);
      loadConocimientos();
    } catch (err) {
      console.error('Error completo bloquear-todos:', err);
      alert('Error al bloquear preguntas: ' + err.message);
    } finally {
      setBloquearLoading(false);
    }
  };

  const handleDesbloquearTodos = async () => {
    if (selectedItems.length === 0) {
      alert('Selecciona al menos un elemento para desbloquear');
      return;
    }

    if (!window.confirm(`¿Estás seguro de desbloquear ${selectedItems.length} preguntas?`)) {
      return;
    }

    try {
      setBloquearLoading(true);
      const result = await desbloquearTodosConocimiento();
      alert(result.message || 'Preguntas desbloqueadas');
      setSelectedItems([]);
      loadConocimientos();
    } catch (err) {
      alert('Error al desbloquear preguntas');
      console.error(err);
    } finally {
      setBloquearLoading(false);
    }
  };

  const handleEjecutarBloqueadas = async () => {
    if (selectedItems.length > 0 && !window.confirm(`¿Ejecutar solo las ${selectedItems.length} preguntas seleccionadas?`)) {
      return;
    } else if (selectedItems.length === 0 && !window.confirm('¿Ejecutar todas las preguntas bloqueadas?')) {
      return;
    }

    try {
      setEjecutarLoading(true);
      const result = await ejecutarBloqueadasConocimiento();

      const mensaje = `Se procesaron ${result.data?.total || result.total || 0} preguntas bloqueadas.
Exitosas: ${result.data?.exitosas || result.exitosas || 0}
Fallidas: ${result.data?.fallidas || result.fallidas || 0}`;

      alert(mensaje);
      console.log('Resultados detallados:', result.data?.resultados || result.resultados);

    } catch (err) {
      alert('Error al ejecutar preguntas bloqueadas');
      console.error(err);
    } finally {
      setEjecutarLoading(false);
    }
  };

  const handleBorrarMemoria = async () => {
    if (!window.confirm('¿Estás seguro de borrar la memoria del chatbot? Esto regenerará los embeddings solo para preguntas permitidas (no bloqueadas). Las preguntas bloqueadas serán excluidas de la memoria.')) {
      return;
    }

    try {
      setEjecutarLoading(true);
      const result = await regenerarMemoriaConocimiento();
      alert(result.message || 'Memoria regenerada');
    } catch (err) {
      alert('Error al regenerar memoria del chatbot');
      console.error(err);
    } finally {
      setEjecutarLoading(false);
    }
  };

  const handleCerrarChatModal = () => {
    setChatModal({ open: false, conocimiento: null });
    setChatMessage('');
    setChatResponse('');
  };

  if (loading) return <div>Cargando conocimiento...</div>;
  if (error) return <div>{error}</div>;

  const isArray = Array.isArray(conocimientos);

  return (
    <div className="conocimiento-table">
      <h2>Entrenamiento de IA</h2>
      {!isArray ? (
        <div className="error-message">Respuesta inesperada del servidor. Intenta recargar.</div>
      ) : conocimientos.length === 0 ? (
        <div>No hay elementos en la base de conocimiento.</div>
      ) : null}

      <div className="form-container">
        <h3>{editingItem ? 'Editar Conocimiento' : 'Crear Conocimiento'}</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Pregunta:</label>
            <textarea
              value={formData.pregunta_frecuente}
              onChange={(e) => setFormData({...formData, pregunta_frecuente: e.target.value})}
              placeholder="Pregunta del usuario"
              rows="3"
            />
          </div>
          <div className="form-group">
            <label>Respuesta Oficial:</label>
            <textarea
              value={formData.respuesta_oficial}
              onChange={(e) => setFormData({...formData, respuesta_oficial: e.target.value})}
              placeholder="Respuesta oficial de la IA"
              rows="3"
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Tema principal:</label>
            <input
              type="text"
              value={formData.tema_principal}
              onChange={(e) => setFormData({...formData, tema_principal: e.target.value})}
              placeholder="Tema principal (ej. general)"
            />
          </div>
          <div className="form-group">
            <label>Nivel de prioridad:</label>
            <input
              type="number"
              value={formData.nivel_prioridad}
              min={1}
              max={5}
              onChange={(e) => setFormData({...formData, nivel_prioridad: parseInt(e.target.value, 10) || 1})}
              placeholder="1-5"
            />
          </div>
          <div className="form-group">
            <label>Vigencia:</label>
            <select
              value={formData.estado_vigencia ? 'activo' : 'inactivo'}
              onChange={(e) => setFormData({...formData, estado_vigencia: e.target.value === 'activo'})}
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Fuente de verificación:</label>
            <input
              type="text"
              value={formData.fuente_verificacion}
              onChange={(e) => setFormData({...formData, fuente_verificacion: e.target.value})}
              placeholder="Fuente del conocimiento"
            />
          </div>
          <div className="form-group">
            <label>ID Pregunta Anónima:</label>
            <input
              type="number"
              value={formData.id_pregunta_anonima}
              onChange={(e) => setFormData({...formData, id_pregunta_anonima: e.target.value})}
              placeholder="ID de pregunta anónima (opcional)"
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>ID Conversación Anónima:</label>
            <input
              type="number"
              value={formData.id_conversacion_anonima}
              onChange={(e) => setFormData({...formData, id_conversacion_anonima: e.target.value})}
              placeholder="ID de conversación anónima (opcional)"
            />
          </div>
          <div className="form-group">
            <label>ID Prompt:</label>
            <input
              type="number"
              value={formData.id_prompt}
              onChange={(e) => setFormData({...formData, id_prompt: e.target.value})}
              placeholder="ID de prompt (opcional)"
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.bloqueado || false}
                onChange={(e) => setFormData({...formData, bloqueado: e.target.checked})}
              />
              Bloqueado
            </label>
          </div>
        </div>
        <div className="form-actions">
          {editingItem ? (
            <>
              <button onClick={handleUpdate}>Actualizar</button>
              <button onClick={handleCancel}>Cancelar</button>
            </>
          ) : (
            <button onClick={handleCreate}>Crear</button>
          )}
        </div>
      </div>

      {/* Botones de bloqueo masivo */}
      <div className="bulk-actions" style={{ margin: '20px 0', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
        <h3>Acciones Masivas</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={handleBloquearTodos}
            disabled={selectedItems.length === 0 || bloquearLoading}
            style={{
              background: '#dc3545',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              cursor: selectedItems.length === 0 || bloquearLoading ? 'not-allowed' : 'pointer',
              opacity: selectedItems.length === 0 || bloquearLoading ? 0.6 : 1
            }}
          >
            {bloquearLoading ? 'Bloqueando...' : `Bloquear Seleccionadas (${selectedItems.length})`}
          </button>

          <button
            onClick={handleDesbloquearTodos}
            disabled={selectedItems.length === 0 || bloquearLoading}
            style={{
              background: '#28a745',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              cursor: selectedItems.length === 0 || bloquearLoading ? 'not-allowed' : 'pointer',
              opacity: selectedItems.length === 0 || bloquearLoading ? 0.6 : 1
            }}
          >
            {bloquearLoading ? 'Desbloqueando...' : `Desbloquear Seleccionadas (${selectedItems.length})`}
          </button>

          <button
            onClick={handleEjecutarBloqueadas}
            disabled={ejecutarLoading}
            style={{
              background: '#007bff',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              cursor: ejecutarLoading ? 'not-allowed' : 'pointer',
              opacity: ejecutarLoading ? 0.6 : 1
            }}
          >
            {ejecutarLoading ? 'Ejecutando...' : selectedItems.length > 0 ? `Ejecutar Seleccionadas (${selectedItems.length})` : 'Ejecutar Todas Bloqueadas'}
          </button>

          <button
            onClick={handleBorrarMemoria}
            disabled={ejecutarLoading}
            style={{
              background: '#6c757d',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              cursor: ejecutarLoading ? 'not-allowed' : 'pointer',
              opacity: ejecutarLoading ? 0.6 : 1
            }}
          >
            {ejecutarLoading ? 'Regenerando...' : 'Borrar Memoria Chatbot'}
          </button>

          {selectedItems.length > 0 && (
            <button
              onClick={() => setSelectedItems([])}
              style={{
                background: '#6c757d',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Limpiar Selección ({selectedItems.length})
            </button>
          )}
        </div>
        <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#666' }}>
          {selectedItems.length === 0
            ? 'Selecciona elementos de la tabla para acciones masivas'
            : `${selectedItems.length} elemento(s) seleccionado(s)`
          }
        </p>
      </div>

      <table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selectedItems.length === conocimientos.length && conocimientos.length > 0}
                onChange={handleSelectAll}
              />
            </th>
            <th>ID</th>
            <th>Pregunta</th>
            <th>Respuesta Oficial</th>
            <th>Fuente Verificación</th>
            <th>Tema Principal</th>
            <th>Prioridad</th>
            <th>Vigente</th>
            <th>Bloqueado</th>
            <th>Fecha Creación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {conocimientos.map(item => (
            <tr key={item.id_conocimiento || item.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id_conocimiento)}
                  onChange={() => handleSelectItem(item.id_conocimiento)}
                />
              </td>
              <td>{item.id_conocimiento || item.id}</td>
              <td>{item.pregunta_frecuente?.substring(0, 50)}...</td>
              <td>{item.respuesta_oficial?.substring(0, 50)}...</td>
              <td>{item.fuente_verificacion}</td>
              <td>{item.tema_principal}</td>
              <td>{item.nivel_prioridad}</td>
              <td>{item.estado_vigencia ? 'Sí' : 'No'}</td>
              <td>
                <span style={{
                  color: item.bloqueado ? '#dc3545' : '#28a745',
                  fontWeight: 'bold'
                }}>
                  {item.bloqueado ? 'Bloqueado' : 'Activo'}
                </span>
              </td>
              <td>{(item.created_at || item.createdAt || item.fecha_creacion || item.fechaCreacion)
                ? new Date(item.created_at || item.createdAt || item.fecha_creacion || item.fechaCreacion).toLocaleDateString()
                : 'Sin fecha'}</td>
              <td>
                <button onClick={() => handleEdit(item)}>Editar</button>
                <button onClick={() => handleToggleBloqueo(item.id_conocimiento)} style={{
                  background: item.bloqueado ? '#28a745' : '#dc3545',
                  color: 'white',
                  marginLeft: '5px'
                }}>
                  {item.bloqueado ? 'Desbloquear' : 'Bloquear'}
                </button>
                <button onClick={() => handleUsarEnChat(item)} style={{ background: '#28a745', color: 'white', marginLeft: '5px' }}>Usar en Chat</button>
                <button onClick={() => handleDelete(item.id_conocimiento || item.id)} style={{ background: '#dc3545', color: 'white', marginLeft: '5px' }}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de Chat con Conocimiento Específico */}
      {chatModal.open && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '80%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3>Chat con Conocimiento Específico</h3>
            <div style={{ marginBottom: '15px', padding: '10px', background: '#f8f9fa', borderRadius: '4px' }}>
              <strong>Conocimiento usado:</strong><br />
              <strong>Tema:</strong> {chatModal.conocimiento.tema_principal}<br />
              <strong>Pregunta:</strong> {chatModal.conocimiento.pregunta_frecuente}<br />
              <strong>Respuesta:</strong> {chatModal.conocimiento.respuesta_oficial}
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Tu mensaje:
              </label>
              <textarea
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Escribe tu pregunta..."
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <button
                onClick={handleEnviarMensajeChat}
                disabled={chatLoading || !chatMessage.trim()}
                style={{
                  background: chatLoading ? '#ccc' : '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: chatLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {chatLoading ? 'Consultando...' : 'Enviar Consulta'}
              </button>
            </div>

            {chatResponse && (
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Respuesta de la IA:
                </label>
                <div style={{
                  padding: '10px',
                  background: '#e9ecef',
                  borderRadius: '4px',
                  border: '1px solid #ced4da',
                  minHeight: '60px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {chatResponse}
                </div>
              </div>
            )}

            <div style={{ textAlign: 'right' }}>
              <button
                onClick={handleCerrarChatModal}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConocimientoTable;