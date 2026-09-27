// Renderizador pixel-perfect: todo desenho vai para um canvas lógico de 320x180, que é
// ampliado por um fator inteiro em pixels físicos (ADR-001).
import { PALETA, IMG } from './sprites.js';

export const L = 320;
export const A = 180;

const visivel = document.getElementById('tela');
const vctx = visivel.getContext('2d');
const trabalho = document.createElement('canvas');
trabalho.width = L;
trabalho.height = A;
export const ctx = trabalho.getContext('2d');

export let escala = 1;

export function ajustar() {
  const dpr = window.devicePixelRatio || 1;
  escala = Math.max(1, Math.floor(Math.min(innerWidth * dpr / L, innerHeight * dpr / A)));
  visivel.width = L * escala;
  visivel.height = A * escala;
  const w = L * escala / dpr;
  const h = A * escala / dpr;
  visivel.style.width = w + 'px';
  visivel.style.height = h + 'px';
  visivel.style.left = (innerWidth - w) / 2 + 'px';
  visivel.style.top = (innerHeight - h) / 2 + 'px';
}

export function apresentar() {
  vctx.imageSmoothingEnabled = false;
  vctx.drawImage(trabalho, 0, 0, L * escala, A * escala);
}

// Cor das sobras laterais (fora da imagem 320x180).
export function fundo(indice) {
  document.body.style.background = PALETA[indice];
}

// Converte coordenadas de tela (CSS) em lógicas. Fora de 0..320 é permitido.
export function paraLogico(clientX, clientY) {
  const r = visivel.getBoundingClientRect();
  return { x: (clientX - r.left) / r.width * L, y: (clientY - r.top) / r.height * A };
}

// Inverso de paraLogico; usado pelos testes.
export function paraTela(x, y) {
  const r = visivel.getBoundingClientRect();
  return { x: r.left + x / L * r.width, y: r.top + y / A * r.height };
}

// Quantos px lógicos equivalem a um tamanho em px CSS. 115 px CSS ~ 2 cm nos aparelhos-alvo.
export function pxLogicosDe(pxCss) {
  return Math.ceil(pxCss * (window.devicePixelRatio || 1) / escala);
}

export function ret(x, y, w, h, cor) {
  ctx.fillStyle = PALETA[cor];
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

export function sprite(nome, x, y, espelhar = false) {
  const s = IMG[nome];
  ctx.drawImage(espelhar ? s.espelho : s.normal, Math.round(x), Math.round(y));
}

export function telaCheia() {
  const el = document.documentElement;
  if (document.fullscreenElement || !el.requestFullscreen) return;
  el.requestFullscreen({ navigationUI: 'hide' })
    .then(() => screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape'))
    .catch(() => {});
}

// Botões fixos de canto: ícone pequeno, área de toque de ~2 cm (115 px CSS) encostada no canto.
const CANTO_CSS = 115;

export function noCanto(x, y) {
  if (x === null) return null;
  const t = pxLogicosDe(CANTO_CSS);
  if (y >= t) return null;
  if (x < t) return 'esq';
  if (x > L - t) return 'dir';
  return null;
}

export function botao(nome, lado) {
  const x = lado === 'esq' ? 3 : L - 21;
  ret(x, 3, 18, 18, 1);
  ret(x + 1, 4, 16, 16, 5);
  sprite(nome, x + 3, 6);
}
