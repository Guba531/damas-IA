const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const resetBtn = document.getElementById('reiniciar');
const span = document.getElementById('turno');

const tamanho = 8;
const celula = canvas.width / tamanho;

const COR_CASA_CLARA = '#f0d9b5';
const COR_CASA_ESCURA = '#b58863';
const COR_DESTAQUE = 'rgba(0, 200, 100, 0.45)';
const COR_CAPTURA = 'rgba(220, 50, 50, 0.45)';
const COR_PECA_BRANCA = '#f5f5f5';
const COR_PECA_PRETA = '#222222';
const COR_DAMA = '#e2b96f';

//Estado do Jogo

let tabuleiro = [];
let turno = 'branca';
let selecionado = null;
let movimentosValidos = [];

//Configurações do Modal
let corJogador = 'branca';
let nivelIA = 1;
let corIA = 'preta';

let pontosJogador = 0;
let pontosIA = 0;

// Flag
let aguardandoIA = false;

//Modal
const modal = document.getElementById("modalEscolha");
const botoesCor = document.querySelectorAll('.btn-cor');
const btnIniciarJogo = document.getElementById('btn-iniciar-jogo');
const botoesNivel = document.querySelectorAll('.btn-nivel');

let jogadorCor = null;
let jogoIniciado = false;

botoesCor.forEach(btn => {
    btn.addEventListener('click', () => {
        botoesCor.forEach(b => b.classList.remove('selecionado'));
        btn.classList.add('selecionado');
        corJogador = btn.dataset.cor;
    });
});

botoesNivel.forEach(btn => {
    btn.addEventListener('click', () => {
        botoesNivel.forEach(b => b.classList.remove('selecionado'));
        btn.classList.add('selecionado');
        nivelIA = parseInt(btn.dataset.nivel);
    });
});

btnIniciarJogo.addEventListener('click', () => {
    corIA = corJogador === 'branca' ? 'preta' : 'branca';
    modal.classList.add('oculto');
    inicializar();
});

resetBtn.addEventListener('click', () => {
    modal.classList.remove('oculto');
});

// Fim do Modal

function inicializar() {
    tabuleiro = [];
    turno = 'branca';
    selecionado = null;
    movimentosValidos = [];
    aguardandoIA = false;

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

    atualizarInfo();
    desenhar();

    //Se a IA jogar primeiro (jogador escolheu pretas), dispara IA
    if (turno === corIA) agendarIA();
}

//-------Desenho-------------
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

//Logica de movimentos
function calcularMovimentos(r, c, tab) {
    tab = tab || tabuleiro;
    const peca = tabuleiro[r][c];
    if (!peca) return [];

    const movs = [];
    const direcoesMovimento = peca.dama
        ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
        : peca.cor === 'branca'
            ? [[-1, -1], [-1, 1]]
            : [[1, -1], [1, 1]];

    const direcoesCaptura = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

    if (!peca.dama) {
        for (const [dr, dc] of direcoesMovimento) {
            const nr = r + dr, nc = c + dc;
            if (dentro(nr, nc) && !tab[nr][nc]) {
                movs.push({ r: nr, c: nc, captura: false });
            }
        }
        for (const [dr, dc] of direcoesCaptura) {
            const nr = r + dr, nc = c + dc;
            if (!dentro(nr, nc)) continue;
            if (tab[nr][nc] && tab[nr][nc].cor !== peca.cor) {
                const pr = nr + dr, pc = nc + dc;
                if (dentro(pr, pc) && !tab[pr][pc]) {
                    movs.push({ r: pr, c: pc, captura: true, capturaR: nr, capturaC: nc });
                }
            }
        }
    } else {
        //Dama: movimentos em raio livre
        for (const [dr, dc] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
            let nr = r + dr, nc = c + dc;
            let inimigoR = null, inimigoC = null, encontrouInimigo = false;

            while (dentro(nr, nc)) {
                if (!tab[nr][nc]) {
                    if (!encontrouInimigo) {
                        movs.push({ r: nr, c: nc, captura: false });
                    } else {
                        movs.push({ r: nr, c: nc, captura: true, capturaR: inimigoR, capturaC: inimigoC });
                    }
                } else {
                    if (tab[nr][nc].cor === peca.cor) break;
                    if (!encontrouInimigo) {
                        encontrouInimigo = true;
                        inimigoR = nr; inimigoC = nc;
                    } else break;
                }
                nr += dr; nc += dc;
            }
        }
    }
    return movs;
}

function temCaptura(cor, tab) {
    tab = tab || tabuleiro;
    for (let r = 0; r < tamanho; r++) {
        for (let c = 0; c < tamanho; c++) {
            const peca = tab[r][c];
            if (!peca || peca.cor !== cor) continue;
            if (calcularMovimentos(r, c, tab).some(m => m.captura)) return true;
        }
    }
    return false;
}

function mover(destR, destC) {
    if (!selecionado) return;

    const { r, c } = selecionado;
    const mov = movimentosValidos.find(m => m.r === destR && m.c === destC);
    if (!mov) return;

    aplicarMovimento(tabuleiro, r, c, mov);

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

    if (verificarVitoria()) return;

    atualizarInfo();
    desenhar();

    //Vez da IA jogar
    if (turno === corIA) agendarIA();
}

function aplicarMovimento(tab, r, c, mov) {
    tab[mov.r][mov.c] = tab[r][c];
    tab[r][c] = null;

    if (mov.captura) tab[mov.capturaR][mov.capturaC] = null;

    const peca = tab[mov.r][mov.c];
    if (peca.cor === 'branca' && mov.r === 0) peca.dama = true;
    if (peca.cor === 'preta' && mov.r === 7) peca.dama = true;
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

    const semMovimentos = !temMovimentosDisponiveis(turno);

    if (branca === 0 || (turno === 'branca' && semMovimentos)) {
        //atualiza placar
        if (corIA === 'preta') {
            registrarPonto('ia');
        } else {
            registrarPonto('jogador');
        }
        exibirVitoria('Pretas');
        return true;
    }

    if (preta === 0 || (turno === 'preta' && semMovimentos)) {
        if (corIA === 'branca') {
            registrarPonto('ia');
        } else {
            registrarPonto('jogador');
        }
        exibirVitoria('Brancas');
        return true;
    }

    return false;
}

function temMovimentosDisponiveis(cor) {
    for (let r = 0; r < tamanho; r++) {
        for (let c = 0; c < tamanho; c++) {
            const peca = tabuleiro[r][c];
            if (!peca || peca.cor !== cor) continue;
            if (calcularMovimentos(r, c).length > 0) return true;
        }
    }

    return false;
}

function exibirVitoria(vencedor) {
    desenhar();
    const foiJogador = (vencedor === 'Brancas' && corJogador === 'branca') ||
        (vencedor === 'Pretas' && corJogador === 'preta');
    const msg = foiJogador ? '🏆 Voce venceu! Parabens!' : '🤖 A IA venceu! Tente novamente.';
    setTimeout(() => {
        turno.innerHTML = `<strong>${msg}</strong>`;
        alert(`${msg}`);
    }, 100);
}

function registrarPonto(quem) {
    if (quem === 'jogador') {
        pontosJogador++;
        document.getElementById('pts-jogador').textContent = pontosJogador;
    } else {
        pontosIA++;
        document.getElementById('pts-ia').textContent = pontosIA;
    }
}

function atualizarInfo() {
    const eVezDoJogador = turno === corJogador;
    const nome = eVezDoJogador ? '🧑‍🦲 Você' : '🤖 IA';
    turno.innerHTML = `Vez: <strong>${nome}</strong>`;
}

function dentro(r, c) {
    return r >= 0 && r < tamanho && c >= 0 && c < tamanho;
}

function agendarIA() {
    aguardandoIA = true;
    desenhar();
    const delay = nivelIA === 1 ? 500 : nivelIA === 2 ? 700 : 1000;
    setTimeout(() => {
        executarJogadaIA();
        aguardandoIA = false;
    }, delay);
}

//Executa a jogada retornada pelo modula de IA (ia.js)
function executarJogadaIA() {
    const jogada = calcularJogadaIA(tabuleiro, corIA, nivelIA, calcularMovimentos, temCaptura, aplicarMovimento, dentro, tamanho);
    if (!jogada) return;

    let { r, c, mov } = jogada;
    aplicarMovimento(tabuleiro, r, c, mov);

    //Captura em cadeia da IA

    // Enquanto ainda for possível fazer uma captura (comer outra peça)
    //Enquanto der pra continuar comendo → continua
    //Se não der mais → para
    while (mov.captura) {
        const proxCapt = calcularMovimentos(mov.r, mov.c).filter(m => m.captura);
        if (proxCapt.length === 0) break;
        const proximo = proxCapt[Math.floor(Math.random() * proxCapt.length)];
        aplicarMovimento(tabuleiro, mov.r, mov.c, proximo);
        mov = proximo;
    }

    turno = turno === 'branca' ? 'preta' : 'branca';
    if (verificarVitoria()) return;
    atualizarInfo();
    desenhar();
}

canvas.addEventListener('click', (e) => {
    if (aguardandoIA || turno !== corJogador) return;

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
        if (temCaptura(turno)) movs = movs.filter(m => m.captura);
        movimentosValidos = movs;
        desenhar();
        return;
    }

    selecionado = null;
    movimentosValidos = [];
    desenhar();
});