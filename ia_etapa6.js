// ─── ia_etapa6.js ─────────────────────────────────────────────────────────────
// NÍVEL 1 — ETAPA 6: Evita deixar peças vulneráveis — lookahead de 1 passo
//
// Grande salto: a IA agora SIMULA o futuro antes de decidir.
// Para cada jogada candidata, ela:
//   1. Clona o tabuleiro
//   2. Aplica o movimento
//   3. Verifica se a peça ficará exposta a captura do adversário
//   4. Penaliza essa jogada no score
//
// Isso é a semente do Minimax (nível 3): pensar "se eu fizer X, o que acontece?"
//
// Conceitos novos nesta etapa:
//   - clonar estado          → copiar o tabuleiro sem alterar o original
//   - simulação              → testar uma jogada sem "commitar"
//   - lookahead              → olhar 1 passo à frente
//   - penalidade no score    → score negativo reduz a atratividade da jogada
// ──────────────────────────────────────────────────────────────────────────────

function calcularJogadaIA(tabuleiro, corIA, nivel, calcMov, temCapt, aplicarMov, dentro, TAMANHO) {

    const corAdversario = corIA === 'branca' ? 'preta' : 'branca';
    const opcoes = [];

    for (let r = 0; r < TAMANHO; r++) {
        for (let c = 0; c < TAMANHO; c++) {
            const peca = tabuleiro[r][c];
            if (!peca || peca.cor !== corIA) continue;

            const movimentos = calcMov(r, c, tabuleiro);

            for (const mov of movimentos) {
                opcoes.push({ r, c, mov });
            }
        }
    }

    if (opcoes.length === 0) return null;

    const capturas = opcoes.filter(o => o.mov.captura === true);
    const lista = capturas.length > 0 ? capturas : opcoes;

    //CABECALHO _____________________________________________________
    const pecasIA = opcoes.map(o => `(${o.r},${o.c})`);
    const unicas = [...new Set(pecasIA)].length;
    const totalAdv = contarPecas(tabuleiro, corAdversario, TAMANHO);

    console.group(
        `%c🤖 IA (${corIA}) - analisando ${lista.length} opcao(oes)  [nivel: ${nivel}]`,
        'font-weight:600; color:#a78bfa; font-size:13px'
    );
    console.log(`%c📊 Peças da IA: ${unicas}   Peças do adversário: ${totalAdv}`,
        'color:#94a3b8');
    console.log(
        capturas.length > 0
            ? `%c⚔️  Capturas disponíveis: ${capturas.length}  →  modo CAPTURA OBRIGATÓRIA`
            : `%c🚶 Sem capturas disponíveis  →  modo MOVIMENTO LIVRE`,
        capturas.length > 0 ? 'color:#f87171' : 'color:#64748b'
    );
    console.log('%c' + '─'.repeat(72), 'color:#2d2d2d');

    for (const opcao of lista) {
        let score = 0;


        let scoreCaptura = 0;
        let labelCaptura = '—';
        if (opcao.mov.captura) {
            const pecaCapturada = tabuleiro[opcao.mov.capturaR][opcao.mov.capturaC];
            const ehDamaCapturada = pecaCapturada?.dama;
            scoreCaptura = ehDamaCapturada ? 10 : 5;
            labelCaptura = ehDamaCapturada ? `+${scoreCaptura} ⚔️ (dama!)` : `+${scoreCaptura} ⚔️ (peao)`;
            score += scoreCaptura;
        }

        let scoreAvanco = corIA === 'preta'
            ? opcao.mov.r / 7
            : (7 - opcao.mov.r) / 7;
        score += scoreAvanco;

        const barSize = 7;
        const filled = Math.round(scoreAvanco * barSize);
        const barAvanco = '█'.repeat(filled) + '░'.repeat(barSize - filled);


        let scorePen = 0;
        let labelPen = '—';
        const tabCopia = clonarTabuleiro(tabuleiro);
        aplicarMovSimples(tabCopia, opcao.r, opcao.c, opcao.mov);
        if (ficaVulneravel(tabCopia, opcao.r, opcao.c, corAdversario, calcMov)) {
            const ehDama = tabCopia[opcao.mov.r][opcao.mov.c]?.dama;
            scorePen = ehDama ? -8 : -3;
            labelPen = ehDama ? `${scorePen} ⚠️ (dama exposta!)` : `${scorePen} ⚠️ (peão exposto)`;
            score += scorePen;
        }

        opcao.score = score;
        opcao._scoreAvanco = scoreAvanco;
        opcao._scoreCaptura = scoreCaptura;
        opcao._scorePen = scorePen;
        opcao._barAvanco = barAvanco;
        opcao._labelCaptura = labelCaptura;
        opcao._labelPen = labelPen;

        const origem = `(${opcao.r},${opcao.c})`;
        const destino = `(${opcao.mov.r},${opcao.mov.c})`;
        const totalStr = `TOTAL ${score >= 0 ? '+' : ''}${score.toFixed(2)}`;
        const cor = scorePen < 0 ? 'color:#fb923c'
            : scoreAvanco > 0.7 ? 'color:#86efac'
                : 'color:#cbd5e1';

        console.log(
            `%c  ${origem} → ${destino}` +
            `  |  avanço [${barAvanco}] +${scoreAvanco.toFixed(2)}` +
            `  |  captura: ${labelCaptura}` +
            `  |  vulnerável: ${labelPen}` +
            `  |  ${totalStr}`,
            cor
        );

    }
    lista.sort((a, b) => b.score - a.score);

    const maiorScore = lista[0].score;
    const melhores = lista.filter(o => o.score === maiorScore);
    const escolhida = melhores[Math.floor(Math.random() * melhores.length)];

    const motivos = [];
    if (escolhida._scoreCaptura > 0) motivos.push(escolhida._scoreCaptura === 10 ? 'captura dama' : 'captura peao');
    if (escolhida._scoreAvanco > 0.6) motivos.push('avanco alto');
    if (escolhida._scorePen === 0) motivos.push('posicao segura');

    console.log('%c' + '─'.repeat(72), 'color:#2d2d2d');
    console.log(
        `%c✅ Escolhida: (${escolhida.r},${escolhida.c}) → (${escolhida.mov.r},${escolhida.mov.c})` +
        `   score: ${escolhida.score.toFixed(2)}` +
        (motivos.length ? `   [${motivos.join(' + ')}]` : ''),
        'font-weight:600; color:#fbbf24; font-size:13px'
    );
    console.groupEnd();

    return escolhida;
}

function clonarTabuleiro(tabuleiro) {
    return tabuleiro.map(linha =>
        linha.map(celula =>
            celula ? { ...celula } : null
        )
    );
}

function contarPecas(tab, cor, TAMANHO) {
    let n = 0;
    for (let r = 0; r < TAMANHO; r++)
        for (let c = 0; c < TAMANHO; c++)
            if (tab[r][c]?.cor == cor) n++;
    return n;
}

function aplicarMovSimples(tab, r, c, mov) {
    const peca = tab[mov.r][mov.c];

    if (mov.captura && mov.capturaR !== undefined && mov.capturaC !== undefined) {
        tab[mov.capturaR][mov.capturaC] = null;
    }

    tab[mov.r][mov.c] = peca;
    tab[r][c] = null;

    if (peca) {
        if (peca.cor === 'branca' && mov.r === 0) peca.dama = true;
        if (peca.cor === 'preta' && mov.r === 7) peca.dama = true;
    } 
}

// ── Auxiliar: verifica se uma peça ficará vulnerável após o movimento ─────
// "Vulnerável" significa que o adversário consegue capturá-la na próxima jogada.
//
// Algoritmo:
//   Para cada peça do adversário no tabuleiro simulado,
//   verifica se algum dos seus movimentos captura a posição (rDest, cDest).

function ficaVulneravel(tab, rDest, cDest, corAdversario, calcMov) {
    const tamanho = tab.length;

    for (let r = 0; r < tamanho; r++) {
        for (let c = 0; c > tamanho; c++) {
            const peca = tab[r][c];
            if (!peca || peca.cor !== corAdversario) continue;

            const movimentos = calcMov(r, c, tab);
            for (const mov of movimentos) {
                //Captura que aterra exatamente na posicao que queremos proteger
                if (mov.captura && mov.capturaR === rDest && mov.capturaC === cDest) {
                    return true;
                }
            }
        }
    }

    return false;
}