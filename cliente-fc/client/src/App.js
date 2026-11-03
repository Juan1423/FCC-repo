import './styles/App.css';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { isAuthenticated, AUTH_CHANGE_EVENT } from './services/authServices';
import { Fab } from '@mui/material';
import { Chat as ChatIcon } from '@mui/icons-material';
import ChatAccessModal from './components/ChatAccessModal';
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import PrivateRoute from './routes/PrivateRoute'
import Login from './modules/sistema/auth/views/Login';
import MenuPrincipal from './components/MenuPrincipal';
import Usuarios from './modules/sistema/usuarios/views/Usuarios';
import Error404 from './components/Error404';
import Paciente from './modules/salud/pacientes/views/Paciente';
import DetallePaciente from './modules/salud/pacientes/views/DetallePaciente';
import PersonalSalud from './modules/salud/personalsalud/views/PersonalSalud';
import DetallePersonalSalud from './modules/salud/personalsalud/views/DetallePersonalSalud';
import Atencion from './modules/salud/atencion/views/Atencion';
import NuevaAtencionMedica from './modules/salud/atencion/views/NuevaAtencionMedica';
import Historia from './modules/salud/historia/views/Historia';
import Terapia from './modules/salud/terapia/views/Terapia';
import NuevaTerapia from './modules/salud/terapia/views/NuevaTerapia';
import AccessDenied from './components/AccessDenied';
import Configuracion from './modules/sistema/configuracion/views/Configuracion';
import { MenuProvider } from './components/base/MenuContext';
import { PacienteProvider } from './components/base/PacienteContext';
import Perfil from './modules/sistema/usuarios/views/Perfil';
import Auditoria from './modules/sistema/auditoria/view/Auditoria';
import VerAuditorias from './modules/sistema/auditoria/componets/verAuditorias';
import ExportarAuditorias from './modules/sistema/auditoria/componets/exportarAuditoria';
import ComunidadModule from './modules/gestion/comunidad';
import NormativaModule from './modules/gestion/normativa';

import ChatbotRoutes from './modules/chatbot/ChatbotRoutes';
import SistemaDashboard from './modules/sistema/SistemaDashboard';
import GestionDashboard from './modules/gestion/GestionDashboard';
import SaludDashboard from './modules/salud/SaludDashboard';

import DocumentacionModule from './modules/gestion/documentacion';
import CapacitacionesModule from './modules/gestion/capacitaciones';
import DonacionesModule from './modules/gestion/donaciones';
import DonacionNacionalForm from './modules/public/donaciones/DonacionNacionalForm';
import DonacionInternacionalForm from './modules/public/donaciones/DonacionInternacionalForm';

// ✅ Importa los chatbots
import { ChatBotIA } from './components/ChatBotIA';
import { ChatBotIA as ChatIAServidor } from './components/ChatIAServidor.jsx';

const CombinedProviders = ({ children }) => (
  <MenuProvider>
    <PacienteProvider>
      {children}
    </PacienteProvider>
  </MenuProvider>
);

const PUBLIC_ROUTES = ['/', '/accessdenied', '/donacion-nacional', '/donacion-internacional'];

const ChatWidgets = () => {
  const { pathname } = useLocation();
  const [showChatbot, setShowChatbot] = useState(false);
  const [showChatbotAsVisitor, setShowChatbotAsVisitor] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [chatbotKey, setChatbotKey] = useState(0);
  const [userAuthenticated, setUserAuthenticated] = useState(() => isAuthenticated());
  const [wantsLogin, setWantsLogin] = useState(false);
  const wasAuthenticatedRef = useRef(isAuthenticated());

  // Relee la cookie y resetea las burbujas cuando cambia el estado de sesión
  const syncAuth = useCallback(() => {
    const authenticated = isAuthenticated();
    setUserAuthenticated(authenticated);
    if (wasAuthenticatedRef.current !== authenticated) {
      setShowChatbot(false);
      setShowChatbotAsVisitor(false);
      setShowLoginModal(false);
      setWantsLogin(false);
      setChatbotKey((key) => key + 1);
    }
    wasAuthenticatedRef.current = authenticated;
  }, []);

  // Login/logout en la misma pestaña, en otra pestaña o al recuperar el foco
  useEffect(() => {
    window.addEventListener(AUTH_CHANGE_EVENT, syncAuth);
    window.addEventListener('storage', syncAuth);
    window.addEventListener('focus', syncAuth);
    const interval = setInterval(syncAuth, 30000);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, syncAuth);
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('focus', syncAuth);
      clearInterval(interval);
    };
  }, [syncAuth]);

  // Cada navegación SPA (p. ej. login -> ruta privada) revalida la sesión
  useEffect(() => {
    syncAuth();
  }, [pathname, syncAuth]);

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const showVisitorFab = !userAuthenticated && isPublicRoute && !showChatbotAsVisitor;

  const handleChatbotClick = () => {
    if (isAuthenticated()) {
      // Si ya está autenticado, abrir el chatbot directamente sin modal
      setShowChatbotAsVisitor(true);
      setShowLoginModal(false);
      setWantsLogin(false);
    } else {
      // Si no está autenticado, mostrar el modal de acceso (login o visitante)
      setShowChatbot(true);
      setWantsLogin(false);
    }
  };

  return (
    <>
      {/* Único FAB del visitante: solo sin sesión y en rutas públicas */}
      {showVisitorFab && (
        <Fab
          color="primary"
          aria-label="chatbot"
          sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 2000 }}
          onClick={handleChatbotClick}
        >
          <ChatIcon />
        </Fab>
      )}

      {/* Chatbot interno: solo con sesión iniciada (esquina inferior izquierda) */}
      {userAuthenticated && <ChatIAServidor />}

      {/* Modal para elegir entre login o visitante */}
      <ChatAccessModal
        open={showChatbot}
        onClose={() => setShowChatbot(false)}
        onContinueAsVisitor={() => {
          setShowChatbot(false);
          setShowChatbotAsVisitor(true);
          setWantsLogin(false);
        }}
        onLoginClick={() => {
          setShowChatbot(false);
          setShowLoginModal(true);
          setShowChatbotAsVisitor(true);
          setWantsLogin(true);
        }}
      />

      {/* Chatbot para visitantes: nunca con sesión activa */}
      {showChatbotAsVisitor && !userAuthenticated && (
        <ChatBotIA
          key={`chatbot-${chatbotKey}-${wantsLogin}`}
          onClose={() => setShowChatbotAsVisitor(false)}
          selectedPrompt={null}
          forceClearMemory={chatbotKey}
          maxQuestions={30}
          isVisitor={!wantsLogin && !userAuthenticated}
          showLoginModalInitially={showLoginModal}
          onLoginModalClose={() => setShowLoginModal(false)}
          onLoginSuccess={() => {
            // Al autenticarse, el chat de visitante se cierra y deja paso al chat interno
            setShowChatbot(false);
            setShowLoginModal(false);
            setShowChatbotAsVisitor(false);
            setUserAuthenticated(true);
            setWantsLogin(false);
          }}
        />
      )}
    </>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
      <CombinedProviders>
        <ChatWidgets />
        <Routes>
            <Route exact path="/" element={<Login />} />
            <Route path="/donacion-nacional" element={<DonacionNacionalForm />} />
            <Route path="/donacion-internacional" element={<DonacionInternacionalForm />} />
            <Route 
              path="/fcc-menu-principal" 
              element={<PrivateRoute element={MenuPrincipal} allowedRoles={['admin', 'personal_salud', 'personal_administrativo']} />} 
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
              element={<PrivateRoute element={Configuracion} allowedRoles={['admin', 'personal_salud', 'personal_administrativo']} />} 
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
              element={<PrivateRoute element={NormativaModule} allowedRoles={['admin', 'personal_administrativo']} />} 
            /> 
                   
            <Route 
              path="/fcc-comunidad/*"
              element={<PrivateRoute element={ComunidadModule} allowedRoles={['admin', 'personal_administrativo']} />} 
            />
            <Route 
              path="/fcc-chatbot/*"
              element={<PrivateRoute element={ChatbotRoutes} allowedRoles={['admin']} />} 
            />
            <Route 
              path="/fcc-asistente-ia" 
              element={<PrivateRoute element={ChatbotRoutes} allowedRoles={['admin']} />} 
            />
            <Route
              path="/fcc-capacitaciones/*"              
              element={<PrivateRoute element={CapacitacionesModule} allowedRoles={['admin']} />}
            />
            <Route
              path="/fcc-sistema"              
              element={<PrivateRoute element={SistemaDashboard} allowedRoles={['admin']} />}
            />    
             <Route
              path="/fcc-gestion"              
              element={<PrivateRoute element={GestionDashboard} allowedRoles={['admin', 'personal_administrativo']} />}
            />    
             <Route
              path="/fcc-salud"              
              element={<PrivateRoute element={SaludDashboard} allowedRoles={['admin',"doctor", "personal_salud"]} />}
            />
            <Route
              path="/fcc-chat/*"              
              element={<PrivateRoute element={ChatbotRoutes} allowedRoles={['admin']} />}
            />   
            <Route
              path="/fcc-documentacion/*"
              element={<PrivateRoute element={DocumentacionModule} allowedRoles={['admin', 'personal_administrativo']} />}
            />
            <Route
              path="/fcc-donaciones/*"
              element={<PrivateRoute element={DonacionesModule} allowedRoles={['admin', 'personal_administrativo']} />}
            />      
            <Route 
              path="/accessdenied"
              element={<AccessDenied />}
            />
            <Route path="/perfil" element={<PrivateRoute element={Perfil} allowedRoles={['admin', 'doctor', 'personal_salud', 'personal_administrativo']} />} />
            <Route path="/configuracion" element={<PrivateRoute element={Configuracion} allowedRoles={['admin', 'doctor', 'personal_salud', 'personal_administrativo']} />} />
            <Route path="*" element={<Error404 />} />
          </Routes>
          </CombinedProviders>
      </BrowserRouter>
    </div>
  );
}

export default App;
