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