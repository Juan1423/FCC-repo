import { API_URL } from './apiConfig';

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

export const getPreguntasAnonimas = async (page = 1, limit = 10, cedula = '') => {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams({ page, limit });
  if (cedula) params.append('cedula', cedula);
  const response = await fetch(`${API_URL}/pregunta-anonima?${params}`, {
    headers: { token }
  });
  return handleResponse(response);
};

export const createPreguntaAnonima = async (data) => {
  const response = await fetch(`${API_URL}/pregunta-anonima`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

export const getUsuariosAnonimos = async (page = 1, limit = 10, estado = '') => {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams({ page, limit });
  if (estado) params.append('estado', estado);
  const response = await fetch(`${API_URL}/usuario-anonimo?${params}`, {
    headers: { token }
  });
  return handleResponse(response);
};

export const createUsuarioAnonimo = async (data) => {
  const response = await fetch(`${API_URL}/usuario-anonimo/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  return handleResponse(response);
};

export const updateUsuarioAnonimo = async (id, data) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/usuario-anonimo/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      token
    },
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

export const deleteUsuarioAnonimo = async (id) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/usuario-anonimo/${id}`, {
    method: 'DELETE',
    headers: { token }
  });
  return handleResponse(response);
};

export const getUsuarioAnonimoByCedula = async (cedula) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/usuario-anonimo/cedula/${encodeURIComponent(cedula)}`, {
    headers: { token }
  });
  return handleResponse(response);
};

export const getConversacionesAnonimas = async (page = 1, limit = 100) => {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams({ page, limit });
  const response = await fetch(`${API_URL}/conversacion-anonima?${params}`, {
    headers: { token }
  });
  return handleResponse(response);
};

export const getConocimiento = async (page = 1, limit = 10) => {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams({ page, limit });
  const response = await fetch(`${API_URL}/conocimiento?${params}`, {
    headers: { token }
  });
  return handleResponse(response);
};

export const createConocimiento = async (data) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/conocimiento`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      token
    },
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

export const updateConocimiento = async (id, data) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/conocimiento/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      token
    },
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

export const deleteConocimiento = async (id) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/conocimiento/${id}`, {
    method: 'DELETE',
    headers: { token }
  });
  return handleResponse(response);
};

export const usarConocimientoEspecifico = async (id, mensaje) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/conocimiento/usar-conocimiento/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      token
    },
    body: JSON.stringify({ mensaje })
  });
  return handleResponse(response);
};

export const usarConversacionEspecifico = async (id, mensaje) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/conversacion/usar-conversacion/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      token
    },
    body: JSON.stringify({ mensaje })
  });
  return handleResponse(response);
};