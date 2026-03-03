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
        for(let c = 0; c < tamanho; c++) {
            if ((r + c) % 2 === 1) {
                tabuleiro[r][c] = {cor: 'preta', dama: false };
            }
        }
    }

    for (let r = 5; r < tamanho; r++) {
        for(let c = 0; c < tamanho; c++) {
            if ((r + c) % 2 === 1) {
                tabuleiro[r][c] = {cor: 'branca', dama: false };
            }
        }
    }

    atualizarInfo();
    desenhar();
}

inicializar();