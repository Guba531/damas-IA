const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const resetBtn = document.getElementById('reiniciar');
const span = document.getElementById('turno');

const pontosBrancoEl = document.getElementById("pontosBranco");
const pontosPretoEl = document.getElementById("pontosPreto");

let pontosBranco = 0;
let pontosPreto = 0;

const modal = document.getElementById("modalEscolha");
const btnBranco = document.getElementById("btnBranco");
const btnPreto = document.getElementById("btnPreto");

let jogadorCor = null;
let jogoIniciado = false;

const tamanho = 8;
const celula = canvas.width / tamanho;

const COR_CASA_CLARA = '#f0d9b5';
const COR_CASA_ESCURA = '#b58863';
const COR_DESTAQUE = 'rgba(0, 200, 100, 0.45)';
const COR_CAPTURA = 'rgba(220, 50, 50, 0.45)';
const COR_PECA_BRANCA = '#f5f5f5';
const COR_PECA_PRETA = '#222222';
const COR_DAMA = '#e2b96f';

let tabuleiro = [];
let turno = 'branca';
let selecionado = null;
let movimentosValidos = [];

btnBranco.onclick = () => {
    jogadorCor = "branca";
    modal.style.display = "none";
    jogoIniciado = true;
};

btnPreto.onclick = () => {
    jogadorCor = "preta";
    modal.style.display = "none";
    jogoIniciado = true;
};

function inicializar() {
    tabuleiro = [];
    turno = 'branca';
    selecionado = null;
    movimentosValidos = [];

    pontosBranco = 0;
    pontosPreto = 0;
    atualizarPlacar();

    for (let r = 0; r < tamanho; r++) {
        tabuleiro[r] = [];
        for (let c = 0; c < tamanho; c++) {
            tabuleiro[r][c] = null;
        }
    }

    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < tamanho; c++) {
            if ((r + c) % 2 === 1) {
                tabuleiro[r][c] = { cor: 'preta', dama: false };
            }
        }
    }

    for (let r = 5; r < tamanho; r++) {
        for (let c = 0; c < tamanho; c++) {
            if ((r + c) % 2 === 1) {
                tabuleiro[r][c] = { cor: 'branca', dama: false };
            }
        }
    }

    desenhar();
}

function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    desenharTabuleiro();
    desenharDestaques();
    colocarPecas();
}

function desenharTabuleiro() {
    for (let r = 0; r < tamanho; r++) {
        for (let c = 0; c < tamanho; c++) {
            ctx.fillStyle = (r + c) % 2 === 0 ? COR_CASA_CLARA : COR_CASA_ESCURA;
            ctx.fillRect(c * celula, r * celula, celula, celula);
        }
    }
}

function desenharDestaques() {
    if (!selecionado) return;

    const { r, c } = selecionado;

    ctx.fillStyle = COR_DESTAQUE;
    ctx.fillRect(c * celula, r * celula, celula, celula);

    for (const mov of movimentosValidos) {
        const cor = mov.captura ? COR_CAPTURA : COR_DESTAQUE;
        ctx.fillStyle = cor;
        ctx.fillRect(mov.c * celula, mov.r * celula, celula, celula);

        ctx.fillStyle = mov.captura ? 'rgba(220,50,50,0.85)' : '(rgba(0,180,80,0.85)';
        ctx.beginPath();
        ctx.arc(
            mov.c * celula + celula / 2,
            mov.r * celula + celula / 2,
            10, 0, Math.PI * 2
        );
        ctx.fill();
    }
}

function desenharPeca(r, c, peca) {
    const cx = c * celula + celula / 2;
    const cy = r * celula + celula / 2;
    const raio = celula / 2 - 8;

    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;

    ctx.beginPath();
    ctx.arc(cx, cy, raio, 0, Math.PI * 2);
    ctx.fillStyle = peca.cor === 'branca' ? COR_PECA_BRANCA : COR_PECA_PRETA;
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle = peca.cor === 'branca' ? '#ccc' : '#555';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, raio - 6, 0, Math.PI * 2);
    ctx.strokeStyle = peca.cor === 'branca' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (peca.dama) {
        desenharCoroa(cx, cy, raio, peca.cor);
    }
}

function colocarPecas() {
    for (let r = 0; r < tamanho; r++) {
        for (let c = 0; c < tamanho; c++) {
            const peca = tabuleiro[r][c];
            if (!peca) continue;
            desenharPeca(r, c, peca);
        }
    }
}

function desenharCoroa(cx, cy, raio, cor) {
    const tamanho = raio * 0.55;
    ctx.fillStyle = COR_DAMA;
    ctx.strokeStyle = cor === 'branca' ? '#8b6914' : '#e2b96f';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(cx - tamanho * 0.8, cy + tamanho * 0.3);

    ctx.lineTo(cx - tamanho * 0.8, cy - tamanho * 0.1);
    ctx.lineTo(cx - tamanho * 0.5, cy - tamanho * 0.5);
    ctx.lineTo(cx - tamanho * 0.2, cy - tamanho * 0.1);
    ctx.lineTo(cx, cy - tamanho * 0.65);
    ctx.lineTo(cx + tamanho * 0.2, cy - tamanho * 0.1);
    ctx.lineTo(cx + tamanho * 0.5, cy - tamanho * 0.5);
    ctx.lineTo(cx + tamanho * 0.8, cy - tamanho * 0.1);
    ctx.lineTo(cx + tamanho * 0.8, cy - tamanho * 0.3);
    ctx.closePath();

    ctx.fill();
    ctx.stroke();
}

function calcularMovimentos(r, c) {
    const peca = tabuleiro[r][c];
    if (!peca) return [];

    const movs = [];
    const direcoesMovimento = peca.dama
        ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
        : peca.cor === 'branca'
            ? [[-1, -1], [-1, 1]]
            : [[1, -1], [1, 1]];

    const direcoesCaptura = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

    for (const [dr, dc] of direcoesMovimento) {
        const nr = r + dr;
        const nc = c + dc;

        if (!dentro(nr, nc)) continue;

        if (!tabuleiro[nr][nc]) {
            movs.push({ r: nr, c: nc, captura: false });
        }
    }

    for (const [dr, dc] of direcoesCaptura) {
        const nr = r + dr;
        const nc = c + dc;

        if (!dentro(nr, nc)) continue;

        if (tabuleiro[nr][nc] && tabuleiro[nr][nc].cor !== peca.cor) {
            const pr = nr + dr;
            const pc = nc + dc;

            if (dentro(pr, pc) && !tabuleiro[pr][pc]) {
                movs.push({
                    r: pr,
                    c: pc,
                    captura: true,
                    capturaR: nr,
                    capturaC: nc
                });
            }
        }
    }

    if (peca.dama) {
        for (const [dr, dc] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
            let nr = r + dr;
            let nc = c + dc;
            let inimigoR = null;
            let inimigoC = null;
            let encontrouInimigo = false;

            while (dentro(nr, nc)) {
                if (!tabuleiro[nr][nc]) {
                    if (!encontrouInimigo) {
                        movs.push({ r: nr, c: nc, captura: false });
                    } else {
                        movs.push({
                            r: nr,
                            c: nc,
                            captura: true,
                            capturaR: inimigoR,
                            capturaC: inimigoC
                        });
                    }
                } else {
                    if (tabuleiro[nr][nc].cor === peca.cor) {
                        break;
                    }
                    if (!encontrouInimigo) {
                        encontrouInimigo = true;
                        inimigoR = nr;
                        inimigoC = nc;
                    } else {
                        break;
                    }
                }

                nr += dr;
                nc += dc;
            }
        }
    }

    return movs;
}

function temCaptura(cor) {
    for (let r = 0; r < tamanho; r++) {
        for (let c = 0; c < tamanho; c++) {
            const peca = tabuleiro[r][c];
            if (!peca || peca.cor !== cor) continue;
            const movs = calcularMovimentos(r, c);
            if (movs.some(m => m.captura)) return true;
        }
    }
    return false;
}

function mover(destR, destC) {
    if (!selecionado) return;

    const { r, c } = selecionado;
    const mov = movimentosValidos.find(m => m.r === destR && m.c === destC);
    if (!mov) return;

    tabuleiro[destR][destC] = tabuleiro[r][c];
    tabuleiro[r][c] = null;

    if (mov.captura) {
        const pecaCapturada = tabuleiro[mov.capturaR][mov.capturaC];

        if (pecaCapturada.cor === 'branca') {
            pontosPreto++;
        } else {
            pontosBranco++;
        }

        atualizarPlacar();
        tabuleiro[mov.capturaR][mov.capturaC] = null;
    }

    const peca = tabuleiro[destR][destC];
    if (peca.cor === 'branca' && destR === 0) peca.dama = true;
    if (peca.cor === 'preta' && destR === 7) peca.dama = true;

    if (mov.captura) {
        const capturasCadeia = calcularMovimentos(destR, destC).filter(m => m.captura);
        if (capturasCadeia.length > 0) {
            selecionado = { r: destR, c: destC };
            movimentosValidos = capturasCadeia;
            desenhar();
            return;
        }
    }

    selecionado = null;
    movimentosValidos = [];
    turno = turno === 'branca' ? 'preta' : 'branca';

    verificarVitoria();
    atualizarInfo();
    desenhar();
}

function verificarVitoria() {
    let branca = 0, preta = 0;
    for (let r = 0; r < tamanho; r++) {
        for (let c = 0; c < tamanho; c++) {
            const p = tabuleiro[r][c];
            if (!p) continue;
            if (p.cor === 'branca') branca++;
            else preta++;
        }
    }

    if (branca === 0) exibirVitoria('Pretas');
    else if (preta === 0) exibirVitoria('Brancas');
}

function exibirVitoria(vencedor) {
    setTimeout(() => {
        span.innerHTML = `<strong>🏆 ${vencedor} venceram!</strong>`;
        alert(`🏆 ${vencedor} venceram! Parabens!`);
    }, 100);
}

function atualizarInfo() {
    const nome = turno === 'branca' ? 'Brancas' : 'Pretas';
    span.innerHTML = `Vez do: <strong>${nome}</strong>`;
}

function atualizarPlacar() {
    pontosBrancoEl.textContent = pontosBranco;
    pontosPretoEl.textContent = pontosPreto;
}

function dentro(r, c) {
    return r >= 0 && r < tamanho && c >= 0 && c < tamanho;
}

canvas.addEventListener('click', (e) => {
    if (!jogoIniciado) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const c = Math.floor(x / celula);
    const r = Math.floor(y / celula);

    const peca = tabuleiro[r][c];

    if (selecionado && movimentosValidos.some(m => m.r === r && m.c === c)) {
        mover(r, c);
        return;
    }

    if (peca && peca.cor === turno) {
        selecionado = { r, c };

        let movs = calcularMovimentos(r, c);
        if (temCaptura(turno)) {
            movs = movs.filter(m => m.captura);
        }

        movimentosValidos = movs;
        desenhar();
        return;
    }

    selecionado = null;
    movimentosValidos = [];
    desenhar();
});

resetBtn.addEventListener('click', inicializar);

inicializar();