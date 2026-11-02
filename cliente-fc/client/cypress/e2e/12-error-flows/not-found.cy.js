/**
 * Paginas de error: 404 y acceso denegado.
 */
describe('Errores - 404 y acceso denegado', () => {
  it('muestra Error 404 en una ruta desconocida y permite volver', () => {
    cy.visit('/ruta-que-no-existe');

    cy.contains('Error 404').should('be.visible');
    cy.contains(/P.gina no encontrada/).should('be.visible');

    cy.contains(/Ir a la p.gina de inicio/).click();
    cy.url().should('eq', `${Cypress.config('baseUrl')}/`);
  });

  it('muestra la pagina de Acceso Denegado', () => {
    cy.visit('/accessdenied');

    cy.contains('Acceso Denegado').should('be.visible');
    cy.contains(/Volver a la p.gina principal/).should('be.visible');
  });
});
