describe('Patient Add', () => {
    beforeEach(() => {
        // Iniciar sesión
        cy.login();
      cy.visit('/fcc-pacientes');
      // Esperar a que la página se cargue completamente
      cy.get('table').should('be.visible');
    });

it('should add a new patient', () => {
    cy.contains('button', 'Paciente').click();
    
    // Paso 1: Información personal
    cy.get('input[name="nombre_paciente"]').type('Ana');
    cy.get('input[name="apellidos_paciente"]').type('García');
    
    // Tipo de Identificación
    cy.contains('label', 'Identificación')
      .closest('.MuiAutocomplete-root')
      .within(() => {
        cy.get('input').click();
      });
    cy.get('.MuiAutocomplete-popper')
      .should('be.visible')
      .find('.MuiAutocomplete-option')
      .first()
      .click();
  
    // Nacionalidad
    cy.contains('label', 'Nacionalidad')
      .closest('.MuiAutocomplete-root')
      .within(() => {
        cy.get('input').click();
      });
    cy.get('.MuiAutocomplete-popper')
      .should('be.visible')
      .find('.MuiAutocomplete-option')
      .first()
      .click();
  
    cy.get('input[name="direccion_paciente"]').type('Calle Principal 123');
    cy.get('input[name="dni_paciente"]').type('1234567890');
    cy.get('input[name="telefono_paciente"]').type('962944605');
    cy.get('input[name="email_paciente"]').type('ana.garcia@email.com');
    cy.contains('button', 'Siguiente').click();
      // Paso 2: Información médica


    cy.get('input[name="telefono_cuidador"]').type('987654322');
    cy.get('input[name="familiar_cuidador"]').type('Juan García');

    cy.contains('label', 'Género')
      .closest('.MuiAutocomplete-root')
      .within(() => {
        cy.get('input').click();
      });
    cy.get('.MuiAutocomplete-popper')
      .should('be.visible')
      .find('.MuiAutocomplete-option')
      .first()
      .click();  

      cy.contains('label', 'Parentesco')
      .closest('.MuiAutocomplete-root')
      .within(() => {
        cy.get('input').click();
      });
    cy.get('.MuiAutocomplete-popper')
      .should('be.visible')
      .find('.MuiAutocomplete-option')
      .first()
      .click();   

      cy.contains('label', 'Sangre')
      .closest('.MuiAutocomplete-root')
      .within(() => {
        cy.get('input').click();
      });
    cy.get('.MuiAutocomplete-popper')
      .should('be.visible')
      .find('.MuiAutocomplete-option')
      .first()
      .click();

// Escribir la fecha directamente evita depender del mes actual del calendario.
cy.get('input[placeholder="MM/DD/YYYY"]')
  .clear()
  .type('09/09/2015')
  .blur()
  .should('have.value', '09/09/2015');

    cy.contains('button', 'Siguiente').click();
  
    // Paso 3: Documentos
    cy.get('textarea[name="biografia_paciente"]').type('Ana es una paciente nueva.');
    // Aquí puedes agregar la lógica para subir archivos si es necesario
  
    cy.contains('button', 'Guardar').click();
    cy.contains('Paciente añadido exitosamente').should('be.visible');
  });

});