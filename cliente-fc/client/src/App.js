import './styles/App.css';
import React, { useState, useEffect } from 'react';
import { isAuthenticated } from './services/authServices';
import { Fab } from '@mui/material';
import { Chat as ChatIcon } from '@mui/icons-material';
import ChatAccessModal from './components/ChatAccessModal';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from './routes/PrivateRoute'
import Login from './modules/auth/views/Login';
import MenuPrincipal from './components/MenuPrincipal';
import Usuarios from './modules/usuarios/views/Usuarios';
import Error404 from './components/Error404';
import Paciente from './modules/pacientes/views/Paciente';
import DetallePaciente from './modules/pacientes/views/DetallePaciente';
import PersonalSalud from './modules/personalsalud/views/PersonalSalud';
import DetallePersonalSalud from './modules/personalsalud/views/DetallePersonalSalud';
import Atencion from './modules/atencion/views/Atencion';
import NuevaAtencionMedica from './modules/atencion/views/NuevaAtencionMedica';
import Historia from './modules/historia/views/Historia';
import Terapia from './modules/terapia/views/Terapia';
import NuevaTerapia from './modules/terapia/views/NuevaTerapia';
import AccessDenied from './components/AccessDenied';
import Configuracion from './modules/configuracion/views/Configuracion';
import { MenuProvider } from './components/base/MenuContext';
import { PacienteProvider } from './components/base/PacienteContext';
import Perfil from './modules/usuarios/views/Perfil';
import Auditoria from './modules/auditoria/view/Auditoria';
import VerAuditorias from './modules/auditoria/componets/verAuditorias';
import ExportarAuditorias from './modules/auditoria/componets/exportarAuditoria';
import ComunidadModule from './modules/comunidad';
import NormativaModule from './modules/normativa';
import ProcesoModule from './modules/proceso';
import ChatCliente from './modules/chatcliente/views/ChatCliente';
import ChatbotAdminPage from './modules/chatcliente/views/ChatbotAdminPage';

// ✅ Importa el chatbot
import { ChatBotIA } from './components/ChatBotIA';

const CombinedProviders = ({ children }) => (
  <MenuProvider>
    <PacienteProvider>
      {children}
    </PacienteProvider>
  </MenuProvider>
);

function App() {
  const [showChatbot, setShowChatbot] = useState(false);
  const [showChatbotAsVisitor, setShowChatbotAsVisitor] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [chatbotKey, setChatbotKey] = useState(0);
  const [userAuthenticated, setUserAuthenticated] = useState(false);

  // Verificar si el usuario ya está autenticado al cargar
  useEffect(() => {
    setUserAuthenticated(isAuthenticated());
  }, []);

  const handleChatbotClick = () => {
    if (isAuthenticated()) {
      // Si ya está autenticado, abrir el chatbot directamente sin modal
      setShowChatbotAsVisitor(true);
      setShowLoginModal(false);  // No mostrar login modal porque ya está loggeado
    } else {
      // Si no está autenticado, mostrar el modal de acceso (login o visitante)
      setShowChatbot(true);
    }
  };
  return (
    <div className="App">
      <BrowserRouter>
      <CombinedProviders>
        {/* FAB global del chatbot */}
        <Fab
          color="primary"
          aria-label="chatbot"
          sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 2000 }}
          onClick={handleChatbotClick}
        >
          <ChatIcon />
        </Fab>

        {/* Modal para elegir entre login o visitante */}
        <ChatAccessModal 
          open={showChatbot} 
          onClose={() => setShowChatbot(false)}
          onContinueAsVisitor={() => {
            setShowChatbot(false);
            setShowChatbotAsVisitor(true);
          }}
          onLoginClick={() => {
            setShowChatbot(false);
            setShowLoginModal(true);
            setShowChatbotAsVisitor(true);
          }}
        />

        {/* Chatbot para visitantes (30 preguntas) o usuarios autenticados */}
        {showChatbotAsVisitor && (
          <ChatBotIA
            key={chatbotKey}
            onClose={() => setShowChatbotAsVisitor(false)}
            selectedPrompt={null}
            forceClearMemory={chatbotKey}
            maxQuestions={30}
            isVisitor={!isAuthenticated()}
            showLoginModalInitially={showLoginModal}
            onLoginModalClose={() => setShowLoginModal(false)}
          />
        )}
        <Routes>
            <Route exact path="/" element={<Login />} />
            <Route 
              path="/fcc-menu-principal" 
              element={<PrivateRoute element={MenuPrincipal} allowedRoles={['admin', 'personal_salud']} />} 
            />
            <Route 
              path="/fcc-pacientes" 
              element={<PrivateRoute element={Paciente} allowedRoles={['admin', 'doctor',  'personal_salud']} />} 
            />
            <Route 
              path="/fcc-pacientes/:id" 
              element={<PrivateRoute element={DetallePaciente} allowedRoles={['admin', 'doctor',  'personal_salud']} />} 
            />
            <Route 
              path="/fcc-personal-salud" 
              element={<PrivateRoute element={PersonalSalud} allowedRoles={['admin'] } />} 
            /> 
            <Route 
              path="/fcc-personal-salud/:id" 
              element={<PrivateRoute element={DetallePersonalSalud} allowedRoles={['admin',  'personal_salud']} />} 
            />
            <Route 
              path="/fcc-atencion" 
              element={<PrivateRoute element={Atencion} allowedRoles={['admin', 'doctor',  'personal_salud']} />} 
            />
            <Route 
              path="/fcc-atencion/nueva-atencion" 
              element={<PrivateRoute element={NuevaAtencionMedica} allowedRoles={['admin', 'doctor',  'personal_salud']} />} 
            />
            <Route 
              path="/fcc-configuracion" 
              element={<PrivateRoute element={Configuracion} allowedRoles={['admin', 'personal_salud']} />} 
            />
            <Route 
              path="/fcc-usuarios" 
              element={<PrivateRoute element={Usuarios} allowedRoles={['admin']} />} 
            />
            <Route 
              path="/fcc-historias-clinicas" 
              element={<PrivateRoute element={Historia} allowedRoles={['admin', 'doctor', 'personal_salud']} />} 
            />
            <Route 
              path="/fcc-terapias" 
              element={<PrivateRoute element={Terapia} allowedRoles={['admin', 'doctor', 'personal_salud']} />} 
            />
            <Route 
              path="/nueva-terapia/:id" 
              element={<PrivateRoute element={NuevaTerapia} allowedRoles={['admin', 'doctor', 'personal_salud']} />} 
            />
            <Route 
              path="/fcc-auditoria" 
              element={<PrivateRoute element={Auditoria} allowedRoles={['admin']} />} 
            />
            <Route 
              path="/fcc-ver-auditoria"
              element={<PrivateRoute element={VerAuditorias} allowedRoles={['admin']} />} 
            />

            <Route 
              path="/fcc-exportar-auditoria"
              element={<PrivateRoute element={ExportarAuditorias} allowedRoles={['admin']} />} 
            />
            <Route 
              path="/fcc-normativa/*"
              element={<PrivateRoute element={NormativaModule} allowedRoles={['admin']} />} 
            /> 
            <Route 
              path="/fcc-proceso/*"
              element={<PrivateRoute element={ProcesoModule} allowedRoles={['admin']} />} 
            />         
            <Route 
              path="/fcc-comunidad/*"
              element={<PrivateRoute element={ComunidadModule} allowedRoles={['admin']} />} 
            />
            <Route 
              path="/fcc-chatbot/*"
              element={<PrivateRoute element={ChatCliente} allowedRoles={['admin']} />} 
            />
            <Route 
              path="/fcc-chatbot-admin"
              element={<PrivateRoute element={ChatbotAdminPage} allowedRoles={['admin']} />} 
            />
            <Route 
              path="/accessdenied"
              element={<AccessDenied />}
            />
            <Route path="/perfil" element={<PrivateRoute element={Perfil} allowedRoles={['admin', 'doctor', 'personal_salud']} />} />
            <Route path="/configuracion" element={<PrivateRoute element={Configuracion} allowedRoles={['admin', 'doctor', 'personal_salud']} />} />
            <Route path="*" element={<Error404 />} />
          </Routes>
          </CombinedProviders>
      </BrowserRouter>
    </div>
  );
}

export default App;
