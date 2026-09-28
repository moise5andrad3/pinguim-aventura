// Escolha do modo: dois cartões que ocupam cada um metade da tela.
// Pinguim pequeno = DIVERSÃO; pinguim grande = AVENTURA. Qualquer criança pode escolher qualquer um.
import * as audio from '../audio.js';
import { escreverCentro } from '../fonte.js';
import { dados, gravar } from '../salvar.js';

let t = 0;

export const cena = {
  entrar() {
    t = 0;
  },

  toque(x) {
    const modo = x !== null && x >= 160 ? 'aventura' : 'diversao';
    dados.modo = modo;
    gravar();
    audio.tocar('pulo');
    cena.trocar('mapa', { modo });
  },

  atualizar() {
    t++;
  },

  desenhar(tela) {
    tela.fundo(1);
    // Diversão
    tela.ret(0, 0, 160, 180, 4);
    tela.ret(8, 8, 144, 164, 5);
    const pulo = Math.abs(Math.sin(t / 15)) * 8;
    tela.sprite('pinguim', 72, 70 - pulo);
    tela.sprite('peixe', 60, 100);
    tela.sprite('peixe', 90, 100, true);
    escreverCentro('DIVERSÃO', 80, 140, 1, 2);
    // Aventura
    tela.ret(160, 0, 160, 180, 10);
    tela.ret(168, 8, 144, 164, 1);
    tela.sprite('sol', 272, 18);
    tela.sprite(t % 180 < 8 ? 'pinguim_pisca' : 'pinguim', 224, 50, false, 2);
    for (let i = 0; i < 3; i++) tela.sprite('peixe_vida', 206 + i * 14, 100);
    escreverCentro('AVENTURA', 240, 140, 7, 2);
  },
};
