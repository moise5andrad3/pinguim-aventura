// A fase: blocos de gelo, pulos, tijolos do iglu, queda e nado, porta e entrada.
// Toda a configuração vem de fases.js; aqui só se interpretam os dados.
import { MODOS, FASES } from '../fases.js';
import * as audio from '../audio.js';
import { escrever } from '../fonte.js';
import { dados, gravar } from '../salvar.js';
import { noCanto } from '../tela.js';

const MUNDO_MIN = -64;
const MUNDO_LARG = 448;
const PE_MARGEM = 33;
const PULO_PASSOS = 21;          // 0,35 s
const GUARDA_PASSOS = 9;         // toque nos últimos 150 ms do pulo fica guardado
const INCLINACAO_MAX = 24;
const X_MIN = 8;
const X_MAX = 312;
const X_PORTA = 160;
const LINHA_MIN = 61;            // limites da linha divisória: cada zona >= 61 px (~2 cm)
const LINHA_MAX = 119;
const NADO_SUBMERSO = 30;        // 0,5 s
const NADO_TOTAL = 78;           // 1,3 s até voltar à margem
const ENTRADA_PASSOS = 48;

const topoBloco = (i) => 36 + 24 * i + 14;
const pe = (linha) => (linha < 0 ? PE_MARGEM : topoBloco(linha));
const limitar = (v, a, b) => Math.max(a, Math.min(b, v));

// Gerador com semente (mulberry32), para os testes serem reproduzíveis.
function gerador(semente) {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Posições dos tijolos do iglu, de baixo para cima, em fileiras cada vez menores.
function vagasIglu(meta) {
  let n = 1;
  while (n * (n + 1) / 2 < meta) n++;
  const larguras = [];
  for (let w = n; w >= 1; w--) larguras.push(w);
  let sobra = n * (n + 1) / 2 - meta;
  for (let i = larguras.length - 1; i >= 0 && sobra > 0; i--) {
    const tira = Math.min(sobra, larguras[i]);
    larguras[i] -= tira;
    sobra -= tira;
  }
  const vagas = [];
  larguras.filter((w) => w > 0).forEach((w, fila) => {
    for (let k = 0; k < w; k++) vagas.push({ x: X_PORTA - w * 5 + k * 10, y: 28 - fila * 6 });
  });
  return vagas;
}

let modo, M, F, fase;
let fileiras, pipo, tijolos, meta, porta, vagas, voando, peixes, peixesPegos, pontos;
let quedasSeguidas, ajuda, pausado, passos, sorteio, proxPeixe;

export const cena = {
  entrar(d) {
    modo = d.modo;
    fase = d.fase;
    M = MODOS[modo];
    F = FASES[fase];
    fileiras = F.fileiras.map((f) => ({
      vel: f.vel,
      azul: false,
      blocos: f.blocos.map(([x, w]) => ({ x, w })),
    }));
    pipo = { x: 60, linha: -1, estado: 'margem', bloco: null, t: 0, vx: 0, y0: 0, destino: 0,
      direita: true, alvo: null, guardado: null };
    meta = F.tijolos[modo];
    tijolos = 0;
    porta = false;
    vagas = vagasIglu(meta);
    voando = [];
    peixes = [];
    peixesPegos = 0;
    pontos = 0;
    quedasSeguidas = 0;
    ajuda = 0;
    pausado = false;
    passos = 0;
    sorteio = gerador(d.semente || 1);
    proxPeixe = F.peixes.intervalo * 60;
  },

  pausar() {
    pausado = true;
  },

  toque(x, y) {
    if (pausado) {
      pausado = false;
      audio.tocar('toque');
      return;
    }
    // Perto do Pipo, o pulo tem prioridade sobre os botões de canto: a área de 2 cm dos botões
    // se sobrepõe à zona "acima" quando ele está numa fileira de cima, perto da borda.
    const pertoDoPipo = x !== null && pipo.estado !== 'margem' && Math.abs(x - pipo.x) < INCLINACAO_MAX;
    const canto = pertoDoPipo ? null : noCanto(x, y);
    if (canto === 'esq') {
      pausado = true;
      audio.tocar('toque');
      return;
    }
    if (canto === 'dir') {
      dados.som = !dados.som;
      audio.definirMudo(!dados.som);
      gravar();
      audio.tocar('toque');
      return;
    }
    tocarNoJogo(x, y);
  },

  atualizar() {
    if (pausado) return;
    passos++;
    if (ajuda > 0) ajuda--;
    moverBlocos();
    moverPipo();
    moverPeixes();
    for (const v of voando) v.t++;
    voando = voando.filter((v) => v.t < 30);
  },

  desenhar(tela) {
    tela.fundo(2);
    desenharCenario(tela);
    desenharBlocos(tela);
    desenharPeixes(tela);
    desenharPipo(tela);
    desenharHud(tela);
    if (pausado) desenharPausa(tela);
  },

  estadoTeste() {
    return {
      estado: pipo.estado, linha: pipo.linha, x: pipo.x, tijolos, meta, porta, pausado, ajuda,
      quedasSeguidas, pontos, peixesPegos,
      assistencia: M.assistencia,
      fileiras: fileiras.map((f) => ({
        azul: f.azul, vel: f.vel * M.velocidade, blocos: f.blocos.map((b) => efetivo(b)),
      })),
    };
  },
};

function efetivo(b) {
  if (ajuda <= 0) return [b.x, b.w];
  const w = b.w * M.ajudaFator;
  return [b.x - (w - b.w) / 2, w];
}

function sobre(b, x, folga) {
  const [bx, bw] = efetivo(b);
  return x >= bx - folga && x <= bx + bw + folga;
}

function tocarNoJogo(x, y) {
  const p = pipo;
  if (p.estado === 'nadando' || p.estado === 'entrando') return;
  if (p.estado === 'pulando') {
    if (PULO_PASSOS - p.t <= GUARDA_PASSOS) p.guardado = { x, y };
    return;
  }
  const divisoria = limitar(pe(p.linha) - 8, LINHA_MIN, LINHA_MAX);
  const acima = y < divisoria;
  const inclinacao = x === null ? 0 : limitar(x - p.x, -INCLINACAO_MAX, INCLINACAO_MAX);
  if (p.estado === 'margem') {
    if (acima) {
      if (x !== null) p.alvo = limitar(x, X_MIN, X_MAX);
    } else {
      pular(0, inclinacao);
    }
    return;
  }
  // Sobre um bloco.
  if (acima) pular(p.linha - 1, inclinacao);
  else if (p.linha < 3) pular(p.linha + 1, inclinacao);
  else audio.tocar('toque');
}

function pular(destino, inclinacao) {
  const p = pipo;
  const vOrigem = p.estado === 'bloco' ? fileiras[p.linha].vel * M.velocidade : 0;
  p.vx = vOrigem + inclinacao / PULO_PASSOS;
  p.y0 = pe(p.linha);
  p.destino = destino;
  p.t = 0;
  p.estado = 'pulando';
  p.bloco = null;
  p.alvo = null;
  if (p.vx !== 0) p.direita = p.vx > 0;
  audio.tocar('pulo');
}

function moverBlocos() {
  for (const f of fileiras) {
    const v = f.vel * M.velocidade;
    for (const b of f.blocos) {
      b.x += v;
      if (v < 0 && b.x + b.w < MUNDO_MIN) b.x += MUNDO_LARG;
      if (v > 0 && b.x > MUNDO_MIN + MUNDO_LARG) b.x -= MUNDO_LARG;
    }
  }
}

function moverPipo() {
  const p = pipo;
  if (p.estado === 'margem') {
    const alvo = porta ? X_PORTA : p.alvo;
    if (alvo !== null) {
      const passo = porta ? 0.8 : 1.2;
      if (Math.abs(alvo - p.x) <= passo) {
        p.x = alvo;
        p.alvo = null;
        if (porta) {
          p.estado = 'entrando';
          p.t = 0;
          audio.tocar('porta');
        }
      } else {
        p.direita = alvo > p.x;
        p.x += p.direita ? passo : -passo;
      }
    }
  } else if (p.estado === 'bloco') {
    p.x = limitar(p.x + fileiras[p.linha].vel * M.velocidade, X_MIN, X_MAX);
    if (!sobre(p.bloco, p.x, 0)) cair();
  } else if (p.estado === 'pulando') {
    p.t++;
    p.x = limitar(p.x + p.vx, X_MIN, X_MAX);
    if (p.t >= PULO_PASSOS) pousar();
  } else if (p.estado === 'nadando') {
    p.t++;
    if (p.t === NADO_SUBMERSO) audio.tocar('saltoAgua');
    if (p.t >= NADO_TOTAL) {
      p.estado = 'margem';
      p.linha = -1;
    }
  } else if (p.estado === 'entrando') {
    p.t++;
    if (p.t >= ENTRADA_PASSOS) {
      cena.trocar('concluida', { modo, fase, pontos, peixes: peixesPegos, segundos: Math.round(passos / 60) });
    }
  }
}

function pousar() {
  const p = pipo;
  const d = p.destino;
  if (d < 0) {
    p.estado = 'margem';
    p.linha = -1;
    audio.tocar('tuc');
  } else {
    const b = fileiras[d].blocos.find((bl) => sobre(bl, p.x, M.assistencia));
    if (!b) {
      p.linha = d;
      cair();
      return;
    }
    const [bx, bw] = efetivo(b);
    p.x = limitar(p.x, bx + 4, bx + bw - 4);
    p.estado = 'bloco';
    p.bloco = b;
    p.linha = d;
    quedasSeguidas = 0;
    pisarFileira(d);
  }
  if (p.guardado) {
    const g = p.guardado;
    p.guardado = null;
    tocarNoJogo(g.x, g.y);
  }
}

function pisarFileira(d) {
  const f = fileiras[d];
  if (f.azul) {
    audio.tocar('tuc');
    return;
  }
  f.azul = true;
  audio.tocar('plim');
  if (tijolos < meta) {
    const vaga = vagas[tijolos];
    tijolos++;
    pontos += 10;
    voando.push({ x0: pipo.x, y0: pe(d) - 8, x1: vaga.x, y1: vaga.y, t: 0 });
    if (tijolos === meta) {
      porta = true;
      audio.tocar('porta');
    }
  }
  if (fileiras.every((fl) => fl.azul)) {
    for (const fl of fileiras) fl.azul = false;
  }
}

function cair() {
  const p = pipo;
  p.estado = 'nadando';
  p.t = 0;
  p.bloco = null;
  p.guardado = null;
  audio.tocar('splash');
  quedasSeguidas++;
  if (M.ajudaApos && quedasSeguidas >= M.ajudaApos) {
    ajuda = M.ajudaSeg * 60;
    quedasSeguidas = 0;
  }
}

function yPipoAgora() {
  const p = pipo;
  if (p.estado !== 'pulando') return pe(p.linha);
  const k = p.t / PULO_PASSOS;
  return p.y0 + (pe(p.destino) - p.y0) * k - 12 * Math.sin(Math.PI * k);
}

function moverPeixes() {
  if (passos >= proxPeixe) {
    proxPeixe += F.peixes.intervalo * 60;
    const daEsquerda = sorteio() < 0.5;
    peixes.push({
      linha: Math.floor(sorteio() * 4),
      x: daEsquerda ? -12 : 332,
      vel: (daEsquerda ? 1 : -1) * F.peixes.vel,
    });
  }
  const py = yPipoAgora() - 6;
  for (const f of peixes) {
    f.x += f.vel;
    const fy = topoBloco(f.linha) - 2 - Math.abs(Math.sin(f.x / 18)) * 10;
    f.y = fy;
    if (!f.pego && pipo.estado !== 'nadando' && Math.abs(f.x - pipo.x) < 10 && Math.abs(fy - py) < 10) {
      f.pego = true;
      peixesPegos++;
      pontos += 50;
      audio.tocar('peixe');
    }
  }
  peixes = peixes.filter((f) => !f.pego && f.x > -20 && f.x < 340);
}

// ---------- desenho ----------

function desenharCenario(tela) {
  tela.ret(0, 0, 320, 22, F.ceu);
  tela.ret(0, 20, 320, 1, 5);
  tela.sprite('sol', 30, 5);
  // margem de neve e pedras
  tela.ret(0, 22, 320, 14, 5);
  tela.ret(0, 34, 320, 2, 6);
  for (const x of [14, 70, 118, 214, 262, 300]) tela.ret(x, 31, 3, 2, 13);
  // iglu: vagas vazias e tijolos colocados
  const colocados = tijolos - voando.length;
  vagas.forEach((v, i) => {
    if (i < colocados) tijolo(tela, v.x, v.y);
    else {
      tela.ret(v.x, v.y, 10, 6, 6);
      tela.ret(v.x + 1, v.y + 1, 8, 4, 4);
    }
  });
  if (porta) {
    const brilho = passos % 30 < 15 ? 7 : 8;
    tela.ret(X_PORTA - 6, 22, 12, 12, brilho);
    tela.ret(X_PORTA - 4, 24, 8, 10, 1);
  }
  // mar
  tela.ret(0, 36, 320, 144, 2);
  tela.ret(0, 150, 320, 30, 1);
  const onda = Math.floor(passos / 20) % 2;
  for (let y = 40; y < 180; y += 12) {
    for (let x = (y / 12 % 2) * 16 + onda * 8; x < 320; x += 32) tela.ret(x, y, 6, 1, 3);
  }
}

function desenharBlocos(tela) {
  fileiras.forEach((f, i) => {
    const topo = topoBloco(i);
    for (const b of f.blocos) {
      const [bx, bw] = efetivo(b);
      if (bx > 320 || bx + bw < 0) continue;
      tela.ret(bx, topo, bw, 7, f.azul ? 3 : 5);
      tela.ret(bx, topo + 7, bw, 2, f.azul ? 1 : 4);
      if (f.azul) {
        tela.ret(bx, topo, bw, 1, 4);
        for (let k = bx + 6; k < bx + bw - 3; k += 14) {
          tela.ret(k, topo + 3, 2, 1, 1);
          tela.ret(k + 3, topo + 4, 2, 1, 1);
        }
      }
    }
  });
}

function desenharPeixes(tela) {
  for (const f of peixes) tela.sprite('peixe', f.x - 5, f.y - 3, f.vel > 0);
}

function desenharPipo(tela) {
  const p = pipo;
  if (p.estado === 'nadando') {
    const yAgua = pe(p.linha);
    if (p.t < NADO_SUBMERSO) {
      const r = Math.floor(p.t / 6);
      tela.ret(p.x - 6 - r, yAgua - 2, 12 + r * 2, 2, 5);
      tela.ret(p.x - 2, yAgua - 6 - (p.t % 12), 2, 2, 4);
      tela.ret(p.x + 3, yAgua - 10 - ((p.t + 6) % 12), 2, 2, 4);
    } else {
      const k = (p.t - NADO_SUBMERSO) / (NADO_TOTAL - NADO_SUBMERSO);
      const y = yAgua + (PE_MARGEM - yAgua) * k - 24 * Math.sin(Math.PI * k);
      tela.sprite('pipo_pulo', p.x - 8, y - 14, !p.direita);
    }
  } else if (p.estado === 'entrando') {
    const k = p.t / ENTRADA_PASSOS;
    tela.ctx.globalAlpha = 1 - k;
    tela.sprite('pipo', p.x - 8, PE_MARGEM - 14 - k * 3, false);
    tela.ctx.globalAlpha = 1;
  } else {
    const nome = p.estado === 'pulando' ? 'pipo_pulo' : (passos % 180 < 8 ? 'pipo_pisca' : 'pipo');
    tela.sprite(nome, p.x - 8, yPipoAgora() - 14, !p.direita);
  }
  for (const v of voando) {
    const k = v.t / 30;
    const x = v.x0 + (v.x1 - v.x0) * k;
    const y = v.y0 + (v.y1 - v.y0) * k - 20 * Math.sin(Math.PI * k);
    tijolo(tela, x, y);
  }
}

function tijolo(tela, x, y) {
  tela.ret(x, y, 10, 6, 3);
  tela.ret(x + 1, y + 1, 8, 4, 5);
}

function desenharHud(tela) {
  tela.botao('pausa', 'esq');
  tela.botao(dados.som ? 'som' : 'mudo', 'dir');
  tela.sprite('peixe', 236, 7);
  escrever(String(peixesPegos), 250, 7, 1);
  escrever(String(pontos), 60, 7, 1);
}

function desenharPausa(tela) {
  tela.ctx.globalAlpha = 0.6;
  tela.ret(0, 0, 320, 180, 0);
  tela.ctx.globalAlpha = 1;
  // botão "continuar": triângulo grande
  for (let i = 0; i < 40; i++) {
    const w = i < 20 ? i : 40 - i;
    tela.ret(148, 70 + i, w * 1.4, 1, 5);
  }
}
