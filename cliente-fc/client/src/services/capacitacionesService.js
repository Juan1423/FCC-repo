import axios from 'axios';
import { API_URL } from './apiConfig';

const getCapacitaciones = () => axios.get(`${API_URL}/capacitacion`);
const createCapacitacion = (data) => axios.post(`${API_URL}/capacitacion`, data);
const updateCapacitacion = (id, data) => axios.put(`${API_URL}/capacitacion/${id}`, data);
const deleteCapacitacion = (id) => axios.delete(`${API_URL}/capacitacion/${id}`);

const capacitacionesService = {
  getCapacitaciones,
  createCapacitacion,
  updateCapacitacion,
  deleteCapacitacion,
};

export default capacitacionesService;