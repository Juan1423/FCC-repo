/**
 * Dashboard del chatbot (solo admin).
 * Verifica tarjetas disponibles y la navegacion a Gestion de Prompts.
 */
describe('Chatbot - dashboard administrativo', () => {
  beforeEach(() => {
    cy.login();
  });

  it('muestra las tarjetas de administracion', () => {
    cy.visit('/fcc-chatbot');

    cy.contains(/Gesti.n del Chatbot/).should('be.visible');
    [
      'Datos de la Fundaci.n',
      'Gesti.n de Prompts',
      'Base de Conocimiento',
      'Aprendizaje',
      'Guardrails',
      'Protocolos',
      'Rate Limit',
      'Historial',
    ].forEach((tarjeta) => {
      cy.contains(new RegExp(tarjeta)).should('be.visible');
    });
  });

  it('navega a Gestion de Prompts', () => {
    cy.visit('/fcc-chatbot');
    cy.contains(/Gesti.n de Prompts/).click();

    cy.url().should('include', '/fcc-chatbot/prompts');
    cy.contains(/Gesti.n de Prompts/).should('be.visible');
  });
});
