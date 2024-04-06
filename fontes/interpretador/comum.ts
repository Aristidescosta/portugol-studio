import { Variavel } from '@designliquido/delegua/construtos';
import { Expressao, Importar, Leia } from '@designliquido/delegua/declaracoes';
import { PilhaEscoposExecucaoInterface } from '@designliquido/delegua/interfaces/pilha-escopos-execucao-interface';
import { DeleguaModulo, FuncaoPadrao } from '@designliquido/delegua/estruturas';
import { ErroEmTempoDeExecucao } from '@designliquido/delegua/excecoes';

import * as matematica from '../bibliotecas/matematica';
import * as texto from '../bibliotecas/texto';
import * as utils from '../bibliotecas/utils';

function carregarBibliotecaMatematica(): DeleguaModulo {
    const metodos: { [nome: string]: FuncaoPadrao } = {
        potencia: new FuncaoPadrao(2, matematica.potencia),
        raiz: new FuncaoPadrao(2, matematica.raiz),
        arredondar: new FuncaoPadrao(2, matematica.arredondar),
        logaritmo: new FuncaoPadrao(2, matematica.logaritmo),
        seno: new FuncaoPadrao(1, matematica.seno),
        cosseno: new FuncaoPadrao(1, matematica.cosseno),
        tangente: new FuncaoPadrao(1, matematica.tangente),
        valor_absoluto: new FuncaoPadrao(1, matematica.valor_absoluto),
        maior_numero: new FuncaoPadrao(2, matematica.maior_numero),
        menor_numero: new FuncaoPadrao(2, matematica.menor_numero),
    };

    const objetoMatematica = new DeleguaModulo('Matematica');
    objetoMatematica.componentes = metodos;
    return objetoMatematica;
}

function carregarBibliotecaTexto(): DeleguaModulo {
    const metodos: { [nome: string]: FuncaoPadrao } = {
        numero_caracteres: new FuncaoPadrao(1, texto.numero_caracteres),
        caixa_alta: new FuncaoPadrao(1, texto.caixa_alta),
        caixa_baixa: new FuncaoPadrao(1, texto.caixa_baixa),
        substituir: new FuncaoPadrao(1, texto.substituir),
        preencher_a_esquerda: new FuncaoPadrao(1, texto.preencher_a_esquerda),
        obter_caracter: new FuncaoPadrao(1, texto.obter_caracter),
        posicao_texto: new FuncaoPadrao(1, texto.posicao_texto),
        extrair_subtexto: new FuncaoPadrao(1, texto.extrair_subtexto),
    };

    const objetoTexto = new DeleguaModulo('Texto');
    objetoTexto.componentes = metodos;
    return objetoTexto;
}

function carregarBibliotecaUtils(): DeleguaModulo {
    const metodos: { [nome: string]: FuncaoPadrao } = {
        obter_diretorio_usuario: new FuncaoPadrao(0, utils.obter_diretorio_usuario),
        numero_elementos: new FuncaoPadrao(1, utils.numero_elementos),
        numero_linhas: new FuncaoPadrao(1, utils.numero_linhas),
        numero_colunas: new FuncaoPadrao(1, utils.numero_colunas),
        sorteia: new FuncaoPadrao(2, utils.sorteia),
        aguarde: new FuncaoPadrao(1, utils.aguarde),
        tempo_decorrido: new FuncaoPadrao(0, utils.tempo_decorrido)
    }

    const objetoUtils = new DeleguaModulo('Utils');
    objetoUtils.componentes = metodos;
    return objetoUtils;
}

export async function visitarExpressaoImportarComum(expressao: Importar): Promise<any> {
    switch (expressao.caminho.valor) {
        case 'Matematica':
            return carregarBibliotecaMatematica();
        case 'Texto':
            return carregarBibliotecaTexto();
        case 'Utils':
            return carregarBibliotecaUtils();
        default:
            throw new ErroEmTempoDeExecucao(null, `Biblioteca não implementada: ${expressao.caminho}.`);
    }
}

/**
 * Execução da leitura de valores da entrada configurada no
 * início da aplicação.
 * @param expressao Expressão do tipo Leia
 * @returns Promise com o resultado da leitura.
 */
export async function visitarExpressaoLeiaComum(
    interfaceEntradaSaida: any,
    pilhaEscoposExecucao: PilhaEscoposExecucaoInterface,
    expressao: Leia
): Promise<any> {
    const mensagem = '> ';
    for (let argumento of expressao.argumentos) {
        const promessaLeitura: Function = () =>
            new Promise((resolucao) =>
                interfaceEntradaSaida.question(mensagem, (resposta: any) => {
                    resolucao(resposta);
                })
            );

        const valorLido = await promessaLeitura();
        const simbolo =
            argumento instanceof Expressao
                ? (<Variavel>(<Expressao>argumento).expressao).simbolo
                : (<Variavel>argumento).simbolo;
        pilhaEscoposExecucao.definirVariavel(simbolo.lexema, valorLido);
    }
}
