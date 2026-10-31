import axios from 'axios';

export const BASE_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_URL = `${BASE_API_URL}/api/fcc`;
export const API_IMAGE_URL = `${BASE_API_URL}`;

axios.defaults.withCredentials = true;

export const fetchWithAuth = (url, options = {}) => fetch(url, {
  credentials: 'include',
  ...options,
  headers: {
    ...(options.headers || {}),
  },
});
