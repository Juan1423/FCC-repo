import React, { useState, useEffect } from 'react';
import PreguntasAnonimasTable from '../components/PreguntasAnonimasTable';
import UsuariosAnonimosTable from '../components/UsuariosAnonimosTable';
import ConocimientoTable from '../components/ConocimientoTable';
import './ChatClienteAdmin.css';

const ChatClienteAdmin = () => {
  const [activeTab, setActiveTab] = useState('preguntas');

  return (
    <div className="chat-cliente-admin">
      <h1>Administración del Chatbot Cliente</h1>
      <div className="tabs">
        <button
          className={activeTab === 'preguntas' ? 'active' : ''}
          onClick={() => setActiveTab('preguntas')}
        >
          Preguntas Anónimas
        </button>
        <button
          className={activeTab === 'usuarios' ? 'active' : ''}
          onClick={() => setActiveTab('usuarios')}
        >
          Usuarios Anónimos
        </button>
        <button
          className={activeTab === 'conocimiento' ? 'active' : ''}
          onClick={() => setActiveTab('conocimiento')}
        >
          Base de Conocimiento IA
        </button>
      </div>
      <div className="tab-content">
        {activeTab === 'preguntas' && <PreguntasAnonimasTable />}
        {activeTab === 'usuarios' && <UsuariosAnonimosTable />}
        {activeTab === 'conocimiento' && <ConocimientoTable />}
      </div>
    </div>
  );
};

export default ChatClienteAdmin;