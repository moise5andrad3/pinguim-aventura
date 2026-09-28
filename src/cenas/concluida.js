// Fase concluída: fanfarra, carimbo do Pinguinzinho (recompensa única dos dois modos),
// peixes, estrelas, pontos e tempo, cada um com ícone e palavra. Troféu se houve recorde.
import * as audio from '../audio.js';
import { escrever, escreverCentro } from '../fonte.js';
import { concluirFase } from '../salvar.js';
import { carimbo } from './mapa.js';

let t = 0;
let info = null;
let recorde = false;

function linha(tela, icone, rotulo, valor, y, cor) {
  if (icone) tela.sprite(icone, 146, y + 3);
  escrever(rotulo, 162, y + 4, 4);
  escrever(valor, 216, y, cor, 2);
}

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
    // Cada número com ícone e palavra (pedido do playtest: os números sozinhos confundiam).
    linha(tela, 'peixe', 'PEIXES', String(info.peixes), 56, 5);
    if (info.totalEstrelas) linha(tela, 'estrela', 'ESTRELAS', info.estrelas + '/' + info.totalEstrelas, 80, 5);
    linha(tela, null, 'PONTOS', String(info.pontos), 104, 7);
    if (info.modo === 'aventura') linha(tela, 'sol', 'TEMPO', info.segundos + ' SEG', 128, 5);
    if (recorde && t >= 60) {
      tela.sprite('trofeu', 146, 150);
      escrever('RECORDE!', 162, 153, 7);
    }
    if (t >= 90 && t % 60 < 40) {
      for (let i = 0; i < 24; i++) {
        const w = i < 12 ? i : 24 - i;
        tela.ret(290, 150 + i, w * 1.2, 1, 5);
      }
    }
  },
};
