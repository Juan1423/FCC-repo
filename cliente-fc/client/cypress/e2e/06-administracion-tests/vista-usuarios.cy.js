// cypress/integration/usuarios_and_perfil_spec.js

describe('Usuarios and Perfil Views', () => {
    beforeEach(() => {
      cy.login(); // Assuming you have a custom command for login
    });
  
    describe('Usuarios View', () => {
      beforeEach(() => {
        cy.intercept('GET', '**/api/fcc/users*').as('getUsuarios');
        cy.visit('/fcc-usuarios');
        cy.get('h5').contains('Usuarios').should('be.visible');
        cy.get('.MuiTableBody-root .MuiTableRow-root').should('have.length.gt', 0);
      });
  
      it('should load the Usuarios component', () => {
        cy.get('h5').contains('Usuarios').should('be.visible');
        cy.get('button').contains('Agregar usuario').should('be.visible');
      });
  
      it('should allow searching for users', () => {
        cy.get('input[placeholder="Buscar usuarios..."]').type('John');
        cy.get('.MuiTableBody-root .MuiTableRow-root').should('have.length.gt', 0);
      });
  
      it('should open the add user modal', () => {
        cy.get('button').contains('Agregar usuario').click();
        cy.get('.MuiDialog-root').should('be.visible');
      });
  
      it('should sort users when clicking on table headers', () => {
        cy.get('.MuiTableHead-root .MuiTableCell-root').contains('Correo electrónico').click();
        // Add assertions here to check if sorting worked
      });
  
      it('should allow editing a user', () => {
        cy.get('.MuiTableBody-root .MuiTableRow-root').first().find('button').first().click();
        // En modo edición aparecen los TextField de nombre/correo y el Select de rol
        cy.get('.MuiTableBody-root .MuiTableRow-root').first().find('input').should('have.length.gte', 2);
        cy.get('.MuiTableBody-root .MuiTableRow-root').first().find('[role="combobox"]').should('exist');
        // Cancelar para no persistir cambios
        cy.get('.MuiTableBody-root .MuiTableRow-root').first().find('button').last().click();
      });
  
      it('should allow activating/deactivating a user', () => {
        cy.intercept('PUT', '**/api/fcc/users/*', { statusCode: 200, body: { success: true } }).as('updateUser');
        cy.get('.MuiTableBody-root .MuiTableRow-root').first().find('.MuiChip-root').click();
        cy.wait('@updateUser');
      });
  
      it('should allow deleting a user', () => {
        cy.intercept('DELETE', '**/api/fcc/users/*', { statusCode: 200, body: { success: true } }).as('deleteUser');
        cy.get('.MuiTableBody-root .MuiTableRow-root').first().find('button').last().click();
        cy.wait('@deleteUser');
      });

      it('should handle pagination', () => {
        cy.get('.MuiTablePagination-root').should('exist');
        cy.get('.MuiTablePagination-actions button').last().then(($btn) => {
          if (!$btn.is(':disabled')) {
            cy.wrap($btn).click();
          }
        });
        // Add assertions to check if the page changed
      });
    });
  
   
  });