// ─── ia_etapa1.js ─────────────────────────────────────────────────────────────
// NÍVEL 1 — ETAPA 1: IA completamente aleatória
//
// O computador não pensa em nada.
// Pega a lista de todos os movimentos possíveis e sorteia um.
//
// Conceitos desta etapa:
//   - Math.random()          → gera número aleatório entre 0 e 1
//   - Math.floor()           → arredonda para baixo (transforma em índice inteiro)
//   - array de opções        → lista de jogadas disponíveis
// ──────────────────────────────────────────────────────────────────────────────

function calcularJogadaIA(tabuleiro, corIA, nivel, calcularMovimentos, temCaptura, aplicarMovimento, dentro, tamanho) {

    //1. Monta a lista de TODOS os movimentos possiveis para a IA
    const opcoes = [];

    for (let r = 0; r < tamanho; r++) {
        for (let c = 0; c < tamanho; c++) {
            const peca = tabuleiro[r][c];
            if (!peca || peca.cor !== corIA) continue;

            const movimentos = calcMov(r, c, tabuleiro);

            for (const mov of movimentos) {
                opcoes.push({ r, c, mov});
            }
        }
    }

    // 2. Se não há nenhuma opção, retorna null (derrota)
    if (opcoes.length === 0) return null;

    // 3. Sorteia um índice aleatório entre 0 e o tamanho da lista
    const indiceAleatorio = Math.floor(Math.random() * opcoes.length);

    // 4. Retorna a jogada sorteada — sem nenhum critério!
    return opcoes[indiceAleatorio];
}