import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  useTheme,
  CircularProgress,
  Chip,
  Tooltip,
} from '@mui/material';
import { Send as SendIcon, SmartToy as BotIcon, Person as PersonIcon, ThumbUpAlt as ThumbUpIcon, ThumbDownAlt as ThumbDownIcon, CheckCircle as CheckIcon } from '@mui/icons-material';
import { enviarMensajeInterno, enviarFeedbackInterno } from '../../../services/chatService';
import chatConfig from '../config/chatConfig';

const chatStyles = {
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '70vh',
    maxWidth: 800,
    mx: 'auto',
  },
  chatHeader: {
    p: 2,
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid',
    borderColor: 'divider',
  },
  messagesContainer: {
    flex: 1,
    overflow: 'auto',
    p: 2,
  },
  messageBubble: {
    display: 'flex',
    alignItems: 'flex-start',
    mb: 2,
    gap: 1,
  },
  userBubble: {
    justifyContent: 'flex-end',
  },
  botBubble: {
    justifyContent: 'flex-start',
  },
  errorBubble: {
    opacity: 0.7,
  },
  avatar: {
    mt: 0.5,
    fontSize: 20,
  },
  messageText: {
    wordBreak: 'break-word',
  },
  userText: {},
  botText: {},
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    p: 2,
    borderTop: '1px solid',
    borderColor: 'divider',
    gap: 1,
  },
  textField: {},
  sendButton: {},
};

const ChatInterno = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [rated, setRated] = useState({});
  const theme = useTheme();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const userName = localStorage.getItem('nombre') || 'Usuario';
    const welcomeMsg = typeof chatConfig.welcomeMessages?.interno === 'function'
      ? chatConfig.welcomeMessages.interno(userName)
      : chatConfig.welcomeMessages?.internoFallback || `Asistente interno - Fundación con Cristo. Conectado como ${userName}.`;
    setMessages([
      {
        id: Date.now(),
        type: 'bot',
        text: welcomeMsg,
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputValue,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const resp = await enviarMensajeInterno({
        mensaje: inputValue,
        sessionId: `asistente-${Date.now()}`,
      });

      if (resp?.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            type: 'bot',
            text: resp.respuesta || 'No se recibió respuesta.',
            timestamp: new Date().toISOString(),
            metadata: resp.metadata,
            id_conversacion: resp.id_conversacion || null,
          },
        ]);
      } else {
        throw new Error(resp?.message || 'Error en la respuesta del servidor');
      }
    } catch (error) {
      console.error('Error enviando mensaje interno:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'bot',
          text: 'Lo siento, ocurrió un error. Por favor intente nuevamente.',
          isError: true,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFeedback = async (msg, calificacion) => {
    if (!msg.id_conversacion) return;
    try {
      await enviarFeedbackInterno({ id_conversacion: msg.id_conversacion, calificacion });
      setRated((prev) => ({ ...prev, [msg.id]: calificacion }));
    } catch (error) {
      console.error('Error enviando feedback interno:', error);
    }
  };

  return (
    <Box sx={chatStyles.chatContainer}>
      <Paper sx={chatStyles.chatHeader}>
        <BotIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
        <Typography variant="h6" gutterBottom>
          Asistente Interno - Fundación con Cristo
        </Typography>
      </Paper>

      <List sx={chatStyles.messagesContainer}>
        {messages.map((msg) => (
          <ListItem
            key={msg.id}
            sx={{
              ...chatStyles.messageBubble,
              ...(msg.type === 'user' ? chatStyles.userBubble : chatStyles.botBubble),
              ...(msg.isError ? chatStyles.errorBubble : {}),
            }}
          >
            {msg.type === 'bot' && <BotIcon sx={chatStyles.avatar} />}
            {msg.type === 'user' && <PersonIcon sx={chatStyles.avatar} />}
            <ListItemText
              primary={msg.text}
              secondary={msg.metadata?.fuentes?.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  {msg.metadata.fuentes.map((fuente, i) => (
                    <Chip key={i} label={fuente} size="small" sx={{ mr: 0.5, mt: 0.5 }} />
                  ))}
                </Box>
              )}
              primaryTypographyProps={{
                ...chatStyles.messageText,
                ...(msg.type === 'user' ? chatStyles.userText : chatStyles.botText),
              }}
            />
            {msg.type === 'bot' && !msg.isError && msg.id_conversacion && (
              <Box sx={{ ml: 0.5, display: 'flex', gap: 0.5, alignItems: 'center' }}>
                {rated[msg.id] != null ? (
                  <Tooltip title="Gracias por tu evaluación">
                    <CheckIcon color="success" sx={{ fontSize: 18 }} />
                  </Tooltip>
                ) : (
                  <>
                    <Tooltip title="Me sirvió">
                      <IconButton size="small" onClick={() => handleFeedback(msg, 5)} color="success">
                        <ThumbUpIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="No me sirvió">
                      <IconButton size="small" onClick={() => handleFeedback(msg, 1)} color="error">
                        <ThumbDownIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </Box>
            )}
          </ListItem>
        ))}
        <div ref={messagesEndRef} />
      </List>

      <Box sx={chatStyles.inputContainer}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Ingrese su consulta interna..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          sx={chatStyles.textField}
        />
        <IconButton
          color="secondary"
          onClick={handleSendMessage}
          disabled={loading || !inputValue.trim()}
          sx={chatStyles.sendButton}
        >
          {loading ? <CircularProgress size={24} /> : <SendIcon />}
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatInterno;
