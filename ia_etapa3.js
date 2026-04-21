// ─── ia_etapa3.js ─────────────────────────────────────────────────────────────
// NÍVEL 1 — ETAPA 3: Prefere capturar sempre que possível
//
// A etapa 2 só capturava quando era obrigatório.
// Agora a IA SEMPRE prefere capturar se tiver a chance — é mais agressiva.
// A diferença é sutil no código, mas muda bastante o comportamento no jogo.
//
// Conceitos novos nesta etapa:
//   - estratégia de prioridade   → "se puder ganhar material, ganhe"
//   - diferença entre regra e estratégia
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

    const indiceAleatorio = Math.floor(Math.random() * lista.length);
    return lista[indiceAleatorio];
}