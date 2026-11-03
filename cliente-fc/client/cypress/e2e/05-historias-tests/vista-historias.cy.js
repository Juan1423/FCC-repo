// cypress/integration/historia_spec.js

describe('Historia Component', () => {
    beforeEach(() => {
      cy.login();
      cy.intercept('GET', '**/api/fcc/paciente').as('getPacientes');
      cy.intercept('GET', '**/api/fcc/historia/*').as('getHistoria');
      cy.visit('/fcc-historias-clinicas');
    });
  
    const openPatientModal = () => {
      cy.get('button').contains('Escoger Paciente').click();
      cy.wait('@getPacientes');
      cy.get('.MuiModal-root').not('#menu-appbar').should('be.visible').and('have.length', 1);
    };
  
    const selectPatient = (patientName) => {
      openPatientModal();
      cy.get('.MuiModal-root').not('#menu-appbar').within(() => {
        cy.get('.MuiInputBase-input').type(patientName);
        cy.get('.MuiList-root .MuiListItem-root').contains(patientName).closest('.MuiListItem-root').find('button').click();
      });
      cy.wait('@getHistoria');
    };
  
    it('Should load the Historia component', () => {
      cy.get('button').contains('Escoger Paciente').should('be.visible');
    });
  
    it('Should allow selecting a patient', () => {
      selectPatient('Ana María García López');
      cy.get('.MuiPaper-root').should('contain', 'HIST001');
    });
  
    it('Should display patient info after selection', () => {
      selectPatient('Ana María García López');
      cy.get('.MuiBox-root').should('contain', 'DNI:');
    });
  
    it('Should display historia clínica after patient selection', () => {
      selectPatient('Ana María García López');
      cy.get('.MuiPaper-root').contains('Historia Clínica').should('be.visible');
      cy.get('.MuiPaper-root').contains('Número de historia clínica').should('be.visible');
      cy.get('.MuiPaper-root').contains('Fecha de Apertura').should('be.visible');
    });
  
    it('Should display motivo de consulta', () => {
      selectPatient('Ana María García López');
      cy.get('.MuiPaper-root').contains('Motivo de Consulta').should('be.visible');
    });
  
    it('Should display alergias and medicamentos', () => {
      selectPatient('Ana María García López');
      cy.get('.MuiPaper-root').contains('Alergias:').should('be.visible');
      cy.get('.MuiPaper-root').contains('Medicamentos:').should('be.visible');
    });
  
    it('Should display diagnóstico and tratamiento', () => {
      selectPatient('Ana María García López');
      cy.get('.MuiPaper-root').contains('Diagnóstico Presuntivo').should('be.visible');
      cy.get('.MuiPaper-root').contains('Tratamientos Recibidos:').should('be.visible');
    });
  
    it('Should display antecedentes', () => {
      selectPatient('Ana María García López');
      cy.get('.MuiPaper-root').contains('Antecedentes').should('be.visible');
    });
  
    it('Should show loading state while fetching historia', () => {
      cy.intercept('GET', '**/api/fcc/historia/*', (req) => {
        req.on('response', (res) => {
          res.setDelay(1000);
        });
      }).as('delayedHistoria');
      openPatientModal();
      cy.get('.MuiModal-root').not('#menu-appbar').within(() => {
        cy.get('.MuiInputBase-input').type('Ana María García López');
        cy.get('.MuiList-root .MuiListItem-root').contains('Ana María García López').closest('.MuiListItem-root').find('button').click();
      });
      cy.get('.MuiCircularProgress-root').should('be.visible');
      cy.wait('@delayedHistoria');
      cy.get('.MuiCircularProgress-root').should('not.exist');
    });
      
    it('Should allow adding a new historia', () => {
      selectPatient('Ana María García López');
      cy.get('button').contains(/Historia Clínica General/).should('be.visible').click();
      // Here you would add assertions for the new historia form or modal
      // For example:
      // cy.get('.MuiDialog-root').should('be.visible');
      // cy.get('.MuiDialog-root').contains('Nueva Historia Clínica').should('be.visible');
    });
  });