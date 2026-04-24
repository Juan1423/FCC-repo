import './styles/App.css';
import React, { useState, useEffect } from 'react';
import { isAuthenticated } from './services/authServices';
import { Fab } from '@mui/material';
import { Chat as ChatIcon } from '@mui/icons-material';
import ChatAccessModal from './components/ChatAccessModal';
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import ProcesoModule from './modules/gestion/proceso';
import ChatCliente from './modules/chatbot/chatcliente/views/ChatCliente';
import ChatbotAdminPage from './modules/chatbot/chatcliente/views/ChatbotAdminPage';
import SistemaDashboard from './modules/sistema/SistemaDashboard';
import GestionDashboard from './modules/gestion/GestionDashboard';
import SaludDashboard from './modules/salud/SaludDashboard';
import ChatDashboard from './modules/chatbot/ChatbotDashboard';
import DocumentacionModule from './modules/gestion/documentacion';

/*import AsistenteInternoView from './modules/chatservidor/views/AsistenteInternoView';*/
import CapacitacionesModule from './modules/gestion/capacitaciones';
import IADashboard from './modules/chatbot/chatservidor/views/IADashboard';
import GestionConocimientoView from './modules/chatbot/chatservidor/views/GestionConocimientoView';
import HistorialIAView from './modules/chatbot/chatservidor/views/HistorialIAView';
import AsesoramientoView from './modules/chatbot/chatservidor/views/AsesoramientoView';

// ✅ Importa los chatbots
import { ChatBotIA } from './components/ChatBotIA';
import { ChatBotIA as ChatIAServidor } from './components/ChatIAServidor';

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
  const [wantsLogin, setWantsLogin] = useState(false);

  // Verificar si el usuario ya está autenticado al cargar
  useEffect(() => {
    setUserAuthenticated(isAuthenticated());
  }, []);

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
    <div className="App">
      <BrowserRouter>
      <CombinedProviders>
        {/* FAB global del chatbot - Solo cuando no está abierto ningún chatbot */}
        {!userAuthenticated && !showChatbotAsVisitor && (
          <Fab
            color="primary"
            aria-label="chatbot"
            sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 2000 }}
            onClick={handleChatbotClick}
          >
            <ChatIcon />
          </Fab>
        )}

        {/* Chatbot Servidor - Esquina inferior izquierda */}
        <ChatIAServidor />

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
            console.log('Clic en Iniciar Sesión');
            setShowChatbot(false);
            setShowLoginModal(true);
            setShowChatbotAsVisitor(true);
            setWantsLogin(true);
            console.log('Estado: showChatbotAsVisitor=true, wantsLogin=true, showLoginModal=true');
          }}
        />

        {/* Chatbot para visitantes (30 preguntas) o usuarios autenticados */}
        {showChatbotAsVisitor && (
          <ChatBotIA
            key={`chatbot-${chatbotKey}-${wantsLogin}`}
            onClose={() => setShowChatbotAsVisitor(false)}
            selectedPrompt={null}
            forceClearMemory={chatbotKey}
            maxQuestions={30}
            isVisitor={!wantsLogin && !isAuthenticated()}
            showLoginModalInitially={showLoginModal}
            onLoginModalClose={() => setShowLoginModal(false)}
            onLoginSuccess={() => {
              console.log('Login exitoso, chatbot se mantiene visible...');
              setShowChatbot(false);
              // NO cerrar el chatbot, solo cerrar el modal de login
              setShowLoginModal(false);
              setUserAuthenticated(true);
              setWantsLogin(false);
            }}
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
              path="/fcc-asistente-ia" 
              element={<PrivateRoute element={IADashboard} allowedRoles={['admin']} />} 
            />
             <Route 
              path="/fcc-asistente-ia/conocimiento" 
              element={<PrivateRoute element={GestionConocimientoView} allowedRoles={['admin']} />} 
            />
            <Route 
              path="/fcc-asistente-ia/historial" 
              element={<PrivateRoute element={HistorialIAView} allowedRoles={['admin']} />} 
            />
            <Route 
              path="/fcc-asistente-ia/asesoramiento" 
              element={<PrivateRoute element={AsesoramientoView} allowedRoles={['admin']} />} 
            />
            <Route
              path="/fcc-capacitaciones/*"              
              element={<PrivateRoute element={CapacitacionesModule} allowedRoles={['admin']} />}
            />
            <Route
              path="/fcc-documentacion/*"
              element={<PrivateRoute element={DocumentacionModule} allowedRoles={['admin']} />}
            />
            <Route
              path="/fcc-sistema"              
              element={<PrivateRoute element={SistemaDashboard} allowedRoles={['admin']} />}
            />    
             <Route
              path="/fcc-gestion"              
              element={<PrivateRoute element={GestionDashboard} allowedRoles={['admin']} />}
            />    
             <Route
              path="/fcc-salud"              
              element={<PrivateRoute element={SaludDashboard} allowedRoles={['admin']} />}
            />
            <Route
              path="/fcc-chat"              
              element={<PrivateRoute element={ChatDashboard} allowedRoles={['admin']} />}
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
