# Auditoría de Seguridad — Estado de Remedición

Repo: `FCC-monorepo` (rama actual)
Fecha de actualización: 2026-11-01
Criterios acordados: roles `admin`, `doctor`, `personal_salud`, `personal_administrativo`. Rutas públicas: `/donacion-nacional`, `/donacion-internacional`, `/login` (cliente) → `POST /donacion_nacional`, `POST /donacion_internacional`, `POST /users/login`, `POST /auth`, chat público y catálogos geográficos (servidor).

## Resumen

| Severidad | Total | Resueltos | Parciales | Pendientes |
|---|---|---|---|---|
| Crítica | 6 | 5 | 1 (C-03) | 0 |
| Alta | 10 | 10 | 0 | 0 |
| Media | 12 | 9 | 3 (M-07, M-10, M-12) | 0 |
| Baja | 5 | 4 | 0 | 1 (B-04) |
| Operativo | 3 | 2 | 0 | 1 |

---

## Críticos

| ID | Descripción | Estado | Commit / Nota |
|---|---|---|---|
| C-01 | Bypass total de autenticación: el header `visitor-id` creaba `req.user` de visitante en cualquier ruta no pública (`securityAuditMiddleware.js`). | ✅ RESUELTO | `b67382c`. El bypass se eliminó; el flujo visitante queda solo en `/chat/publico` (rutas públicas con `verifyTokenOrVisitor`). Verificado: `visitor-id` → 400 en rutas clínicas. |
| C-02 | Routers clínicos y administrativos sin `verifyToken`/`requireRole` (paciente, historia, usuario, atención, examen, terapia, signos, enfermedades, personalsalud, auditoría, comunidad, documentación, donaciones, capacitaciones, CIE-11). | ✅ RESUELTO | `b67382c`. RBAC por rol en todos los routers; `self-or-admin` en `/users/:id`. Verificado: `doctor` no lista `/users` (403), `personal_administrativo` no accede a pacientes (403). |
| C-03 | Archivos médicos servidos públicamente vía `express.static('uploads')` + path traversal en descargas (`sendFile` con params, `documento_interaccion.controller`). | 🟡 PARCIAL | `e5be23b`. Traversal cerrado (basename + contención, 8 vectores → 404) y estático global eliminado. **Residual:** las fotos de perfil (paciente/personal/personas) siguen públicas porque el frontend las muestra con `<img src>` que no puede enviar cookies; requiere refactor del cliente a carga autenticada (endpoint que devuelva el blob con el header `token`). |
| C-04 | Escritura arbitraria de archivos: `id_historia` del body se usaba sin validar en `multerConfigExamen.js`/`multerConfigTerapia.js` (`path.join` con `../../` → salir de uploads → posible RCE). | ✅ RESUELTO | `e7df5db`. `id_historia` validado como entero > 0 + contención; nombres de archivo sanitizados con `path.basename`. |
| C-05 | Hashes y contraseñas expuestos: `GET /users` y login devolvían `password_usuario`; `console.log` de credenciales en claro; logger sin redacción de `password_usuario` ni de cadenas. | ✅ RESUELTO | `9824f58` + `e7df5db`. `defaultScope` excluye el hash, login usa scope `withPassword`, create/update devuelven usuario saneado, logger redacta claves, `clave=valor` y JWTs. Verificado: ninguna respuesta contiene `password_usuario`. |
| C-06 | Subidas sin límites de tamaño ni validación real de tipo (varios multer sin `limits`, `multerConfigInteraccion`/`multerConfigDocumentacion` aceptaban cualquier tipo) → DoS y XSS almacenado. | ✅ RESUELTO | `a4459d9` + esta iteración. `limits.fileSize` 10 MB, allowlist de MIME y nombres saneados. **Residual cerrado:** `src/utils/fileSignature.js` valida *magic bytes* (PDF/JPEG/PNG/GIF/WEBP/BMP/TIFF/ZIP-OOXML/OLE) después de multer y borra los archivos incoherentes; montado en paciente, personal de salud, exámenes, terapias, chat (prompts/knowledge), comunidad y documentación. |

---

## Altos

| ID | Descripción | Estado | Nota |
|---|---|---|---|
| A-01 | Prompt injection directa e indirecta: contexto RAG, historial y mensaje concatenados sin delimitadores; `promptId` sin validar. | ✅ RESUELTO | `9824f58`. Bloques `<contexto_base_conocimiento>`, `<historial_conversacion>`, `<mensaje_usuario>` con escape + política "datos, no instrucciones"; `promptId` exige `activo` y canal válido; bloqueo de fuga de instrucciones en la respuesta. |
| A-02 | Rate limit evadible (identificador controlado por el cliente) y login sin protección. | ✅ RESUELTO | `9824f58`. `express-rate-limit` global (1000/15min), login (10 fallos/15min por IP+correo), chat (20/min por IP); tope por IP para visitantes (`RATE_LIMIT_VISITANTE_IP_DIARIO`, 50/día). |
| A-03 | IDOR de historial de conversación: `sessionId` ajeno inyectaba el historial de otra persona en el prompt. | ✅ RESUELTO | `9824f58`. Se valida la pertenencia del `sessionId` (público e interno) antes de usarlo. |
| A-04 | Enumeración de usuarios anónimos por cédula (`POST /chat/publico/usuario-anonimo/register` devolvía el registro existente). | ✅ RESUELTO | `9824f58`. Respuesta genérica con forma fija `{ id_usuario_anonimo, nombre }` sin filtrar PII almacenada. |
| A-05 | Credenciales de PostgreSQL hardcodeadas en `comando creacion bd docker actualizado.txt`. | ✅ RESUELTO (parcial operativo) | `9824f58`. Archivo saneado (placeholder). **Pendiente:** rotar la contraseña y purgar el historial Git. |
| A-06 | Token en cookie JS/localStorage (exfiltrable por XSS) y log del login en el cliente. | ✅ RESUELTO | `9824f58`. Cookie `HttpOnly; SameSite=Lax; Max-Age=2h` emitida por el servidor; token solo en memoria; logout limpia cookie; el cliente usa `withCredentials` + `fetchWithAuth`. |
| A-07 | JWT sin algoritmo fijado, sin issuer/audience, TTL 23 h, usuario deshabilitado seguía operando. | ✅ RESUELTO | `9824f58`. HS256 + `iss`/`aud` verificados, TTL 2 h (`JWT_EXPIRES_IN`), rechazo de usuario con `estado_usuario=false`. |
| A-08 | CORS abierto (`cors()` sin opciones) y ausencia de headers de seguridad. | ✅ RESUELTO | `9824f58`. Whitelist `CORS_ALLOWED_ORIGINS`, `helmet` (CORP cross-origin para no romper `<img>`), `x-powered-by` off, `trust proxy` configurable. |
| A-09 | Path traversal en descarga de PDFs de prompts (`prompts.service.downloadPdf`, `admin.controller`). | ✅ RESUELTO | `9824f58`. `path.basename` + contención en descarga y subida. |
| A-10 | IDOR/abuso de feedback: cualquier visitante calificaba conversaciones ajenas y disparaba aprendizaje. | ✅ RESUELTO | `9824f58`. Verificación de pertenencia (público e interno) → 404 si no es del solicitante. |

---

## Medios

| ID | Descripción | Estado | Nota |
|---|---|---|---|
| M-01 | Swagger público en `/api-docs` (divulga endpoints, parámetros y modelos). | ✅ RESUELTO | `app.js` solo monta Swagger en desarrollo; en producción exige `ENABLE_API_DOCS=true` (documentado en `.env.example`). |
| M-02 | IP spoofing vía `X-Forwarded-For` y bloqueo de IP que no aplica a rutas públicas (el `return next()` de `PUBLIC_ROUTES` ocurre antes del check). | ✅ RESUELTO | El spoofing se resolvió (`req.ip` + `TRUST_PROXY_HOPS`). El check `isIpBlocked` ahora se ejecuta antes del bypass de rutas públicas (`securityAuditMiddleware.js`). |
| M-03 | La auditoría persiste `req.query` y `params` con PII (cédulas, nombres, filtros) en `detalle`. | ✅ RESUELTO | `buildDetail` usa `sanitizeAuditDetail` (`security.utils.js`): redacta PII/secretos, acota profundidad y longitud; conserva endpoint/ID/operación. |
| M-04 | Inyección de fórmulas en exportación CSV (celdas que empiezan con `=`, `+`, `-`, `@`). | ✅ RESUELTO | `escapeCsv` delega en `escapeCsvCell`: prefija apóstrofe ante fórmulas/espacios iniciales y escapa comillas. |
| M-05 | Enumeración de usuarios en login (mensajes distintos). | ✅ RESUELTO | `9824f58`. Mensaje genérico "Credenciales incorrectas" + rate limit por IP+correo. |
| M-06 | Docker/CI: usuario root, `StrictHostKeyChecking=no`, secretos en la línea de `ssh`, `.env` potencialmente dentro de la imagen. | ✅ RESUELTO | `Dockerfile` con `npm ci --omit=dev`, `USER node` y directorios de escritura acotados; `.dockerignore` excluye `.env*`, `.git`, logs, tests y uploads; CI valida con `node --check`, usa `StrictHostKeyChecking=accept-new` y `--env-file` temporal con permisos 600. |
| M-07 | Mass assignment: controladores pasan `req.body` directo a create/update (campos no previstos, incluidos roles/estados/IDs). | ✅ RESUELTO | Listas blancas en usuarios, pacientes, personal de salud, exámenes, terapias, donaciones públicas, comunidad (persona/interacción), los 12 controladores de documentación, y los controladores de catálogos clínicos (`especialidad`, `tipo_especialidad`, `tipo_terapia`, `enfermedades`), `historia`, `atencion`, `signosvitales`, `auditoria` y `capacitaciones` (`pickModelFields`). Nota: los controladores `tipo_enfermedad` y `diagnostico` son código muerto (referencian servicios inexistentes) y fueron excluidos. |
| M-08 | `promptId` público permitía cargar prompts inactivos o no públicos. | ✅ RESUELTO | `9824f58`. Validación `activo` + `canal`. |
| M-09 | Mensajes de error internos devueltos al cliente (`error.message` en varios controladores). | ✅ RESUELTO | `app.js` normaliza cualquier respuesta 5xx (vía `res.json` y `res.send`) a `{ success: false, message: 'Error interno del servidor' }`; además se sanearon los controladores más expuestos. Los 4xx conservan mensajes de validación. |
| M-10 | Sin validación de esquema (zod/joi) ni límites por campo. | 🟡 PARCIAL | `security.utils.validatePayload` valida tipo/longitud/patrón/enum sin dependencias nuevas; aplicado a usuarios, login, cambio de contraseña, feedback y registro/pregunta anónima del chat. **Residual:** extender esquemas `validatePayload` a los catálogos clínicos y capacitaciones ya protegidos con `pickModelFields`, para validar tipos/longitudes antes de persistir. |
| M-11 | API del cliente apuntaba a `http://localhost:5000` fijo. | ✅ RESUELTO | `9824f58`. `REACT_APP_API_URL` con fallback de desarrollo. |
| M-12 | CSRF si `COOKIE_SAME_SITE=none` (cookie viajaría en peticiones cross-site). | 🟡 PARCIAL (mitigado) | Con `SameSite=Lax` (default) queda mitigado. Si se despliega con `none`, hay que añadir token CSRF de doble envío o verificación de `Origin`. |

---

## Bajos

| ID | Descripción | Estado | Nota |
|---|---|---|---|
| B-01 | `X-Powered-By` expuesto (fingerprinting Express). | ✅ RESUELTO | `9824f58`. |
| B-02 | Escritura síncrona de logs (bloquea el event loop bajo carga). | ✅ RESUELTO | `logger.js` usa stream asíncrono con cola, inicialización diferida y rotación no bloqueante por bytes (`LOGGING_MAX_MB`). |
| B-03 | Fragmento del token registrado en logs (`console.info` con últimos 4 chars). | ✅ RESUELTO | `9824f58`. Se eliminó el log. |
| B-04 | Dependencias desactualizadas: `npm audit` reporta 34 vulnerabilidades de producción (4 críticas, 18 altas, 9 medias, 3 bajas) sobre 799 dependencias. **Críticas:** RCE en `protobufjs`, SQL Injection en `sequelize`, CRLF injection en `form-data`, y creación/sobreescritura arbitraria de archivos en `tar`. **Altas:** SSRF/fuga de credenciales en `axios`, DoS/agotamiento de memoria en `ws`, y XSS en `express`. | ⏳ PENDIENTE | **Plan de remediación por fases:** (1) `npm audit fix` para parches menores sin breaking changes; (2) Actualizar `axios` a >=1.19.1, `ws` a >=8.20.2 y `express` a >=4.22.3; (3) Planificar actualización de `sequelize` y `newrelic` (breaking changes, requiere regresión E2E completa); (4) Re-ejecutar `npm audit --omit=dev` y verificar reducción de vulnerabilidades. **No aplicar `npm audit fix --force`** sin pruebas de regresión, ya que puede romper la API. |
| B-05 | Ruta mal formada `${filetype}${file}` en `index.routes.js`. | ✅ RESUELTO | Eliminada junto con el estático global (C-03, `e5be23b`). |

---

## Operativo / Entorno

| Ítem | Estado | Acción |
|---|---|---|
| `bcrypt@5.1.1` no compilaba en Node 24 (faltaba `bcrypt_lib.node`). | ✅ RESUELTO | Verificado en Node `v24.11.0`: `bcrypt@5.1.1` carga y hashea correctamente (`$2b$`). El `Dockerfile` fija `node:18-alpine` para producción. |
| `NEW_RELIC_APP_NAME` ausente (el agente New Relic falla en cada boot). | ✅ RESUELTO | Presente en `.env` local y documentado en `.env.example` junto con `NEW_RELIC_LICENSE_KEY`. |
| Contraseña de PostgreSQL aún en el historial Git (ya no está en el archivo). | ⏳ PENDIENTE | Rotarla y purgar historial. |

---

## Variables de entorno

Plantillas listas para copiar con explicación no técnica de cada variable
(valores aceptados, qué pasa si falta y consecuencias):

- **Servidor:** `servidor-fc/server/.env.example`
- **Cliente:** `cliente-fc/client/.env.example`

Resumen rápido de las nuevas:

| Variable | Obligatoria en prod | Consecuencia si falta/falla |
|---|---|---|
| `CORS_ALLOWED_ORIGINS` | Sí | La página del frontend no puede iniciar sesión (error CORS) |
| `NODE_ENV=production` | Sí | Sin HTTPS, la cookie Secure rompe el login |
| `REACT_APP_API_URL` | Sí | El frontend habla con localhost en producción |
| `NEW_RELIC_APP_NAME` | Sí | New Relic falla en cada arranque (preexistente) |
| `JWT_ISSUER` / `JWT_AUDIENCE` | No (defaults) | Cambiarlos invalida todas las sesiones al instante |
| `JWT_EXPIRES_IN` | No (default 2h) | Solo afecta a tokens nuevos; sincronizado con la cookie |
| `COOKIE_SAME_SITE` | No (default lax) | `none` abre CSRF (exige HTTPS + protección extra) |
| `TRUST_PROXY_HOPS` | Solo con proxy | Con proxy y vacío, todos comparten IP (límites rotos) |
| `RATE_LIMIT_VISITANTE_IP_DIARIO` | No (default 50) | 0 = sin límite (piso de seguridad) |

Nota: la cookie de sesión usa `JWT_EXPIRES_IN` (misma duración), de modo que
si se cambia la vida del token, la cookie lo sigue automáticamente.

---

## Cambios de esta iteración (2026-11-01)

- `src/utils/security.utils.js`: listas blancas (`pickFields`/`pickModelFields`), auditoría sin PII, escape CSV, validación de payload y `ValidationError`.
- `src/utils/fileSignature.js`: validación de *magic bytes* y middleware que elimina archivos incoherentes (C-06).
- `app.js`: Swagger condicionado por `ENABLE_API_DOCS`, normalización de 5xx (M-09) y orden de middlewares.
- `securityAuditMiddleware.js`: bloqueo de IP antes de rutas públicas y auditoría saneada (M-02/M-03).
- Controladores: usuarios, pacientes, personal de salud, exámenes, terapias, donaciones públicas, comunidad (persona/interacción) y chat público (validación y errores genéricos).
- Subidas: middleware de firmas en paciente, personal, exámenes, terapias, chat, comunidad y documentación.
- Documentación: los 12 controladores de `documentacion.controllers/` filtran `req.body` con `pickModelFields` y devuelven 500 genéricos; rutas de subida validan *magic bytes*. Chat público: esquemas `validatePayload` en `registrarAnonimo` y `crearPreguntaAnonima`.
- `logger.js` asíncrono (B-02); `Dockerfile`/`.dockerignore` y CI/CD endurecidos (M-06).
- Pruebas: `__tests__/security.utils.test.js` y `__tests__/fileSignature.test.js` (15 casos). Suite servidor: 171 pruebas pasando, 12 omitidas.

## Próximos pasos (orden propuesto)

1. Extender esquemas `validatePayload` (M-10) a los catálogos clínicos y capacitaciones ya protegidos con `pickModelFields` (M-07 ya resuelto en esos controladores).
2. Eliminar o corregir el código muerto de `tipo_enfermedad` y `diagnostico` (controladores que referencian servicios inexistentes; riesgo de fallo en tiempo de ejecución).
3. B-04: actualización planificada de dependencias con `npm audit fix`, pruebas de regresión y lockfile versionado.
4. C-03 residual (fotos autenticadas vía blob) - refactor de cliente.
5. Operativo: rotar la contraseña de PostgreSQL y purgar el historial Git.
6. M-12: si se despliega con `COOKIE_SAME_SITE=none`, añadir token CSRF/validación de `Origin`.