import { Variavel } from '@designliquido/delegua/construtos';
import { Expressao, Importar, Leia } from '@designliquido/delegua/declaracoes';
import { PilhaEscoposExecucaoInterface } from '@designliquido/delegua/interfaces/pilha-escopos-execucao-interface';
import { DeleguaModulo, FuncaoPadrao } from '@designliquido/delegua/estruturas';
import { ErroEmTempoDeExecucao } from '@designliquido/delegua/excecoes';

import {
    arredondar,
    cosseno,
    logaritmo,
    maior_numero,
    menor_numero,
    potencia,
    raiz,
    seno,
    tangente,
    valor_absoluto,
} from '../bibliotecas';

export function carregarBibliotecaMatematica() {
    const metodos: { [nome: string]: FuncaoPadrao } = {
        potencia: new FuncaoPadrao(2, potencia),
        raiz: new FuncaoPadrao(2, raiz),
        arredondar: new FuncaoPadrao(2, arredondar),
        logaritmo: new FuncaoPadrao(2, logaritmo),
        seno: new FuncaoPadrao(1, seno),
        cosseno: new FuncaoPadrao(1, cosseno),
        tangente: new FuncaoPadrao(1, tangente),
        valor_absoluto: new FuncaoPadrao(1, valor_absoluto),
        maior_numero: new FuncaoPadrao(2, maior_numero),
        menor_numero: new FuncaoPadrao(2, menor_numero),
    };

    const objetoMatematica = new DeleguaModulo('Matematica');
    objetoMatematica.componentes = metodos;
    return objetoMatematica;
}

export async function visitarExpressaoImportarComum(expressao: Importar): Promise<any> {
    switch (expressao.caminho.valor) {
        case 'Matematica':
            return carregarBibliotecaMatematica();
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
