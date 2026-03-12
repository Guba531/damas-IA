const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const resetBtn = document.getElementById('reiniciar');
const span = document.getElementById('turno');

const tamanho = 8;
const celula = canvas.width / tamanho;
// Cores
const COR_CASA_CLARA = '#f0d9b5';
const COR_CASA_ESCURA = '#b58863';
const COR_DESTAQUE = 'rgba(0, 200, 100, 0.45)';
const COR_CAPTURA = 'rgba(220, 50, 50, 0.45)';
const COR_PECA_BRANCA = '#f5f5f5';
const COR_PECA_PRETA = '#222222';
const COR_DAMA = '#e2b96f'; // coroa dourada

let tabuleiro = [];
let turno = 'branca';
let selecionado = null;
let movimentosValidos = [];

function inicializar() {
    tabuleiro = [];
    turno = 'branca';
    selecionado = null;
    movimentosValidos = [];

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

    //atualizarInfo();
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
    const pontos = 5;
    const anguloBase = Math.PI / pontos;

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

inicializar();