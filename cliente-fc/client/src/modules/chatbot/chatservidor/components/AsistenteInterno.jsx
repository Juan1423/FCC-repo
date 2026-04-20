import React, { useState, useRef, useEffect } from 'react';

// Ajusta esta URL base si tu backend corre en otro puerto/ip
const API_BASE = 'http://localhost:5000/api/fcc/asistente'; 

const AsistenteInterno = () => {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' o 'upload'
  
  // Estados del Chat
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hola, soy el asistente interno de la Fundación. ¿En qué puedo ayudarte hoy?' }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const chatEndRef = useRef(null);

  // Estados de Subida
  const [file, setFile] = useState(null);
  const [docTitle, setDocTitle] = useState('');
  const [uploadStatus, setUploadStatus] = useState(null); // { type: 'success' | 'error', msg: '' }
  const [loadingUpload, setLoadingUpload] = useState(false);

  // Auto-scroll al final del chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- LÓGICA DEL CHAT ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    // 1. Agregar mensaje del usuario
    const userText = inputMsg;
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInputMsg('');
    setLoadingChat(true);

    try {
      // 2. Consultar al Backend
      const response = await fetch(`${API_BASE}/consultar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: userText, sessionId: 'admin-session-01' })
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => [...prev, { sender: 'bot', text: data.data.respuesta }]);
      } else {
        setMessages(prev => [...prev, { sender: 'bot', text: 'Error: No pude consultar la base de datos.' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Error de conexión con el servidor.' }]);
    } finally {
      setLoadingChat(false);
    }
  };

  // --- LÓGICA DE SUBIDA (ENTRENAMIENTO) ---
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoadingUpload(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('titulo', docTitle || file.name);

    try {
      const response = await fetch(`${API_BASE}/upload-conocimiento`, {
        method: 'POST',
        body: formData, // No poner Content-Type header manualmente con FormData
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setUploadStatus({ type: 'success', msg: `¡Documento aprendido! Se generaron ${result.data.chunks} fragmentos de conocimiento.` });
        setFile(null);
        setDocTitle('');
      } else {
        setUploadStatus({ type: 'error', msg: result.message || 'Error al procesar el documento.' });
      }
    } catch (error) {
      setUploadStatus({ type: 'error', msg: 'Error de red al subir el archivo.' });
    } finally {
      setLoadingUpload(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white shadow-lg rounded-lg mt-6">
      <header className="mb-6 border-b pb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">🤖 Asistente de Gestión (IA)</h2>
        <div className="space-x-2">
          <button 
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded ${activeTab === 'chat' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Chat Consultas
          </button>
          <button 
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded ${activeTab === 'upload' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          >
            Subir Conocimiento
          </button>
        </div>
      </header>

      {/* --- VISTA DE CHAT --- */}
      {activeTab === 'chat' && (
        <div className="flex flex-col h-[500px]">
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 rounded mb-4 border">
            {messages.map((msg, index) => (
              <div key={index} className={`mb-3 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white border border-gray-300 shadow-sm rounded-bl-none'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {loadingChat && <div className="text-gray-500 text-sm italic ml-2">Escribiendo...</div>}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input 
              type="text" 
              className="flex-1 p-2 border rounded focus:outline-none focus:border-blue-500"
              placeholder="Pregunta sobre normativas, procesos, guías..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              disabled={loadingChat}
            />
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={loadingChat}
            >
              Enviar
            </button>
          </form>
        </div>
      )}

      {/* --- VISTA DE SUBIDA --- */}
      {activeTab === 'upload' && (
        <div className="p-6 bg-gray-50 rounded border h-[500px]">
          <h3 className="text-xl font-semibold mb-4">Entrenar al Asistente</h3>
          <p className="text-gray-600 mb-6">Sube documentos PDF oficiales (Reglamentos, Guías, Actas) para que el asistente pueda responder preguntas sobre ellos.</p>
          
          <form onSubmit={handleUpload} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700">Título del Documento</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded mt-1"
                placeholder="Ej: Reglamento Interno 2026"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Archivo PDF</label>
              <input 
                type="file" 
                accept=".pdf"
                className="w-full p-2 border rounded mt-1 bg-white"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50 flex justify-center items-center gap-2"
              disabled={loadingUpload}
            >
              {loadingUpload ? 'Procesando e Indexando...' : 'Subir y Entrenar'}
            </button>
          </form>

          {uploadStatus && (
            <div className={`mt-6 p-4 rounded ${uploadStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {uploadStatus.msg}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AsistenteInterno;