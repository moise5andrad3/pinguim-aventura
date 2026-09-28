// Fase concluída: fanfarra, carimbo do Pinguinzinho (recompensa única dos dois modos),
// peixes, estrelas e pontos. Troféu se algum recorde foi batido.
import * as audio from '../audio.js';
import { escrever, escreverCentro } from '../fonte.js';
import { concluirFase } from '../salvar.js';
import { carimbo } from './mapa.js';

let t = 0;
let info = null;
let recorde = false;

export const cena = {
  entrar(d) {
    info = d;
    t = 0;
    recorde = concluirFase(d.modo, d.fase, d.pontos, d.segundos);
    audio.tocar('fanfarra');
  },

  toque() {
    if (t < 90) return;
    audio.tocar('toque');
    if (info.fase === 3) cena.trocar('final', { modo: info.modo });
    else cena.trocar('mapa', { modo: info.modo });
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
    if (t >= 45) {
      const k = Math.min(1, (t - 45) / 8);
      carimbo(tela, 90, 100, Math.round(34 - 10 * k));
    }
    tela.sprite('peixe', 170, 78);
    escrever(String(info.peixes), 186, 78, 5, 2);
    if (info.totalEstrelas) {
      tela.sprite('estrela', 222, 80);
      escrever(info.estrelas + '/' + info.totalEstrelas, 236, 78, 5, 2);
    }
    escrever(String(info.pontos), 170, 104, 7, 2);
    if (recorde && t >= 60) tela.sprite('trofeu', 172, 128, false, 2);
    if (t >= 90 && t % 60 < 40) {
      for (let i = 0; i < 24; i++) {
        const w = i < 12 ? i : 24 - i;
        tela.ret(262, 140 + i, w * 1.5, 1, 5);
      }
    }
  },
};
