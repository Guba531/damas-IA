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
            (peca.cor === 'preta' && r === 7);
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

function ficaVulneravel(tab, r, c, corAdversario, calcMov, TAMANHO) {
    for (let ar = 0; ar < TAMANHO; ar++) {
        for (let ac = 0; ac < TAMANHO; ac++) {
            const p = tab[ar][ac];
            if (!p || p.cor !== corAdversario) continue;
            const movAdv = calcMov(ar, ac, tab);
            if (movAdv.some(m => m.captura && m.capturaR === r && m.capturaC === c)) return true;
        }
    }
    return false;
}

//-------IA Nivel 2: MEDIO------------------------------------

function avaliarTabuleiro(tab, corIA) {
    let score = 0;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = tab[r][c];
            if (!p) continue;
            const valor = p.dama ? 3 : 1;
            const avanco = p.cor === 'preta' ? r / 7 : (7 - r) / 7;
            if (p.cor === corIA) score += valor + avanco * 0.3;
            else score -= valor + avanco * 0.3;
        }
    }
    return score;
}

function iaNivel2(tabuleiro, corIA, calcMov, temCapt, TAMANHO) {
    const opcoes = todosMovimentos(tabuleiro, corIA, calcMov, temCapt, TAMANHO);

    if (opcoes.length === 0) return null;

    let melhorScore = -Infinity;
    let melhorOpcao = null;

    for (const opcao of opcoes) {
        const copia = simularMov(tabuleiro, opcao);
        const score = avaliarTabuleiro(copia, corIA) + Math.random() * 0.5;

        if (score > melhorScore) {
            melhorScore = score;
            melhorOpcao = opcao;
        }
    }

    return melhorOpcao;
}

//-----------IA Nivel 3: Dificil-------------------------------------------

function iaNivel3(tabuleiro, corIA, calcMov, temCapt, TAMANHO) {
    const opcoes = todosMovimentos(tabuleiro, corIA, calcMov, temCapt, TAMANHO);
    if (opcoes.length === 0) return null;

    let melhorValor = -Infinity;
    let melhorOpcao = null;

    for (const opcao of opcoes) {
        const copia = simularMov(tabuleiro, opcao);
        aplicarMovSimples(copia, opcao.r, opcao.c, opcao.mov);

        const val = minimax(copia, PROFUNDIDADE_MAX - 1, -Infinity, Infinity, false, corIA, calcMov, temCapt, TAMANHO);

        if (val > melhorValor) {
            melhorValor = val;
            melhorOpcao = opcao;
        }
    }

    return melhorOpcao;
}

/**
 * Minimax com poda Alpha-Beta.
 *
 * @param {Array}   tab          - Tabuleiro atual (já clonado)
 * @param {number}  profundidade - Níveis restantes a explorar
 * @param {number}  alpha        - Melhor valor que MAX já garantiu neste caminho
 * @param {number}  beta         - Melhor valor que MIN já garantiu neste caminho
 * @param {boolean} maximizando  - true = turno da IA (MAX) | false = adversário (MIN)
 * @param {string}  corIA        - Cor da IA (referência fixa durante toda a busca)
 */

function minimax(tab, profundidade, alpha, beta, maximizando, corIA, calcMov, temCapt, TAMANHO) {
    const corAdv = corAdversaria(corIA);

    // Caso base: atingiu a profundidade limite — avalia o tabuleiro resultante
    if (profundidade === 0) {
        return avaliarTabuleiro(tab, corIA);
    }

    const corAtual = maximizando ? corIA : corAdv;
    const opcoes = todosMovimentos(tab, corAtual, calcMov, temCapt, TAMANHO);

    // Sem movimentos disponíveis = derrota para quem deveria jogar agora
    if (opcoes.length === 0) {
        return maximizando ? -1000 : 1000;
    }

    if (maximizando) {
        let maxVal = -Infinity;
        for (const opcao of opcoes) {
            const copia = simularMov(tab, opcao);
            const val = minimax(copia, profundidade - 1, alpha, beta, false, corIA, calcMov, temCapt, TAMANHO);
            maxVal = Math.max(maxVal, val);
            alpha = Math.max(alpha, val);
            if (beta <= alpha) break; // poda beta: adversário nunca escolheria
        }
        return maxVal;
        

    } else {
        let minVal = Infinity;
        for (const opcao of opcoes) {
            const copia = simularMov(tab, opcao);
            const val = minimax(copia, profundidade - 1, alpha, beta, true, corIA, calcMov, temCapt, TAMANHO);
            minVal = Math.min(minVal, val);
            beta   = Math.min(beta, val);
            if (beta <= alpha) break; // poda beta: adversário nunca escolheria
        }
        return minVal;
        
    }
}

/**
 * Avaliação completa do tabuleiro para o Minimax (IA 3).
 * Evolução de avaliarTabuleiro(): acrescenta controle do centro,
 * proteção de borda e bônus por vantagem numérica acentuada.
 * Dama vale 5 (vs 3 na IA 2) pois o Minimax enxerga consequências a longo prazo.
 */

function avaliarTabuleiroCompleto(tab, corIA) {
    let score = 0;
    let pecasIA = 0, pecasAdv = 0;

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = tab[r][c];
            if (!p) continue;

            const base = p.dama ? 5 : 1;
            const avanco = p.cor === 'preta' ? r / 7 : (7 - r) / 7;
            const centro = (r >= 2 && r <= 5 && c >= 2 && c <= 5) ? 0.3 : 0;
            const borda = (c === 0 || c === 7) ? 0.1 : 0;

            const valor = base + avanco * 0.4 + centro + borda

            if (p.cor === corIA) { score += valor; pecasIA++; }
            else { score -= valor; pecasAdv++; }
        }
    }

    if (pecasIA > pecasAdv + 3) score += 2;
    if (pecasAdv > pecasIA + 3) score -= 2;

    return score;
}
