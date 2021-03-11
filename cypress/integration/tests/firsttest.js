describe('CHIPR TEST AUTOMATION', () => {

    let sessionid

    before(() => {
        cy.visit('http://ec2-18-230-150-124.sa-east-1.compute.amazonaws.com/login')
        cy.getCookie('PHPSESSID')
        cy.log(cy.getCookie('PHPSESSID').then((cookie) => {
            sessionid = cookie.value
        }))
    })

    it('Login', () => {
        cy.visit('http://ec2-18-230-150-124.sa-east-1.compute.amazonaws.com/login')
        cy.fixture('example.json').then((user) => {
            cy.get("#email").type(user.chipremail)
            cy.get("#password").type(user.chiprpwd)
        })
        cy.get("#login-wrapper > div > div.panel-body > form > div:nth-child(3) > div > input").click()
        cy.wait(1000)
    })

    it('Criar Jogadores', () => {
        cy.setCookie('PHPSESSID',sessionid)
        cy.wait(1000)
        cy.visit('http://ec2-18-230-150-124.sa-east-1.compute.amazonaws.com/gerenciar/player/', { timeout: 300000 })
        cy.wait(2000)
        cy.get('#accordionJogador > div > div.panel-heading > h4 > a').click()

        cy.fixture('example.json').then((json) => {
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
            }
        })
    })

    it('Criar Mesa de Ring Game', () => {
        cy.log(sessionid)
        cy.setCookie('PHPSESSID',sessionid)
        cy.wait(1000)
        cy.visit('http://ec2-18-230-150-124.sa-east-1.compute.amazonaws.com/jogosdia/ring', { timeout: 300000 })
        cy.wait(1000)
        cy.get('#newRingModel').select('Ring Game Holdem')
        cy.get('#newRingGamemode').select('Texas Holdem')
        cy.get('#newRingTable').select('Mesa 1')
        cy.get('#main-content > div > div.col-md-4 > div > div.panel-body > button').click()

        cy.url().should('include','/jogosdia/gerenciarring')

        cy.fixture('example.json').then((json) => {
            for (let i = 0; i<json.consumo.length; i++) {
                cy.get(`#main-content > div > div.col-md-7 > div > div.panel-body > div > div > table > tbody > tr:nth-child(${i+1}) > td:nth-child(4) > input`).type(json.consumo[i].player)
                cy.wait(1000)
                cy.get(`#main-content > div > div.col-md-7 > div > div.panel-body > div > div > table > tbody > tr:nth-child(${i+1}) > td:nth-child(4) > input`).type('{enter}')
                cy.wait(1000)
                cy.get('#buyin_regular > div > div > div:nth-child(1) > div.col-xs-5 > input').type('100')
                cy.get('#payment_20').check()
                cy.get('body > div.bootbox.modal.fade.in > div.modal-dialog > div > div.modal-footer > button').click()
                cy.wait(10000)
            }
        })
    })

    it('Gerar Consumo rapido', () => {
        cy.setCookie('PHPSESSID',sessionid)
        cy.visit('http://ec2-18-230-150-124.sa-east-1.compute.amazonaws.com/index/consumo', { timeout: 300000 })

        // cy.fixture('example.json').then((user) => {
        //     cy.get("#email").type(user.chipremail)
        //     cy.get("#password").type(user.chiprpwd)
        // })
        cy.fixture('example.json').then((json) => {
            for (let i = 0; i<json.consumo.length; i++) {
                cy.server()
                cy.route('POST', 'http://ec2-18-230-150-124.sa-east-1.compute.amazonaws.com/consumo/comandaoper').as('consumo')

                cy.get("#fastCard").type(json.consumo[i].player)
                cy.wait(200)
                cy.get("#fastCard").type('{enter}')
                cy.get("#fastProd").type('caf')
                cy.wait(200)
                cy.get("#fastProd").type('{enter}')
                cy.get("#fastQuant").clear().type(json.consumo[i].qtd)
                cy.get("#main-content > div > div > div > div.panel-body > div > div:nth-child(1) > div:nth-child(4) > button").click()
                cy.wait(500)
                cy.get('#fastAddActions > button.btn.btn-success.btn-lg').click()
        
                cy.wait('@consumo').then((xhr) => {
                    expect(xhr.response.body).to.be.greaterThan(0)
                    cy.get('body > div.bootbox.modal.fade.bootbox-alert.in > div.modal-dialog > div > div.modal-footer > button').click()
                })
            }
        })
    })

    it('Navegar em Estrutura - Ring Games', () => {
        cy.setCookie('PHPSESSID',sessionid)
        cy.visit('http://ec2-18-230-150-124.sa-east-1.compute.amazonaws.com/jogos/ring', { timeout: 300000 })
        cy.get('#main-content > div > div > div > div.panel-heading > h3').should('have.text','Modelos')
        cy.wait(1000)
    })

    it('Navegar em Estrutura - Blind', () => {
        cy.setCookie('PHPSESSID',sessionid)
        cy.visit('http://ec2-18-230-150-124.sa-east-1.compute.amazonaws.com/jogos/blinds', { timeout: 300000 })
        cy.get('#new_blind > div > div.panel-heading > h3').should('have.text','Criar novo modelo')
        cy.wait(1000)
    })

    it('Navegar em Estrutura - Rateio de Premios', () => {
        cy.setCookie('PHPSESSID',sessionid)
        cy.visit('http://ec2-18-230-150-124.sa-east-1.compute.amazonaws.com/jogos/premios', { timeout: 300000 })
        cy.get('#main-wrapper > section > div > h1').should('have.text','Rateio de Prêmios')
        cy.wait(1000)
    })

    it('Navegar em Estrutura - Modalidades', () => {
        cy.setCookie('PHPSESSID',sessionid)
        cy.visit('http://ec2-18-230-150-124.sa-east-1.compute.amazonaws.com/jogos/modalidades', { timeout: 300000 })
        cy.get('#main-wrapper > section > div > h1').should('have.text','Modalidades')
        cy.wait(1000)
    })

    it('Navegar em Estrutura - Mesas', () => {
        cy.setCookie('PHPSESSID',sessionid)
        cy.visit('http://ec2-18-230-150-124.sa-east-1.compute.amazonaws.com/jogos/mesas', { timeout: 300000 })
        cy.get('#main-wrapper > section > div > h1').should('have.text','Mesas')
        cy.wait(1000)
    })

    it('Navegar em Estrutura - Formas de pagamento', () => {
        cy.setCookie('PHPSESSID',sessionid)
        cy.visit('http://ec2-18-230-150-124.sa-east-1.compute.amazonaws.com/jogos/pagamento', { timeout: 300000 })
        cy.get('#main-wrapper > section > div > h1').should('have.text','Formas de Pagamento')
        cy.wait(1000)
    })

    it('Navegar em Estrutura - Tickets', () => {
        cy.setCookie('PHPSESSID',sessionid)
        cy.visit('http://ec2-18-230-150-124.sa-east-1.compute.amazonaws.com/jogos/tickets', { timeout: 300000 })
        cy.get('#main-wrapper > section > div > h1').should('have.text','Tickets')
        cy.wait(1000)
    })

    it('Navegar em Estrutura - Rake Back', () => {
        cy.setCookie('PHPSESSID',sessionid)
        cy.visit('http://ec2-18-230-150-124.sa-east-1.compute.amazonaws.com/jogos/rakeback', { timeout: 300000 })
        cy.get('#main-wrapper > section > div > h1').should('have.text','Rake Back')
        cy.wait(1000)
    })

    it('Navegar em Estrutura - Torneios', () => {
        cy.setCookie('PHPSESSID',sessionid)
        cy.visit('http://ec2-18-230-150-124.sa-east-1.compute.amazonaws.com/jogos', { timeout: 300000 })
        cy.get('#new_game > div > div.panel-body > div.form-group > div.fs-upload-element.fs-upload > div').should('be.visible')
        cy.wait(1000)
    })

    it('Gerência - Clube', () => {
        cy.setCookie('PHPSESSID',sessionid)
        cy.visit('http://ec2-18-230-150-124.sa-east-1.compute.amazonaws.com/gerenciar/clube', { timeout: 300000 })
        cy.get('#main-wrapper > section > div > h1').should('have.text','Minha Conta')
        cy.wait(1000)
    })

    it('Gerência - Administradores', () => {
        cy.setCookie('PHPSESSID',sessionid)
        cy.visit('http://ec2-18-230-150-124.sa-east-1.compute.amazonaws.com/gerenciar/admin', { timeout: 300000 })
        cy.get('#main-wrapper > section > div > p').should('have.text','Gerenciamento de administradores.')
        cy.wait(1000)
    })

    it('Gerência - Funcionarios', () => {
        cy.setCookie('PHPSESSID',sessionid)
        cy.visit('http://ec2-18-230-150-124.sa-east-1.compute.amazonaws.com/gerenciar/funcionarios', { timeout: 300000 })
        cy.get('#main-wrapper > section > div > h1').should('have.text','Funcionários')
        cy.wait(1000)
    })

    it('Gerência - Grupos', () => {
        cy.setCookie('PHPSESSID',sessionid)
        cy.visit('http://ec2-18-230-150-124.sa-east-1.compute.amazonaws.com/gerenciar/grupo', { timeout: 300000 })
        cy.get('#main-wrapper > section > div > h1').should('have.text','Grupo')
        cy.wait(1000)
        cy.get('#main-content > div > div > div.panel-body > div:nth-child(2) > b:nth-child(2)').should('have.text','Warning')
    })

    it('Consumo - Comandas', () => {
        cy.setCookie('PHPSESSID',sessionid)
        cy.visit('http://ec2-18-230-150-124.sa-east-1.compute.amazonaws.com/consumo/comandas', { timeout: 300000 })
        cy.get('#main-wrapper > section > div > h1').should('have.text','Gereciamento de Comandas')
        cy.wait(1000)
        cy.fixture('example.json').then((json) => {
            cy.get('#club_cards_filter > label > input').type(json.consumo[0].player)
        })
        cy.wait(200)
        cy.get('#club_cards > tbody > tr > td > a').click()
        cy.get('#main-wrapper > section > div > h1').should('have.text','Ver Comanda')
        cy.wait(1000)
    })

    it('Consumo - Cadastro de Produtos', () => {
        cy.setCookie('PHPSESSID',sessionid)
        cy.visit('http://ec2-18-230-150-124.sa-east-1.compute.amazonaws.com/consumo/cadastroproduto', { timeout: 300000 })
        cy.get('#main-wrapper > section > div > h1').should('have.text','Cadastro de Produtos')

        cy.fixture('example.json').then((json) => {
            for (let i = 0; i<json.produtos.length; i++) {
                cy.server()
                cy.route('POST', '/consumo/prodoper').as('prodoper')

                cy.get('#product_code').type(json.produtos[i].codigo)
                cy.get('#product_name').type(json.produtos[i].nome)
                cy.get('#product_value').type(json.produtos[i].venda)
                cy.get('#product_cost').type(json.produtos[i].custo)
                cy.get('#main-content > div > div.col-md-4 > div > div.panel-body > div:nth-child(1) > div:nth-child(5) > div:nth-child(3) > label > input[type=radio]').check()
                cy.get('#product_tip').type(json.produtos[i].comissao)
                cy.get('#main-content > div > div.col-md-4 > div > div.panel-body > div:nth-child(3) > div > button').click()
                cy.wait(1000)

                cy.wait('@prodoper').then((xhr) => {
                    expect(xhr.response.body).to.not.equal('code_exists')
                })
                cy.wait(100)
            }
        })
    })
})  