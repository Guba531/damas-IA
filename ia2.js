// ─── ia_nivel2.js ─────────────────────────────────────────────────────────────
// NÍVEL 2 — Avaliação global do tabuleiro (sem lookahead)
//
// O que é da IA 1 e reaparece aqui sem alteração:
//   - clonarTabuleiro()    → copiar o estado antes de simular
//   - aplicarMovSimples()  → aplicar o movimento na cópia
//   - prioridade de captura → capturas são obrigatórias e avaliadas primeiro
//   - score por jogada     → pontuar e ordenar candidatos
//
// O que é NOVO nesta etapa:
//   - Avaliação GLOBAL do tabuleiro resultante
//     Na IA 1, avaliávamos apenas a peça que se moveu (captura, avanço, vulnerabilidade).
//     Aqui, depois de simular o movimento, percorremos o tabuleiro inteiro e
//     somamos/subtraímos o valor de TODAS as peças — as da IA e as do adversário.
//     Isso permite enxergar consequências que afetam outras peças do tabuleiro,
//     não só a que acabou de mover.
//
//   - Função avaliarTabuleiro(tab, corIA)
//     Percorre todas as casas, pontua cada peça pelo seu tipo e posição,
//     e retorna um score único que representa "quão bom está o tabuleiro para a IA".
//     Score positivo = vantagem da IA | Score negativo = vantagem do adversário.
//
// Resumo da evolução:
//   IA 1 → olha a peça que moveu
//   IA 2 → olha o tabuleiro inteiro após o movimento
//   IA 3 → olha o tabuleiro inteiro N jogadas à frente (Minimax)
// ──────────────────────────────────────────────────────────────────────────────
"use strict"
// "use strict" → faz o JavaScript ficar mais chato de propósito.
// Se você esquecer de declarar uma variável ou cometer um erro bobo,
// ele avisa na hora em vez de ficar quieto e causar bug misterioso lá na frente.

function calcularJogadaIA(tabuleiro, corIA, nivel, calcMov, temCapt, aplicarMov, dentro, TAMANHO) {
    return iaNivel2(tabuleiro, corIA, calcMov, temCapt, TAMANHO);
}

function clonarTabuleiro(tabuleiro) {
    return tabuleiro.map(linha =>
        linha.map(celula =>
            celula ? { ...celula } : null
        )
    );
}

function aplicarMovSimples(tab, r, c, mov) {

    tab[mov.r][mov.c] = tab[r][c];
    tab[r][c] = null;

    if (mov.captura) tab[mov.capturaR][mov.capturaC] = null;
    const peca = tab[mov.r][mov.c];

    if (peca.cor === 'branca' && mov.r === 0) peca.dama = true;
    if (peca.cor === 'preta' && mov.r === 7) peca.dama = true;
}

// ─── Avaliação global do tabuleiro ──────────────────────────────────────
// Percorre todas as peças e calcula um score único para o estado atual.
//
// Critérios:
//   Peça normal = 1 ponto
//   Dama        = 3 pontos
//   Bônus de avanço: quanto mais próxima da promoção, até +0.3 extra
//
// Peças da IA somam; peças do adversário subtraem.

function avaliarTabuleiro(tab, corIA) {
    let score = 0;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = tab[r][c];
            if (!p) continue;
            const valor = p.dama ? 3 : 1;
            const avanco = p.cor === 'preta' ? r / 7 : (7 - r) / 7;

            // Em JavaScript, as chaves { } são opcionais quando o if/else possui apenas UMA instrução.
            // Por isso, neste caso, o código funciona mesmo sem as chaves.
            // ⚠️ Atenção:
            // Se adicionar mais de uma linha sem usar { }, apenas a PRIMEIRA linha
            // será considerada dentro do if/else, e as outras serão executadas sempre.
            // Isso pode causar bugs difíceis de perceber.
            //
            // Por segurança e melhor leitura, é recomendado usar sempre { } em códigos maiores.

            if (p.cor === corIA) score += valor + avanco * 0.3;
            else score -= valor + avanco * 0.3;
        }
    }
    return score;
}

//-------------Nivel 2--------------------------------------

function iaNivel2(tabuleiro, corIA, calcMov, temCapt, TAMANHO) {
    const obrigado = temCapt(corIA, tabuleiro);
    const opcoes = [];

    for (let r = 0; r < TAMANHO; r++) {
        for (let c = 0; c < TAMANHO; c++) {
            const peca = tabuleiro[r][c];
            if (!peca || peca.cor !== corIA) continue;

            let movs = calcMov(r, c, tabuleiro);
            if (obrigado) movs = movs.filter(m => m.captura);

            for (const mov of movs) opcoes.push({ r, c, mov });
        }
    }

    if (opcoes.length === 0) return null;

    let melhorScore = -Infinity;
    let melhorOpcao = null;

    for (const opcao of opcoes) {
        const copia = clonarTabuleiro(tabuleiro);
        aplicarMovSimples(copia, opcao.r, opcao.c, opcao.mov);

        // avalia o tabuleiro inteiro, nao so a peca que moveu.
        const score = avaliarTabuleiro(copia, corIA) + Math.random() * 0.5;

        if(score > melhorScore) {
            melhorScore = score;
            melhorOpcao = opcao;
        }
    }

    return melhorOpcao;
}