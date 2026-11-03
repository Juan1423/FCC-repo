Cypress.Commands.add('login', () => {
    cy.session('user', () => {
      cy.request({
        method: 'POST',
        url: 'http://localhost:5000/api/fcc/users/login',
        body: {
          correo_usuario: Cypress.env('USER_EMAIL'),
          password_usuario: Cypress.env('USER_PASSWORD'),
        },
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.success).to.eq(true)
        const token = response.body.token
        const userData = response.body.data

        cy.setCookie('auth_token', token, { domain: 'localhost' })
        cy.window().then((win) => {
          win.localStorage.setItem('user', JSON.stringify(userData))
        })
      })
      cy.visit('/fcc-menu-principal')
      cy.get('.MuiDrawer-paper').should('exist')
    }, {
      validate: () => {
        cy.getCookie('auth_token').should('exist')
      }
    })
  })