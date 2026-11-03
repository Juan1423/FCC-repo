describe('Vista de Exámenes', () => {
    beforeEach(() => {
    cy.login();
      cy.visit('/fcc-atencion');
      cy.intercept('GET', '**/api/fcc/paciente').as('getPacientes');
      cy.contains('button', 'Escoger Paciente').click();
      cy.wait('@getPacientes');
      cy.get('.MuiModal-root').not('#menu-appbar').within(() => {
        cy.get('.MuiList-root .MuiListItem-root').first().find('button').click();
      });
      cy.get('.MuiTabs-root').contains('Exámenes').click();
    });
  
    it('Debe mostrar la lista de exámenes del paciente', () => {
      cy.get('.MuiTableContainer-root').should('be.visible');
      cy.get('.MuiTableBody-root .MuiTableRow-root').should('have.length.gt', 0);
    });
  
    it('Debe permitir añadir un nuevo examen', () => {
      cy.contains('button', 'Añadir Examen').click();
      cy.get('.MuiModal-root').not('#menu-appbar').should('be.visible').within(() => {
        cy.get('input[name="nombre_examen"]').type('Examen de sangre');
        cy.get('textarea[name="comentario_examen"]').type('Revisar niveles de colesterol');
        cy.contains('button', 'Añadir').click();
      });
      cy.get('.MuiTableBody-root').contains('Examen de sangre');
    });
  
    it('Debe permitir editar un examen existente', () => {
      cy.get('[data-testid="EditIcon"]').last().click();
      cy.get('.MuiModal-root').not('#menu-appbar').should('be.visible').within(() => {
        cy.get('textarea[name="comentario_examen"]').clear().type('Nuevo comentario');
        cy.contains('button', 'Actualizar').click();
      });
      cy.get('.MuiTableBody-root').contains('Nuevo comentario');
    });
  
    it('Debe permitir eliminar un examen', () => {
        cy.get('[data-testid="DeleteIcon"]').last().click();
      cy.on('window:confirm', () => true);
      cy.get('.MuiTableBody-root .MuiTableRow-root').should('have.length.lt', 2);
    });
  
    it('Debe permitir cambiar el estado de un examen', () => {
      cy.get('.MuiTableBody-root .MuiTableRow-root').first().find('.MuiSelect-select').click();
      cy.get('ul[role="listbox"]').contains('Completado').click();

      cy.get('.MuiTableBody-root .MuiTableRow-root').first().should('contain', 'Completado');
    });
  });