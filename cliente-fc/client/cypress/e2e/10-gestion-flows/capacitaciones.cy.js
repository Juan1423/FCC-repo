/**
 * Modulo Capacitaciones (solo admin).
 * Cubre apertura del formulario, validacion y alta de una capacitacion.
 */
describe('Capacitaciones - alta desde el dashboard', () => {
  beforeEach(() => {
    cy.login();
    cy.intercept('GET', '**/capacitacion', { statusCode: 200, body: [] }).as('capacitaciones');
    cy.intercept('POST', '**/capacitacion', { statusCode: 200, body: { success: true } }).as('crear');
  });

  it('muestra el dashboard y abre el formulario', () => {
    cy.visit('/fcc-capacitaciones');

    cy.contains(/Capacitaciones Internas y Externas/).should('be.visible');
    cy.contains('button', /Nueva Capacitaci.n/).click();

    cy.get('[role="dialog"]').should('be.visible');
    cy.contains('[role="dialog"]', /Nueva Capacitaci.n/).should('be.visible');
  });

  it('cancela el formulario sin guardar', () => {
    cy.visit('/fcc-capacitaciones');
    cy.contains('button', /Nueva Capacitaci.n/).click();

    cy.contains('button', 'Cancelar').click();
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('valida titulo y fecha de inicio obligatorios', () => {
    cy.visit('/fcc-capacitaciones');
    cy.contains('button', /Nueva Capacitaci.n/).click();

    cy.on('window:alert', (mensaje) => {
      expect(mensaje).to.contain('obligatorios');
    });
    cy.contains('button', 'Guardar').click();
  });

  it('crea una capacitacion nueva', () => {
    cy.visit('/fcc-capacitaciones');
    cy.contains('button', /Nueva Capacitaci.n/).click();

    cy.get('[role="dialog"] input').filter(':visible').first().type('Curso de prueba');
    cy.get('[role="dialog"] input[type="date"]').first().type('2026-05-01');
    cy.contains('button', 'Guardar').click();

    cy.wait('@crear');
    cy.get('[role="dialog"]').should('not.exist');
  });
});
