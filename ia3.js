// ─── ia_nivel3.js ─────────────────────────────────────────────────────────────
// NÍVEL 3 — Minimax com poda Alpha-Beta
//
// O que já conhece e reaparece aqui sem alteração:
//   - clonarTabuleiro()      → copiar o estado antes de simular
//   - aplicarMovSimples()    → aplicar o movimento na cópia
//   - prioridade de captura  → obrigatoriedade já tratada em todosMovimentos()
//   - avaliarTabuleiro()     → mesma lógica global da IA 2, aqui com mais critérios
//
// O que é NOVO nesta etapa — o MINIMAX:
//
//   Na IA 2 a pergunta era:
//     "Qual movimento deixa o tabuleiro melhor para mim AGORA?"
//
//   No Minimax a pergunta é:
//     "Qual movimento deixa o tabuleiro melhor para mim depois que
//      o adversário também jogar da melhor forma possível?"
//
//   O algoritmo alterna entre dois papéis:
//     MAX  → turno da IA       → quer o maior score possível
//     MIN  → turno do adversário → quer o menor score possível (pior para a IA)
//
//   Para cada movimento candidato da IA, o algoritmo:
//     1. Simula o movimento (já conhecido)
//     2. Chama a si mesmo recursivamente para o adversário (MIN)
//     3. O adversário faz o mesmo: simula cada resposta e chama MAX de volta
//     4. Isso se repete até atingir a profundidade limite
//     5. No fundo da árvore, avalia o tabuleiro e sobe o valor pela recursão
//
//   A IA escolhe o ramo cujo valor final (após a melhor resposta do adversário)
//   é o maior possível.
//
// Poda Alpha-Beta — otimização do Minimax:
//   Durante a busca, mantemos dois valores:
//     alpha → melhor que o MAX já garantiu (começa em -Infinito)
//     beta  → melhor que o MIN já garantiu (começa em +Infinito)
//
//   Se em algum ponto beta <= alpha, sabemos que esse ramo nunca será escolhido
//   por nenhum dos dois jogadores — podemos parar de explorá-lo (break).
//   O resultado final é IDÊNTICO ao Minimax puro, só muito mais rápido.
//
// Resumo da evolução:
//   IA 1 → avalia a peça que moveu (1 passo, parcial)
//   IA 2 → avalia o tabuleiro inteiro (1 passo, global)
//   IA 3 → avalia o tabuleiro inteiro N jogadas à frente, assumindo adversário ótimo
// ──────────────────────────────────────────────────────────────────────────────

"use strict";

const PROFUNDIDADE_MAX = 4;

function calcularJogadaIA(tabuleiro, corIA, nivel, calcMov, temCapt, aplicarMov, dentro, TAMANHO) {
    return iaNivel3(tabuleiro, corIA, calcMov, temCapt, TAMANHO);
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

function avaliarTabuleiro(tab, corIA) {
    const corAdv = corIA === 'branca' ? 'preta' : 'branca';
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

// MINIMAX — como a IA pensa antes de jogar
//
// Imagina que você está jogando damas e pensa:
//   "Se eu mover essa peça aqui... o adversário vai me capturar ali.
//    Então melhor não fazer isso."
//
// O Minimax faz exatamente isso, só que no computador:
//
//   1. A IA testa cada movimento que ela pode fazer
//   2. Para cada um, simula a MELHOR resposta do adversário
//   3. Para cada resposta do adversário, simula a MELHOR resposta da IA
//   4. Isso se repete N vezes (a profundidade)
//   5. No final, a IA escolhe o caminho que — mesmo com o adversário
//      jogando bem — ainda é o melhor para ela
//
// Dois papéis se alternam:
//   MAX → turno da IA         → quer o MAIOR score possível
//   MIN → turno do adversário → quer o MENOR score possível (pior para a IA)
//
// Diferença para as IAs anteriores:
//   IA 1 → pensa só no movimento atual
//   IA 2 → pensa só no movimento atual, mas olha o tabuleiro inteiro
//   IA 3 → pensa vários movimentos à frente, assumindo que o adversário
//           também vai jogar da melhor forma possível

// ─── NOVO: Minimax com poda Alpha-Beta ────────────────────────────────────────
//
// Parâmetros:
//   tab          → tabuleiro atual (já clonado antes da chamada)
//   profundidade → quantos níveis ainda faltam explorar
//   alpha        → melhor valor que MAX já garantiu neste caminho
//   beta         → melhor valor que MIN já garantiu neste caminho
//   maximizando  → true = turno da IA (MAX) | false = turno do adversário (MIN)
//   corIA        → cor da IA (referência fixa durante toda a busca)

function minimax(tab, profundidade, alpha, beta, maximizando, corIA, calcMov, temCapt, TAMANHO) {
    const corAdv = corIA === 'branca' ? 'preta' : 'branca';

    if (profundidade === 0) {
        return avaliarTabuleiro(tab, corIA);
    }

    const corAtual = maximizando ? corIA : corAdv;
    const opcoes = todosMovimentos(tab, corAtual, calcMov, temCapt, TAMANHO);

    if (opcoes.length === 0) {
        return maximizando ? -1000 : 1000;
    }

    if (maximizando) {
        let maxVal = -Infinity;
        for (const opcao of opcoes) {
            const copia = clonarTabuleiro(tab);
            aplicarMovSimples(copia, opcao.r, opcao.c, opcao.mov);
            const val = minimax(copia, profundidade - 1, alpha, beta, false, corIA, calcMov, temCapt, TAMANHO);
            maxVal = Math.max(maxVal, val);
            alpha = Math.max(alpha, val);
            if (beta <= alpha) break;
        }
        return maxVal;
        

    } else {
        let minVal = Infinity;
        for (const opcao of opcoes) {
            const copia = clonarTabuleiro(tab);
            aplicarMovSimples(copia, opcao.r, opcao.c, opcao.mov);
            const val = minimax(copia, profundidade - 1, alpha, beta, true, corIA, calcMov, temCapt, TAMANHO);
            minVal = Math.min(minVal, val);
            beta   = Math.min(beta, val);
            if (beta <= alpha) break;
        }
        return minVal;
    }
}

//-------------------Nivel 3-------------------------------

function iaNivel3(tabuleiro, corIA, calcMov, temCapt, TAMANHO) {
    const opcoes = todosMovimentos(tabuleiro, corIA, calcMov, temCapt, TAMANHO);
    if (opcoes.length === 0) return null;

    let melhorValor = -Infinity;
    let melhorOpcao = null;

    for (const opcao of opcoes) {
        const copia = clonarTabuleiro(tabuleiro);
        aplicarMovSimples(copia, opcao.r, opcao.c, opcao.mov);

        const val = minimax(copia, PROFUNDIDADE_MAX - 1, -Infinity, Infinity, false, corIA, calcMov, temCapt, TAMANHO);

        if (val > melhorValor) {
            melhorValor = val;
            melhorOpcao = opcao;
        }
    }

    return melhorOpcao;
}