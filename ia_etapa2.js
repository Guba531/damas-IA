// ─── ia_etapa2.js ─────────────────────────────────────────────────────────────
// NÍVEL 1 — ETAPA 2: Respeita a regra de captura obrigatória
//
// Evolução da etapa 1: antes de sortear, verifica se existe alguma captura.
// Se houver, só sorteia entre as capturas (regra oficial do jogo).
// Se não houver, sorteia qualquer movimento normalmente.
//
// Conceitos novos nesta etapa:
//   - .filter()              → filtra um array por condição
//   - operador ternário      → condição ? valorA : valorB
//   - propriedade .captura   → flag no objeto de movimento
// ──────────────────────────────────────────────────────────────────────────────

function calcularJogadaIA(tabuleiro, corIA, nivel, calcMov, temCapt, aplicarMov, dentro, TAMANHO) {
    //1. Monta a lista de todos os movimentos possiveis
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

    const soCapturas = opcoes.filter(opcao => opcao.mov.captura === true);

    const lista = soCapturas.length > 0 ? soCapturas : opcoes;

    const indiceAleatorio = Math.floor(Math.random() * lista.length);
    return lista[indiceAleatorio];
}