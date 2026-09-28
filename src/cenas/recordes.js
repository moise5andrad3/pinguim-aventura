// Recordes por modo e por fase: carimbo, pontos e melhor tempo. Apagar exige segurar a
// lixeira por 3 s (proteção para adulto; a criança nunca precisa desse gesto).
import * as audio from '../audio.js';
import { escrever, escreverCentro } from '../fonte.js';
import { dados, apagarTudo } from '../salvar.js';
import { noCanto } from '../tela.js';
import { carimbo } from './mapa.js';

export const VERSAO = 'V0.2';
const SEGURAR = 180; // 3 s

let modo = 'diversao';
let segurando = 0;
let t = 0;

function naLixeira(x, y) {
  return x !== null && x > 240 && y > 130;
}

export const cena = {
  entrar(d) {
    modo = d.modo;
    segurando = 0;
    t = 0;
  },

  toque(x, y) {
    if (naLixeira(x, y)) {
      segurando = 1;
      return;
    }
    audio.tocar('toque');
    if (noCanto(x, y) === 'esq' || t > 30) cena.trocar('mapa', { modo });
  },

  soltar() {
    segurando = 0;
  },

  atualizar() {
    t++;
    if (segurando > 0) {
      segurando++;
      if (segurando >= SEGURAR) {
        segurando = 0;
        apagarTudo();
        audio.tocar('perda');
      }
    }
  },

  desenhar(tela) {
    tela.fundo(1);
    tela.ret(0, 0, 320, 180, 1);
    tela.sprite('trofeu', 150, 6, false, 2);
    // cabeçalho: pinguim pequeno (Diversão) e grande (Aventura)
    tela.sprite('pinguim', 112, 36);
    tela.sprite('pinguim', 212, 22, false, 2);
    ['diversao', 'aventura'].forEach((m, coluna) => {
      const r = dados.modos[m];
      const x0 = coluna === 0 ? 70 : 170;
      for (let f = 0; f < 4; f++) {
        const y = 62 + f * 24;
        escrever(String(f + 1), 40, y + 4, 4);
        if (r.carimbos[f]) carimbo(tela, x0 + 10, y + 8, 10);
        const rec = r.recordes[f];
        if (rec) {
          escrever(String(rec.pontos), x0 + 26, y + 1, 5);
          if (m === 'aventura') escrever(rec.segundos + 'S', x0 + 26, y + 10, 7);
        }
      }
    });
    tela.botao('casa', 'esq');
    // lixeira com anel de progresso
    tela.ret(262, 142, 36, 30, 6);
    tela.sprite('lixeira', 268, 146, false, 2);
    if (segurando > 0) tela.ret(262, 170, 36 * segurando / SEGURAR, 2, 9);
    escreverCentro(VERSAO, 290, 4, 3);
  },
};
