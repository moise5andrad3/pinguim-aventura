// Final: festa da colônia na aurora, com o iglu gigante. A palavra "FIM" aparece junto.
import * as audio from '../audio.js';
import { escreverCentro } from '../fonte.js';

let t = 0;
let modo = 'diversao';

export const cena = {
  entrar(d) {
    modo = d.modo;
    t = 0;
    audio.tocar('fanfarra');
  },

  toque() {
    if (t < 180) return;
    audio.tocar('toque');
    cena.trocar('recordes', { modo });
  },

  atualizar() {
    t++;
    if (t % 150 === 0) audio.tocar('fanfarra');
  },

  desenhar(tela) {
    tela.fundo(1);
    tela.ret(0, 0, 320, 180, 1);
    for (let i = 0; i < 40; i++) tela.ret((i * 67) % 320, (i * 29) % 90, 1, 1, 5);
    // aurora
    for (let x = 0; x < 320; x += 4) {
      const o = Math.round(Math.sin((x + t) / 25) * 4);
      tela.ret(x, 20 + o, 4, 2, 12);
      tela.ret(x, 23 + o, 4, 2, 11);
      tela.ret(x, 27 + o, 4, 2, 10);
    }
    // neve e iglu gigante
    tela.ret(0, 120, 320, 60, 5);
    tela.ret(0, 120, 320, 2, 6);
    for (let fila = 0; fila < 6; fila++) {
      const n = 8 - fila;
      for (let k = 0; k < n; k++) {
        const x = 160 - n * 8 + k * 16;
        const y = 108 - fila * 10;
        tela.ret(x, y, 16, 10, 3);
        tela.ret(x + 1, y + 1, 14, 8, 5);
      }
    }
    tela.ret(150, 98, 20, 20, 1);
    // colônia dançando (o Pinguinzinho no centro, maior)
    const pulo = (i) => Math.abs(Math.sin((t + i * 10) / 10)) * 6;
    for (let i = 0; i < 8; i++) {
      const x = 12 + i * 38 + (i >= 4 ? 16 : 0);
      tela.sprite(i % 2 ? 'pinguim_pulo' : 'pinguim', x, 134 - pulo(i), (Math.floor(t / 20) + i) % 2 === 0);
    }
    tela.sprite('pinguim_pulo', 144, 128 - pulo(9) * 2, false, 2);
    escreverCentro('FIM', 160, 24, 7, 4, 0);
    if (t >= 180 && t % 60 < 40) {
      for (let i = 0; i < 24; i++) {
        const w = i < 12 ? i : 24 - i;
        tela.ret(290, 150 + i, w * 1.5, 1, 7);
      }
    }
  },
};
