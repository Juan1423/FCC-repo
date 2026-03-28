import {API_URL} from './apiConfig';
import { getAuthToken } from './authServices';

export const enviarPreguntaAI = async (mensaje, promptId = null, consentimiento = false, metadata = null, promptText = null) => {
  const token = getAuthToken();
  console.log('Enviando pregunta a:', `${API_URL}/chat`);
  console.log('Token:', token);
  
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Si hay token, agregarlo. Si no, es visitante
    if (token) {
      headers['token'] = token;
    } else {
      // Para visitantes, usar un identificador único
      const visitorId = localStorage.getItem('visitorId') || `visitor-${Date.now()}`;
      if (!localStorage.getItem('visitorId')) {
        localStorage.setItem('visitorId', visitorId);
      }
      headers['visitor-id'] = visitorId;
    }
    
    const body = { mensaje, promptId, consentimiento, metadata };
    if (promptText) body.promptText = promptText;

    const respuesta = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    });

    if (!respuesta.ok) {
      // Intentar leer el cuerpo de error JSON del servidor para dar más contexto
      let errorBody = null;
      try {
        errorBody = await respuesta.json();
      } catch (e) {
        // No es JSON
      }
      const serverMessage = errorBody && (errorBody.error || errorBody.message) ? (errorBody.error || errorBody.message) : null;
      const errMsg = serverMessage ? `HTTP ${respuesta.status} - ${serverMessage}` : `HTTP error! status: ${respuesta.status}`;
      throw new Error(errMsg);
    }

    const data = await respuesta.json();
    console.log('Respuesta del API:', data);
    return data; // Ahora incluye { respuesta, id_conversacion }
  } catch (error) {
    console.error('Error en enviarPreguntaAI:', error);
    throw error;
  }
};

export const enviarFeedback = async (idConversacion, calificacion, comentario) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['token'] = token;
  } else {
    // Para visitantes, usar un identificador único
    const visitorId = localStorage.getItem('visitorId') || `visitor-${Date.now()}`;
    if (!localStorage.getItem('visitorId')) {
      localStorage.setItem('visitorId', visitorId);
    }
    headers['visitor-id'] = visitorId;
  }
  
  const response = await fetch(`${API_URL}/feedback`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      id_conversacion: idConversacion,
      calificacion,
      comentario
    })
  });
  return response.json();
};

export const subirPDF = async (file) => {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append('pdf', file);

  const respuesta = await fetch(`${API_URL}/upload-pdf`, {
    method: 'POST',
    headers: {
      'token': token
    },
    body: formData
  });

  const data = await respuesta.json();
  return data;
};