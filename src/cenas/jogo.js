// A fase: blocos de gelo, pulos, tijolos do iglu, queda e nado, porta e entrada; gaivotas,
// caranguejos, blocos que afundam, peixes, estrelas-do-mar, ursinho-polar; sol e peixes-vida
// no modo Aventura; pausa com confirmação. Toda a configuração vem de fases.js.
import { MODOS, FASES, PISCA_SEG, AFUNDADO_SEG } from '../fases.js';
import * as audio from '../audio.js';
import { escrever } from '../fonte.js';
import { dados, gravar } from '../salvar.js';
import { noCanto } from '../tela.js';

const MUNDO_MIN = -64;
const MUNDO_LARG = 448;
const PE_MARGEM = 33;
const PULO_PASSOS = 21;          // 0,35 s
const GUARDA_PASSOS = 21;        // toque durante o pulo inteiro fica guardado (playtest)
const INCLINACAO_MAX = 24;
const X_MIN = 8;
const X_MAX = 312;
const X_PORTA = 160;
const FIM_MARGEM = 36;           // na margem: tocar acima disso anda; abaixo, pula
const NADO_SUBMERSO = 30;        // 0,5 s
const NADO_TOTAL = 78;           // 1,3 s até voltar à margem
const ENTRADA_PASSOS = 48;
const REINICIO_PASSOS = 90;      // 1,5 s de aviso antes de recomeçar a fase (modo Aventura)
const AVISO_GAIVOTA = 60;        // PRD: sombra e grasnado 1 s antes

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

let entrada, modo, M, F, fase;
let fileiras, pinguim, tijolos, meta, porta, vagas, voando, peixes, peixesPegos, pontos;
let quedasSeguidas, ajuda, passos, sorteio, proxPeixe, douradoSaiu;
let gaivotas, proxGaivota, caranguejos, estrelas, estrelasPegas, urso;
let vidas, reiniciando, reinicios, pausa, balanco, danca, ultimoEmpurrao, toques, quedasPor;

export const cena = {
  entrar(d) {
    entrada = d;
    modo = d.modo;
    fase = d.fase;
    M = MODOS[modo];
    F = FASES[fase];
    fileiras = F.fileiras.map((f) => ({
      vel: f.vel,
      azul: false,
      blocos: f.blocos.map(([x, w, atraso]) => ({
        x, w: Math.round(w * M.largura), atraso: atraso === undefined ? null : atraso, etapa: 'normal',
      })),
    }));
    pinguim = { x: 60, linha: -1, estado: 'margem', bloco: null, t: 0, vx: 0, y0: 0, destino: 0,
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
    passos = 0;
    sorteio = gerador(d.semente || 1);
    proxPeixe = F.peixes.intervalo * 60;
    douradoSaiu = !F.peixeDourado;
    gaivotas = [];
    proxGaivota = F.gaivotas ? F.gaivotas.intervalo * 60 : Infinity;
    caranguejos = (F.caranguejos || []).map((c) => ({
      bloco: fileiras[c.fileira].blocos[c.bloco], dx: 4, dir: 1, espera: 0,
    }));
    estrelas = (F.estrelas || []).map((e) => ({
      bloco: fileiras[e.fileira].blocos[e.bloco], dx: Math.min(e.dx, Math.round(e.dx * M.largura)), pega: false,
    }));
    estrelasPegas = 0;
    urso = F.urso ? { x: 230, dir: -1, t: 0, sentado: 0, espera: 0 } : null;
    vidas = M.vidas;
    reiniciando = 0;
    reinicios = d.reinicios || 0;
    pausa = null;
    balanco = 0;
    danca = 0;
    ultimoEmpurrao = { causa: null, passo: -99 };
    toques = { gaivota: 0, caranguejo: 0, urso: 0 };
    quedasPor = { gaivota: 0, caranguejo: 0 };
  },

  pausar() {
    if (!pausa) pausa = 'menu';
  },

  toque(x, y) {
    if (reiniciando) return;
    if (pausa) {
      tocarNaPausa(x);
      return;
    }
    // Perto do Pinguinzinho, o pulo tem prioridade sobre os botões de canto: a área de 2 cm
    // dos botões se sobrepõe à zona "acima" quando ele está numa fileira de cima, perto da borda.
    const perto = x !== null && pinguim.estado !== 'margem' && Math.abs(x - pinguim.x) < INCLINACAO_MAX;
    const canto = perto ? null : noCanto(x, y);
    if (canto === 'esq') {
      pausa = 'menu';
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
    if (pausa) return;
    if (reiniciando) {
      reiniciando--;
      if (reiniciando === 0) cena.entrar({ ...entrada, reinicios: reinicios + 1 });
      return;
    }
    passos++;
    if (ajuda > 0) ajuda--;
    if (balanco > 0) balanco--;
    if (danca > 0) danca--;
    moverBlocos();
    moverPinguim();
    moverPeixes();
    moverGaivotas();
    moverCaranguejos();
    pegarEstrelas();
    moverUrso();
    for (const v of voando) v.t++;
    voando = voando.filter((v) => v.t < 30);
    if (M.sol && passos >= M.sol * 60 && pinguim.estado !== 'entrando') perderFase();
  },

  desenhar(tela) {
    tela.fundo(F.noite ? 1 : 2);
    desenharCenario(tela);
    desenharUrso(tela);
    desenharBlocos(tela);
    desenharEstrelas(tela);
    desenharCaranguejos(tela);
    desenharPeixes(tela);
    desenharPinguim(tela);
    desenharGaivotas(tela);
    desenharHud(tela);
    if (pausa) desenharPausa(tela);
    if (reiniciando) desenharReinicio(tela);
  },

  estadoTeste() {
    return {
      fase, modo, estado: pinguim.estado, linha: pinguim.linha, destino: pinguim.destino, x: pinguim.x,
      tijolos, meta, porta,
      pausa, ajuda, quedasSeguidas, pontos, peixesPegos, estrelasPegas, vidas, reinicios,
      reiniciando, passos, sol: M.sol ? M.sol - passos / 60 : null,
      assistencia: M.assistencia, toques: { ...toques }, quedasPor: { ...quedasPor },
      urso: urso ? { x: urso.x } : null,
      ateAfundarAtual: pinguim.bloco ? finito(ateAfundar(pinguim.bloco)) : 999,
      fileiras: fileiras.map((f) => ({
        azul: f.azul,
        vel: f.vel * M.velocidade,
        blocos: f.blocos.map((b) => [...efetivo(b), b.etapa, finito(ateAfundar(b))]),
      })),
    };
  },
};

const finito = (v) => (Number.isFinite(v) ? v : 999);

// ---------- regras ----------

function efetivo(b) {
  if (ajuda <= 0) return [b.x, b.w];
  const w = b.w * M.ajudaFator;
  return [b.x - (w - b.w) / 2, w];
}

// Etapa do ciclo de um bloco que afunda: normal, pisca (1 s) e afundado (1,5 s).
function etapaDe(b) {
  if (b.atraso === null || !F.afundar) return 'normal';
  const c = F.afundar.ciclo;
  const t = (passos / 60 + b.atraso) % c;
  if (t >= c - AFUNDADO_SEG) return 'afundado';
  if (t >= c - AFUNDADO_SEG - PISCA_SEG) return 'pisca';
  return 'normal';
}

// Segundos até o bloco afundar (0 se já está afundado; Infinity se nunca afunda).
function ateAfundar(b) {
  if (b.atraso === null || !F.afundar) return Infinity;
  const c = F.afundar.ciclo;
  const t = (passos / 60 + b.atraso) % c;
  return Math.max(0, c - AFUNDADO_SEG - t);
}

function sobre(b, x, folga) {
  if (b.etapa === 'afundado') return false;
  const [bx, bw] = efetivo(b);
  return x >= bx - folga && x <= bx + bw + folga;
}

function tocarNaPausa(x) {
  audio.tocar('toque');
  if (pausa === 'menu') {
    if (x !== null && x < 107) pausa = 'recomecar';
    else if (x !== null && x > 213) pausa = 'mapa';
    else pausa = null;
    return;
  }
  // Confirmação: lado esquerdo = não (X vermelho), lado direito = sim (V verde).
  if (x === null || x < 160) {
    pausa = 'menu';
  } else if (pausa === 'recomecar') {
    cena.entrar({ ...entrada, reinicios });
  } else {
    cena.trocar('mapa', { modo });
  }
}

function tocarNoJogo(x, y) {
  const p = pinguim;
  if (p.estado === 'nadando' || p.estado === 'entrando') return;
  if (p.estado === 'pulando') {
    if (PULO_PASSOS - p.t <= GUARDA_PASSOS) p.guardado = { x, y };
    return;
  }
  // A linha que separa "subir" de "descer" é o próprio Pinguinzinho (o meio do desenho): tocar
  // no bloco para onde ele deve ir sempre funciona. Na margem, a linha é a beira da água.
  const divisoria = p.estado === 'margem' ? FIM_MARGEM : pe(p.linha) - 8;
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
  if (acima) pular(p.linha - 1, inclinacao);
  else if (p.linha < 3) pular(p.linha + 1, inclinacao);
  else audio.tocar('toque');
}

function pular(destino, inclinacao) {
  const p = pinguim;
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
      const antes = b.etapa;
      b.etapa = etapaDe(b);
      if (antes === 'normal' && b.etapa === 'pisca' && pinguim.bloco === b) audio.tocar('aviso');
    }
  }
}

function moverPinguim() {
  const p = pinguim;
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
      const bonus = M.sol ? Math.max(0, Math.floor(M.sol - passos / 60)) * 10 : 0;
      cena.trocar('concluida', {
        modo, fase, pontos: pontos + bonus, peixes: peixesPegos, estrelas: estrelasPegas,
        totalEstrelas: estrelas.length, segundos: Math.round(passos / 60),
      });
    }
  }
}

function pousar() {
  const p = pinguim;
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
    voando.push({ x0: pinguim.x, y0: pe(d) - 8, x1: vaga.x, y1: vaga.y, t: 0 });
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
  const p = pinguim;
  p.estado = 'nadando';
  p.t = 0;
  p.bloco = null;
  p.guardado = null;
  audio.tocar('splash');
  if (passos - ultimoEmpurrao.passo <= 2) quedasPor[ultimoEmpurrao.causa]++;
  quedasSeguidas++;
  if (M.ajudaApos && quedasSeguidas >= M.ajudaApos) {
    ajuda = M.ajudaSeg * 60;
    quedasSeguidas = 0;
  }
  if (M.vidas) {
    vidas--;
    if (vidas <= 0) perderFase();
  }
}

// Só no modo Aventura (sol se pôs ou acabaram os peixes-vida): recomeça a fase atual.
function perderFase() {
  if (reiniciando) return;
  reiniciando = REINICIO_PASSOS;
  audio.tocar('perda');
}

// Gaivota e caranguejo: no Diversão só balançam; no Aventura empurram e podem derrubar.
function empurrar(dx, causa) {
  if (!M.empurra) {
    balanco = 30;
    audio.tocar(causa === 'caranguejo' ? 'clique' : 'empurrao');
    return;
  }
  audio.tocar('empurrao');
  pinguim.x = limitar(pinguim.x + dx, X_MIN, X_MAX);
  ultimoEmpurrao = { causa, passo: passos };
  balanco = 20;
}

function yPinguimAgora() {
  const p = pinguim;
  if (p.estado !== 'pulando') return pe(p.linha);
  const k = p.t / PULO_PASSOS;
  return p.y0 + (pe(p.destino) - p.y0) * k - 12 * Math.sin(Math.PI * k);
}

function moverPeixes() {
  if (passos >= proxPeixe) {
    proxPeixe += F.peixes.intervalo * 60;
    soltarPeixe(false);
  }
  if (!douradoSaiu && passos >= F.peixeDourado * 60) {
    douradoSaiu = true;
    soltarPeixe(true);
  }
  const py = yPinguimAgora() - 6;
  for (const f of peixes) {
    f.x += f.vel;
    f.y = topoBloco(f.linha) - 2 - Math.abs(Math.sin(f.x / 18)) * 10;
    if (!f.pego && pinguim.estado !== 'nadando' && Math.abs(f.x - pinguim.x) < 10 && Math.abs(f.y - py) < 10) {
      f.pego = true;
      peixesPegos++;
      pontos += f.dourado ? 200 : 50;
      audio.tocar(f.dourado ? 'dourado' : 'peixe');
    }
  }
  peixes = peixes.filter((f) => !f.pego && f.x > -20 && f.x < 340);
}

function soltarPeixe(dourado) {
  const daEsquerda = sorteio() < 0.5;
  const vel = F.peixes.vel * (dourado ? 1.3 : 1);
  peixes.push({ linha: Math.floor(sorteio() * 4), x: daEsquerda ? -12 : 332, vel: daEsquerda ? vel : -vel, dourado });
}

function moverGaivotas() {
  if (passos >= proxGaivota) {
    proxGaivota += F.gaivotas.intervalo * 60;
    const linha = pinguim.estado === 'bloco' ? pinguim.linha : Math.floor(sorteio() * 4);
    const daEsquerda = sorteio() < 0.5;
    gaivotas.push({ linha, dir: daEsquerda ? 1 : -1, x: daEsquerda ? -20 : 340, aviso: AVISO_GAIVOTA, bateu: false });
    audio.tocar('grasnado');
  }
  const p = pinguim;
  for (const g of gaivotas) {
    if (g.aviso > 0) {
      g.aviso--;
      continue;
    }
    g.x += g.dir * F.gaivotas.vel;
    if (!g.bateu && p.estado === 'bloco' && p.linha === g.linha && Math.abs(g.x - p.x) < 10) {
      g.bateu = true;
      toques.gaivota++;
      empurrar(g.dir * M.empurraoGaivota, 'gaivota');
    }
  }
  gaivotas = gaivotas.filter((g) => g.aviso > 0 || (g.x > -30 && g.x < 350));
}

function moverCaranguejos() {
  const p = pinguim;
  for (const c of caranguejos) {
    c.dx += 0.3 * c.dir;
    if (c.dx > c.bloco.w - 14) c.dir = -1;
    if (c.dx < 2) c.dir = 1;
    if (c.espera > 0) c.espera--;
    const cx = c.bloco.x + c.dx + 6;
    if (c.espera <= 0 && c.bloco.etapa !== 'afundado' && p.estado === 'bloco' && p.bloco === c.bloco
      && Math.abs(p.x - cx) < 9) {
      c.espera = 90;
      toques.caranguejo++;
      if (!M.empurra) danca = 30;
      empurrar(p.x < cx ? -M.empurraoCaranguejo : M.empurraoCaranguejo, 'caranguejo');
    }
  }
}

function pegarEstrelas() {
  const p = pinguim;
  for (const e of estrelas) {
    if (e.pega || p.estado !== 'bloco' || p.bloco !== e.bloco || e.bloco.etapa === 'afundado') continue;
    if (Math.abs(p.x - (e.bloco.x + e.dx + 4)) < 8) {
      e.pega = true;
      estrelasPegas++;
      pontos += 300;
      audio.tocar('estrela');
    }
  }
}

// Ursinho-polar (fase 4, igual nos dois modos): passeia na margem, às vezes senta e boceja.
// Encostar nele faz o Pinguinzinho quicar para trás, sem perda. Com a porta aberta, ele se
// afasta rápido para não bloquear a entrada.
function moverUrso() {
  if (!urso) return;
  const u = urso;
  if (u.espera > 0) u.espera--;
  if (porta) {
    const alvo = 285;
    if (Math.abs(u.x - alvo) > 1.2) {
      u.dir = u.x < alvo ? 1 : -1;
      u.x += u.dir * 1.2;
      u.sentado = 0;
    } else {
      u.sentado = 60;
    }
  } else if (u.sentado > 0) {
    u.sentado--;
  } else {
    u.x += 0.3 * u.dir;
    if (u.x < 100) u.dir = 1;
    if (u.x > 240) u.dir = -1;
    u.t++;
    if (u.t % 300 === 0) {
      u.sentado = 120;
      audio.tocar('urso');
    }
  }
  const p = pinguim;
  if (u.espera <= 0 && p.estado === 'margem' && Math.abs(p.x - u.x) < 16) {
    u.espera = 60;
    toques.urso++;
    p.x = limitar(u.x + (p.x < u.x ? -24 : 24), X_MIN, X_MAX);
    p.alvo = null;
    balanco = 20;
    audio.tocar('urso');
  }
}

// ---------- desenho ----------

function desenharCenario(tela) {
  const [topo, horizonte] = F.ceu;
  tela.ret(0, 0, 320, 22, topo);
  for (let y = 13; y < 22; y++) {
    const passo = y < 17 ? 4 : 2;
    for (let x = y % 2; x < 320; x += passo) tela.ret(x, y, 1, 1, horizonte);
  }
  if (F.noite) {
    for (let i = 0; i < 30; i++) tela.ret((i * 67) % 320, 2 + ((i * 23) % 10), 1, 1, 5);
    for (let x = 0; x < 320; x += 4) {
      const o = Math.round(Math.sin((x + passos * 0.5) / 30) * 2);
      tela.ret(x, 5 + o, 4, 1, 12);
      tela.ret(x, 6 + o, 4, 1, 11);
      tela.ret(x, 8 + o, 4, 1, 10);
    }
  }
  // Astro: no Aventura ele anda e se põe (relógio); no Diversão fica parado.
  const k = M.sol ? Math.min(1, passos / (M.sol * 60)) : 0;
  const astro = F.noite ? 'lua' : 'sol';
  tela.sprite(astro, 30 + 250 * k, 4 + 14 * k * k);
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
  const mar = F.noite ? 1 : 2;
  tela.ret(0, 36, 320, 144, mar);
  tela.ret(0, 150, 320, 30, F.noite ? 0 : 1);
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
      if (b.etapa === 'afundado') {
        // só o contorno na água
        tela.ret(bx, topo + 6, bw, 1, 4);
        continue;
      }
      const piscando = b.etapa === 'pisca' && passos % 12 < 6;
      tela.ret(bx, topo, bw, 7, piscando ? 4 : (f.azul ? 3 : 5));
      tela.ret(bx, topo + 7, bw, 2, f.azul ? 1 : 4);
      if (b.atraso !== null) {
        // rachaduras marcam os blocos que afundam
        tela.ret(bx + bw / 2 - 1, topo + 1, 1, 3, 6);
        tela.ret(bx + bw / 2, topo + 3, 1, 3, 6);
      }
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

function linhaDoBloco(b) {
  return fileiras.findIndex((f) => f.blocos.includes(b));
}

function desenharEstrelas(tela) {
  for (const e of estrelas) {
    if (e.pega || e.bloco.etapa === 'afundado') continue;
    tela.sprite('estrela', e.bloco.x + e.dx, topoBloco(linhaDoBloco(e.bloco)) - 6);
  }
}

function desenharCaranguejos(tela) {
  for (const c of caranguejos) {
    if (c.bloco.etapa === 'afundado') continue;
    const nome = Math.floor(passos / 10) % 2 ? 'caranguejo_a' : 'caranguejo_b';
    tela.sprite(nome, c.bloco.x + c.dx, topoBloco(linhaDoBloco(c.bloco)) - 8);
  }
}

function desenharPeixes(tela) {
  for (const f of peixes) tela.sprite(f.dourado ? 'peixe_dourado' : 'peixe', f.x - 5, f.y - 3, f.vel > 0);
}

function desenharGaivotas(tela) {
  for (const g of gaivotas) {
    const y = topoBloco(g.linha) - 14;
    if (g.aviso > 0) {
      // aviso: sombra piscando na borda da fileira de onde a gaivota vai sair
      if (g.aviso % 12 < 6) {
        const x = g.dir > 0 ? 0 : 304;
        tela.ret(x, topoBloco(g.linha) - 3, 16, 2, 0);
        tela.sprite('gaivota_a', x, y, g.dir < 0);
      }
      continue;
    }
    tela.sprite(Math.floor(passos / 8) % 2 ? 'gaivota_a' : 'gaivota_b', g.x - 8, y, g.dir < 0);
  }
}

function desenharUrso(tela) {
  if (!urso) return;
  const u = urso;
  const d = u.dir;
  const sentado = u.sentado > 0;
  const passo = !sentado && Math.floor(passos / 12) % 2;
  const corpoY = sentado ? 27 : 25;
  // contorno e corpo
  tela.circulo(u.x, corpoY, 8, 0);
  tela.circulo(u.x + d * 8, 19, 6, 0);
  tela.circulo(u.x + d * 5, 13, 2, 0);
  tela.circulo(u.x + d * 11, 13, 2, 0);
  tela.circulo(u.x, corpoY, 7, 5);
  tela.circulo(u.x + d * 8, 19, 5, 5);
  tela.circulo(u.x + d * 5, 13, 1, 5);
  tela.circulo(u.x + d * 11, 13, 1, 5);
  tela.ret(u.x - 6, corpoY + 3, 12, 2, 6);
  // patas
  if (!sentado) {
    tela.ret(u.x - 6 + (passo ? 1 : 0), 30, 3, 3, 0);
    tela.ret(u.x + 3 - (passo ? 1 : 0), 30, 3, 3, 0);
  }
  // focinho, nariz, olho e bocejo
  tela.ret(u.x + d * 11 - 2, 19, 5, 3, 14);
  tela.ret(u.x + d * 13 - 1, 19, 2, 1, 0);
  tela.ret(u.x + d * 8, 16, 1, 1, 0);
  if (sentado && u.sentado % 60 < 30) tela.ret(u.x + d * 11 - 1, 21, 3, 2, 9);
}

function desenharPinguim(tela) {
  const p = pinguim;
  const tremor = balanco > 0 ? Math.round(Math.sin(balanco) * 2) : 0;
  const virado = danca > 0 ? Math.floor(danca / 6) % 2 === 0 : !p.direita;
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
      tela.sprite('pinguim_pulo', p.x - 8, y - 14, !p.direita);
    }
  } else if (p.estado === 'entrando') {
    const k = p.t / ENTRADA_PASSOS;
    tela.ctx.globalAlpha = 1 - k;
    tela.sprite('pinguim', p.x - 8, PE_MARGEM - 14 - k * 3, false);
    tela.ctx.globalAlpha = 1;
  } else {
    const nome = p.estado === 'pulando' ? 'pinguim_pulo' : (passos % 180 < 8 ? 'pinguim_pisca' : 'pinguim');
    tela.sprite(nome, p.x - 8 + tremor, yPinguimAgora() - 14, virado);
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

// Números sobre placa escura: legíveis mesmo quando o sol ou a lua passam por trás.
function placa(tela, txt, x) {
  tela.ret(x - 2, 5, txt.length * 6 + 3, 11, 1);
  escrever(txt, x, 7, 5);
}

function desenharHud(tela) {
  tela.botao('pausa', 'esq');
  tela.botao(dados.som ? 'som' : 'mudo', 'dir');
  placa(tela, String(pontos), 60);
  for (let i = 0; i < vidas; i++) tela.sprite('peixe_vida', 100 + i * 12, 8);
  if (estrelas.length) {
    tela.sprite('estrela', 202, 6);
    placa(tela, String(estrelasPegas), 212);
  }
  tela.sprite('peixe', 234, 7);
  placa(tela, String(peixesPegos), 248);
}

function icone(tela, nome, cx, cy) {
  tela.circulo(cx, cy, 25, 5);
  tela.sprite(nome, cx - 18, cy - 18, false, 3);
}

function escurecer(tela) {
  tela.ctx.globalAlpha = 0.65;
  tela.ret(0, 0, 320, 180, 0);
  tela.ctx.globalAlpha = 1;
}

function triangulo(tela, x, y, altura, cor) {
  for (let i = 0; i < altura; i++) {
    const w = i < altura / 2 ? i : altura - i;
    tela.ret(x, y + i, w * 1.4, 1, cor);
  }
}

function desenharPausa(tela) {
  escurecer(tela);
  if (pausa === 'menu') {
    tela.ret(106, 20, 1, 140, 6);
    tela.ret(213, 20, 1, 140, 6);
    icone(tela, 'recomecar', 53, 90);
    triangulo(tela, 148, 70, 40, 5);
    icone(tela, 'casa', 267, 90);
    return;
  }
  // confirmação: qual ação está sendo confirmada, no alto
  tela.circulo(160, 26, 17, 5);
  tela.sprite(pausa === 'recomecar' ? 'recomecar' : 'casa', 148, 14, false, 2);
  tela.ret(159, 50, 1, 110, 6);
  tela.sprite('errado', 65, 81, false, 3);
  tela.sprite('certo', 222, 84, false, 3);
}

function desenharReinicio(tela) {
  escurecer(tela);
  tela.sprite(M.sol && passos >= M.sol * 60 ? (F.noite ? 'lua' : 'sol') : 'peixe_vida', 148, 40, false, 2);
  icone(tela, 'recomecar', 160, 98);
}
