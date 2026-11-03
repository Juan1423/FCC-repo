// cypress/integration/atencion_spec.js

import { last } from "lodash";

describe('Componente de Atención', () => {
    beforeEach(() => {
        cy.login();
      cy.visit('/fcc-atencion');
      cy.intercept('GET', '**/api/fcc/paciente').as('getPacientes');
    });
  
    const openPatientModal = () => {
      cy.contains('button', 'Escoger Paciente').click();
      cy.wait('@getPacientes');
      // Esperar a que el modal correcto esté visible
      cy.get('.MuiModal-root').not('#menu-appbar').should('be.visible').and('have.length', 1);
    };
  
    const selectPatient = (patientName) => {
      openPatientModal();
      cy.get('.MuiModal-root').not('#menu-appbar').within(() => {
        cy.get('.MuiList-root .MuiListItem-root').contains(patientName).closest('.MuiListItem-root').find('button').click();
      });
    };

    // El componente filtra por defecto "Últimos 7 días". Al elegir "Rango
    // personalizado" sin fechas se muestran todas las atenciones, evitando
    // que los datos antiguos queden ocultos por el paso del tiempo.
    const showAllAtenciones = () => {
      cy.get('#date-range-label').parent().find('[role="combobox"]').click();
      cy.get('ul[role="listbox"]').contains('Rango personalizado').click();
    };
  
    it('Debe permitir seleccionar un paciente', () => {
      openPatientModal();
      cy.get('.MuiModal-root').not('#menu-appbar').within(() => {
        // Buscar el input dentro del modal
        cy.get('.MuiInputBase-input').should('be.visible').type('Ana María García López');
        cy.get('.MuiList-root .MuiListItem-root').contains('Ana María García López').closest('.MuiListItem-root').find('button').click();
      });
  
      // Verificar que el paciente ha sido seleccionado
      cy.get('.MuiGrid-root').should('contain', 'DNI:');
      cy.get('.MuiGrid-root').should('contain', 'Ana María García López');
    });
  
    it('Debe mostrar la lista de atenciones del paciente seleccionado', () => {
      selectPatient('Ana María García López');
      showAllAtenciones();
      cy.get('.MuiTableContainer-root').should('be.visible');
      cy.get('.MuiTableBody-root .MuiTableRow-root').should('have.length.gt', 0);
    });
  
   
    it('should filter atenciones by date on the front end', () => {
        selectPatient('Ana María García López');
        showAllAtenciones();
        
        // Store the initial number of rows
        let initialRowCount;
        cy.get('.MuiTableBody-root .MuiTableRow-root').its('length').then(count => {
          initialRowCount = count;
          cy.log(`Initial row count: ${initialRowCount}`);
        });
    
        // Set the date
        const filterDate = '2024-08-20';
        const filterDateFormatted = '20/08/2024';
        cy.get('input[type="date"]')
          .type(filterDate, { force: true })
          .should('have.value', filterDate)
          .trigger('change')
          .trigger('input')
          .trigger('blur');
    
        // Give React time to update the state and re-render
        cy.wait(1500); // Increased wait time
    
        // Check if the table has been filtered
        cy.get('.MuiTableBody-root .MuiTableRow-root').then($rows => {
          const filteredRowCount = $rows.length;
          cy.log(`Filtered row count: ${filteredRowCount}`);
          
          // Log the content of each row for debugging
          $rows.each((index, row) => {
            cy.log(`Row ${index} content: ${Cypress.$(row).text()}`);
          });
    
          // Check if at least one row contains the filtered date
          let foundFilteredDate = false;
          cy.wrap($rows).each(($row, index) => {
            if (index === $rows.length - 1) return; // Skip the last row
            cy.wrap($row).find('td').eq(0).invoke('text').then(text => {
              if (text.includes(filterDateFormatted)) {
                foundFilteredDate = true;
              }
            });
          }).then(() => {
            expect(foundFilteredDate).to.be.true;
          });
        });
    
        // Check for a visual indicator of the applied filter, if it exists
        cy.get('body').then($body => {
          if ($body.find('.applied-filters').length > 0) {
            cy.get('.applied-filters').should('contain', filterDateFormatted);
          }
        });
      });
  
    it('Debe mostrar los detalles de una atención al hacer clic', () => {
      selectPatient('Ana María García López');
      showAllAtenciones();
      cy.get('.MuiTableBody-root .MuiTableRow-root').first().find('.MuiIconButton-root').click();
      cy.get('.MuiCollapse-root').should('be.visible');
    });
  
    it('Debe permitir generar un reporte PDF', () => {
      selectPatient('Ana María García López');
      showAllAtenciones();
      cy.get('.MuiTableBody-root .MuiTableRow-root').first().find('.MuiIconButton-root').click();
      
      cy.contains('button', 'Generar Informe').should('be.visible').click();

    });
  });