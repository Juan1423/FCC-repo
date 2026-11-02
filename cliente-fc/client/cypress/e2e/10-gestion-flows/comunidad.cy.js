/**
 * Modulo Comunidad: personas e interacciones.
 * Se stubbean los listados para validar la navegacion del flujo.
 */
describe('Comunidad - personas e interacciones', () => {
  beforeEach(() => {
    cy.login();
    cy.intercept('GET', '**/persona', { statusCode: 200, body: [] });
    cy.intercept('GET', '**/interaccion', { statusCode: 200, body: [] });
  });

  it('lista personas y navega al formulario de alta', () => {
    cy.visit('/fcc-comunidad/personas');

    cy.contains('Personas de la Comunidad').should('be.visible');
    cy.contains('button', 'Agregar Persona').click();

    cy.url().should('include', '/fcc-comunidad/personas/nueva');
  });

  it('muestra la vista de interacciones', () => {
    cy.visit('/fcc-comunidad/interacciones');

    cy.contains('Interacciones de la Comunidad').should('be.visible');
  });
});
