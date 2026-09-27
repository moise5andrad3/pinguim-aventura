// Abertura: título, Pipo animado e um botão de jogar que ocupa a tela toda.
// O primeiro toque libera o áudio (em main.js), pede tela cheia e trava paisagem.
import * as audio from '../audio.js';
import { escreverCentro } from '../fonte.js';
import { dados, gravar } from '../salvar.js';
import { noCanto, telaCheia } from '../tela.js';

let t = 0;

export const cena = {
  entrar() {
    t = 0;
  },

  toque(x, y) {
    if (noCanto(x, y) === 'dir') {
      dados.som = !dados.som;
      audio.definirMudo(!dados.som);
      gravar();
      audio.tocar('toque');
      return;
    }
    telaCheia();
    audio.tocar('pulo');
    // M1: só a fase 1 no modo Diversão. Escolha de modo e mapa entram no M2.
    cena.trocar('jogo', { modo: 'diversao', fase: 0 });
  },

  atualizar() {
    t++;
  },

  desenhar(tela) {
    tela.fundo(4);
    tela.ret(0, 0, 320, 110, 4);
    tela.ret(0, 110, 320, 70, 5);
    tela.ret(0, 110, 320, 2, 6);
    escreverCentro('AVENTURA', 160, 22, 1, 3, 3);
    escreverCentro('PINGUIM', 160, 50, 1, 3, 3);
    const pulo = Math.abs(Math.sin(t / 15)) * 10;
    tela.sprite(t % 180 < 8 ? 'pipo_pisca' : 'pipo', 152, 94 - pulo);
    // botão jogar: triângulo piscando devagar
    const cor = t % 60 < 40 ? 9 : 8;
    for (let i = 0; i < 30; i++) {
      const w = i < 15 ? i : 30 - i;
      tela.ret(150, 128 + i, w * 1.5, 1, cor);
    }
    tela.botao(dados.som ? 'som' : 'mudo', 'dir');
  },
};
