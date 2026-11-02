/**
 * Smoke test del modulo de Documentacion.
 *
 * Objetivo: verificar que un usuario con rol permitido (admin) puede entrar a
 * /fcc-documentacion y que el dashboard renderiza su estructura basica
 * (sidebar con secciones + area principal). No valida datos de la BD, solo
 * que la pantalla carga sin romperse.
 *
 * Requisitos: cliente en http://localhost:3000 y backend + BD levantados
 * (el login es real, no esta stubbeado).
 *
 * Ejecutar:
 *   npx cypress run --spec "cypress/e2e/documentacion.cy.js"
 */

describe('Documentacion - smoke test', () => {
  beforeEach(() => {
    // Reutiliza el comando custom cy.login() (cypress/support/commands.js)
    cy.login();
    cy.visit('/fcc-documentacion');
  });

  it('carga el dashboard y muestra las secciones del sidebar', () => {
    cy.url().should('include', '/fcc-documentacion');

    // Las secciones se definen estaticamente en views/sections.js,
    // por lo que deben estar visibles aunque la BD este vacia.
    cy.contains('Documentos').should('be.visible');
    cy.contains('Indicadores').should('be.visible');
    cy.contains('Tipos de Documento').should('be.visible');
  });

  it('permite navegar a la seccion Documentos', () => {
    cy.contains('Documentos').click();

    // El dashboard cambia de vista por estado (sessionStorage), no por URL.
    // "Biblioteca central" es el kicker exclusivo de la seccion Documentos.
    cy.contains('Biblioteca central').should('be.visible');
  });
});
