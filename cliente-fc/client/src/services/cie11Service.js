
import {API_URL} from './apiConfig';
import { getAuthToken } from './authServices';

const authHeaders = () => {
  const token = getAuthToken();
  return token ? { 'token': token } : {};
};

const cie11Service = {
  searchDiseases: async (query) => {
    const response = await fetch(`${API_URL}/cie11/search?query=${query}`, {
      headers: authHeaders()
    });
    return response.json();
  },
};

export default cie11Service;