import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  Psychology as BrainIcon,
  LibraryBooks as BookIcon,
  CheckCircle as CheckCircleIcon,
  Shield as ShieldIcon,
  Policy as ProtocolIcon,
  Topic as TopicIcon,
  Speed as RateLimitIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import ChatbotLayout from './components/ChatbotLayout';
import ChatbotDashboard from './ChatbotDashboard';
import IndividualView from './components/IndividualView';
import HistorialUnificado from './components/HistorialUnificado';
import PromptsAdmin from './views/PromptsAdmin';
import KnowledgeAdmin from './views/KnowledgeAdmin';
import AprendizajeAdmin from './views/AprendizajeAdmin';
import GuardrailsConfig from './components/GuardrailsConfig';
import ProtocolosSensiblesEditor from './components/ProtocolosSensiblesEditor';
import TemasValidosEditor from './components/TemasValidosEditor';
import RateLimitConfig from './components/RateLimitConfig';

const ChatbotRoutes = () => {
  return (
    <ChatbotLayout>
      <Routes>
        <Route index element={<ChatbotDashboard />} />
        <Route
          path="prompts"
          element={
            <IndividualView
              title="Gestión de Prompts"
              subtitle="Instrucciones y comportamiento del asistente"
              icon={<BrainIcon color="primary" />}
            >
              <PromptsAdmin />
            </IndividualView>
          }
        />
        <Route
          path="conocimiento"
          element={
            <IndividualView
              title="Base de Conocimiento"
              subtitle="Documentos e índices vectoriales (RAG)"
              icon={<BookIcon color="primary" />}
            >
              <KnowledgeAdmin />
            </IndividualView>
          }
        />
        <Route
          path="aprendizaje"
          element={
            <IndividualView
              title="Aprendizaje"
              subtitle="Revisiones y conocimientos canónicos"
              icon={<CheckCircleIcon color="primary" />}
            >
              <AprendizajeAdmin />
            </IndividualView>
          }
        />
        <Route
          path="guardrails"
          element={
            <IndividualView
              title="Guardrails"
              subtitle="Límites y protección del asistente"
              icon={<ShieldIcon color="primary" />}
            >
              <GuardrailsConfig />
            </IndividualView>
          }
        />
        <Route
          path="protocolos"
          element={
            <IndividualView
              title="Protocolos"
              subtitle="Respuestas para temas sensibles"
              icon={<ProtocolIcon color="primary" />}
            >
              <ProtocolosSensiblesEditor />
            </IndividualView>
          }
        />
        <Route
          path="temas"
          element={
            <IndividualView
              title="Temas Válidos"
              subtitle="Alcance on-topic del asistente"
              icon={<TopicIcon color="primary" />}
            >
              <TemasValidosEditor />
            </IndividualView>
          }
        />
        <Route
          path="rate-limit"
          element={
            <IndividualView
              title="Rate Limit"
              subtitle="Límites de uso y rendimiento"
              icon={<RateLimitIcon color="primary" />}
            >
              <RateLimitConfig />
            </IndividualView>
          }
        />
        <Route
          path="historial"
          element={
            <IndividualView
              title="Historial de Conversaciones"
              subtitle="Historial de todos los canales"
              icon={<ChatIcon color="primary" />}
            >
              <HistorialUnificado />
            </IndividualView>
          }
        />
      </Routes>
    </ChatbotLayout>
  );
};

export default ChatbotRoutes;