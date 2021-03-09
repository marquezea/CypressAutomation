describe('Chipr Test - Basic Scenarios', () => {

    let sessionid

    before(() => {
        cy.visit('http://ec2-18-229-107-147.sa-east-1.compute.amazonaws.com/login')
        cy.getCookie('PHPSESSID')
        cy.log(cy.getCookie('PHPSESSID').then((cookie) => {
            sessionid = cookie.value
        }))
    })

    it('Login', () => {
        cy.visit('http://ec2-18-229-107-147.sa-east-1.compute.amazonaws.com/login')
        cy.fixture('example.json').then((user) => {
            cy.get("#email").type(user.chipremail)
            cy.get("#password").type(user.chiprpwd)
        })
        cy.get("#login-wrapper > div > div.panel-body > form > div:nth-child(3) > div > input").click()
        cy.wait(1000)
    })

    it.skip('Criar jogadores', () => {
        cy.on('window:confirm', function(alertText) {
            cy.log(alertText)   
        })

        cy.log(sessionid)
        cy.setCookie('PHPSESSID',sessionid)
        cy.wait(1000)
        cy.visit('http://ec2-18-229-107-147.sa-east-1.compute.amazonaws.com/gerenciar/player/')
        cy.wait(2000)
        cy.get('#accordionJogador > div > div.panel-heading > h4 > a').click()

        cy.fixture('example.json').then((json) => {
            cy.task('log', 'Criando novos jogadores')
            for (let i = 0; i<json.novos_jogadores.length; i++) {
                cy.task('log', `      Criando jogador: ${i+1}`)
                cy.server()
                cy.route('POST', '/gerenciar/playeroper').as('playeroper')

                cy.get('#newUserName').clear().type(json.novos_jogadores[i].username)
                cy.get('#newUserMail').clear().type(json.novos_jogadores[i].usermail)
                cy.get('#newUserPhone').clear().type(json.novos_jogadores[i].userphone)
                cy.get('#tabCriarJog > div > div > div.col-sm-12 > button').click()

                cy.wait('@playeroper').then((xhr) => {
                    expect(xhr.response.body).to.not.equal('mail_exists')
                    cy.get('body > div.bootbox.modal.fade.bootbox-alert.in > div.modal-dialog > div > div.modal-footer > button').click()
                })

                //cy.get('body > div.bootbox.modal.fade.bootbox-alert.in > div.modal-dialog > div > div.modal-body > div',{timeout:60000}).should('have.text', 'Já existe um usuário com este e-mail!')
                //cy.get('body > div.bootbox.modal.fade.bootbox-alert.in > div.modal-dialog > div > div.modal-body > div',{timeout:60000}).should('have.text', 'Conta criada com sucesso!')
            }
        })
    })

    it('Criar mesa de jogo Ring Game', () => {
        cy.on('window:confirm', function(alertText) {
            cy.log(alertText)   
        })

        cy.log(sessionid)
        cy.setCookie('PHPSESSID',sessionid)
        cy.wait(1000)
        cy.visit('http://ec2-18-229-107-147.sa-east-1.compute.amazonaws.com/jogosdia/ring')
        cy.wait(1000)
        cy.get('#newRingModel').select('Ring Game Holdem')
        cy.get('#newRingGamemode').select('Texas Holdem')
        cy.get('#newRingTable').select('Mesa 1')
        cy.get('#main-content > div > div.col-md-4 > div > div.panel-body > button').click()

        cy.url().should('include','/jogosdia/gerenciarring')

        for (let i=0; i<9; i++) {
            cy.get(`#main-content > div > div.col-md-7 > div > div.panel-body > div > div > table > tbody > tr:nth-child(${i+1}) > td:nth-child(4) > input`).type(`000${i+1}`)
            cy.wait(500)
            cy.get(`#main-content > div > div.col-md-7 > div > div.panel-body > div > div > table > tbody > tr:nth-child(${i+1}) > td:nth-child(4) > input`).type('{enter}')
            cy.wait(500)
            cy.get('#buyin_regular > div > div > div:nth-child(1) > div.col-xs-5 > input').type('100')
            cy.get('#payment_20').check()
            cy.get('body > div.bootbox.modal.fade.in > div.modal-dialog > div > div.modal-footer > button').click()
            cy.wait(500)
        }

    })


})  