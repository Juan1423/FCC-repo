/**
 * CRUD completo del modulo Capacitaciones (solo admin).
 * Cubre listar, crear, editar y eliminar desde el dashboard.
 * Se interceptan las APIs para no depender del backend.
 */
const capacitacion = {
  id_capacitacion: 1,
  titulo: 'Capacitacion existente',
  descripcion: 'Descripcion de prueba',
  tipo: 'INTERNA',
  modalidad: 'Virtual',
  fecha_inicio: '2026-01-01T00:00:00.000Z',
  fecha_fin: '2026-01-02T00:00:00.000Z',
  estado: 'PROGRAMADA',
};

const stubLista = (items = []) => {
  cy.intercept('GET', '**/capacitacion', {
    statusCode: 200,
    body: items,
  }).as('capacitaciones');
};

describe('Capacitaciones - CRUD', () => {
  beforeEach(() => {
    cy.login();
  });

  it('lista las capacitaciones existentes', () => {
    stubLista([capacitacion]);

    cy.visit('/fcc-capacitaciones');
    cy.wait('@capacitaciones');

    cy.contains('Capacitacion existente').should('be.visible');
    cy.contains('PROGRAMADA').should('be.visible');
  });

  it('crea una capacitacion nueva', () => {
    stubLista([]);
    cy.intercept('POST', '**/capacitacion', {
      statusCode: 200,
      body: { success: true },
    }).as('crear');

    cy.visit('/fcc-capacitaciones');
    cy.wait('@capacitaciones');

    cy.contains('button', /Nueva Capacitaci.n/).click();
    cy.contains('[role="dialog"]', /Nueva Capacitaci.n/).should('be.visible');

    cy.get('[role="dialog"] input').filter(':visible').first().type('Curso de prueba');
    cy.get('[role="dialog"] input[type="date"]').first().type('2026-05-01');

    cy.contains('button', 'Guardar').click();
    cy.wait('@crear');
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('edita una capacitacion existente', () => {
    stubLista([capacitacion]);
    cy.intercept('PUT', '**/capacitacion/1', {
      statusCode: 200,
      body: { success: true },
    }).as('actualizar');

    cy.visit('/fcc-capacitaciones');
    cy.wait('@capacitaciones');

    cy.contains('button', 'Editar').click();
    cy.contains('[role="dialog"]', /Editar Capacitaci.n/).should('be.visible');

    cy.get('[role="dialog"] input').filter(':visible').first()
      .clear()
      .type('Capacitacion editada');

    cy.contains('button', 'Guardar').click();
    cy.wait('@actualizar');
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('elimina una capacitacion existente', () => {
    stubLista([capacitacion]);
    cy.intercept('DELETE', '**/capacitacion/1', {
      statusCode: 200,
      body: { success: true },
    }).as('eliminar');

    cy.visit('/fcc-capacitaciones');
    cy.wait('@capacitaciones');

    cy.contains('button', 'Eliminar').click();
    cy.wait('@eliminar');
  });
});
