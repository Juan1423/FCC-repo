# AGENTS.md - FCC Monorepo Development Guidelines

## Project Overview

This is a monorepo containing:
- **Client** (`E:\Herramientas Clases Espe\clases espe\Practicas\Proyectos a unificar\FCC-monorepo\cliente-fc\client\`): React 18 + Material-UI application
- **Server** (`E:\Herramientas Clases Espe\clases espe\Practicas\Proyectos a unificar\FCC-monorepo\servidor-fc\server\`): Express.js + Sequelize + PostgreSQL API

## Build Commands

### Client

```bash
cd cliente-fc/client
npm install           # Install dependencies
npm start            # Start development server (port 3000)
npm run build        # Production build
npm test             # Run Jest tests (interactive)
npm run test -- --watchAll=false  # Run tests once
npm run eject       # Eject create-react-app config
```

### Server

```bash
cd servidor-fc/server
npm install
npm start            # Start server (requires PostgreSQL)
npm run db:seed:required    # Run required seeders
npm run db:seed:optional    # Run optional seeders
npm run db:seed:all         # Run all seeders
```

### Running a Single Test

**Jest (Client unit tests):**
```bash
cd cliente-fc/client
npm test -- --testPathPattern="filename" --watchAll=false
npm test -- --testPathIgnorePatterns="cypress" --watchAll=false
```

**Cypress (E2E tests):**
```bash
cd cliente-fc/client
npx cypress run                    # Run all E2E tests
npx cypress run --spec "cypress/e2e/01-paciente-tests/añadir-paciente.cy.js"
npx cypress open                   # Open Cypress GUI
```

## Project Structure

### Client (`cliente-fc/client/src/`)

```
src/
├── components/         # Shared UI components
│   ├── base/          # Context providers (MenuContext, PacienteContext)
│   ├── data/          # Static data
│   ├── global/        # Global utilities
│   ├── styles/       # CSS/styled components
│   └── *.js          # Reusable components (Navbar, Drawer, Inputs, etc.)
├── modules/           # Feature modules by domain
│   ├── chatbot/      # AI chatbot functionality
│   ├── gestion/      # Management模块 (normativa, proceso, capacitación, donations)
│   ├── salud/       # Health模块 (pacientes, personalSalud, terapia, atencion, historia)
│   └── sistema/      # System模块 (auth, usuarios, auditoria, configuracion)
├── routes/           # Route guards (PrivateRoute)
├── services/         # API service layer (*Service.js)
│   ├── apiConfig.js  # API base configuration
│   ├── authServices.js
│   └── *.js         # Domain services
├── App.js           # Main app component with routes
└── index.js         # Entry point
```

### Server (`servidor-fc/server/src/`)

```
src/
├── config/           # Configuration (db.js, config.js)
├── controllers/     # Request handlers (name.controller.js)
│   └── domain/
├── docs/            # Swagger definitions
├── libs/            # Sequelize instance
├── migrations/      # Database migrations
├── models/          # Sequelize models (index.models.js + domain models)
├── routes/          # Route definitions
├── services/       # Business logic layer
├── middleware/    # Custom middleware (verifyToken.js)
└── utils/          # Utilities (validations, multer configs)
```

## Code Style Guidelines

### JavaScript Standards

- **Language**: JavaScript (ES6+) - no TypeScript in this codebase
- **Modules**: React uses ES6 imports; Server uses CommonJS (`require`)
- **File naming**: `camelCase.js` for all files (controllers, services, components)
- **Component files**: PascalCase for React components (e.g., `Paciente.js`, `ModalAdd.js`)

### Import Conventions

**Client imports (ES6):**
```javascript
import React, { useState, useEffect } from 'react';
import { Box, Button, Dialog } from '@mui/material';
import { getPacientes } from '../../services/pacientesServices';
import NavbarAdmin from '../../components/NavbarAdmin';
```

**Server imports (CommonJS):**
```javascript
const PacienteService = require('../../services/historiaclinica.services/paciente.service');
const { validarTelefono } = require('../../utils/validations');
```

### React Component Patterns

1. **Functional components with hooks**:
```javascript
import * as React from 'react';
import { useState, useEffect } from 'react';

const ComponentName = () => {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    // side effects on mount
  }, []);

  return (<JSX />);
};

export default ComponentName;
```

2. **State naming**: Use descriptive names - `pacientes`, `loading`, `modalOpen`, `selectedPaciente`
3. **Event handlers**: `handle*Noun*Verb` pattern - `handleDrawerToggle`, `handleEditModalClose`
4. **Props**: Destructure in component signature when possible

### Server Patterns

1. **Controller structure**:
```javascript
const Service = require('../../services/domain.service');
const service = new Service();

const create = async (req, res) => {
  try {
    const response = await service.create(req.body);
    res.json({ success: true, data: response });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

module.exports = { create, get, update, delete };
```

2. **Response format**:
   - Success: `{ success: true, data: <response> }`
   - Error: `{ success: false, message: <error.message> }` with appropriate HTTP status

### Naming Conventions

| Type | Convention | Example |
|------|-----------|----------|
| Components | PascalCase | `PacienteTable`, `ModalAddPaciente` |
| Functions | camelCase | `fetchPacientes`, `handleEditClick` |
| Variables | camelCase | `pacientes`, `selectedState` |
| Constants | UPPER_SNAKE_CASE | `API_URL`, `TOKEN_COOKIE_NAME` |
| Files | kebab-case or PascalCase | `modal-add-paciente.js` or `Paciente.js` |
| Database tables | snake_case | `pacientes`, `historia_clinica` |
| API routes | kebab-case | `/fcc-pacientes`, `/nueva-atencion` |

### Error Handling

**Client-side:**
```javascript
try {
  const data = await getPacientes();
  setPacientes(data);
} catch (error) {
  console.error("Error fetching pacientes:", error);
  setErrorAlert(true);
} finally {
  setLoading(false);
}
```

**Server-side:**
```javascript
try {
  const response = await service.create(req.body);
  res.json({ success: true, data: response });
} catch (error) {
  res.status(500).send({ success: false, message: error.message });
}
```

### API Design

- RESTful endpoints
- JWT authentication via `Authorization: Bearer <token>` header
- Token stored in cookies (client) with `auth_token` key
- Audit logging for critical operations via `auditoriaServices.logAuditAction()`

### Database

- **ORM**: Sequelize
- **Database**: PostgreSQL
- **Tables**: Use snake_case naming, singular model names
- **Migrations**: Run via Sequelize CLI
- **Seeders**: `npm run db:seed:*` scripts available

### Testing

**E2E with Cypress:**
- Tests in `cypress/e2e/` organized by feature (01-paciente-tests, etc.)
- Use custom `cy.login()` command from `cypress/support/commands.js`
- Wait for elements: `cy.get('table').should('be.visible')`

**Cypress test pattern:**
```javascript
describe('Feature Name', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/route');
  });

  it('should do something', () => {
    cy.contains('button', 'Label').click();
    // assertions
  });
});
```

### Material-UI Usage

- Use MUI components (`@mui/material`)
- Use MUI Icons (`@mui/icons-material`)
- Component prop patterns: `<Box sx={{ ... }}>`, `<Tooltip title="...">`
- Dialog pattern for modals with `open`, `onClose` props

### State Management

- React Context for global state (`MenuContext`, `PacienteContext`)
- Local state with `useState` for component-level state
- Services layer for API communication

### Form Handling

- Controlled components with state
- Validation via service utilities (`validation.js`)
- MUI Autocomplete for dropdowns

## Common Tasks

### Adding a New Module

1. Create folder in `src/modules/<domain>/`
2. Add views, components, services as needed
3. Import in `App.js` and add Route
4. Add server routes in `servidor-fc/server/src/routes/`

### Adding a Database Table

1. Create model in `servidor-fc/server/src/models/`
2. Create migration in `servidor-fc/server/src/migrations/`
3. Create controller and service
4. Add routes in appropriate route file

### Running the Application

1. Ensure PostgreSQL is running
2. Run migrations: `cd servidor-fc/server && npx sequelize-cli db:migrate`
3. Run seeders (optional): `npm run db:seed:all`
4. Start server: `npm start` (in server folder)
5. Start client: `npm start` (in client folder)

## Environment Variables

**Client** (create `.env` in client root):
```
REACT_APP_API_URL=http://localhost:5000
```

**Server** (create `.env` in server root):
```
DB_NAME=fcc
DB_USER=postgres
DB_PASS=password
DB_HOST=localhost
PORT=5000
JWT_SECRET=your-secret
```