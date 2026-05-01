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
  const response = await fetch(`${API_URL}/conocimiento/`, {
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

export const getAllConversaciones = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/conversacion/`, {
    headers: { token }
  });
  return handleResponse(response);
};

export const updateConversacion = async (id, data) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/conversacion/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      token
    },
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

export const deleteConversacion = async (id) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/conversacion/${id}`, {
    method: 'DELETE',
    headers: { token }
  });
  return handleResponse(response);
};

export const generateEmbeddings = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/conocimiento/generate-embeddings/`, {
    method: 'POST',
    headers: { token }
  });
  return handleResponse(response);
};

export const blockUser = async (userId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/seguridad/block-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      token
    },
    body: JSON.stringify({ userId })
  });
  return handleResponse(response);
};

export const unblockUser = async (userId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/seguridad/unblock-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      token
    },
    body: JSON.stringify({ userId })
  });
  return handleResponse(response);
};

export const blockIP = async (ip) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/seguridad/block-ip`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      token
    },
    body: JSON.stringify({ ip })
  });
  return handleResponse(response);
};

export const unblockIP = async (ip) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/seguridad/unblock-ip`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      token
    },
    body: JSON.stringify({ ip })
  });
  return handleResponse(response);
};

export const toggleBloqueoConocimiento = async (id) => {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
  const response = await fetch(`${API_URL}/conocimiento/${id}/toggle-bloqueo`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      token
    }
  });
  return handleResponse(response);
};

export const bloquearTodosConocimiento = async () => {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
  const response = await fetch(`${API_URL}/conocimiento/bloquear-todos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      token
    }
  });
  return handleResponse(response);
};

export const desbloquearTodosConocimiento = async () => {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
  const response = await fetch(`${API_URL}/conocimiento/desbloquear-todos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      token
    }
  });
  return handleResponse(response);
};

export const ejecutarBloqueadasConocimiento = async () => {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
  const response = await fetch(`${API_URL}/conocimiento/ejecutar-bloqueadas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      token
    }
  });
  return handleResponse(response);
};

export const regenerarMemoriaConocimiento = async () => {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
  const response = await fetch(`${API_URL}/chatcliente/conocimiento/regenerar-memoria`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      token
    }
  });
  return handleResponse(response);
};