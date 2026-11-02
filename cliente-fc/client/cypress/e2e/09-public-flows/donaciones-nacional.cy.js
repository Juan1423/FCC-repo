/**
 * Flujo publico de donacion nacional.
 * Los catalogos (region, provincia, tipo de donante/donacion) se stubbean
 * para que el test sea determinista y no dependa de la BD.
 */
describe('Donacion Nacional - flujo publico', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/region', { statusCode: 200, body: [] });
    cy.intercept('GET', '**/provincia', { statusCode: 200, body: [] });
    cy.intercept('GET', '**/canton', { statusCode: 200, body: [] });
    cy.intercept('GET', '**/parroquia', { statusCode: 200, body: [] });
    cy.intercept('GET', '**/tipo_donante', { statusCode: 200, body: [] });
    cy.intercept('GET', '**/tipo_donacion', { statusCode: 200, body: [] });
  });

  it('mantiene Siguiente deshabilitado hasta completar los campos obligatorios', () => {
    cy.visit('/donacion-nacional');
    cy.contains(/Donaci.n Nacional/).should('be.visible');

    cy.contains('button', 'Siguiente').should('be.disabled');

    cy.get('#nacional-nombres').type('Ana');
    cy.get('#nacional-apellidos').type('Perez');
    cy.get('#nacional-identificacion').type('1712345678');
    cy.get('#nacional-telefono').type('0999999999');
    cy.get('#nacional-email').type('ana@example.com');

    cy.contains('button', 'Siguiente').should('not.be.disabled');
  });

  it('completa los tres pasos y envia la donacion', () => {
    cy.intercept('POST', '**/donante_nacional', {
      statusCode: 200,
      body: { success: true, data: { id_donante_nacional: 101 } },
    }).as('donante');
    cy.intercept('POST', '**/donacion_nacional', {
      statusCode: 200,
      body: { success: true },
    }).as('donacion');

    cy.visit('/donacion-nacional');

    cy.get('#nacional-nombres').type('Ana');
    cy.get('#nacional-apellidos').type('Perez');
    cy.get('#nacional-identificacion').type('1712345678');
    cy.get('#nacional-telefono').type('0999999999');
    cy.get('#nacional-email').type('ana@example.com');

    cy.contains('button', 'Siguiente').click();
    cy.contains(/Informaci.n de la donaci.n/).should('be.visible');

    cy.contains('button', 'Siguiente').click();

    cy.contains('button', /Enviar donaci.n/).should('be.visible').click();
    cy.wait('@donante');
    cy.wait('@donacion');

    cy.contains(/Donaci.n registrada exitosamente/).should('be.visible');
  });
});
