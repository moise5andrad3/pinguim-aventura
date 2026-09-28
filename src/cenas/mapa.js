// Mapa: 4 ilhas em sequência. Cadeado nas bloqueadas; carimbo nas concluídas.
// Cada ilha responde numa faixa vertical de 80 px (bem mais que 2 cm).
import * as audio from '../audio.js';
import { escrever } from '../fonte.js';
import { dados } from '../salvar.js';
import { noCanto } from '../tela.js';

const ILHAS = [{ x: 40, y: 110 }, { x: 120, y: 90 }, { x: 200, y: 110 }, { x: 280, y: 90 }];

let modo = 'diversao';
let t = 0;
let tremer = { ilha: -1, t: 0 };

export function carimbo(tela, cx, cy, r) {
  tela.circulo(cx, cy, r, 9);
  tela.circulo(cx, cy, r - 3, 5);
  tela.sprite('pinguim', cx - 8, cy - 8);
}

export const cena = {
  entrar(d) {
    modo = d.modo;
    t = 0;
    tremer = { ilha: -1, t: 0 };
  },

  toque(x, y) {
    const canto = noCanto(x, y);
    if (canto === 'esq') {
      audio.tocar('toque');
      cena.trocar('modo');
      return;
    }
    if (canto === 'dir') {
      audio.tocar('toque');
      cena.trocar('recordes', { modo });
      return;
    }
    if (x === null) return;
    const i = Math.max(0, Math.min(3, Math.floor(x / 80)));
    if (i + 1 > dados.modos[modo].liberada) {
      audio.tocar('cadeado');
      tremer = { ilha: i, t: 20 };
      return;
    }
    audio.tocar('pulo');
    cena.trocar('jogo', { modo, fase: i });
  },

  atualizar() {
    t++;
    if (tremer.t > 0) tremer.t--;
  },

  desenhar(tela) {
    const m = dados.modos[modo];
    tela.fundo(2);
    tela.ret(0, 0, 320, 180, 2);
    for (let y = 30; y < 180; y += 14) {
      for (let x = (y / 14 % 2) * 20 + (Math.floor(t / 30) % 2) * 6; x < 320; x += 40) tela.ret(x, y, 8, 1, 3);
    }
    // caminho pontilhado entre as ilhas
    for (let i = 0; i < 3; i++) {
      const a = ILHAS[i];
      const b = ILHAS[i + 1];
      for (let k = 0.2; k < 0.85; k += 0.1) tela.ret(a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k, 3, 2, 5);
    }
    ILHAS.forEach((il, i) => {
      const dx = tremer.ilha === i && tremer.t > 0 ? Math.round(Math.sin(tremer.t) * 2) : 0;
      const liberada = i + 1 <= m.liberada;
      tela.circulo(il.x + dx, il.y, 26, 4);
      tela.circulo(il.x + dx, il.y - 2, 24, liberada ? 5 : 6);
      if (m.carimbos[i]) {
        carimbo(tela, il.x + dx, il.y - 2, 16);
      } else if (liberada) {
        escrever(String(i + 1), il.x - 5 + dx, il.y - 9, 1, 2);
        if (i + 1 === m.liberada && t % 60 < 40) tela.sprite('pinguim', il.x - 8, il.y - 44);
      } else {
        tela.sprite('cadeado', il.x - 12 + dx, il.y - 14, false, 2);
      }
    });
    // modo atual: pinguim pequeno (Diversão) ou grande (Aventura)
    if (modo === 'aventura') tela.sprite('pinguim', 144, 140, false, 2);
    else tela.sprite('pinguim', 152, 154);
    tela.botao('casa', 'esq');
    tela.botao('trofeu', 'dir');
  },
};
