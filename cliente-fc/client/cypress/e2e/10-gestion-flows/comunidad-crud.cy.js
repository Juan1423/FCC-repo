/**
 * CRUD completo del modulo Comunidad - Personas.
 * Cubre listar, crear, editar y eliminar personas desde la interfaz.
 * Se interceptan las APIs (incluida la jerarquia geografica) para no
 * depender del backend.
 */
const persona = {
  id_persona: 1,
  nombre_persona: 'Ana',
  apellido_persona: 'Perez',
  correo_persona: 'ana@example.com',
  telefono_persona: '0999999999',
  direccion_persona: 'Calle 1',
  foto_persona: '',
  estado_persona: 'Activo',
  id_geo: 4,
  id_tipo_persona: 1,
};

const jerarquia = [
  { id_geo: 1, nivel: 'region', descripcion: 'Sierra' },
  { id_geo: 2, nivel: 'provincia', descripcion: 'Pichincha' },
  { id_geo: 3, nivel: 'canton', descripcion: 'Quito' },
  { id_geo: 4, nivel: 'parroquia', descripcion: 'Centro' },
];

const stubGeo = () => {
  cy.intercept('GET', /nivel=region/, { statusCode: 200, body: [{ id_geo: 1, descripcion: 'Sierra' }] }).as('regiones');
  cy.intercept('GET', /jerarquia=true/, { statusCode: 200, body: jerarquia }).as('jerarquia');
  cy.intercept('GET', /id_padre=1/, { statusCode: 200, body: [{ id_geo: 2, descripcion: 'Pichincha' }] }).as('provincias');
  cy.intercept('GET', /id_padre=2/, { statusCode: 200, body: [{ id_geo: 3, descripcion: 'Quito' }] }).as('cantones');
  cy.intercept('GET', /id_padre=3/, { statusCode: 200, body: [{ id_geo: 4, descripcion: 'Centro' }] }).as('parroquias');
};

const stubTipos = () => {
  cy.intercept('GET', '**/tipo_persona', {
    statusCode: 200,
    body: [{ id_tipo_persona: 1, descripcion_tipo_persona: 'Voluntario' }],
  });
};

describe('Comunidad - CRUD de personas', () => {
  beforeEach(() => {
    cy.login();
  });

  it('lista las personas registradas', () => {
    cy.intercept('GET', '**/persona', { statusCode: 200, body: [persona] }).as('personas');
    stubTipos();

    cy.visit('/fcc-comunidad/personas');
    cy.wait('@personas');

    cy.contains('Ana Perez').should('be.visible');
  });

  it('crea una persona desde el formulario', () => {
    cy.intercept('GET', '**/persona', { statusCode: 200, body: [] }).as('personas');
    stubTipos();
    stubGeo();
    cy.intercept('POST', '**/persona', { statusCode: 200, body: { success: true } }).as('crear');

    cy.visit('/fcc-comunidad/personas');
    cy.wait('@personas');
    cy.contains('button', 'Agregar Persona').click();
    cy.url().should('include', '/fcc-comunidad/personas/nueva');

    cy.contains('form label', 'Nombre').parent().find('input').type('Ana');
    cy.contains('form label', 'Apellido').parent().find('input').type('Perez');
    cy.contains('form label', 'Correo').parent().find('input').type('ana@example.com');
    cy.contains('form label', /Tel.fono/).parent().find('input').type('0999999999');

    cy.get('form [role="combobox"]').eq(0).click();
    cy.get('[role="listbox"]').contains('Sierra').click();
    cy.wait('@provincias');

    cy.get('form [role="combobox"]').eq(1).click();
    cy.get('[role="listbox"]').contains('Pichincha').click();
    cy.wait('@cantones');

    cy.get('form [role="combobox"]').eq(2).click();
    cy.get('[role="listbox"]').contains('Quito').click();
    cy.wait('@parroquias');

    cy.get('form [role="combobox"]').eq(3).click();
    cy.get('[role="listbox"]').contains('Centro').click();

    cy.get('form [role="combobox"]').eq(4).click();
    cy.get('[role="listbox"]').contains('Voluntario').click();

    cy.contains('button', 'Guardar Persona').click();
    cy.wait('@crear');
    cy.url().should('include', '/fcc-comunidad/personas');
  });

  it('edita una persona existente', () => {
    cy.intercept('GET', '**/persona', { statusCode: 200, body: [persona] }).as('personas');
    cy.intercept('GET', '**/persona/1', { statusCode: 200, body: persona }).as('persona');
    stubTipos();
    stubGeo();
    cy.intercept('PUT', '**/persona/1', { statusCode: 200, body: { success: true } }).as('actualizar');

    cy.visit('/fcc-comunidad/personas');
    cy.wait('@personas');
    cy.get('[title="Editar"]').first().click();
    cy.url().should('include', '/fcc-comunidad/personas/1/editar');
    cy.wait('@persona');

    cy.contains('form label', 'Nombre').parent().find('input')
      .should('have.value', 'Ana')
      .clear()
      .type('Ana Maria');

    cy.contains('button', 'Guardar Cambios').click();
    cy.wait('@actualizar');
  });

  it('elimina una persona con confirmacion', () => {
    cy.intercept('GET', '**/persona', { statusCode: 200, body: [persona] }).as('personas');
    stubTipos();
    cy.intercept('DELETE', '**/persona/1', { statusCode: 200, body: { success: true } }).as('eliminar');

    cy.visit('/fcc-comunidad/personas');
    cy.wait('@personas');

    cy.get('[title="Eliminar"]').first().click();
    cy.contains('[role="dialog"]', 'Confirmar Eliminaci').should('be.visible');
    cy.contains('button', 'Eliminar').click();
    cy.wait('@eliminar');
  });
});
