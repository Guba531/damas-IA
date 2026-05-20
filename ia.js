// ─── ia.js ────────────────────────────────────────────────────────────────────
// Módulo unificado da Inteligência Artificial para o Jogo de Damas.
//
// Exporta uma única função pública chamada pelo script.js:
//   calcularJogadaIA(tabuleiro, corIA, nivel, calcMov, temCapt, aplicarMov, dentro, TAMANHO)
//   → retorna { r, c, mov } com a peça de origem e o movimento escolhido.
//
// Níveis disponíveis:
//   1 - Fácil:   avalia a peça que moveu (captura, avanço, vulnerabilidade)
//   2 - Médio:   avalia o tabuleiro inteiro após o movimento (sem lookahead)
//   3 - Difícil: Minimax com poda Alpha-Beta (profundidade 4)
//
// Evolução pedagógica:
//   IA 1 → olha apenas a peça que se moveu
//   IA 2 → olha o tabuleiro inteiro após o movimento        [NOVO: avaliarTabuleiro]
//   IA 3 → olha o tabuleiro inteiro N jogadas à frente      [NOVO: minimax recursivo]
// ──────────────────────────────────────────────────────────────────────────────

"use strict";

const PROFUNDIDADE_MAX = 4;

function calcularJogadaIA(tabuleiro, corIA, calcMov, temCapt, aplicarMov, dentro, TAMANHO) {
    switch (nivel) {
        case 1: return iaNivel1(tabuleiro, corIA, calcMov, temCapt, TAMANHO);
        case 2: return iaNivel2(tabuleiro, corIA, calcMov, temCapt, TAMANHO);
        case 3: return iaNivel3(tabuleiro, corIA, calcMov, temCapt, TAMANHO);
        default: return iaNivel1(tabuleiro, corIA, calcMov, temCapt, TAMANHO);
    }
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
    promoverSeDama(tab[mov.r][mov.c], mov.r);
}

function todosMovimentos(tabuleiro, corIA, calcMov, temCapt, TAMANHO) {
    const obrigado = temCapt(corIA, tabuleiro);
    const lista = [];
    for (let r = 0; r < TAMANHO; r++) {
        for (let c = 0; c < TAMANHO; c++) {
            const peca = tabuleiro[r][c];
            if (!peca || peca.cor !== corIA) continue;
            let movs = calcMov(r, c, tabuleiro);
            if (obrigado) movs = movs.filter(m => m.captura);
            for (const mov of movs) lista.push({ r, c, mov });
        }
    }
    return lista;
}

function corAdversaria(cor) {
    return cor === 'branca' ? 'preta' : 'branca';
}

function promoverSeDama(peca, r) {
    if (!peca.dama) {
        peca.dama = (peca.cor === 'branca' && r === 0) ||
                    (peca.cor === 'preta'  && r === 7);
    }
}

function calcularAvanco(peca, r) {
    return peca.cor === 'preta' ? r / 7 : (7 - r) / 7;
}

function simularMov(tab, { r, c, mov }) {
    const copia = clonarTabuleiro(tab);
    aplicarMovSimples(copia, r, c, mov);
    return copia;
}

function iaNivel1(tabuleiro, corIA, calcMov, temCapt, TAMANHO) {
    const corAdversario = corAdversaria(corIA);

    const opcoes = todosMovimentos(tabuleiro, corIA, calcMov, temCapt, TAMANHO);

    if (opcoes.length === 0) return null;

    for (const opcao of opcoes) {
        let score = 0;

        if (opcao.mov.captura) {
            const pecaCapturada = tabuleiro[opcao.mov.capturaR][opcao.mov.capturaC];
            score += pecaCapturada && pecaCapturada.dama ? 10 : 5;
        }

        if (corIA === 'preta') score += opcao.mov.r / 7;
        else score += (7 - opcao.mov.r) / 7;


        const tabCopia = clonarTabuleiro(tabuleiro);
        aplicarMovSimples(tabCopia, opcao.r, opcao.c, opcoes.mov);
        if (ficaVulneravel(tabCopia, opcao.mov.r, opcao.mov.c, corAdversario, calcMov, TAMANHO)) {
            const ehDama = tabCopia[opcao.mov.r][opcao.mov.c]?.dama;
            score -= ehDama ? 8 : 3;
        }

        opcao.score = score;
    }

    opcoes.sort((a, b) => b.score - a.score);
    const maiorScore = opcoes[0].score;
    const melhores = opcoes.filter(o => o.score === maiorScore);
    return melhores[Math.floor(Math.random() * melhores.length)];
}