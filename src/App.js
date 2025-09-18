import './styles/App.css';
import React from 'react';
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
import Comunidad from './modules/comunidad/Comunidad';
import Personas from './modules/comunidad/Personas';
import Interacciones from './modules/comunidad/Interacciones';
import AddPersona from './modules/comunidad/AddPersona';
import AddInteraccion from './modules/comunidad/AddInteraccion';
import PersonaInteracciones from './modules/comunidad/PersonaInteracciones';
import EditInteraccion from './modules/comunidad/EditInteraccion';


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
  return (
    <div className="App">
      <BrowserRouter>
      <CombinedProviders>
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
              path="/fcc-comunidad"
              element={<PrivateRoute element={Comunidad} allowedRoles={['admin']} />} 
            />
            <Route 
              path="/fcc-comunidad/personas"
              element={<PrivateRoute element={Personas} allowedRoles={['admin']} />} 
            />
            <Route 
              path="/fcc-comunidad/personas/nueva"
              element={<PrivateRoute element={AddPersona} allowedRoles={['admin']} />} 
            />
            <Route 
              path="/fcc-comunidad/personas/:id/interacciones"
              element={<PrivateRoute element={PersonaInteracciones} allowedRoles={['admin']} />} 
            />
            <Route 
              path="/fcc-comunidad/interacciones"
              element={<PrivateRoute element={Interacciones} allowedRoles={['admin']} />} 
            />
            <Route 
              path="/fcc-comunidad/interacciones/nueva"
              element={<PrivateRoute element={AddInteraccion} allowedRoles={['admin']} />} 
            />
            <Route 
              path="/fcc-comunidad/interacciones/:id/editar"
              element={<PrivateRoute element={EditInteraccion} allowedRoles={['admin']} />} 
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
      <ChatBotIA/>
    </div>
  );
}

export default App;
