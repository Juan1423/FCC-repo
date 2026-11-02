/**
 * Flujo de autenticacion y control de acceso (PrivateRoute).
 * Sin depender del backend: se intercepta POST /auth para simular
 * sesion invalida, rol sin permiso y admin autorizado.
 */
describe('Auth guard - control de acceso', () => {
  it('redirige a /accessdenied cuando no hay sesion valida', () => {
    cy.intercept('POST', '**/auth', {
      statusCode: 200,
      body: { isValid: false },
    }).as('auth');

    cy.visit('/fcc-auditoria');
    cy.wait('@auth');

    cy.url().should('include', '/accessdenied');
    cy.contains('Acceso Denegado').should('be.visible');
  });

  it('bloquea a un rol sin permiso (doctor en /fcc-usuarios)', () => {
    cy.intercept('POST', '**/auth', {
      statusCode: 200,
      body: { isValid: true, data: { rol: 'doctor' } },
    }).as('auth');

    cy.visit('/fcc-usuarios');
    cy.wait('@auth');

    cy.url().should('include', '/accessdenied');
    cy.contains('Acceso Denegado').should('be.visible');
  });

  it('permite a admin entrar a /fcc-auditoria', () => {
    cy.intercept('POST', '**/auth', {
      statusCode: 200,
      body: { isValid: true, data: { rol: 'admin' } },
    }).as('auth');
    cy.intercept('GET', '**/auditoria', { statusCode: 200, body: [] }).as('auditorias');

    cy.visit('/fcc-auditoria');
    cy.wait('@auth');
    cy.wait('@auditorias');

    cy.contains(/Auditor.as Generales/).should('be.visible');
  });
});
