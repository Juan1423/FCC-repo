/**
 * Modulo Normativa (solo admin).
 * Verifica el dashboard y el cambio de pestanas sin depender del backend.
 */
describe('Normativa - dashboard', () => {
  beforeEach(() => {
    cy.login();
    cy.intercept('GET', '**/normativa', { statusCode: 200, body: [] }).as('normativas');
    cy.intercept('GET', '**/tipo_normativa', { statusCode: 200, body: [] }).as('tipos');
  });

  it('muestra el dashboard y sus pestanas', () => {
    cy.visit('/fcc-normativa');

    cy.get('h1').contains('Normativa').should('be.visible');
    cy.contains('[role="tab"]', 'Normativas').should('be.visible');
    cy.contains('[role="tab"]', 'Tipos de Normativa').should('be.visible');
  });

  it('cambia a la pestana Tipos de Normativa', () => {
    cy.visit('/fcc-normativa');

    cy.contains('[role="tab"]', 'Tipos de Normativa')
      .click()
      .should('have.attr', 'aria-selected', 'true');
  });
});
