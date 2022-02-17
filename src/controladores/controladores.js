const { banco } = require('../bancodedados');
let { numeroUnico, contas, saques, depositos, transferencias } = require('../bancodedados');
const format = require('date-fns/format');

const validarSenhaBanco = (req, res, next) => {
    const { senha_banco } = req.query;

    if(!senha_banco) {
        return res.status(401).json('A senha não foi informada');
    }

    if (senha_banco !== banco.senha) {
        return res.status(403).json('A senha está incorreta');
    }

    next();
};

const listagemContas = (req, res) => {
    res.status(200).json(contas)
};

const criarContaBancaria = (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    contas.push({
    numero: numeroUnico++,
    saldo: 0,
    usuario: {
        nome: nome,
        cpf: cpf,
        data_nascimento: data_nascimento,
        telefone: telefone,
        email: email,
        senha: senha
        }
    });

   return res.status(201).json();

};

const verificarDadosCompletos = (req, res, next) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    if (!nome) {
        return res.status(400).json('mensagem: É necessário informar o nome para abertura de conta')
    };
    if (!cpf) {
        return res.status(400).json('mensagem: É necessário informar o cpf para abertura de conta')
    };
    if (!data_nascimento) {
        return res.status(400).json('mensagem: É necessário informar a data de nascimento para abertura de conta')
    };
    if (!telefone) {
        return res.status(400).json('mensagem: É necessário informar o telefone para abertura de conta')
    };
    if (!email) {
        return res.status(400).json('mensagem: É necessário informar o email para abertura de conta')
    };
    if (!senha) {
        return res.status(400).json('mensagem: É necessário criar e informar a senha para abertura de conta')
    }

    const dadosRepetidos = contas.some((cliente) => {
        return cliente.usuario.cpf === cpf || cliente.usuario.email === email;
    })
    if (dadosRepetidos) {
        return res.status(400).json('mensagem: Já existe uma conta com o cpf ou e-mail informado!')
    }; 

    next()
};

const validarConta = (req, res, next) => {
    const { numeroConta } = req.params;

    const contaUsuario = contas.find((conta) => {
        return conta.numero === Number(numeroConta);
    })

    if(!contaUsuario) {
        return res.status(404).json('mensagem: A conta não foi encontrada');
    }

    next();
};

const atualizarDadosUsuario = (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;
    const { numeroConta } = req.params;

    const contaAtualizar = contas.find((conta) => {
        return conta.numero === Number(numeroConta);
    })

    contaAtualizar.usuario.nome = nome;
    contaAtualizar.usuario.cpf = cpf;
    contaAtualizar.usuario.data_nascimento = data_nascimento;
    contaAtualizar.usuario.telefone = telefone;
    contaAtualizar.usuario.email = email;
    contaAtualizar.usuario.senha = senha;

    return res.status(204).json();
};

const excluirConta = (req, res) => {
    const { numeroConta } = req.params;

    const contaDeletar = contas.find((conta) => {
        return conta.numero === Number(numeroConta);
    })

    if(contaDeletar.saldo > 0) {
       return res.status(400).json('mensagem: A conta só pode ser removida se o saldo for zero!')
    };

    contas = contas.filter((conta) => {
        return conta.numero !== Number(numeroConta);
    })

    return res.status(200).json();
}

const depositar = (req, res) => {
    const { numero_conta, valor } = req.body;

    const contaDestino = contas.find((conta) => {
        return conta.numero === Number(numero_conta);
    })

    if(!contaDestino) {
        res.status(404).json('mensagem: A conta informada não foi encontrada!')
    }
    if (!numero_conta || !valor) {
        return res.status(400).json('mensagem:O número da conta e o valor são obrigatórios!')
    };

    contaDestino.saldo += Number(valor);

    const data = format(new Date(), "yyyy-MM-dd kk:mm:ss");

    depositos.push({
        data: data,
        numero_conta: numero_conta,
        valor: valor
    });

    return res.status(200).json();
};

const sacar = (req, res) => {
    const { numero_conta, valor, senha } = req.body;

    const contaOrigem = contas.find((conta) => {
        return conta.numero === Number(numero_conta);
    })

    if (!contaOrigem) {
       return res.status(404).json('mensagem: A conta informada não foi encontrada!')
    }

    if (!numero_conta || !valor || !senha) {
        return res.status(400).json('mensagem: O número da conta, o valor e a senha são obrigatórios!')
    };

    if (contaOrigem.usuario.senha !== senha) {
        return res.status(403).json('A senha está incorreta');
    }

    if (contaOrigem.saldo <= Number(valor)) {
        return res.status(400).json('mensagem: Não há saldo suficiente para completar a operação!')
    }

    contaOrigem.saldo -= Number(valor);

    const data = format(new Date(), "yyyy-MM-dd kk:mm:ss");

    saques.push({
        data: data,
        numero_conta: numero_conta,
        valor: valor
    });

    return res.status(200).json();
};

const transferir = (req, res) => {
    const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;

    if (!numero_conta_origem || !valor || !senha || !numero_conta_destino) {
        return res.status(400).json('mensagem: O número das contas, o valor e a senha são obrigatórios!')
    };

    const contaOrigem = contas.find((conta) => {
        return conta.numero === Number(numero_conta_origem);
    })

    if(!contaOrigem) {
        return res.status(404).json('mensagem: A conta de origem não foi encontrada!') 
    }

    const contaDestino = contas.find((conta) => {
        return conta.numero === Number(numero_conta_destino);
    })

    if (!contaDestino) {
        return res.status(404).json('mensagem: A conta de destino não foi encontrada!')
    }

    if (contaOrigem.usuario.senha !== senha) {
        return res.status(403).json('A senha está incorreta');
    }

    if (contaOrigem.saldo <= Number(valor)) {
        return res.status(400).json('mensagem: Não há saldo suficiente para completar a operação!')
    }

    contaOrigem.saldo -= Number(valor);
    contaDestino.saldo += Number(valor);

    const data = format(new Date(), "yyyy-MM-dd kk:mm:ss");

    transferencias.push({
        data: data,
        numero_conta_origem: numero_conta_origem,
        numero_conta_destino: numero_conta_destino,
        valor: valor
    })

    return res.status(200).json();
};

const saldo = (req, res) => {
    const { numero_conta } = req.query;

    const contaConsultada = contas.find((conta) => {
        return conta.numero === Number(numero_conta);
    });

    return res.status(200).json(`saldo: ${contaConsultada.saldo}`);
};

const verificarContasConsultadas = (req, res, next) => {
    const { numero_conta, senha } = req.query;

    if (!numero_conta || !senha) {
        return res.status(400).json('mensagem: O número da conta e a senha são obrigatórios!')
    };

    const contaConsultada = contas.find((conta) => {
        return conta.numero === Number(numero_conta);
    });

    if (!contaConsultada) {
        return res.status(400).json('mensagem: Conta bancária não encontada!');
    };

    if (senha !== contaConsultada.usuario.senha) {
        return res.status(403).json('A senha informada está errada');
    };

    next();
};

const extrato = (req, res) => {
    const { numero_conta } = req.query;

    const dadosSaques = saques.filter((saque) =>{
        return Number(saque.numero_conta) === Number(numero_conta);
    });

    const dadosDepositos = depositos.filter((deposito) => {
        return Number(deposito.numero_conta) === Number(numero_conta);
    });

    const transferenciasEnviadas = transferencias.filter((transferencia) => {
        return Number(transferencia.numero_conta_origem) === Number(numero_conta);
    });

    const transferenciasRecebidas = transferencias.filter((transferencia) => {
        return Number(transferencia.numero_conta_destino) === Number(numero_conta);
    });

    return res.status(200).json({
        depositos: dadosDepositos,
        saques: dadosSaques,
        transferenciasEnviadas: transferenciasEnviadas,
        transferenciasRecebidas: transferenciasRecebidas
    });
};

module.exports = {
    validarSenhaBanco,
    listagemContas,
    criarContaBancaria,
    verificarDadosCompletos,
    atualizarDadosUsuario,
    validarConta,
    excluirConta,
    depositar,
    sacar,
    transferir,
    saldo,
    extrato,
    verificarContasConsultadas
};