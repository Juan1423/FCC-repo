import axios from 'axios';
import { API_URL } from './apiConfig';

const base = API_URL;

/** Tipos de indicador (documentación) */
export const getTipoIndicadores = () => axios.get(`${base}/tipo-indicador`).then((r) => r.data);
export const getTipoIndicador = (id) => axios.get(`${base}/tipo-indicador/${id}`).then((r) => r.data);
export const createTipoIndicador = (data) => axios.post(`${base}/tipo-indicador`, data).then((r) => r.data);
export const updateTipoIndicador = (id, data) => axios.put(`${base}/tipo-indicador/${id}`, data).then((r) => r.data);
export const deleteTipoIndicador = (id) => axios.delete(`${base}/tipo-indicador/${id}`).then((r) => r.data);

/** Indicadores */
export const getIndicadores = () => axios.get(`${base}/indicador`).then((r) => r.data);
export const getIndicador = (id) => axios.get(`${base}/indicador/${id}`).then((r) => r.data);
export const createIndicador = (data) => axios.post(`${base}/indicador`, data).then((r) => r.data);
export const updateIndicador = (id, data) => axios.put(`${base}/indicador/${id}`, data).then((r) => r.data);
export const deleteIndicador = (id) => axios.delete(`${base}/indicador/${id}`).then((r) => r.data);

/** Registros proceso–indicador–normativa (documentación) */
export const getRegistrarProcesos = () => axios.get(`${base}/registrar-procesos`).then((r) => r.data);
export const createRegistrarProcesos = (data) => axios.post(`${base}/registrar-procesos`, data).then((r) => r.data);
export const updateRegistrarProcesos = (id, data) => axios.put(`${base}/registrar-procesos/${id}`, data).then((r) => r.data);
export const deleteRegistrarProcesos = (id) => axios.delete(`${base}/registrar-procesos/${id}`).then((r) => r.data);

/** Catálogos para formularios de registrar_procesos */
export const getProcesosDoc = () => axios.get(`${base}/proceso`).then((r) => r.data);
export const getDocNormativas = () => axios.get(`${base}/doc-normativa`).then((r) => r.data);
