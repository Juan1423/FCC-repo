# AGENTS.md - FCC Monorepo

## Project Overview

Monorepo with two apps (no root `package.json`):
- **Client** (`cliente-fc/client/`): React 18 + MUI 5 (CRA 5)
- **Server** (`servidor-fc/server/`): Express + Sequelize 6 + PostgreSQL

Server entry point: `servidor-fc/server/app.js` (NOT `index.js` — `package.json` has `"main": "index.js"` but that file does not exist).
API base path: `/api/fcc`. Swagger: `/api-docs`.

## Build & Test Commands

### Client
```bash
cd cliente-fc/client
npm install
npm start                              # Dev server on port 3000
npm run build                          # Production build
npm run lint                           # ESLint (src/**/*.{js,jsx})
npm run lint:fix                       # Auto-fix lint issues
npm test -- --watchAll=false           # Run all unit tests once
npm test -- --testPathPattern="name" --watchAll=false  # Single test file
npx cypress run                        # All Cypress E2E
npx cypress run --spec "cypress/e2e/**/file.cy.js"  # Single E2E
npx cypress open                       # Cypress GUI
```

### Server
```bash
cd servidor-fc/server
npm install
node app.js                            # Start server (port 5000, requires PostgreSQL)
npx sequelize-cli db:migrate           # Run migrations
npm run db:seed:required               # Required seeders only
npm run db:seed:optional               # Optional seeders only
npm run db:seed:all                    # All seeders (required + optional)
npm test                               # Jest (--forceExit --detectOpenHandles)
npm run test:watch                     # Jest in watch mode
npm run test:coverage                  # Jest with coverage
```

## Architecture Notes

### Client (`cliente-fc/client/src/`)
- `components/base/` — Context providers: `MenuContext.js`, `PacienteContext.js`
- `components/` — Shared UI (Menu, Drawer, PdfGenerator, ChatBotIA.jsx)
- `modules/` — Feature domains: `chatbot/`, `gestion/`, `salud/`, `sistema/`, `public/`
- `routes/` — `PrivateRoute.js` (route guard)
- `services/` — API layer (`*Service.js`), `apiConfig.js` exports `API_URL` (= `BASE_API_URL + /api/fcc`)
- `__mocks__/axios.js` — Global Jest mock for axios
- Context: `PacienteContext` persists `selectedPaciente` to `localStorage`
- Contexts wrapped in `CombinedProviders` in `App.js`

### Server (`servidor-fc/server/src/`)
- `config/` — `db.js` (env vars), `config.js` (Sequelize CLI), `chatConfig.js` (OpenAI + chatbot settings)
- `controllers/`, `services/`, `models/`, `routes/` — Per-domain subdirectories
- `middleware/` — `securityAuditMiddleware.js` (global, handles auth + audit), `verifyToken.js` (granular auth helpers)
- `uploads/` — Subdirs: `chatbot/`, `comunidad/`, `pacientes/`, `personal/`, `examenes/`, `terapias/`, etc.
- `test-utils/createTestApp.js` — Shared Express app factory for controller tests
- Multiple multer configs in `utils/` (not just `multerConfig.js`): `multerConfigPersona.js`, `multerConfigExamen.js`, etc.

### Route Registration
- `routerApi(app)` in `src/routes/index.routes.js` mounts all routes on `/api/fcc`
- Exception: `setupUploadsRoutes(app)` and static file routes mount on `app` directly
- Chat routes have 6 sub-routers: `/chat/publico`, `/chat/interno`, `/chat/admin`, `/chat/knowledge`, `/chat/aprendizaje`, `/chat/config`

## Code Style

- **Language**: JavaScript (ES6+) — no TypeScript
- **Client**: ES6 `import`/`export`
- **Server**: CommonJS `require`/`module.exports`
- **No Prettier at root**. Client has ESLint (`.eslintrc.json`): extends `react-app`, enforces `react-hooks/rules-of-hooks` as error, `react-hooks/exhaustive-deps` as warning.

### Naming Conventions
| Type | Convention | Example |
|------|-----------|---------|
| React components | PascalCase | `PacienteTable`, `ModalAddPaciente` |
| Functions/vars | camelCase | `fetchPacientes`, `handleEditClick` |
| Constants | UPPER_SNAKE_CASE | `API_URL`, `TOKEN_COOKIE_NAME` |
| Files | camelCase (most common) | `multerConfig.js`, `openaiService.js` |
| DB tables | snake_case | `paciente`, `historia` |
| API routes | kebab-case or camelCase | `/fcc-pacientes`, `/nueva-atencion` |
| Server domains | directory per domain | `chatcliente.services/`, `historiaclinica.models/` |

### Client Patterns
- Functional components with hooks only (no class components)
- Destructure props in component signature
- Event handlers: `handle*Noun*Verb` (`handleDrawerToggle`, `handleEditModalClose`)
- MUI (`@mui/material`, `@mui/icons-material`, `@mui/lab`, `@mui/x-date-pickers`)
- `<Box sx={{ ... }}>` for styling, Dialog for modals
- SweetAlert2 for popups, framer-motion for animations, recharts for charts
- API calls via services in `src/services/` using `apiConfig.js` constants

### Server Patterns
- Controller-Service-Model layers
- Controllers instantiate service classes: `const service = new Service();`
- Response format: `{ success: true, data: <response> }` or `{ success: false, message: <error> }`
- Controllers wrap logic in try/catch, return 500 on error
- **Logging**: `src/utils/logger.js` intercepta TODOS los `console.*` vía shim global instalado en `app.js` (tras `require('newrelic')`). Sin imports explícitos: cualquier `console.log/warn/error` ya queda con timestamp, nivel, `[archivo:línea]`, redacción de campos sensibles y se escribe en `logs/app.log` (gitignored). Si un arg es `Error`, escribe el stack y dispara `newrelic.noticeError`. Tamaño máximo de archivo opcional: `LOGGING_MAX_MB` (default 5). `sequelize` usa `logging: false` (no inundar el log). Pasar el objeto `Error` (no solo `.message`) a `console.error` para capturar stack + NewRelic.
- JWT auth: **custom `token` header** (`req.headers["token"]`), NOT `Authorization: Bearer`. Token stored in client cookie `auth_token`.
- `securityAuditMiddleware.js` runs globally on `/api/fcc` — handles auth + audit logging in one pass
- File uploads via multer — many specialized configs in `utils/multerConfig*.js`

## Database

- PostgreSQL, schema `fcc_historiaclinica`
- Tables in snake_case, model names singular (`Paciente` → table `paciente`)
- Models loaded via `src/models/index.models.js`
- Migrations + seeders via Sequelize CLI (`src/config/config.js` for DB connection)

**Critical Sequelize hook**: An `afterCreate` hook on `Paciente` auto-creates a `Historia` record. Do not create Historia manually when creating a Paciente.

**Env vars** (in `servidor-fc/server/.env`):
```
DB_USER, DB_PASSWORD, DB_DATABASE, DB_HOST, DB_PORT, PORT
JWT_SECRET, OPENAI_API_KEY, CIE11_CLIENT_ID, CIE11_CLIENT_SECRET
BASE_URL, NODE_ENV, OPENAI_MODEL
NEW_RELIC_APP_NAME, NEW_RELIC_LICENSE_KEY
```
Plus `FUNDACION_*` vars for chatbot branding and `LOGGING_*` vars for debug output.

## Testing

- **Client unit**: Jest (CRA default), tests in `__tests__/` subdirs adjacent to code. `__mocks__/axios.js` provides global mock.
- **Client E2E**: Cypress in `cypress/e2e/` organized by feature (7 subdirs). `cy.login()` custom command from `cypress/support/commands.js` reads creds from `cypress.env.json`. Base URL: `http://localhost:3000`.
- **Server**: Jest + supertest. Tests in `__tests__/` at server root. `test-utils/createTestApp.js` for controller tests.

## Chatbot Module

Split across client and server:
- **Client**: `src/modules/chatbot/` — `ChatbotDashboard.js`, `chatcliente/`, `chatservidor/`
- **Client components**: `ChatBotIA.jsx` (public/visitor), `ChatIAServidor.jsx` (admin), `ChatAccessModal.jsx`, `HistorialUnificado.jsx`
- **Server**: 9 service files (rag, guardrails, learning, openai, knowledge, prompts, conversations, config), 12 model files, 6 controllers
- Two OpenAI integration patterns: legacy `openaiService.js` (node-fetch), modern `chat.services/openai.service.js` (OpenAI SDK)
- Semantic search via cosine similarity (manual implementation, not pgvector SQL operators). `searchSimilar` ordena por `cosineSimilarity` y acepta un chunk si `similarity >= rag_similarity_threshold`
- Multi-turn memory (Fase 2): `conversationsService.getRecentBySessionId(sessionId, limit)` inyecta bloque `HISTORIAL RECIENTE DE LA CONVERSACIÓN` en `construirPromptCompleto`. Claves `memory_enabled`/`memory_max_turnos`. Público solo cuando `consentimiento=true`; interno siempre
- Chunking configurable (Fase 4): `chunk_size`/`chunk_overlap` (UI GuardrailsConfig, constraints en `config.service.js` CONFIG_CONSTRAINTS). `ingestDocumento` lee la config vía `ragService.configLoader` (seteado en `chat.services/index.js`). Aplica SOLO a PDFs subidos después del cambio (no re-indexa existentes)
- OCR (Fase 5): `src/utils/ocr.service.js` usa `pdfjs-dist` (legacy build + `@napi-rs/canvas` + `DOMMatrix` global + worker como `file://` URL) y `tesseract.js` (spa+eng). Extracción POR PÁGINA: `extraerTextoCompletoConOCR` conserva el texto nativo y hace OCR **solo en páginas sin texto** (<5 chars) cuando `ocr_enabled=true`; el checkbox del upload (`opciones.ocr`) fuerza OCR en todas las páginas. PDFs mixtos (parte texto + parte imagen) ahora indexan el contenido de las páginas-imagen. Columnas `ocr`/`paginas_ocr` en `chat_documentos`. "12345" puede leerse como "17345" por resolución del render
- Monitor RAG (`chat_rag_monitor`): registra decision='responder' (chatPublico/chatInterno). La rama off_topic fue ELIMINADA del flujo (controllers) — hoy el off-topic lo maneja el umbral estricto del RAG (respuesta por defecto sin contexto), sin registrar decision='off_topic'.
- Throttle (Fase 6): `ingestDocumento` hace `setTimeout 100ms` entre generación de embeddings

## Common Pitfalls

- **Embeddings: todos los modelos deben ser consistentes.** Cambiar `OPENAI_EMBEDDING_MODEL` exige regenerar NO SOLO `chat_conocimiento.embedding`, sino TAMBIÉN `chat_tema_valido.embedding` y `chat_respuesta_canonica.embedding_trigger` (Fase 1 lo olvidó → guardrails `isOnTopic` con cos≈0 → TODO se clasificaba `off_topic`). Diagnóstico: coseno de una query 3-small vs un embedding almacenado ~0.7+ si coincide, ~0 si distinto modelo.
- **Guardrails actuales (calibración 2026):** el guardrail Off-Topic fue ELIMINADO (`isOnTopic`, clave `off_topic_threshold`, ramas `off_topic` en controllers). El off-topic lo maneja el piso duro del RAG: `RAG_UMBRAL_ESTRICTO=0.55` en `rag.service.js` (`Math.max(threshold, RAG_UMBRAL_ESTRICTO)` en `searchSimilar`). Guardrail Sensible: `UMBRAL_GUARDRAIL_SENSIBLE=0.45` en `guardrails.service.js`, detecta por keywords Y coseno (≥0.45) contra `chat_protocolos_sensibles`, backfill de `embedding_keywords` si es null. Incluye protocolos de salud Y seguridad (jailbreak/inyección de prompt, hackeo, PII) — accion_requerida 'derivar_humano_inmediato' (seeders file `20260917000001-chat-protocolos-seguridad.js`).
- Off-topic NO corta si RAG tiene contexto: `tieneContextoRelevante()` (openaiService) decide. Umbrales DB actuales: `rag_similarity_threshold=0.55` (piso duro de código 0.55). `chat_tema_valido` ya NO se consulta en runtime, solo en el script de calibración (`calibracion-umbrales.js`, columna Off-Topic).
- `selectedPaciente` from context is `id_paciente`, NOT `id_historia` — always resolve via `getHistorias()` + `.find()` when you need historia ID
- Photo upload paths: multer saves to `/uploads/comunidad/personas/` (not `/uploads/personas/`)
- Seeder `20240809000007-comunidad-geo.js` does NOT insert regions; use `20240809000010-comunidad-geo-regiones.js` for regions
- Server `PacienteService.findOne()` does NOT include the `historia` association by default
- Server `app.js` entry point — there is no `index.js` at the server root
- `newrelic_agent.log` is gitignored — do not commit it
- Root `package.json` is not committed — do not commit it
- `.husky/` was removed — no pre-commit or pre-push hooks active
- Server uses `node-fetch`, `uuid`, `form-data` but they are NOT in `package.json` (rely on transitive deps — fragile)
