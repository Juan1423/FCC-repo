import { API_URL } from './apiConfig';
import { getAuthToken } from './authServices';

const authHeaders = () => {
  const token = getAuthToken();
  return token ? { 'token': token } : {};
};

const getByInteraccion = async (interaccionId) => {
  const response = await fetch(`${API_URL}/comunidad/documentos/interaccion/${interaccionId}`, {
    headers: authHeaders()
  });
  return response.json();
};

const create = async (interaccionId, formData) => {
  const headers = authHeaders();
  const response = await fetch(`${API_URL}/comunidad/documentos/interaccion/${interaccionId}`, {
    method: 'POST',
    headers,
    body: formData,
  });
  return response.json();
};

const deleteDoc = async (id) => {
    const response = await fetch(`${API_URL}/comunidad/documentos/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
    });
    return response.json();
};

const getDownloadUrl = (filename) => {
    return `${API_URL}/comunidad/documentos/download/${filename}`;
};

export default {
  getByInteraccion,
  create,
  deleteDoc,
  getDownloadUrl
};