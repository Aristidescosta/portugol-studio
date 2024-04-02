import {
    numero_caracteres,
    caixa_alta,
    caixa_baixa,
    substituir,
    preencher_a_esquerda,
    obter_caracter,
    posicao_texto,
    extrair_subtexto
} from '../../fontes/bibliotecas/texto';

describe('Biblioteca Texto', () => {
    describe('Número de Caracteres', () => {
        it('String vazia', async () => {
            const resultado = await numero_caracteres('');
            expect(resultado).toBe(0);
        });

        it('String com um caractere', async () => {
            const resultado = await numero_caracteres('a');
            expect(resultado).toBe(1);
        });

        it('String com varios caracteres', async () => {
            const resultado = await numero_caracteres('Olá, mundo!');
            expect(resultado).toBe(11);
        });
    });

    describe('Caixa Alta', () => {
        it('Trivial', async () => {
            const resultado = await caixa_alta('Olá, mundo!');
            expect(resultado).toBe('OLÁ, MUNDO!');
        });
    });

    describe('Caixa Baixa', () => {
        it('Trivial', async () => {
            const resultado = await caixa_baixa('Olá, mundo!');
            expect(resultado).toBe('olá, mundo!');
        });
    });

    describe('Substituir', () => {
        it('Uma ocorrencia', async () => {
            const resultado = await substituir('Olá, mundo!', 'mundo', 'Charlotte');
            expect(resultado).toBe('Olá, Charlotte!');
        });

        it('Varias ocorrencias', async () => {
            const resultado = await substituir('um dois um três um quatro', 'um', 'cinco');
            expect(resultado).toBe('cinco dois um três um quatro');
        });
    });

    describe('Preencher à Esquerda', () => {
        it('String menor que o tamanho especificado', async () => {
            const resultado = await preencher_a_esquerda('0', 8, '123');
            expect(resultado).toBe('00000123');
        });

        it('String maior que o tamanho especificado', async () => {
            const resultado = await preencher_a_esquerda('0', 3, 'mundo');
            expect(resultado).toBe('mundo');
        });

        it('String vazia', async () => {
            const resultado = await preencher_a_esquerda('0', 5, '');
            expect(resultado).toBe('00000');
        });
    });

    describe('Obter Caracter', () => {
        it('Indice Valido', async () => {
            const resultado = await obter_caracter('olá', 2);
            expect(resultado).toBe('á');
        });
        it('Indice Negativo', async () => {
            await expect(obter_caracter('olá', -1)).rejects.toThrow('O índice do caracter (-1) é menor que 0');
        });

        it('Indice maior que a String', async () => {
            await expect(obter_caracter('olá', 10)).rejects.toThrow(
                'O índice do caracter (10) é maior que o número de caracteres na cadeia (3)'
            );
        });
    });
    describe('Posição do Texto', () => {
        it('Trivial', async () => {
            const resultado = await posicao_texto('Olá, mundo!', 'mundo', 0);
            expect(resultado).toBe(5);
        });

        it('Texto não encontrado', async () => {
            const resultado = await posicao_texto('Olá mundo!', 'Char', 0);
            expect(resultado).toBe(-1);
        });

        it('String vazia', async () => {
            const resultado = await posicao_texto('', 'Char', 0);
            expect(resultado).toBe(-1);
        });
    });
    describe('Extrair Subtexto', () => {
        it('Trivial', async () => {
            const resultado = await extrair_subtexto('Olá, mundo!', 0, 3);
            expect(resultado).toBe('Olá');
        });
    
        it('Posição inicial invalida', async () => {
            await expect(extrair_subtexto('Olá, mundo!', -1, 3)).rejects.toThrow('Posição inicial ou final inválida. A posição deve estar entre 0 e o tamanho da cadeia');
        });
    
        it('Posição final invalida', async () => {
            await expect(extrair_subtexto('Olá, mundo!', 0, 20)).rejects.toThrow('Posição inicial ou final inválida. A posição deve estar entre 0 e o tamanho da cadeia');
        });
    
    });
});
