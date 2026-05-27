# AGENTS.md - FCC Monorepo

## Project Overview

Monorepo con dos proyectos:
- **Client** (`cliente-fc/client/`): React 18 + Material-UI (CRA)
- **Server** (`servidor-fc/server/`): Express.js + Sequelize + PostgreSQL

## Build & Test Commands

### Client
```bash
cd cliente-fc/client
npm install              # Install dependencies
npm start                # Dev server on port 3000
npm run build            # Production build
npm test                 # Jest (interactive)
npm test -- --watchAll=false  # Run all tests once
npm test -- --testPathPattern="filename" --watchAll=false  # Single test file
npx cypress run          # Run all Cypress E2E tests
npx cypress run --spec "cypress/e2e/**/test-file.cy.js"  # Single E2E test
npx cypress open         # Open Cypress GUI
```

### Server
```bash
cd servidor-fc/server
npm install
npm start                          # Start server (nodemon, requires PostgreSQL)
npx sequelize-cli db:migrate       # Run migrations
npm run db:seed:required           # Required seeders
npm run db:seed:optional           # Optional seeders
npm run db:seed:all                # All seeders
```

## Project Structure

### Client (`cliente-fc/client/src/`)
```
src/
├── components/base/    # Context providers (MenuContext, PacienteContext)
├── modules/            # Feature modules (chatbot, gestion, salud, sistema)
├── routes/             # Route guards (PrivateRoute)
├── services/           # API layer (*Service.js), apiConfig.js
├── utils/              # Utilities
├── App.js / index.js
```

### Server (`servidor-fc/server/src/`)
```
src/
├── config/             # DB config, env vars
├── controllers/        # Request handlers (domain.controller.js)
├── libs/               # Sequelize instance
├── migrations/         # DB migrations
├── models/             # Sequelize models
├── routes/             # Express route definitions
├── services/           # Business logic
├── middleware/         # verifyToken.js
└── utils/              # validations.js, multerConfig.js
```

## Code Style

### JavaScript
- **Language**: JavaScript (ES6+) — no TypeScript
- **Modules**: Client uses ES6 `import`/`export`; Server uses CommonJS `require`/`module.exports`
- **Formatting**: No Prettier/ESLint config found; follow existing file conventions

### Naming
| Type | Convention | Example |
|------|-----------|---------|
| React components | PascalCase | `PacienteTable`, `ModalAddPaciente` |
| Functions/vars | camelCase | `fetchPacientes`, `handleEditClick` |
| Constants | UPPER_SNAKE_CASE | `API_URL`, `TOKEN_COOKIE_NAME` |
| Files | kebab-case or PascalCase | `modal-add-paciente.js` or `Paciente.js` |
| DB tables | snake_case | `paciente`, `historia` |
| API routes | kebab-case | `/fcc-pacientes`, `/nueva-atencion` |

### Client Patterns
- Functional components with hooks only (no class components)
- Destructure props in component signature
- State: descriptive names (`pacientes`, `loading`, `modalOpen`, `selectedPaciente`)
- Event handlers: `handle*Noun*Verb` (`handleDrawerToggle`, `handleEditModalClose`)
- MUI components (`@mui/material`), MUI Icons (`@mui/icons-material`), MUI Lab (`@mui/lab`)
- `<Box sx={{ ... }}>` for styling, `<Tooltip title="...">`, Dialog for modals
- React Context for global state (`MenuContext`, `PacienteContext`)

### Server Patterns
- Controller-Service-Model layers
- Controllers instantiate service classes: `const service = new Service();`
- Response format: `{ success: true, data: <response> }` or `{ success: false, message: <error> }`
- Controllers wrap logic in try/catch, return 500 on error

## Error Handling
- **Client:** try/catch with `console.error` + error state, finally block for `setLoading(false)`
- **Server:** try/catch in controllers, return `{ success: false, message: error.message }` with 500 status

## API Design
- RESTful endpoints under kebab-case paths
- JWT auth via `Authorization: Bearer <token>` header
- Token stored in cookie with key `auth_token`
- Audit logging: `auditoriaServices.logAuditAction()` for critical operations
- File uploads via multer (see `utils/multerConfig.js`)

## Database
- **ORM**: Sequelize
- **DB**: PostgreSQL with schema `fcc_historiaclinica`
- Tables in snake_case, model names singular (e.g., `Paciente` → table `paciente`)
- Models define static `config()` and `associate()` methods
- Migrations + seeders via Sequelize CLI

## Testing
- **Unit**: Jest (CRA default) in `src/__tests__/` or alongside components
- **E2E**: Cypress in `cypress/e2e/` organized by feature
- Cypress uses custom `cy.login()` command from `cypress/support/commands.js`
- Cypress pattern: `cy.login()` in `beforeEach`, `cy.visit('/route')`, then `cy.contains()`, `cy.get()`

## Common Pitfalls (from real bugs)
- `selectedPaciente` from context is `id_paciente`, NOT `id_historia` — always resolve via `getHistorias()` + `.find()` when you need historia ID
- Photo upload paths: multer saves to `/uploads/comunidad/personas/` (not `/uploads/personas/`)
- Seeder `20240809000007-comunidad-geo.js` does NOT insert regions; use `20240809000010-comunidad-geo-regiones.js` for regions
- Server `PacienteService.findOne()` does NOT include the `historia` association by default

## Environment Variables

**Client** (`.env` in `cliente-fc/client/`):
```
REACT_APP_API_URL=http://localhost:5000
```

**Server** (`.env` in `servidor-fc/server/`):
```
DB_NAME=fcc
DB_USER=postgres
DB_PASS=password
DB_HOST=localhost
PORT=5000
JWT_SECRET=your-secret
```
