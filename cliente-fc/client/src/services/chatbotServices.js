import { API_URL } from './apiConfig';
import { getUserInfo } from './authServices';

export const getPrompts = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/prompt`, {
    headers: { 'token': token }
  });
  return response.json();
};

export const createPrompt = async (data, pdfFile = null) => {
  const token = localStorage.getItem('token');
  
  // Si hay PDF, usar FormData
  if (pdfFile) {
    const formData = new FormData();
    formData.append('titulo', data.titulo);
    formData.append('descripcion', data.descripcion);
    formData.append('instrucciones', data.instrucciones);
    formData.append('tipo_prompt', data.tipo_prompt);
    formData.append('activo', data.activo);
    formData.append('pdf', pdfFile);

    const response = await fetch(`${API_URL}/prompt`, {
      method: 'POST',
      headers: { 'token': token },
      body: formData
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      const msg = (body && body.error) ? body.error : (body && body.message) ? body.message : `HTTP ${response.status}`;
      throw new Error(msg);
    }
    return body;
  }
  
  // Sin PDF, usar JSON
  const response = await fetch(`${API_URL}/prompt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'token': token
    },
    body: JSON.stringify(data)
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const msg = (body && body.error) ? body.error : (body && body.message) ? body.message : `HTTP ${response.status}`;
    throw new Error(msg);
  }
  return body;
};

export const updatePrompt = async (id, data, pdfFile = null) => {
  const token = localStorage.getItem('token');
  
  // Si hay PDF, usar FormData
  if (pdfFile) {
    const formData = new FormData();
    formData.append('titulo', data.titulo);
    formData.append('descripcion', data.descripcion);
    formData.append('instrucciones', data.instrucciones);
    formData.append('tipo_prompt', data.tipo_prompt);
    formData.append('activo', data.activo);
    formData.append('pdf', pdfFile);

    const response = await fetch(`${API_URL}/prompt/${id}`, {
      method: 'PUT',
      headers: { 'token': token },
      body: formData
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      const msg = (body && body.error) ? body.error : (body && body.message) ? body.message : `HTTP ${response.status}`;
      throw new Error(msg);
    }
    return body;
  }
  
  // Sin PDF, usar JSON
  const response = await fetch(`${API_URL}/prompt/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'token': token
    },
    body: JSON.stringify(data)
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const msg = (body && body.error) ? body.error : (body && body.message) ? body.message : `HTTP ${response.status}`;
    throw new Error(msg);
  }
  return body;
};

export const uploadPdfToOpenAI = async (pdfFile) => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('pdf', pdfFile);
  formData.append('tipo_prompt', 'contexto_pdf');

  const response = await fetch(`${API_URL}/prompt/upload-pdf`, {
    method: 'POST',
    headers: { 'token': token },
    body: formData
  });
  
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const msg = (body && body.error) ? body.error : (body && body.message) ? body.message : `HTTP ${response.status}`;
    throw new Error(msg);
  }
  return body;
};

export const deletePrompt = async (id) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/prompt/${id}`, {
    method: 'DELETE',
    headers: { 'token': token }
  });
  return response.json();
};

export const getConversaciones = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/conversacion`, {
    headers: { 'token': token }
  });
  return response.json();
};

export const getConversacionesByUser = async () => {
  const token = localStorage.getItem('token');
  const userInfo = getUserInfo();
  const userId = userInfo?.user;
  
  if (!userId) {
    throw new Error('No user ID found');
  }
  
  const response = await fetch(`${API_URL}/conversacion/usuario/${userId}`, {
    headers: { 'token': token }
  });
  return response.json();
};

export const clearPromptMemory = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/conversacion/clear-memory`, {
    method: 'POST',
    headers: { 'token': token }
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const msg = (body && body.error) ? body.error : (body && body.message) ? body.message : `HTTP ${response.status}`;
    throw new Error(msg);
  }
  return body;
};

export const checkPdfAvailable = async (pdfName) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/prompt/check/${encodeURIComponent(pdfName)}`, {
    headers: { 'token': token }
  });
  const body = await response.json().catch(() => null);
  return body?.exists === true;
};

export const activatePrompt = async (id) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/prompt/${id}/activate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'token': token
    },
    body: JSON.stringify({})
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const msg = (body && body.error) ? body.error : (body && body.message) ? body.message : `HTTP ${response.status}`;
    throw new Error(msg);
  }
  return body;
};

export const executeSelectedPrompts = async (promptIds) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/prompt/execute-selected`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'token': token
    },
    body: JSON.stringify({ prompt_ids: promptIds })
  });
  return response.json();
};

export const executeAllPrompts = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/conocimiento/regenerar-memoria`, {
    method: 'POST',
    headers: { 'token': token }
  });
  return response.json();
};

export const downloadPdf = async (pdfName) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/prompt/download/${encodeURIComponent(pdfName)}`, {
    headers: { 
      'token': token,
      'Authorization': `Bearer ${token}`
    },
    responseType: 'blob'
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.blob();
};

export const getSecurityData = async (userId = null, limit = 100) => {
  const token = localStorage.getItem('token');
  let url = `${API_URL}/seguridad?limit=${limit}`;
  if (userId && /^[0-9]+$/.test(userId)) {
    url += `&user_id=${userId}`;
  }
  const response = await fetch(url, {
    headers: { 'token': token }
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const msg = (body && body.message) ? body.message : `HTTP ${response.status}`;
    throw new Error(msg);
  }
  return body?.data || body;
};

export const getUserById = async (userId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/users/${userId}`, {
    headers: { 'token': token }
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const msg = (body && body.message) ? body.message : `HTTP ${response.status}`;
    throw new Error(msg);
  }
  return body;
};

export const getConversacionesByUserId = async (userId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/conversacion/usuario/${userId}`, {
    headers: { 'token': token }
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const msg = (body && body.message) ? body.message : `HTTP ${response.status}`;
    throw new Error(msg);
  }
  return body?.data || body;
};

export const getAnonUserById = async (anonUserId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/usuario-anonimo/${anonUserId}`, {
    headers: { 'token': token }
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const msg = (body && body.message) ? body.message : `HTTP ${response.status}`;
    throw new Error(msg);
  }
  return body?.data || body;
};

export const getConversacionesAnonimasByUser = async (anonUserId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/conversacion-anonima/usuario/${anonUserId}`, {
    headers: { 'token': token }
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const msg = (body && body.message) ? body.message : `HTTP ${response.status}`;
    throw new Error(msg);
  }
  return body?.data || body;
};

export const blockUser = async (userId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/users/${userId}/block`, {
    method: 'POST',
    headers: { 'token': token }
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const msg = (body && body.message) ? body.message : `HTTP ${response.status}`;
    throw new Error(msg);
  }
  return body;
};

export const unblockUser = async (userId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/users/${userId}/unblock`, {
    method: 'POST',
    headers: { 'token': token }
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const msg = (body && body.message) ? body.message : `HTTP ${response.status}`;
    throw new Error(msg);
  }
  return body;
};

export const blockAnonUser = async (anonUserId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/usuario-anonimo/${anonUserId}/block`, {
    method: 'POST',
    headers: { 'token': token }
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const msg = (body && body.message) ? body.message : `HTTP ${response.status}`;
    throw new Error(msg);
  }
  return body;
};

export const unblockAnonUser = async (anonUserId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/usuario-anonimo/${anonUserId}/unblock`, {
    method: 'POST',
    headers: { 'token': token }
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const msg = (body && body.message) ? body.message : `HTTP ${response.status}`;
    throw new Error(msg);
  }
  return body;
};