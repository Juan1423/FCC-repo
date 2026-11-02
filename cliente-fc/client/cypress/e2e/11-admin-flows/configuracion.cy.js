/**
 * Configuracion de la cuenta.
 * Valida el acceso y el titulo de la vista.
 */
describe('Configuracion - cuenta', () => {
  beforeEach(() => {
    cy.login();
  });

  it('muestra la configuracion de la cuenta', () => {
    cy.visit('/fcc-configuracion');

    cy.contains(/Configuraci.n de la cuenta/).should('be.visible');
  });
});
