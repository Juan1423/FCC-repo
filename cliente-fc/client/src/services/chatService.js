import { API_URL } from './apiConfig';
import { getAuthToken } from './authServices';

const handleResponse = async (response) => {
  let data;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error(`Respuesta no válida del servidor (código ${response.status})`);
  }
  if (!response.ok) {
    const message = data?.message || data?.error || `HTTP ${response.status}`;
    throw new Error(message);
  }
  return data;
};

const getHeaders = (includeAuth = true) => {
  const headers = { 'Content-Type': 'application/json' };
  const token = getAuthToken();
  if (token) {
    headers['token'] = token;
  } else {
    headers['visitor-id'] = getVisitorId();
  }
  return headers;
};

const getVisitorId = () => {
  const storedId = localStorage.getItem('visitorId');
  if (storedId) {
    return storedId;
  }
  const visitorId = `visitor-${Date.now()}`;
  localStorage.setItem('visitorId', visitorId);
  return visitorId;
};

// === CHAT PÚBLICO ===
export const enviarMensajePublico = async (data) => {
  const response = await fetch(`${API_URL}/chat/publico/mensaje`, {
    method: 'POST',
    headers: getHeaders(),
    
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const enviarFeedback = async (data) => {
  const response = await fetch(`${API_URL}/chat/publico/feedback`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const registrarUsuarioAnonimo = async (data) => {
  const response = await fetch(`${API_URL}/chat/publico/usuario-anonimo/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const crearPreguntaAnonima = async (data) => {
  const response = await fetch(`${API_URL}/chat/publico/pregunta-anonima`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

// === CHAT INTERNO ===
export const enviarMensajeInterno = async (data) => {
  const response = await fetch(`${API_URL}/chat/interno/mensaje`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const getHistorialInterno = async (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const response = await fetch(`${API_URL}/chat/interno/historial${qs ? `?${qs}` : ''}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getHistorialReporte = async (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const token = getAuthToken();
  const response = await fetch(`${API_URL}/chat/interno/historial/reporte?${qs}`, {
    headers: { token },
    responseType: 'blob',
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.blob();
};

// === ADMIN PROMPTS ===
export const getPrompts = async (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const response = await fetch(`${API_URL}/chat/admin/prompts${qs ? `?${qs}` : ''}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const createPrompt = async (data, pdfFile = null) => {
  if (pdfFile) {
    const formData = new FormData();
    formData.append('titulo', data.titulo);
    formData.append('descripcion', data.descripcion);
    formData.append('instrucciones', data.instrucciones);
    formData.append('tipo_prompt', data.tipo_prompt);
    formData.append('activo', data.activo);
    formData.append('pdf', pdfFile);

    const response = await fetch(`${API_URL}/chat/admin/prompts`, {
      method: 'POST',
      headers: { token: getAuthToken() },
      body: formData,
    });
    return handleResponse(response);
  }

  const response = await fetch(`${API_URL}/chat/admin/prompts`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updatePrompt = async (id, data, pdfFile = null) => {
  if (pdfFile) {
    const formData = new FormData();
    formData.append('titulo', data.titulo);
    formData.append('descripcion', data.descripcion);
    formData.append('instrucciones', data.instrucciones);
    formData.append('tipo_prompt', data.tipo_prompt);
    formData.append('activo', data.activo);
    formData.append('pdf', pdfFile);

    const response = await fetch(`${API_URL}/chat/admin/prompts/${id}`, {
      method: 'PUT',
      headers: { token: getAuthToken() },
      body: formData,
    });
    return handleResponse(response);
  }

  const response = await fetch(`${API_URL}/chat/admin/prompts/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deletePrompt = async (id) => {
  const response = await fetch(`${API_URL}/chat/admin/prompts/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const activatePrompt = async (id) => {
  const response = await fetch(`${API_URL}/chat/admin/prompts/${id}/activate`, {
    method: 'POST',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const uploadPromptPdf = async (pdfFile) => {
  const formData = new FormData();
  formData.append('file', pdfFile);

  const response = await fetch(`${API_URL}/chat/admin/prompts/upload-pdf`, {
    method: 'POST',
    headers: { token: getAuthToken() },
    body: formData,
  });
  return handleResponse(response);
};

export const downloadPromptPdf = async (archivo) => {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}/chat/admin/prompts/download/${encodeURIComponent(archivo)}`, {
    headers: { token, Authorization: `Bearer ${token}` },
    responseType: 'blob',
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.blob();
};

// === ADMIN KNOWLEDGE ===
export const getKnowledge = async (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const response = await fetch(`${API_URL}/chat/knowledge${qs ? `?${qs}` : ''}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const createKnowledge = async (data) => {
  const response = await fetch(`${API_URL}/chat/knowledge`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateKnowledge = async (id, data) => {
  const response = await fetch(`${API_URL}/chat/knowledge/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteKnowledge = async (id) => {
  const response = await fetch(`${API_URL}/chat/knowledge/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const toggleBloqueoKnowledge = async (id) => {
  const response = await fetch(`${API_URL}/chat/knowledge/${id}/toggle-bloqueo`, {
    method: 'PATCH',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const uploadDocumento = async (pdfFile, titulo) => {
  const formData = new FormData();
  formData.append('pdf', pdfFile);
  formData.append('titulo', titulo);

  const response = await fetch(`${API_URL}/chat/knowledge/upload-documento`, {
    method: 'POST',
    headers: { token: getAuthToken() },
    body: formData,
  });
  return handleResponse(response);
};

export const generarEmbeddings = async () => {
  const response = await fetch(`${API_URL}/chat/knowledge/generate-embeddings`, {
    method: 'POST',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const regenerarMemoria = async () => {
  const response = await fetch(`${API_URL}/chat/knowledge/regenerar-memoria`, {
    method: 'POST',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const bloquearTodosKnowledge = async () => {
  const response = await fetch(`${API_URL}/chat/knowledge/bloquear-todos`, {
    method: 'POST',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const desbloquearTodosKnowledge = async () => {
  const response = await fetch(`${API_URL}/chat/knowledge/desbloquear-todos`, {
    method: 'POST',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const ejecutarBloqueadasKnowledge = async () => {
  const response = await fetch(`${API_URL}/chat/knowledge/ejecutar-bloqueadas`, {
    method: 'POST',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const usarConocimiento = async (id, mensaje) => {
  const response = await fetch(`${API_URL}/chat/knowledge/${id}/usar-conocimiento`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ mensaje }),
  });
  return handleResponse(response);
};

// === ADMIN USUARIOS / PREGUNTAS ANÓNIMOS ===
export const getUsuariosAnonimos = async (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const response = await fetch(`${API_URL}/chat/admin/usuarios-anonimos${qs ? `?${qs}` : ''}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const updateUsuarioAnonimo = async (id, data) => {
  const response = await fetch(`${API_URL}/chat/admin/usuarios-anonimos/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteUsuarioAnonimo = async (id) => {
  const response = await fetch(`${API_URL}/chat/admin/usuarios-anonimos/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const blockAnonUser = async (id) => {
  const response = await fetch(`${API_URL}/chat/admin/usuarios-anonimos/${id}/block`, {
    method: 'POST',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const unblockAnonUser = async (id) => {
  const response = await fetch(`${API_URL}/chat/admin/usuarios-anonimos/${id}/unblock`, {
    method: 'POST',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getPreguntasAnonimas = async (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const response = await fetch(`${API_URL}/chat/admin/preguntas-anonimas${qs ? `?${qs}` : ''}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// === ADMIN CONVERSACIONES & STATS ===
export const getConversaciones = async (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const response = await fetch(`${API_URL}/chat/admin/conversaciones${qs ? `?${qs}` : ''}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getConversacionesByUser = async (userId) => {
  const response = await fetch(`${API_URL}/chat/admin/conversaciones?tipo=publico`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getStats = async () => {
  const response = await fetch(`${API_URL}/chat/admin/stats`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const clearMemory = async () => {
  const response = await fetch(`${API_URL}/chat/admin/conversaciones/clear-memory`, {
    method: 'POST',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// === APRENDIZAJE ===
export const getRevisiones = async (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const response = await fetch(`${API_URL}/chat/aprendizaje/revisiones${qs ? `?${qs}` : ''}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const aprobarRevision = async (id, data) => {
  const response = await fetch(`${API_URL}/chat/aprendizaje/revisiones/${id}/aprobar`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const rechazarRevision = async (id) => {
  const response = await fetch(`${API_URL}/chat/aprendizaje/revisiones/${id}/rechazar`, {
    method: 'POST',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getCanonicas = async () => {
  const response = await fetch(`${API_URL}/chat/aprendizaje/canonicas`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const createCanonica = async (data) => {
  const response = await fetch(`${API_URL}/chat/aprendizaje/canonicas`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateCanonica = async (id, data) => {
  const response = await fetch(`${API_URL}/chat/aprendizaje/canonicas/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteCanonica = async (id) => {
  const response = await fetch(`${API_URL}/chat/aprendizaje/canonicas/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getLearningStats = async () => {
  const response = await fetch(`${API_URL}/chat/aprendizaje/stats`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// === CONFIG ===
export const getChatConfig = async () => {
  const response = await fetch(`${API_URL}/chat/config`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const updateChatConfig = async (clave, valor) => {
  const response = await fetch(`${API_URL}/chat/config`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ clave, valor }),
  });
  return handleResponse(response);
};

export const regenerarTemas = async () => {
  const response = await fetch(`${API_URL}/chat/config/regenerar-temas`, {
    method: 'POST',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// === TEMAS VALIDOS ===
export const getTemasValidos = async () => {
  const response = await fetch(`${API_URL}/chat/config/temas`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// === PROTOCOLOS SENSIBLES ===
export const getProtocolos = async () => {
  const response = await fetch(`${API_URL}/chat/config/protocolos`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const createProtocolo = async (data) => {
  const response = await fetch(`${API_URL}/chat/config/protocolos`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateProtocolo = async (id, data) => {
  const response = await fetch(`${API_URL}/chat/config/protocolos/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteProtocolo = async (id) => {
  const response = await fetch(`${API_URL}/chat/config/protocolos/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// === RATE LIMIT ===
export const getRateLimitLogs = async () => {
  const response = await fetch(`${API_URL}/chat/admin/rate-limit-logs`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const clearRateLimit = async (identifier) => {
  const response = await fetch(`${API_URL}/chat/admin/rate-limit/clear`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ identifier }),
  });
  return handleResponse(response);
};

export const updateConversacion = async (id, data) => {
  const response = await fetch(`${API_URL}/chat/admin/conversaciones/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteConversacion = async (id) => {
  const response = await fetch(`${API_URL}/chat/admin/conversaciones/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const blockUser = async (userId) => {
  const response = await fetch(`${API_URL}/chat/admin/seguridad/block-user`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ userId }),
  });
  return handleResponse(response);
};

export const unblockUser = async (userId) => {
  const response = await fetch(`${API_URL}/chat/admin/seguridad/unblock-user`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ userId }),
  });
  return handleResponse(response);
};

export const blockIP = async (ip) => {
  const response = await fetch(`${API_URL}/chat/admin/seguridad/block-ip`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ ip }),
  });
  return handleResponse(response);
};

export const unblockIP = async (ip) => {
  const response = await fetch(`${API_URL}/chat/admin/seguridad/unblock-ip`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ ip }),
  });
  return handleResponse(response);
};

export const usarConversacionEspecifico = async (id, mensaje) => {
  const response = await fetch(`${API_URL}/chat/admin/conversaciones/${id}/usar-conversacion`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ mensaje }),
  });
  return handleResponse(response);
};

export const createConocimiento = async (data) => {
  return createKnowledge(data);
};

export { getVisitorId };
