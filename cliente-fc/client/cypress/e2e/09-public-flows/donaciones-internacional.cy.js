/**
 * Flujo publico de donacion internacional.
 * Se stubbean los catalogos geograficos y los POST de donante/donacion.
 */
describe('Donacion Internacional - flujo publico', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/continente', { statusCode: 200, body: [] });
    cy.intercept('GET', '**/pais', { statusCode: 200, body: [] });
    cy.intercept('GET', '**/ciudad', { statusCode: 200, body: [] });
    cy.intercept('GET', '**/tipo_donante', { statusCode: 200, body: [] });
    cy.intercept('GET', '**/tipo_donacion', { statusCode: 200, body: [] });
  });

  it('mantiene Siguiente deshabilitado hasta completar los campos obligatorios', () => {
    cy.visit('/donacion-internacional');
    cy.contains(/Donaci.n Internacional/).should('be.visible');

    cy.contains('button', 'Siguiente').should('be.disabled');

    cy.get('#internacional-nombres').type('John');
    cy.get('#internacional-apellidos').type('Doe');
    cy.get('#internacional-identificacion').type('X1234567');
    cy.get('#internacional-telefono').type('+15555555555');
    cy.get('#internacional-email').type('john@example.com');

    cy.contains('button', 'Siguiente').should('not.be.disabled');
  });

  it('completa los pasos y envia la donacion', () => {
    cy.intercept('POST', '**/donante_internacional', {
      statusCode: 200,
      body: { success: true, data: { id_donante_internacional: 202 } },
    }).as('donante');
    cy.intercept('POST', '**/donacion_internacional', {
      statusCode: 200,
      body: { success: true },
    }).as('donacion');

    cy.visit('/donacion-internacional');

    cy.get('#internacional-nombres').type('John');
    cy.get('#internacional-apellidos').type('Doe');
    cy.get('#internacional-identificacion').type('X1234567');
    cy.get('#internacional-telefono').type('+15555555555');
    cy.get('#internacional-email').type('john@example.com');

    cy.contains('button', 'Siguiente').click();
    cy.contains(/Informaci.n de la donaci.n/).should('be.visible');

    cy.contains('button', 'Siguiente').click();

    cy.contains('button', /Enviar donaci.n/).should('be.visible').click();
    cy.wait('@donante');
    cy.wait('@donacion');

    cy.contains(/Donaci.n internacional registrada/).should('be.visible');
  });
});
