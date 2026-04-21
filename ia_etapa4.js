// ─── ia_etapa4.js ─────────────────────────────────────────────────────────────
// NÍVEL 1 — ETAPA 4: Escolhe a captura de maior VALOR
//
// Até agora, quando havia duas capturas, a IA sorteava entre elas.
// Agora ela avalia: vale mais capturar uma DAMA do que uma peça normal.
// Introduzimos o conceito de PONTUAÇÃO (score) para cada jogada.
//
// Conceitos novos nesta etapa:
//   - pontuação / peso por tipo    → dama = 10, peça = 1
//   - .sort()                      → ordena array por critério
//   - acesso a propriedade de obj  → tabuleiro[r][c].dama
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

    for (const opcao of lista) {
        if (opcao.mov.captura) {
                //Verifica se a peca que sera capturada e uma dama
            const pecaCapturada = tabuleiro[opcao.mov.capturaR][opcao.mov.capturaC];
            opcao.score = pecaCapturada && pecaCapturada.dama ? 10 : 1;
        } else {
            opcao.score = 0; //Movimento simples nao pontua
        }
    }

    lista.sort((a, b) => b.score - a.score);

    const maiorScore = lista[0].score;

    const melhores = lista.filter(o => o.score === maiorScore);

    return melhores[Math.floor(Math.random() * melhores.length)];
}