// ─── ia_etapa5.js ─────────────────────────────────────────────────────────────
// NÍVEL 1 — ETAPA 5: Bônus por avanço — heurística posicional
//
// Além de preferir capturas, agora a IA também avalia a POSIÇÃO da jogada.
// Peças que avançam em direção à promoção (virar dama) recebem um bônus.
// Isso faz a IA "empurrar" as peças para frente em vez de andar aleatoriamente.
//
// Conceitos novos nesta etapa:
//   - heurística         → regra de estimativa que não é exata, mas funciona bem
//   - normalização       → transformar linha 0-7 em valor 0.0 a 1.0
//   - score composto     → combinar múltiplos critérios numa só nota
// ──────────────────────────────────────────────────────────────────────────────

function calcularJogadaIA(tabuleiro, corIA, nivel, calcMov, temCapt, aplicarMov, dentro, TAMANHO) {

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

    // ── LOG DIDÁTICO: cabeçalho da rodada ─────────────────────────────────────
    console.group(`%c🤖 IA (${corIA}) — avaliando ${lista.length} opção(ões)`, 'font-weight:bold; color:#6a5acd');
    console.log(`Modo: ${capturas.length > 0 ? '⚔️  somente capturas' : '🚶 movimentos normais'}`);
    // ──────────────────────────────────────────────────────────────────────────

    for (const opcao of lista) {
        let score = 0;
        let scoreCaptura = 0;
        let scoreAvanco = 0;

        if (opcao.mov.captura) {
            //Verifica se a peca que sera capturada e uma dama
            const pecaCapturada = tabuleiro[opcao.mov.capturaR][opcao.mov.capturaC];
            scoreCaptura = pecaCapturada && pecaCapturada.dama ? 10 : 5;
            score += scoreCaptura;
        }

        if (corIA === 'preta') {
            scoreAvanco += opcao.mov.r / 7;
        } else {
            scoreAvanco += (7 - opcao.mov.r) / 7;
        }

        opcao.score = score;
        // ── LOG DIDÁTICO: detalhes de cada opção ────────────────────────────────
        const origem = `(${opcao.r},${opcao.c})`;
        const destino = `(${opcao.mov.r},${opcao.mov.c})`;
        const barraAvanco = '█'.repeat(Math.round(scoreAvanco * 7)).padEnd(7, '░');
        const barraCaptura = scoreCaptura > 0 ? `+${scoreCaptura} ⚔️` : '—';

        console.log(
            `%c  ${origem} → ${destino}` +
            `  | avanço: ${barraAvanco} +${scoreAvanco.toFixed(2)}` +
            `  | captura: ${barraCaptura}` +
            `  | TOTAL: ${score.toFixed(2)}`,
            scoreAvanco > 0.7 ? 'color:#22c55e' : 'color:inherit'   // verde se avanço alto
        );
    }

    lista.sort((a, b) => b.score - a.score);

    const maiorScore = lista[0].score;
    const melhores = lista.filter(o => o.score === maiorScore);

    const escolhida = melhores[Math.floor(Math.random() * melhores.length)];

  // ── LOG DIDÁTICO: resultado final ─────────────────────────────────────────
  console.log(
    `%c  ✅ Escolhida: (${escolhida.r},${escolhida.c}) → (${escolhida.mov.r},${escolhida.mov.c})  score: ${escolhida.score.toFixed(2)}`,
    'font-weight:bold; color:#f59e0b'
  );
  console.groupEnd();
  // ──────────────────────────────────────────────────────────────────────────

  return escolhida;
}