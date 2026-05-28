import {API_URL} from './apiConfig';
import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

const TOKEN_COOKIE_NAME = 'auth_token';

// Interceptor global de axios: adjunta el token de la cookie en cada request
axios.interceptors.request.use(
  (config) => {
    const token = Cookies.get(TOKEN_COOKIE_NAME);
    if (token) {
      config.headers['token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const login = async (user) => {
    try {
        const response = await axios.post(`${API_URL}/users/login`, user);
        const { token } = response.data;
        if (token) {
            setAuthToken(token);
        }
        return response.data;
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
};

export const logout = () => {
    setAuthToken(null);
};

export const verifyToken = async () => {
    const token = getAuthToken();
    if (!token) {
        return { isValid: false };
    }
    try {
        const response = await axios.post(`${API_URL}/auth`, {}, {
            headers: {
                'token': token
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error verifying token:', error);
        return { isValid: false };
    }
};

export const setAuthToken = (token) => {
    if (token) {
        Cookies.set(TOKEN_COOKIE_NAME, token, { expires: 1 });
    } else {
        Cookies.remove(TOKEN_COOKIE_NAME);
    }
};

export const getAuthToken = () => {
    return Cookies.get(TOKEN_COOKIE_NAME);
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
    const token = getAuthToken();
    if (!token) return null;
    
    const decodedToken = decodeToken(token);
    if (!decodedToken) return null;

    return {
        user: decodedToken.user,
        rol: decodedToken.rol
    };
};

export const isAuthenticated = () => {
    const token = getAuthToken();
    return !!token;
};

export const changePassword = async (passwords) => {
    try {
        const token = getAuthToken();
        const response = await axios.post(`${API_URL}/auth/change-password`, passwords, {
            headers: {
                'token': token
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error changing password:', error);
        throw error;
    }
};