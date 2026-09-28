// Inicialização, loop de passo fixo, troca de cenas, aviso de retrato e pausa automática.
import * as tela from './tela.js';
import * as audio from './audio.js';
import { carregarSprites } from './sprites.js';
import { iniciarToque } from './toque.js';
import { dados } from './salvar.js';
import { escreverCentro, escrever } from './fonte.js';
import { cena as abertura } from './cenas/abertura.js';
import { cena as jogo } from './cenas/jogo.js';
import { cena as concluida } from './cenas/concluida.js';
import { cena as modo } from './cenas/modo.js';
import { cena as mapa } from './cenas/mapa.js';
import { cena as final } from './cenas/final.js';
import { cena as recordes } from './cenas/recordes.js';

const PASSO = 1 / 60;
const MAX_PASSOS = 5;
const CENAS = { abertura, modo, mapa, jogo, concluida, final, recordes };
const DIAG = new URLSearchParams(location.search).has('diag');

let nomeCena = '';
let cena = null;
let acumulado = 0;
let anterior = null;
let pedido = null;
let quadros = 0;
let fps = 0;
let marcaFps = 0;
let tRetrato = 0;

function trocarCena(nome, d = {}) {
  nomeCena = nome;
  cena = CENAS[nome];
  cena.entrar(d);
  audio.tocarMusica(cena.musica ? cena.musica(d) : null);
}

for (const c of Object.values(CENAS)) c.trocar = trocarCena;

const retrato = () => innerHeight > innerWidth;

function quadro(t) {
  pedido = requestAnimationFrame(quadro);
  if (anterior === null) anterior = t;
  acumulado += Math.min(0.25, (t - anterior) / 1000);
  anterior = t;
  let n = 0;
  while (acumulado >= PASSO && n < MAX_PASSOS) {
    if (retrato()) tRetrato++;
    else cena.atualizar(PASSO);
    acumulado -= PASSO;
    n++;
  }
  if (n === MAX_PASSOS) acumulado = 0;

  if (retrato()) desenharRetrato();
  else cena.desenhar(tela);
  if (DIAG) desenharDiag();
  tela.apresentar();

  quadros++;
  if (t - marcaFps >= 1000) {
    fps = quadros;
    quadros = 0;
    marcaFps = t;
  }
}

// Aviso sem texto: um celular que alterna entre em pé e deitado.
function desenharRetrato() {
  tela.fundo(1);
  tela.ret(0, 0, 320, 180, 1);
  const deitado = Math.floor(tRetrato / 50) % 2 === 1;
  const w = deitado ? 120 : 68;
  const h = deitado ? 68 : 120;
  tela.ret(160 - w / 2, 90 - h / 2, w, h, 5);
  tela.ret(160 - w / 2 + 5, 90 - h / 2 + 5, w - 10, h - 10, 2);
  tela.sprite('pinguim', 152, 82);
}

function desenharDiag() {
  const dpr = window.devicePixelRatio || 1;
  const linhas = [
    'DPR ' + dpr.toFixed(2),
    'K ' + tela.escala,
    'CSS ' + innerWidth + 'X' + innerHeight,
    'FIS ' + Math.round(innerWidth * dpr) + 'X' + Math.round(innerHeight * dpr),
    'FPS ' + fps,
  ];
  tela.ret(0, 120, 110, 60, 0);
  linhas.forEach((l, i) => escrever(l, 3, 123 + i * 11, 7));
  // Quadrado que deveria medir 2 cm (115 px CSS): conferir com uma régua.
  const lado = tela.pxLogicosDe(115);
  tela.ret(318 - lado, 178 - lado, lado, lado, 9);
  tela.ret(319 - lado, 179 - lado, lado - 2, lado - 2, 0);
  escreverCentro('2CM', 318 - lado / 2, 178 - lado / 2 - 3, 7);
}

function iniciarLoop() {
  if (pedido !== null) return;
  anterior = null;
  acumulado = 0;
  pedido = requestAnimationFrame(quadro);
}

function pararLoop() {
  if (pedido !== null) cancelAnimationFrame(pedido);
  pedido = null;
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (cena.pausar) cena.pausar();
    pararLoop();
    audio.suspender();
  } else {
    iniciarLoop();
    audio.retomar();
  }
});

addEventListener('resize', tela.ajustar);
addEventListener('orientationchange', tela.ajustar);

// Ganchos de teste: somente leitura, não alteram o jogo.
window.__jogo = {
  cena: () => nomeCena,
  jogo: () => jogo.estadoTeste(),
  paraTela: tela.paraTela,
  escala: () => tela.escala,
  audio: () => audio.estado(),
  musica: () => audio.musicaAtual(),
  retrato,
  loopParado: () => pedido === null,
};

carregarSprites();
audio.definirMudo(!dados.som);
tela.ajustar();
iniciarToque(
  (x, y) => {
    if (!retrato()) cena.toque(x, y);
  },
  () => {
    audio.desbloquear();
    tela.telaCheia();
  },
  () => {
    if (cena.soltar) cena.soltar();
  },
);
trocarCena('abertura');
iniciarLoop();

// Offline e instalação: o service worker guarda o jogo no aparelho (ADR-001).
if ('serviceWorker' in navigator && window.isSecureContext) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
