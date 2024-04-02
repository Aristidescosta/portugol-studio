import { Leia } from '@designliquido/delegua/declaracoes';
import { InterpretadorBase } from '@designliquido/delegua/interpretador/interpretador-base';
import { visitarExpressaoLeiaComum } from './comum';
import { PilhaEscoposExecucaoPortugolStudio } from './pilha-escopos-execucao-portugol-studio';

export class InterpretadorPortugolStudio extends InterpretadorBase {
    constructor(diretorioBase: string, performance = false, funcaoDeRetorno: Function = null) {
        super(diretorioBase, performance, funcaoDeRetorno);
        this.pilhaEscoposExecucao = new PilhaEscoposExecucaoPortugolStudio();
    }

    /**
     * Execução da leitura de valores da entrada configurada no
     * início da aplicação.
     * @param expressao Expressão do tipo Leia
     * @returns Promise com o resultado da leitura.
     */
    async visitarExpressaoLeia(expressao: Leia): Promise<any> {
        return visitarExpressaoLeiaComum(this.interfaceEntradaSaida, this.pilhaEscoposExecucao, expressao);
    }
}
