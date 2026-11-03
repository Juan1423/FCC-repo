describe('Navigation Functionality', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/fcc-menu-principal')
  })
  
    it('should load the main menu page', () => {
        cy.get('h4').should('contain', 'Panel de Control')
    })
  
    it('should open and close the drawer on mobile', () => {
      cy.viewport('iphone-x')
      cy.get('button[aria-label="open drawer"]').click()
      cy.get('.MuiDrawer-paper').should('be.visible')
      cy.get('body').click(0, 0) // Click fuera del drawer para cerrarlo
      cy.get('.MuiDrawer-paper').should('not.be.visible')
    })
  
    it('should navigate through menu items', () => {
        cy.get('.MuiDrawer-paper').within(() => {
          cy.contains('Menu Principal').click()
          cy.url().should('include', '/fcc-menu-principal')
    
          cy.contains('Historia Cl').click()
          cy.contains('Pacientes').should('be.visible').click()
          cy.url().should('include', '/fcc-pacientes')
    
          cy.contains(/^Historia$/).should('be.visible').click()
          cy.url().should('include', '/fcc-historias-clinicas')
    
          cy.contains('Operaciones').click()
          cy.contains('Usuarios').should('be.visible').click()
          cy.url().should('include', '/fcc-usuarios')
        })
      })    
  
    it('should toggle drawer minimization', () => {
      cy.get('.MuiDrawer-paper button').first().click()
      cy.get('.MuiDrawer-paper').should('have.css', 'width', '60px')
      cy.get('.MuiDrawer-paper button').first().click()
      cy.get('.MuiDrawer-paper').should('have.css', 'width', '240px')
    })
  
    it('should open user menu and navigate to profile', () => {
      cy.get('button[aria-label="Opciones de usuario"]').click()
      cy.get('.MuiMenu-paper').within(() => {
        cy.contains('Perfil').click()
      })
      cy.url().should('include', '/perfil')
    })
  
    it('should logout', () => {
      cy.get('button[aria-label="Opciones de usuario"]').click()
      cy.get('.MuiMenu-paper').within(() => {
        cy.contains('Cerrar Sesión').click()
      })
      cy.url().should('include', '/')
    })
  })