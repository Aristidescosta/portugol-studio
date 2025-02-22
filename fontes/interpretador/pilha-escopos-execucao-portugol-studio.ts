import { EscopoExecucao } from "@designliquido/delegua/interfaces/escopo-execucao";
import { PilhaEscoposExecucaoInterface } from "@designliquido/delegua/interfaces/pilha-escopos-execucao-interface";
import { Simbolo, SimboloInterface, VariavelInterface } from "@designliquido/delegua";
import { ErroEmTempoDeExecucao } from "@designliquido/delegua/excecoes";
import { DeleguaClasse, DeleguaFuncao } from "@designliquido/delegua/estruturas";
import { EspacoVariaveis } from "@designliquido/delegua/espaco-variaveis";

import { TipoInferencia, inferirTipoVariavel } from "./inferenciador";

export class PilhaEscoposExecucaoPortugolStudio implements PilhaEscoposExecucaoInterface {
    pilha: EscopoExecucao[];

    constructor() {
        this.pilha = [];
        const escopoExecucao: EscopoExecucao = {
            declaracoes: [],
            declaracaoAtual: 0,
            ambiente: new EspacoVariaveis(),
            finalizado: false,
            tipo: 'outro',
            emLacoRepeticao: false,
        };
        this.empilhar(escopoExecucao);
    }

    empilhar(item: EscopoExecucao): void {
        this.pilha.push(item);
    }

    eVazio(): boolean {
        return this.pilha.length === 0;
    }

    elementos(): number {
        return this.pilha.length;
    }

    naPosicao(posicao: number): EscopoExecucao {
        return this.pilha[posicao];
    }

    topoDaPilha(): EscopoExecucao {
        if (this.eVazio()) throw new Error('Pilha vazia.');
        return this.pilha[this.pilha.length - 1];
    }

    removerUltimo(): EscopoExecucao {
        if (this.eVazio()) throw new Error('Pilha vazia.');
        return this.pilha.pop();
    }

    private converterValor(tipo: string, valor: any) {
        switch ((tipo || '').toLowerCase()) {
            case 'inteiro':
                return parseInt(valor);
            case 'lógico':
                return Boolean(valor);
            case 'real':
                return Number(valor);
            case 'texto':
                return String(valor);
            default:
                return valor;
        }
    }

    definirConstante(nomeConstante: string, valor: any, tipo?: string): void {
        const constante = this.pilha[this.pilha.length - 1].ambiente.valores[nomeConstante];

        let tipoConstante;
        if (constante && constante.hasOwnProperty('tipo')) {
            tipoConstante = constante.tipo
        } else if (tipo) {
            tipoConstante = tipo
        } else {
            tipoConstante = inferirTipoVariavel(valor);
        }

        let elementoAlvo: VariavelInterface = {
            valor: this.converterValor(tipo, valor),
            tipo: tipoConstante,
            subtipo: undefined,
            imutavel: true,
        };

        this.pilha[this.pilha.length - 1].ambiente.valores[nomeConstante] = elementoAlvo;
    }

    definirVariavel(nomeVariavel: string, valor: any, tipo?: string) {
        let variavel: VariavelInterface;
        for (let i = 1; i <= this.pilha.length; i++) {
            const ambiente = this.pilha[this.pilha.length - i].ambiente;
            if (ambiente.valores[nomeVariavel] !== undefined) {
                variavel = ambiente.valores[nomeVariavel];
            }
        }

        let tipoVariavel;
        if (variavel && variavel.hasOwnProperty('tipo')) {
            tipoVariavel = variavel.tipo
        } else if (tipo) {
            tipoVariavel = tipo
        } else {
            tipoVariavel = inferirTipoVariavel(valor);
        }

        let elementoAlvo: VariavelInterface = {
            valor: this.converterValor(tipo, valor),
            tipo: tipoVariavel,
            subtipo: undefined,
            imutavel: false,
        };

        this.pilha[this.pilha.length - 1].ambiente.valores[nomeVariavel] = elementoAlvo;
    }

    atribuirVariavelEm(distancia: number, simbolo: any, valor: any): void {
        const ambienteAncestral = this.pilha[this.pilha.length - distancia].ambiente;
        if (ambienteAncestral.valores[simbolo.lexema].imutavel) {
            throw new ErroEmTempoDeExecucao(simbolo, `Constante '${simbolo.lexema}' não pode receber novos valores.`);
        }
        ambienteAncestral.valores[simbolo.lexema] = {
            valor,
            tipo: inferirTipoVariavel(valor),
            imutavel: false,
        };
    }

    atribuirVariavel(simbolo: SimboloInterface, valor: any) {
        for (let i = 1; i <= this.pilha.length; i++) {
            const ambiente = this.pilha[this.pilha.length - i].ambiente;
            if (ambiente.valores[simbolo.lexema] !== undefined) {
                const variavel = ambiente.valores[simbolo.lexema];
                if (variavel.imutavel) {
                    throw new ErroEmTempoDeExecucao(
                        simbolo,
                        `Constante '${simbolo.lexema}' não pode receber novos valores.`
                    );
                }
                const tipo = (variavel && variavel.hasOwnProperty('tipo') ? variavel.tipo : inferirTipoVariavel(valor)).toLowerCase() as TipoInferencia;

                const valorResolvido = this.converterValor(tipo, valor);
                ambiente.valores[simbolo.lexema] = {
                    valor: valorResolvido,
                    tipo,
                    imutavel: false,
                };
                return;
            }
        }

        throw new ErroEmTempoDeExecucao(simbolo, "Variável não definida '" + simbolo.lexema + "'.");
    }

    obterEscopoPorTipo(tipo: string): EscopoExecucao | undefined {
        for (let i = 1; i <= this.pilha.length; i++) {
            const escopoAtual = this.pilha[this.pilha.length - i];
            if (escopoAtual.tipo === tipo) {
                return escopoAtual;
            }
        }

        return undefined;
    }

    obterVariavelEm(distancia: number, nome: string): VariavelInterface {
        const ambienteAncestral = this.pilha[this.pilha.length - distancia].ambiente;
        return ambienteAncestral.valores[nome];
    }

    obterValorVariavel(simbolo: SimboloInterface): VariavelInterface {
        for (let i = 1; i <= this.pilha.length; i++) {
            const ambiente = this.pilha[this.pilha.length - i].ambiente;
            if (ambiente.valores[simbolo.lexema] !== undefined) {
                return ambiente.valores[simbolo.lexema];
            }
        }

        throw new ErroEmTempoDeExecucao(simbolo, "Variável não definida: '" + simbolo.lexema + "'.");
    }

    obterVariavelPorNome(nome: string): VariavelInterface {
        for (let i = 1; i <= this.pilha.length; i++) {
            const ambiente = this.pilha[this.pilha.length - i].ambiente;
            if (ambiente.valores[nome] !== undefined) {
                return ambiente.valores[nome];
            }
        }

        throw new ErroEmTempoDeExecucao(
            new Simbolo('especial', nome, nome, -1, -1),
            "Variável não definida: '" + nome + "'."
        );
    }

    /**
     * Método usado pelo depurador para obter todas as variáveis definidas.
     */
    obterTodasVariaveis(todasVariaveis: VariavelInterface[] = []): any[] {
        for (let i = 1; i <= this.pilha.length - 1; i++) {
            const valoresAmbiente = this.pilha[this.pilha.length - i].ambiente.valores;

            const vetorObjeto: VariavelInterface[] = Object.entries(valoresAmbiente).map((chaveEValor, indice) => ({
                nome: chaveEValor[0],
                valor: chaveEValor[1].valor,
                tipo: chaveEValor[1].tipo,
                imutavel: chaveEValor[1].imutavel,
            }));
            todasVariaveis = todasVariaveis.concat(vetorObjeto);
        }

        return todasVariaveis;
    }

    /**
     * Obtém todas as funções declaradas ou por código-fonte, ou pelo desenvolvedor
     * em console, do último escopo.
     */
    obterTodasDeleguaFuncao(): { [nome: string]: DeleguaFuncao } {
        const retorno = {};
        const ambiente = this.pilha[this.pilha.length - 1].ambiente;
        for (const [nome, corpo] of Object.entries(ambiente.valores)) {
            const corpoValor = corpo.hasOwnProperty('valor') ? corpo.valor : corpo;
            if (corpoValor instanceof DeleguaFuncao) {
                retorno[nome] = corpoValor;
            }
        }

        return retorno;
    }

    /**
     * Obtém todas as declarações de classe do último escopo.
     * @returns
     */
    obterTodasDeclaracaoClasse(): any {
        const retorno = {};
        const ambiente = this.pilha[this.pilha.length - 1].ambiente;
        for (const [nome, corpo] of Object.entries(ambiente.valores)) {
            const corpoValor = corpo.hasOwnProperty('valor') ? corpo.valor : corpo;
            if (corpoValor instanceof DeleguaClasse) {
                retorno[nome] = corpoValor;
            }
        }

        return retorno;
    }
}
