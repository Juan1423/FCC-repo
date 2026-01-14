import axios from 'axios';
import { API_URL } from './apiConfig';

const getNormativas = () => axios.get(`${API_URL}/normativa`);
const getNormativa = (id) => axios.get(`${API_URL}/normativa/${id}`);
const deleteNormativa = (id) => axios.delete(`${API_URL}/normativa/${id}`);
const createNormativa = (data) => axios.post(`${API_URL}/normativa`, data);
const updateNormativa = (id, data) => axios.put(`${API_URL}/normativa/${id}`, data);

const normativaServices = { getNormativas, getNormativa, deleteNormativa, createNormativa, updateNormativa };
export default normativaServices;