/**
 * Auditoria (solo admin).
 * Valida la carga del listado con la API stubbeada.
 */
describe('Auditoria - panel administrativo', () => {
  beforeEach(() => {
    cy.login();
    cy.intercept('GET', '**/auditoria', { statusCode: 200, body: [] }).as('auditorias');
  });

  it('carga el listado de auditorias', () => {
    cy.visit('/fcc-auditoria');

    cy.wait('@auditorias');
    cy.contains(/Auditor.as Generales/).should('be.visible');
  });
});
