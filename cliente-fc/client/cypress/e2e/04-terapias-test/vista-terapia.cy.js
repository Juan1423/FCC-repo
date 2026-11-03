// cypress/integration/terapias_spec.js

describe('Terapias Page', () => {
    beforeEach(() => {
      cy.login(); // Asumiendo que tienes un comando personalizado para el login
      cy.visit('/fcc-terapias');
      cy.intercept('GET', '**/api/fcc/paciente').as('getPacientes');
    });
  
    const openPatientModal = () => {
      cy.contains('button', 'Escoger Paciente').click();
      cy.wait('@getPacientes');
      cy.get('.MuiModal-root').not('#menu-appbar').should('be.visible').and('have.length', 1);
    };
  
    const selectPatient = (patientName) => {
      openPatientModal();
      cy.get('.MuiModal-root').not('#menu-appbar').within(() => {
        cy.get('.MuiList-root .MuiListItem-root').contains(patientName).closest('.MuiListItem-root').find('button').click();
      });
    };

    // El componente filtra por defecto "Últimos 7 días". Al elegir "Rango
    // personalizado" sin fechas se muestran todas las terapias, evitando
    // que los datos antiguos queden ocultos por el paso del tiempo.
    const showAllTerapias = () => {
      cy.get('#date-range-label').parent().find('[role="combobox"]').click();
      cy.get('ul[role="listbox"]').contains('Rango personalizado').click();
    };
  
    describe('TerapiasHeader', () => {
      it('renders CuadroPaciente component after selecting a patient', () => {
        selectPatient('Ana María García López');
        cy.get('.MuiGrid-container').first().within(() => {
          cy.get('.MuiGrid-item').first().should('contain', 'DNI:');
          cy.get('.MuiGrid-item').first().should('contain', 'Ana María García López');
        });
      });
  
      it('displays and enables "Nueva Terapia" button after selecting a patient', () => {
        cy.contains('button', 'Nueva Terapia').should('be.disabled');
        selectPatient('Ana María García López');
        cy.contains('button', 'Nueva Terapia').should('not.be.disabled');
      });
  
      it('navigates to nueva-terapia page when "Nueva Terapia" button is clicked', () => {
        selectPatient('Ana María García López');
        cy.contains('button', 'Nueva Terapia').click();
        cy.url().should('include', '/nueva-terapia/');
      });
    });
  
    describe('TerapiasTabs', () => {
      beforeEach(() => {
        selectPatient('Ana María García López');
      });
  
      it('renders both tabs', () => {
        cy.contains('button', 'Terapias Anteriores').should('exist');
        cy.contains('button', 'Asistencia').should('exist');
      });
  
      it('selects "Terapias Anteriores" tab by default', () => {
        cy.contains('button', 'Terapias Anteriores')
          .should('have.attr', 'aria-selected', 'true');
      });
  
      it('changes selected tab when clicked', () => {
        cy.contains('button', 'Asistencia').click();
        cy.contains('button', 'Asistencia')
          .should('have.attr', 'aria-selected', 'true');
        cy.contains('button', 'Terapias Anteriores')
          .should('have.attr', 'aria-selected', 'false');
      });
  
      it('applies correct styles to selected tab', () => {
        cy.contains('button', 'Terapias Anteriores')
          .should('have.css', 'background-color', 'rgb(243, 244, 246)');
        
        cy.contains('button', 'Asistencia').click();
        cy.contains('button', 'Asistencia')
          .should('have.css', 'background-color', 'rgb(243, 244, 246)');
      });
    });
  
    describe('Terapias Content', () => {
      beforeEach(() => {
        selectPatient('Ana María García López');
        showAllTerapias();
      });
  
      it('displays the list of terapias for the selected patient', () => {
        cy.get('.MuiTableContainer-root').should('be.visible');
        cy.get('.MuiTableBody-root .MuiTableRow-root').should('have.length.gt', 0);
      });
  
      it('allows filtering terapias by date', () => {
        const filterDateFormatted = '12/08/2024';
        
        // En rango personalizado se muestran los DatePicker de inicio/fin
        cy.contains('label', 'Fecha inicial')
          .closest('.MuiFormControl-root')
          .find('input')
          .clear()
          .type('08/01/2024');
        cy.contains('label', 'Fecha final')
          .closest('.MuiFormControl-root')
          .find('input')
          .clear()
          .type('08/31/2024{enter}');
  
        cy.get('.MuiTableBody-root .MuiTableRow-root').should('have.length.gt', 0);
        cy.get('.MuiTableBody-root').should('contain', filterDateFormatted);
      });
  
      it('shows terapia details when clicked', () => {
        cy.get('.MuiTableBody-root .MuiTableRow-root').first().find('.MuiButtonBase-root').click();
        cy.get('.MuiPaper-root').should('contain', 'Detalles de la Terapia');
      });
  
      it('allows generating a PDF report', () => {
        cy.get('.MuiButtonBase-root').contains('Generar Informe de Terapias').click();
      });
    });
  });