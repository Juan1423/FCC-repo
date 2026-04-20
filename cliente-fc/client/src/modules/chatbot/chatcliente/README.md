# Módulo Chatbot Cliente

## Descripción
El módulo Chatbot Cliente es responsable de la administración y gestión del chatbot de la aplicación. Incluye gestión de prompts, historial de conversaciones, seguridad, usuarios anónimos y base de conocimiento para la IA.

## Funcionalidades Principales

### 1. Gestión de Prompts
- Crear, editar, eliminar y buscar prompts.
- Tipos de prompts: instrucciones, contexto_pdf, global, otro.
- Integración con archivos PDF para contexto.

### 2. Historial de Conversaciones
- Visualización de conversaciones entre usuarios y el chatbot.
- Búsqueda y filtrado.
- Envío de conversaciones a la base de conocimiento de la IA.
- Consultas específicas usando conversaciones como referencia.

### 3. Seguridad
- Bloqueo/desbloqueo de usuarios por IP, ID, etc.
- Verificación automática de IPs bloqueadas en middleware.
- Reportes de seguridad con datos de usuarios registrados y anónimos.

### 4. Usuarios Anónimos
- Gestión de usuarios sin registro.
- Agrupación de conversaciones por usuario anónimo.
- Bloqueo/desbloqueo de usuarios anónimos.

### 5. Base de Conocimiento
- Almacenamiento de preguntas frecuentes y respuestas oficiales.
- Generación de embeddings para respuestas mejoradas.
- Integración con OpenAI para respuestas del chatbot.

## Cómo Funciona el Chatbot

1. **Recepción de Mensaje**: El usuario envía un mensaje a través de la interfaz.
2. **Procesamiento**: Se busca en la base de conocimiento usando embeddings de similitud.
3. **Respuesta**: Si se encuentra una coincidencia, se devuelve la respuesta oficial. De lo contrario, se genera una respuesta usando OpenAI con los prompts configurados.
4. **Almacenamiento**: La conversación se guarda en la base de datos.
5. **Aprendizaje**: Los administradores pueden enviar conversaciones al conocimiento para mejorar futuras respuestas.

## Librerías Utilizadas

### Frontend (React)
- **React**: Framework principal.
- **Material-UI (@mui/material)**: Componentes UI consistentes.
- **Axios**: Cliente HTTP para llamadas a la API.
- **React Router**: Navegación.
- **LocalStorage**: Almacenamiento local para tokens y historial de búsquedas.

### Backend (Node.js/Express)
- **Express**: Framework web.
- **Sequelize**: ORM para base de datos PostgreSQL.
- **JWT (jsonwebtoken)**: Autenticación.
- **Multer**: Manejo de archivos (PDFs).
- **OpenAI**: Integración con API de OpenAI.
- **PDF-parse**: Extracción de texto de PDFs.
- **Request-ip**: Obtención de IP del cliente.

### Base de Datos
- **PostgreSQL**: Base de datos relacional.
- **Tablas principales**:
  - prompts: Configuración de prompts.
  - conversaciones: Historial de chats registrados.
  - conversaciones_anonimas: Chats de usuarios anónimos.
  - usuarios_anonimos: Datos de usuarios sin registro.
  - seguridad: Registros de seguridad (bloqueos, IPs).
  - conocimiento: Base de conocimiento para IA.

## Estructura de Archivos

```
cliente-fc/client/src/modules/chatcliente/
├── components/
│   ├── UsuariosAnonimosTable.jsx
│   └── ...
├── views/
│   ├── ChatCliente.js
│   ├── Prompts.js
│   ├── ChatClienteAdmin.jsx
│   └── ...
└── services/
    └── chatbotAdminServices.js

servidor-fc/server/src/controllers/chatcliente.controllers/
├── prompt.controller.js
├── conversacion.controller.js
├── seguridad.controller.js
├── usuario_anonimo.controller.js
├── conocimiento.controller.js
└── ...
```

## API Endpoints

- `GET /chatcliente/prompt`: Obtener prompts.
- `POST /chatcliente/prompt`: Crear prompt.
- `PUT /chatcliente/prompt/:id`: Actualizar prompt.
- `DELETE /chatcliente/prompt/:id`: Eliminar prompt.
- `GET /chatcliente/conversaciones`: Obtener conversaciones.
- `POST /chatcliente/conocimiento`: Agregar a base de conocimiento.
- `POST /chatcliente/seguridad/block-ip`: Bloquear IP.
- `POST /chatcliente/seguridad/unblock-ip`: Desbloquear IP.
- `GET /chatcliente/usuarios-anonimos`: Obtener usuarios anónimos.
- `POST /chatcliente/usuarios-anonimos/block`: Bloquear usuario anónimo.
- `POST /chatcliente/usuarios-anonimos/unblock`: Desbloquear usuario anónimo.

## Seguridad
- Middleware `verifyToken` verifica JWT y bloqueos de IP.
- Funciones de bloqueo en servicios de seguridad.
- Reportes en interfaz de administración.

## Notas de Desarrollo
- Mantener consistencia visual usando Material-UI theme.
- Usar tipografía y colores estándar en todas las tablas y componentes.
- Funcionalidades de bloqueo disponibles en historial de conversaciones y tabla de usuarios anónimos.