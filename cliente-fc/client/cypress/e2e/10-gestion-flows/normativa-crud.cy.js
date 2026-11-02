/**
 * CRUD completo del modulo Normativa (solo admin).
 * Cubre listar, crear, editar y eliminar desde el dashboard.
 * Se interceptan las APIs para no depender del backend.
 */
const normativa = {
  id_normativa: 1,
  id_tipo_normativa: 1,
  nombre_normativa: 'Norma de prueba',
  descripcion_normativa: 'Descripcion de prueba',
  fecha_normativa: '2026-01-01',
  fecha_vigencia_normativa: '2027-01-01',
  tipo_registro_normativa: 'Registro',
};

const stubBase = (normativas = []) => {
  cy.intercept('GET', '**/tipo_normativa', {
    statusCode: 200,
    body: [{ id_tipo_normativa: 1, nombre_tipo_normativa: 'Ley' }],
  });
  cy.intercept('GET', '**/normativa', {
    statusCode: 200,
    body: normativas,
  }).as('normativas');
};

describe('Normativa - CRUD', () => {
  beforeEach(() => {
    cy.login();
  });

  it('lista las normativas existentes', () => {
    stubBase([normativa]);

    cy.visit('/fcc-normativa');
    cy.wait('@normativas');

    cy.contains('Norma de prueba').should('be.visible');
    cy.contains('Ley').should('be.visible');
  });

  it('crea una normativa desde el dialogo', () => {
    stubBase([]);
    cy.intercept('POST', '**/normativa', {
      statusCode: 200,
      body: { success: true },
    }).as('crear');

    cy.visit('/fcc-normativa');
    cy.wait('@normativas');

    cy.contains('button', 'Nueva normativa').click();
    cy.contains('[role="dialog"]', 'Nueva normativa').should('be.visible');

    cy.contains('[role="dialog"] label', 'Nombre')
      .parent()
      .find('input')
      .type('Norma nueva');

    cy.contains('button', 'Guardar').click();
    cy.wait('@crear');
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('edita una normativa existente', () => {
    stubBase([normativa]);
    cy.intercept('PUT', '**/normativa/1', {
      statusCode: 200,
      body: { success: true },
    }).as('actualizar');

    cy.visit('/fcc-normativa');
    cy.wait('@normativas');

    cy.get('[aria-label="Editar Norma de prueba"]').click();
    cy.contains('[role="dialog"]', 'Editar normativa').should('be.visible');

    cy.contains('[role="dialog"] label', 'Nombre')
      .parent()
      .find('input')
      .clear()
      .type('Norma actualizada');

    cy.contains('button', 'Actualizar').click();
    cy.wait('@actualizar');
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('elimina una normativa existente', () => {
    stubBase([normativa]);
    cy.intercept('DELETE', '**/normativa/1', {
      statusCode: 200,
      body: { success: true },
    }).as('eliminar');

    cy.visit('/fcc-normativa');
    cy.wait('@normativas');

    cy.get('[aria-label="Eliminar Norma de prueba"]').click();
    cy.wait('@eliminar');
  });
});
