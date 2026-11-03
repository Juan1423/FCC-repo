describe('Perfil View', () => {

    beforeEach(() => {
        cy.login(); 
      cy.intercept('GET', '**/api/fcc/users/*').as('getUsuario');
      cy.intercept('GET', '**/api/fcc/personalsalud/*/estadisticas').as('getEstadisticas');
      cy.intercept('GET', '**/api/fcc/personalsalud/*').as('getPersonalSalud');
      cy.visit('/perfil');
      cy.wait(['@getUsuario', '@getPersonalSalud', '@getEstadisticas']);
    });

    it('should load the Perfil component', () => {
      cy.get('h1').contains('Perfil de Usuario').should('be.visible');
      cy.get('button').contains('Editar Perfil').should('be.visible');
    });

    it('should display user information', () => {
      cy.get('.MuiAvatar-root').should('be.visible');
      cy.get('.MuiChip-root').should('be.visible');
      cy.contains('Detalles del perfil').should('be.visible');
    });

    it('should display professional statistics', () => {
      cy.contains('Estadísticas profesionales').scrollIntoView().should('be.visible');
      cy.contains('Pacientes atendidos').scrollIntoView().should('be.visible');
      cy.contains('Años de experiencia').scrollIntoView().should('be.visible');
      cy.contains('Terapias realizadas').scrollIntoView().should('be.visible');
    });

    it('should allow editing the profile', () => {
      cy.get('button').contains('Editar Perfil').click();
      cy.get('input[name="nombres_personal"]').should('be.visible');
      cy.get('button').contains('Guardar').should('be.visible');
      cy.get('button').contains('Cancelar').should('be.visible');
    });

    it('should save profile changes', () => {
      cy.get('button').contains('Editar Perfil').click();
      cy.get('input[name="nombres_personal"]').clear().type('Nuevo Nombre');
      cy.get('button').contains('Guardar').click();
      cy.contains('Nuevo Nombre').should('be.visible');
    });

    it('should cancel profile changes', () => {
      cy.get('button').contains('Editar Perfil').click();
      cy.get('input[name="nombres_personal"]').clear().type('Nombre Temporal');
      cy.get('button').contains('Cancelar').click();
      cy.contains('Nombre Temporal').should('not.exist');
    });

    it('should handle error when updating profile', () => {
      cy.intercept('PUT', '**/api/fcc/users/*', {
        statusCode: 500,
        body: 'Server error'
      }).as('updateUsuarioError');

      cy.get('button').contains('Editar Perfil').click();
      cy.get('input[name="nombres_personal"]').clear().type('Nuevo Nombre');
      cy.get('button').contains('Guardar').click();
      cy.wait('@updateUsuarioError');
      cy.contains('Hubo un error al actualizar el perfil').should('be.visible');
    });
  });