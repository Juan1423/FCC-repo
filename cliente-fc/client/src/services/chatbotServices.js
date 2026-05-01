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
  const response = await fetch(`${API_URL}/chatcliente/conversacion/clear-memory`, {
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
  const response = await fetch(`${API_URL}/chatcliente/prompt/${id}/activate`, {
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