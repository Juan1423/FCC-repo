import axios from 'axios';
import { logAuditAction } from './auditoriaServices';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/fcc';

const getCantones = () => {
  return axios.get(`${API_URL}/canton`);
};

const getParroquias = () => {
  return axios.get(`${API_URL}/parroquia`);
};

const getProvincias = () => {
  return axios.get(`${API_URL}/provincia`);
};

const getPersonas = () => {
  return axios.get(`${API_URL}/persona`);
};

const getTiposPersona = () => {
  return axios.get(`${API_URL}/tipo_persona`);
};

const getInteracciones = () => {
  return axios.get(`${API_URL}/interaccion`);
};

const getInteraccionesByPersona = (idPersona) => {
  return axios.get(`${API_URL}/interaccion/persona/${idPersona}`);
};

const createPersona = (persona) => {
  logAuditAction('CREAR_PERSONA', { newData: persona });
  return axios.post(`${API_URL}/persona`, persona);
};

const createInteraccion = (formData) => {
  // FormData can't be stringified directly. Extract data for logging.
  const logData = {};
  for (let [key, value] of formData.entries()) {
    logData[key] = value;
  }
  logAuditAction('CREAR_INTERACCION', { newData: logData });
  return axios.post(`${API_URL}/interaccion`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

const getInteraccionById = (id) => {
  return axios.get(`${API_URL}/interaccion/${id}`);
};

const updateInteraccion = (id, interaccion) => {
  logAuditAction('ACTUALIZAR_INTERACCION', { interaccionId: id, updatedData: interaccion });
  return axios.put(`${API_URL}/interaccion/${id}`, interaccion);
};

const getPersonasByInteraccion = (idInteraccion) => {
  return axios.get(`${API_URL}/persona/interaccion/${idInteraccion}`);
};

const deletePersona = (id) => {
  logAuditAction('ELIMINAR_PERSONA', { personaId: id });
  return axios.delete(`${API_URL}/persona/${id}`);
};

const getPersonaById = (id) => {
  return axios.get(`${API_URL}/persona/${id}`);
};

const updatePersona = (id, persona) => {
  logAuditAction('ACTUALIZAR_PERSONA', { personaId: id, updatedData: persona });
  return axios.put(`${API_URL}/persona/${id}`, persona);
};

const uploadPersonaPhoto = async (file) => {
  const formData = new FormData();
  formData.append('foto_persona', file);
  
  const response = await axios.post(`${API_URL}/persona/upload-foto`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

const deleteInteraccion = (id) => {
  logAuditAction('ELIMINAR_INTERACCION', { interaccionId: id });
  return axios.delete(`${API_URL}/interaccion/${id}`);
};

const comunidadService = {
  getCantones,
  getParroquias,
  getProvincias,
  getPersonas,
  getTiposPersona,
  getInteracciones,
  getInteraccionesByPersona,
  createPersona,
  createInteraccion,
  getInteraccionById,
  updateInteraccion,
  getPersonasByInteraccion,
  deletePersona,
  getPersonaById,
  updatePersona,
  deleteInteraccion,
  uploadPersonaPhoto,
};

export default comunidadService;