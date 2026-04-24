import axios from 'axios';
import { API_URL } from './apiConfig';

const base = API_URL;

/* ========== Tipo Indicador ========== */
export const getTipoIndicadores = () => axios.get(`${base}/tipo_indicador`).then((r) => r.data);
export const getTipoIndicador = (id) => axios.get(`${base}/tipo_indicador/${id}`).then((r) => r.data);
export const createTipoIndicador = (data) => axios.post(`${base}/tipo_indicador`, data).then((r) => r.data);
export const updateTipoIndicador = (id, data) => axios.put(`${base}/tipo_indicador/${id}`, data).then((r) => r.data);
export const deleteTipoIndicador = (id) => axios.delete(`${base}/tipo_indicador/${id}`).then((r) => r.data);

/* ========== Indicador ========== */
export const getIndicadores = () => axios.get(`${base}/indicador`).then((r) => r.data);
export const getIndicador = (id) => axios.get(`${base}/indicador/${id}`).then((r) => r.data);
export const createIndicador = (data) => axios.post(`${base}/indicador`, data).then((r) => r.data);
export const updateIndicador = (id, data) => axios.put(`${base}/indicador/${id}`, data).then((r) => r.data);
export const deleteIndicador = (id) => axios.delete(`${base}/indicador/${id}`).then((r) => r.data);

/* ========== Tipo Proceso (documentación) ========== */
export const getDocTipoProcesos = () => axios.get(`${base}/tipo_proceso`).then((r) => r.data);
export const getDocTipoProceso = (id) => axios.get(`${base}/tipo_proceso/${id}`).then((r) => r.data);
export const createDocTipoProceso = (data) => axios.post(`${base}/tipo_proceso`, data).then((r) => r.data);
export const updateDocTipoProceso = (id, data) => axios.put(`${base}/tipo_proceso/${id}`, data).then((r) => r.data);
export const deleteDocTipoProceso = (id) => axios.delete(`${base}/tipo_proceso/${id}`).then((r) => r.data);

/* ========== Proceso (documentación) ========== */
export const getProcesosDoc = () => axios.get(`${base}/proceso`).then((r) => r.data);
export const getProcesoDoc = (id) => axios.get(`${base}/proceso/${id}`).then((r) => r.data);
export const createProcesoDoc = (data) => axios.post(`${base}/proceso`, data).then((r) => r.data);
export const updateProcesoDoc = (id, data) => axios.put(`${base}/proceso/${id}`, data).then((r) => r.data);
export const deleteProcesoDoc = (id) => axios.delete(`${base}/proceso/${id}`).then((r) => r.data);

/* ========== Tipo Normativa (documentación) ========== */
export const getDocTipoNormativas = () => axios.get(`${base}/tipo_normativa`).then((r) => r.data);
export const getDocTipoNormativa = (id) => axios.get(`${base}/tipo_normativa/${id}`).then((r) => r.data);
export const createDocTipoNormativa = (data) => axios.post(`${base}/tipo_normativa`, data).then((r) => r.data);
export const updateDocTipoNormativa = (id, data) => axios.put(`${base}/tipo_normativa/${id}`, data).then((r) => r.data);
export const deleteDocTipoNormativa = (id) => axios.delete(`${base}/tipo_normativa/${id}`).then((r) => r.data);

/* ========== Normativa (documentación) ========== */
export const getDocNormativas = () => axios.get(`${base}/normativa`).then((r) => r.data);
export const getDocNormativa = (id) => axios.get(`${base}/normativa/${id}`).then((r) => r.data);
export const createDocNormativa = (data) => axios.post(`${base}/normativa`, data).then((r) => r.data);
export const updateDocNormativa = (id, data) => axios.put(`${base}/normativa/${id}`, data).then((r) => r.data);
export const deleteDocNormativa = (id) => axios.delete(`${base}/normativa/${id}`).then((r) => r.data);

/* ========== Tipo Institucion ========== */
export const getTipoInstituciones = () => axios.get(`${base}/tipo_institucion`).then((r) => r.data);
export const getTipoInstitucion = (id) => axios.get(`${base}/tipo_institucion/${id}`).then((r) => r.data);
export const createTipoInstitucion = (data) => axios.post(`${base}/tipo_institucion`, data).then((r) => r.data);
export const updateTipoInstitucion = (id, data) => axios.put(`${base}/tipo_institucion/${id}`, data).then((r) => r.data);
export const deleteTipoInstitucion = (id) => axios.delete(`${base}/tipo_institucion/${id}`).then((r) => r.data);

/* ========== Institucion ========== */
export const getInstituciones = () => axios.get(`${base}/institucion`).then((r) => r.data);
export const getInstitucion = (id) => axios.get(`${base}/institucion/${id}`).then((r) => r.data);
export const createInstitucion = (data) => axios.post(`${base}/institucion`, data).then((r) => r.data);
export const updateInstitucion = (id, data) => axios.put(`${base}/institucion/${id}`, data).then((r) => r.data);
export const deleteInstitucion = (id) => axios.delete(`${base}/institucion/${id}`).then((r) => r.data);

/* ========== Tipo Documento ========== */
export const getTipoDocumentos = () => axios.get(`${base}/tipo_documento`).then((r) => r.data);
export const getTipoDocumento = (id) => axios.get(`${base}/tipo_documento/${id}`).then((r) => r.data);
export const createTipoDocumento = (data) => axios.post(`${base}/tipo_documento`, data).then((r) => r.data);
export const updateTipoDocumento = (id, data) => axios.put(`${base}/tipo_documento/${id}`, data).then((r) => r.data);
export const deleteTipoDocumento = (id) => axios.delete(`${base}/tipo_documento/${id}`).then((r) => r.data);

/* ========== Documento ========== */
export const getDocumentos = () => axios.get(`${base}/documento`).then((r) => r.data);
export const getDocumento = (id) => axios.get(`${base}/documento/${id}`).then((r) => r.data);
export const createDocumento = (data) => axios.post(`${base}/documento`, data).then((r) => r.data);
export const updateDocumento = (id, data) => axios.put(`${base}/documento/${id}`, data).then((r) => r.data);
export const deleteDocumento = (id) => axios.delete(`${base}/documento/${id}`).then((r) => r.data);

/* ========== Modulo ========== */
export const getModulos = () => axios.get(`${base}/modulo`).then((r) => r.data);
export const getModulo = (id) => axios.get(`${base}/modulo/${id}`).then((r) => r.data);
export const createModulo = (data) => axios.post(`${base}/modulo`, data).then((r) => r.data);
export const updateModulo = (id, data) => axios.put(`${base}/modulo/${id}`, data).then((r) => r.data);
export const deleteModulo = (id) => axios.delete(`${base}/modulo/${id}`).then((r) => r.data);

/* ========== Registrar Procesos ========== */
export const getRegistrarProcesos = () => axios.get(`${base}/registrar_procesos`).then((r) => r.data);
export const getRegistrarProceso = (id) => axios.get(`${base}/registrar_procesos/${id}`).then((r) => r.data);
export const createRegistrarProceso = (data) => axios.post(`${base}/registrar_procesos`, data).then((r) => r.data);
export const updateRegistrarProceso = (id, data) => axios.put(`${base}/registrar_procesos/${id}`, data).then((r) => r.data);
export const deleteRegistrarProceso = (id) => axios.delete(`${base}/registrar_procesos/${id}`).then((r) => r.data);