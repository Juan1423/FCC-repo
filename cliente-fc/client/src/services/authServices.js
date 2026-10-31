import {API_URL} from './apiConfig';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export const AUTH_CHANGE_EVENT = 'auth-change';

const notifyAuthChange = () => {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

const USER_STORAGE_KEY = 'user';

let authToken = null;

axios.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers['token'] = authToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const login = async (user) => {
    try {
        const response = await axios.post(`${API_URL}/users/login`, user);
        const { token, data } = response.data;
        if (token) {
            setAuthToken(token);
        }
        if (data) {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data));
        }
        return response.data;
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
};

export const logout = () => {
    setAuthToken(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    axios.post(`${API_URL}/users/logout`).catch(() => {});
};

export const verifyToken = async () => {
    try {
        const response = await axios.post(`${API_URL}/auth`, {});
        return response.data;
    } catch (error) {
        console.error('Error verifying token:', error);
        return { isValid: false };
    }
};

export const setAuthToken = (token) => {
    authToken = token || null;
    notifyAuthChange();
};

export const getAuthToken = () => {
    return authToken;
};

export const decodeToken = (token) => {
    try {
        return jwtDecode(token);
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

export const getUserInfo = () => {
    try {
        const user = JSON.parse(localStorage.getItem(USER_STORAGE_KEY));
        if (!user) return null;
        return {
            user: user.id_usuario,
            rol: user.rol_usuario
        };
    } catch (error) {
        console.error('Error getting user info:', error);
        return null;
    }
};

export const isAuthenticated = () => {
    if (authToken) return true;
    try {
        return !!localStorage.getItem(USER_STORAGE_KEY);
    } catch (error) {
        return false;
    }
};

export const changePassword = async (passwords) => {
    try {
        const response = await axios.post(`${API_URL}/change-password`, passwords);
        return response.data;
    } catch (error) {
        console.error('Error changing password:', error);
        throw error;
    }
};
