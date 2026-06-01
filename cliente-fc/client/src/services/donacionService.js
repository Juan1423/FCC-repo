import { API_URL } from './apiConfig';
import axios from 'axios';

const ROLES_ASIGNABLES = ['admin', 'personal_administrativo'];

// ---- Geo nacional ----
export const getRegiones = () => axios.get(`${API_URL}/region`).then(r => r.data);
export const getProvincias = () => axios.get(`${API_URL}/provincia`).then(r => r.data);
export const getCantones = () => axios.get(`${API_URL}/canton`).then(r => r.data);
export const getParroquias = () => axios.get(`${API_URL}/parroquia`).then(r => r.data);

// ---- Geo internacional ----
export const getContinentes = () => axios.get(`${API_URL}/continente`).then(r => r.data);
export const getPaises = () => axios.get(`${API_URL}/pais`).then(r => r.data);
export const getCiudades = () => axios.get(`${API_URL}/ciudad`).then(r => r.data);

// ---- Catálogos ----
export const getTipoDonantes = () => axios.get(`${API_URL}/tipo_donante`).then(r => r.data);
export const getTipoDonaciones = () => axios.get(`${API_URL}/tipo_donacion`).then(r => r.data);

export const getUsuariosAsignables = async () => {
  const { data } = await axios.get(`${API_URL}/users`);
  const list = Array.isArray(data) ? data : [];
  return list.filter(u => ROLES_ASIGNABLES.includes(u.rol_usuario) && u.estado_usuario === true);
};

// ---- Donante Nacional ----
export const createDonanteNacional = (data) => axios.post(`${API_URL}/donante_nacional`, data).then(r => r.data);
export const getDonantesNacionales = () => axios.get(`${API_URL}/donante_nacional`).then(r => r.data);

// ---- Donante Internacional ----
export const createDonanteInternacional = (data) => axios.post(`${API_URL}/donante_internacional`, data).then(r => r.data);
export const getDonantesInternacionales = () => axios.get(`${API_URL}/donante_internacional`).then(r => r.data);

// ---- Donacion Nacional ----
export const getDonacionesNacionales = () => axios.get(`${API_URL}/donacion_nacional`).then(r => r.data);
export const createDonacionNacional = (data) => axios.post(`${API_URL}/donacion_nacional`, data).then(r => r.data);
export const updateDonacionNacional = (id, data) => axios.put(`${API_URL}/donacion_nacional/${id}`, data).then(r => r.data);
export const deleteDonacionNacional = (id) => axios.delete(`${API_URL}/donacion_nacional/${id}`).then(r => r.data);

// ---- Donacion Internacional ----
export const getDonacionesInternacionales = () => axios.get(`${API_URL}/donacion_internacional`).then(r => r.data);
export const createDonacionInternacional = (data) => axios.post(`${API_URL}/donacion_internacional`, data).then(r => r.data);
export const updateDonacionInternacional = (id, data) => axios.put(`${API_URL}/donacion_internacional/${id}`, data).then(r => r.data);
export const deleteDonacionInternacional = (id) => axios.delete(`${API_URL}/donacion_internacional/${id}`).then(r => r.data);

