import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Psychology as BrainIcon,
  LibraryBooks as BookIcon,
  Chat as ChatIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Speed as RateLimitIcon,
  History as HistoryIcon,
  Topic as TopicIcon,
} from '@mui/icons-material';
import PromptsAdmin from './PromptsAdmin';
import KnowledgeAdmin from './KnowledgeAdmin';
import AprendizajeAdmin from './AprendizajeAdmin';
import HistorialUnificado from '../components/HistorialUnificado';
import GuardrailsConfig from '../components/GuardrailsConfig';
import ProtocolosSensiblesEditor from '../components/ProtocolosSensiblesEditor';
import RateLimitConfig from '../components/RateLimitConfig';
import TemasValidosEditor from '../components/TemasValidosEditor';

const AdminView = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: 'Prompts', icon: <BrainIcon />, component: <PromptsAdmin /> },
    { label: 'Conocimiento', icon: <BookIcon />, component: <KnowledgeAdmin /> },
    { label: 'Aprendizaje', icon: <ChatIcon />, component: <AprendizajeAdmin /> },
    { label: 'Historial', icon: <HistoryIcon />, component: <HistorialUnificado /> },
    { label: 'Guardrails', icon: <SecurityIcon />, component: <GuardrailsConfig /> },
    { label: 'Protocolos', icon: <SpeedIcon />, component: <ProtocolosSensiblesEditor /> },
    { label: 'Temas', icon: <TopicIcon />, component: <TemasValidosEditor /> },
    { label: 'Rate Limit', icon: <RateLimitIcon />, component: <RateLimitConfig /> },
  ];

  return (
    <Box>
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          indicatorColor="primary"
          textColor="primary"
        >
          {tabs.map((tab, i) => (
            <Tab
              key={i}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
              sx={{ minWidth: 120 }}
            />
          ))}
        </Tabs>
      </Paper>

      <Paper sx={{ p: 3, minHeight: 400 }}>
        {tabs[activeTab]?.component || (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Esta sección está en desarrollo.
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AdminView;
