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
} from '@mui/material';
import { Send as SendIcon, SmartToy as BotIcon, Person as PersonIcon } from '@mui/icons-material';
import { enviarMensajePublico, getChatConfig, getVisitorId } from '../../../services/chatService';
import chatConfig from '../config/chatConfig';
import chatStyles from './chatStyles';

const ChatPublico = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState(null);

  const theme = useTheme();

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const resp = await getChatConfig();
        if (resp?.success) setConfig(resp.data);
      } catch (e) {
        console.warn('Usando config local');
      }
    };
    loadConfig();

    const visitorId = getVisitorId();
    const welcomeMsg = chatConfig.welcomeMessages?.publico || '¡Bienvenido! Soy el asistente virtual de la Fundación con Cristo. ¿En qué puedo ayudarle?';

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
      getVisitorId();
      const resp = await enviarMensajePublico({
        mensaje: inputValue,
        visitor_id: getVisitorId(),
      });

      if (resp?.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            type: 'bot',
            text: resp.data?.respuesta || resp.data?.mensaje || 'No se recibió respuesta.',
            timestamp: new Date().toISOString(),
          },
        ]);
      } else {
        throw new Error(resp?.message || 'Error en la respuesta del servidor');
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'bot',
          text: 'Lo siento, ocurrió un error al procesar su mensaje. Por favor intente nuevamente.',
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

  return (
    <Box sx={chatStyles.chatContainer}>
      <Paper sx={chatStyles.chatHeader}>
        <BotIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
        <Typography variant="h6" gutterBottom>
          Asistente Virtual - Fundación con Cristo
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
              primaryTypographyProps={{
                ...chatStyles.messageText,
                ...(msg.type === 'user' ? chatStyles.userText : chatStyles.botText),
              }}
            />
          </ListItem>
        ))}
        <div ref={messagesEndRef} />
      </List>

      <Box sx={chatStyles.inputContainer}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Escriba su pregunta..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          sx={chatStyles.textField}
        />
        <IconButton
          color="primary"
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

export default ChatPublico;
