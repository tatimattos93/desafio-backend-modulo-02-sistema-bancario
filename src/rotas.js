const express = require('express');
const banco = require('./controladores/controladores');

const rotas = express();

rotas.get('/contas', banco.validarSenhaBanco, banco.listagemContas);

rotas.post('/contas', banco.verificarDadosCompletos, banco.criarContaBancaria);

rotas.put('/contas/:numeroConta/usuario', banco.validarConta, banco.verificarDadosCompletos, banco.atualizarDadosUsuario);

rotas.delete('/contas/:numeroConta', banco.validarConta, banco.excluirConta);

rotas.post('/transacoes/depositar', banco.depositar); 

rotas.post('/transacoes/sacar', banco.sacar);

rotas.post('/transacoes/transferir', banco.transferir);

rotas.get('/contas/saldo', banco.verificarContasConsultadas, banco.saldo);

rotas.get('/contas/extrato', banco.verificarContasConsultadas, banco.extrato);

module.exports = rotas;