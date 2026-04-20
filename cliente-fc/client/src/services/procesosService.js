import axios from 'axios';
import { API_URL } from './apiConfig';

const getProcesos = () => axios.get(`${API_URL}/proceso`);
const getTipoProcesos = () => axios.get(`${API_URL}/tipo_proceso`);
const createProceso = (data) => axios.post(`${API_URL}/proceso`, data);
const updateProceso = (id, data) => axios.put(`${API_URL}/proceso/${id}`, data);
const deleteProceso = (id) => axios.delete(`${API_URL}/proceso/${id}`);

const procesosService = { getProcesos, getTipoProcesos, createProceso, updateProceso, deleteProceso };
export default procesosService;
