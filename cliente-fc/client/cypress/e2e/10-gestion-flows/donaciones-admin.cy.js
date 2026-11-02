/**
 * Panel administrativo de Donaciones.
 * Verifica que el dashboard cargue y que las pestanas Nacionales/Internacionales
 * alternen el contenido sin depender del backend.
 */
describe('Donaciones - panel administrativo', () => {
  beforeEach(() => {
    cy.login();
    cy.intercept('GET', '**/donacion_nacional', { statusCode: 200, body: [] }).as('nacionales');
    cy.intercept('GET', '**/donacion_internacional', { statusCode: 200, body: [] }).as('internacionales');
    cy.intercept('GET', '**/donante_nacional', { statusCode: 200, body: [] });
    cy.intercept('GET', '**/donante_internacional', { statusCode: 200, body: [] });
  });

  it('muestra el panel y la pestana Nacionales activa por defecto', () => {
    cy.visit('/fcc-donaciones');

    cy.contains('Donaciones').should('be.visible');
    cy.contains('[role="tab"]', 'Nacionales').should('have.attr', 'aria-selected', 'true');
  });

  it('cambia a la pestana Internacionales', () => {
    cy.visit('/fcc-donaciones');

    cy.contains('[role="tab"]', 'Internacionales')
      .click()
      .should('have.attr', 'aria-selected', 'true');
  });
});
