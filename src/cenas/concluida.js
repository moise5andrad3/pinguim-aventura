// Fase concluída: fanfarra, carimbo do Pipo (recompensa única dos dois modos), peixes e pontos.
import * as audio from '../audio.js';
import { escrever, escreverCentro } from '../fonte.js';
import { concluirFase } from '../salvar.js';

let t = 0;
let info = null;

function circulo(tela, cx, cy, r, cor) {
  for (let y = -r; y <= r; y++) {
    const w = Math.round(Math.sqrt(r * r - y * y));
    tela.ret(cx - w, cy + y, w * 2 + 1, 1, cor);
  }
}

export const cena = {
  entrar(d) {
    info = d;
    t = 0;
    concluirFase(d.modo, d.fase, d.pontos, d.segundos);
    audio.tocar('fanfarra');
  },

  toque() {
    if (t < 90) return;
    audio.tocar('toque');
    // M1: volta para a mesma fase. O mapa entra no M2.
    cena.trocar('jogo', { modo: info.modo, fase: info.fase });
  },

  atualizar() {
    t++;
    if (t === 45) audio.tocar('carimbo');
  },

  desenhar(tela) {
    tela.fundo(1);
    tela.ret(0, 0, 320, 180, 1);
    for (let i = 0; i < 24; i++) tela.ret((i * 53 + t) % 320, (i * 37) % 180, 1, 1, 5);
    escreverCentro('BOA!', 160, 14, 7, 4, 0);
    // carimbo: aparece "batendo" a partir de 0,75 s
    if (t >= 45) {
      const k = Math.min(1, (t - 45) / 8);
      const r = Math.round(34 - 10 * k);
      circulo(tela, 90, 100, r, 9);
      circulo(tela, 90, 100, r - 3, 5);
      tela.sprite('pipo', 82, 92);
    }
    tela.sprite('peixe', 170, 84);
    escrever(String(info.peixes), 186, 84, 5, 2);
    escrever(String(info.pontos), 170, 108, 7, 2);
    if (t >= 90 && t % 60 < 40) {
      for (let i = 0; i < 24; i++) {
        const w = i < 12 ? i : 24 - i;
        tela.ret(262, 140 + i, w * 1.5, 1, 5);
      }
    }
  },
};
