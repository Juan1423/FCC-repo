import axios from 'axios';
import { API_URL } from './apiConfig';

const getProcesos = () => axios.get(`${API_URL}/procesos`);
const getTipoProcesos = () => axios.get(`${API_URL}/tipoproceso`);
const createProceso = (data) => axios.post(`${API_URL}/procesos`, data);
const updateProceso = (id, data) => axios.put(`${API_URL}/procesos/${id}`, data);
const deleteProceso = (id) => axios.delete(`${API_URL}/procesos/${id}`);

const procesosService = { getProcesos, getTipoProcesos, createProceso, updateProceso, deleteProceso };
export default procesosService;
