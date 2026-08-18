# AGENTS.md - FCC Monorepo

## Project Overview

Monorepo with two apps:
- **Client** (`cliente-fc/client/`): React 18 + Material-UI (CRA)
- **Server** (`servidor-fc/server/`): Express.js + Sequelize + PostgreSQL

Server entry point: `servidor-fc/server/app.js` (not `index.js`).
API base path: `/api/fcc`.
Swagger docs: `/api-docs` (served by `swagger-ui-express`).

## Build & Test Commands

### Client
```bash
cd cliente-fc/client
npm install
npm start                          # Dev server on port 3000
npm run build                      # Production build
npm test -- --watchAll=false       # Run all tests once
npm test -- --testPathPattern="filename" --watchAll=false  # Single test file
npx cypress run                    # Run all Cypress E2E tests
npx cypress run --spec "cypress/e2e/**/test-file.cy.js"  # Single E2E test
npx cypress open                   # Open Cypress GUI
```

### Server
```bash
cd servidor-fc/server
npm install
node app.js                        # Start server (requires PostgreSQL)
npx sequelize-cli db:migrate       # Run migrations
npm run db:seed:required           # Required seeders only
npm run db:seed:optional           # Optional seeders only
npm run db:seed:all                # All seeders
npm test                           # Jest (--forceExit --detectOpenHandles)
```

**No root `package.json` is committed.** Each app manages its own dependencies.

## Project Structure

### Client (`cliente-fc/client/src/`)
```
src/
├── components/         # Shared UI (Menu, Drawer, PdfGenerator, ChatBotIA.jsx)
├── modules/            # Feature modules: chatbot/, gestion/, salud/, sistema/, public/
├── routes/             # PrivateRoute.js (route guard)
├── services/           # API layer (*Service.js), apiConfig.js (BASE_API_URL)
├── utils/
└── App.js / index.js
```

### Server (`servidor-fc/server/src/`)
```
src/
├── config/             # db.js (env vars), config.js (Sequelize CLI config)
├── controllers/        # Per-domain: chatcliente/, chatservidor/, historiaclinica/, etc.
├── docs/               # swagger.definitions.js
├── libs/               # Sequelize instance
├── middleware/         # verifyToken.js, securityAuditMiddleware.js
├── migrations/
├── models/             # Per-domain subdirs + index.models.js (Sequelize init)
├── routes/             # Per-domain route files + index.routes.js (router setup)
├── scripts/
├── seeders/
├── services/           # Per-domain business logic
├── uploads/            # Static file storage (multer)
└── utils/              # validations.js, multerConfig.js
```

## Code Style

- **Language**: JavaScript (ES6+) — no TypeScript
- **Client**: ES6 `import`/`export`
- **Server**: CommonJS `require`/`module.exports`
- **No Prettier/ESLint config at root** — follow existing file conventions

### Naming Conventions
| Type | Convention | Example |
|------|-----------|---------|
| React components | PascalCase | `PacienteTable`, `ModalAddPaciente` |
| Functions/vars | camelCase | `fetchPacientes`, `handleEditClick` |
| Constants | UPPER_SNAKE_CASE | `API_URL`, `TOKEN_COOKIE_NAME` |
| Files | kebab-case or PascalCase | `modal-add-paciente.js` or `Paciente.js` |
| DB tables | snake_case | `paciente`, `historia` |
| API routes | kebab-case | `/fcc-pacientes`, `/nueva-atencion` |
| Server domains | directory per domain | `chatcliente.services/`, `historiaclinica.models/` |

### Client Patterns
- Functional components with hooks only (no class components)
- Destructure props in component signature
- State: descriptive names (`pacientes`, `loading`, `modalOpen`)
- Event handlers: `handle*Noun*Verb` (`handleDrawerToggle`, `handleEditModalClose`)
- MUI (`@mui/material`, `@mui/icons-material`, `@mui/lab`)
- `<Box sx={{ ... }}>` for styling, Dialog for modals
- React Context for global state (`MenuContext`, `PacienteContext`)
- API calls via services in `src/services/` using `apiConfig.js` constants

### Server Patterns
- Controller-Service-Model layers
- Controllers instantiate service classes: `const service = new Service();`
- Response format: `{ success: true, data: <response> }` or `{ success: false, message: <error> }`
- Controllers wrap logic in try/catch, return 500 on error
- Routes registered via `setupXxxRoutes(router)` in `src/routes/index.routes.js`
- JWT auth: `Authorization: Bearer <token>` header, token in cookie `auth_token`
- File uploads via multer (see `utils/multerConfig.js`)
- Audit logging: `auditoriaServices.logAuditAction()` for critical operations

## Database

- **ORM**: Sequelize
- **DB**: PostgreSQL, schema `fcc_historiaclinica`
- Tables in snake_case, model names singular (`Paciente` → table `paciente`)
- Models define static `config()` and `associate()` methods
- Models loaded via `src/models/index.models.js`
- Migrations + seeders via Sequelize CLI (`src/config/config.js` for DB connection)

**Env var names** (in `.env`):
```
DB_USER, DB_PASSWORD, DB_DATABASE, DB_HOST, DB_PORT
JWT_SECRET, PORT, OPENAI_API_KEY, CIE11_CLIENT_ID, CIE11_CLIENT_SECRET
```

## Testing

- **Unit**: Jest (CRA default) in `src/__tests__/` or alongside components
- **E2E**: Cypress in `cypress/e2e/` organized by feature
- Cypress custom command: `cy.login()` from `cypress/support/commands.js`
- Server tests use `supertest` for HTTP assertions
- Server `npm test` runs with `--forceExit --detectOpenHandles` (pg/OpenAI connections)

## Chatbot Module

Split across client and server:
- **Client**: `src/modules/chatbot/` — `ChatbotDashboard.js`, `chatcliente/`, `chatservidor/`
- **Client components**: `ChatBotIA.jsx` (public), `ChatIAServidor.jsx` (admin)
- **Server services**: `chatcliente.services/`, `chatservidor.services/`
- **Server routes**: `chatcliente.routes/`, `chatservidor.routes/`
- OpenAI integration: `openaiService.js` (server), `iaService.js` (client)
- pgvector for semantic search in `chatservidor.services/`

## Common Pitfalls

- `selectedPaciente` from context is `id_paciente`, NOT `id_historia` — always resolve via `getHistorias()` + `.find()` when you need historia ID
- Photo upload paths: multer saves to `/uploads/comunidad/personas/` (not `/uploads/personas/`)
- Seeder `20240809000007-comunidad-geo.js` does NOT insert regions; use `20240809000010-comunidad-geo-regiones.js` for regions
- Server `PacienteService.findOne()` does NOT include the `historia` association by default
- Server `app.js` entry point — there is no `index.js` at the server root
- `newrelic_agent.log` is gitignored — do not commit it
- Root `package.json` is not committed (untracked) — do not commit it
- `.husky/` was removed — no pre-commit or pre-push hooks active
