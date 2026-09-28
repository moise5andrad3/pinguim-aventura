// Som chiptune gerado por Web Audio. O AudioContext só nasce no primeiro gesto do usuário
// e é retomado em todo toque enquanto não estiver "running" (ADR-001).

let ac = null;
let mestre = null;
let ruido = null;
let mudo = false;

// Efeitos como dados: onda, notas [frequência Hz, duração s] em sequência, volume.
// ruido: duração em s de um chiado filtrado (splash).
const SONS = {
  toque: { onda: 'square', notas: [[1320, 0.025]], vol: 0.04 },
  pulo: { onda: 'square', notas: [[392, 0.04], [523, 0.04], [659, 0.05]], vol: 0.07 },
  plim: { onda: 'triangle', notas: [[1047, 0.06], [1568, 0.12]], vol: 0.16 },
  tuc: { onda: 'triangle', notas: [[262, 0.06]], vol: 0.14 },
  tijolo: { onda: 'square', notas: [[784, 0.04], [1047, 0.06]], vol: 0.06 },
  splash: { ruido: 0.35, vol: 0.18 },
  saltoAgua: { onda: 'square', notas: [[330, 0.05], [494, 0.05], [659, 0.05], [988, 0.08]], vol: 0.06 },
  peixe: { onda: 'square', notas: [[880, 0.04], [1175, 0.04], [1760, 0.07]], vol: 0.06 },
  porta: { onda: 'triangle', notas: [[523, 0.1], [659, 0.1], [784, 0.1], [1047, 0.25]], vol: 0.18 },
  fanfarra: {
    onda: 'square',
    notas: [[523, 0.12], [523, 0.12], [784, 0.12], [1047, 0.3], [880, 0.12], [1047, 0.45]],
    vol: 0.07,
  },
  carimbo: { onda: 'triangle', notas: [[196, 0.05], [131, 0.12]], vol: 0.2 },
  grasnado: { onda: 'square', notas: [[1200, 0.05], [900, 0.05], [1200, 0.05], [900, 0.08]], vol: 0.05 },
  empurrao: { onda: 'triangle', notas: [[330, 0.05], [220, 0.08]], vol: 0.14 },
  clique: { onda: 'square', notas: [[1600, 0.02], [0, 0.04], [1600, 0.02]], vol: 0.04 },
  urso: { onda: 'triangle', notas: [[110, 0.12], [98, 0.2], [82, 0.25]], vol: 0.22 },
  estrela: { onda: 'triangle', notas: [[1319, 0.05], [1568, 0.05], [2093, 0.05], [2637, 0.12]], vol: 0.12 },
  dourado: { onda: 'square', notas: [[784, 0.05], [988, 0.05], [1175, 0.05], [1568, 0.05], [1976, 0.12]], vol: 0.06 },
  aviso: { onda: 'triangle', notas: [[660, 0.05], [0, 0.05], [660, 0.05]], vol: 0.08 },
  perda: { onda: 'triangle', notas: [[523, 0.12], [440, 0.12], [392, 0.25]], vol: 0.14 },
  cadeado: { onda: 'square', notas: [[196, 0.05], [196, 0.05]], vol: 0.05 },
  dica: { onda: 'triangle', notas: [[1568, 0.08], [2093, 0.14]], vol: 0.08 },
  vai: { onda: 'square', notas: [[523, 0.08], [659, 0.08], [784, 0.16]], vol: 0.07 },
};

// Músicas originais como dados. Cada voz: onda, volume e notas [nome, duração em colcheias];
// null é pausa. Todas as vozes de uma música somam o mesmo número de colcheias (laço).
const MUSICAS = {
  tema: {
    bpm: 150,
    vozes: [
      { onda: 'square', vol: 0.05, notas: [
        ['E5', 1], ['G5', 1], ['C6', 2], ['B5', 1], ['G5', 1], ['E5', 2],
        ['F5', 1], ['A5', 1], ['C6', 2], ['B5', 2], ['G5', 2],
        ['E5', 1], ['G5', 1], ['C6', 1], ['E6', 1], ['D6', 2], ['C6', 2],
        ['B5', 1], ['G5', 1], ['A5', 1], ['B5', 1], ['C6', 4],
      ] },
      { onda: 'triangle', vol: 0.12, notas: [
        ['C3', 2], ['G3', 2], ['C3', 2], ['G3', 2], ['F3', 2], ['C4', 2], ['F3', 2], ['C4', 2],
        ['C3', 2], ['G3', 2], ['E3', 2], ['G3', 2], ['G3', 2], ['D4', 2], ['G3', 2], ['C3', 2],
      ] },
    ],
  },
  fase: {
    bpm: 140,
    vozes: [
      { onda: 'square', vol: 0.035, notas: [
        ['C5', 2], ['E5', 1], ['G5', 1], ['A5', 2], ['G5', 2],
        ['F5', 2], ['A5', 1], ['F5', 1], ['E5', 2], ['C5', 2],
        ['D5', 1], ['E5', 1], ['F5', 1], ['G5', 1], ['A5', 2], ['G5', 2],
        ['E5', 2], ['D5', 2], ['C5', 2], [null, 2],
      ] },
      { onda: 'triangle', vol: 0.1, notas: [
        ['C3', 4], ['G2', 4], ['F2', 4], ['C3', 4], ['D3', 4], ['G2', 4], ['C3', 4], ['G2', 4],
      ] },
    ],
  },
  festa: {
    bpm: 170,
    vozes: [
      { onda: 'square', vol: 0.05, notas: [
        ['C6', 1], ['C6', 1], ['G5', 1], ['C6', 1], ['E6', 2], ['C6', 2],
        ['D6', 1], ['D6', 1], ['B5', 1], ['D6', 1], ['F6', 2], ['D6', 2],
        ['E6', 1], ['D6', 1], ['C6', 1], ['B5', 1], ['A5', 2], ['G5', 2],
        ['C6', 2], ['G5', 2], ['C6', 4],
      ] },
      { onda: 'triangle', vol: 0.12, notas: [
        ['C3', 2], ['G3', 2], ['C3', 2], ['G3', 2], ['G2', 2], ['D3', 2], ['G2', 2], ['D3', 2],
        ['A2', 2], ['E3', 2], ['F2', 2], ['G2', 2], ['C3', 2], ['G2', 2], ['C3', 4],
      ] },
    ],
  },
};

const MUSICA_VOL = 0.6;   // música abaixo dos efeitos (PRD, seção 9)
const ANTECEDENCIA = 0.12; // agenda notas até 0,12 s à frente
const NOTAS = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

let musica = null;        // { nome, transpor, bpm }
let tocando = null;       // estado do sequenciador
let relogio = null;
let ganhoMusica = null;

function freq(nome, transpor) {
  const midi = 12 * (Number(nome[nome.length - 1]) + 1) + NOTAS[nome[0]] + (nome.includes('#') ? 1 : 0);
  return 440 * 2 ** ((midi + transpor - 69) / 12);
}

function agendar() {
  if (!tocando || !ac || ac.state !== 'running') return;
  const def = MUSICAS[tocando.nome];
  const colcheia = 30 / (tocando.bpm || def.bpm);
  const limite = ac.currentTime + ANTECEDENCIA;
  def.vozes.forEach((voz, i) => {
    const v = tocando.vozes[i];
    if (v.t < ac.currentTime) v.t = ac.currentTime + 0.02;
    while (v.t < limite) {
      const [nota, dur] = voz.notas[v.i];
      const d = dur * colcheia;
      if (nota) {
        const osc = ac.createOscillator();
        const g = ac.createGain();
        osc.type = voz.onda;
        osc.frequency.value = freq(nota, tocando.transpor || 0);
        g.gain.setValueAtTime(voz.vol, v.t);
        g.gain.setValueAtTime(voz.vol, v.t + d * 0.75);
        g.gain.linearRampToValueAtTime(0.0001, v.t + d * 0.95);
        osc.connect(g).connect(ganhoMusica);
        osc.start(v.t);
        osc.stop(v.t + d);
      }
      v.t += d;
      v.i = (v.i + 1) % voz.notas.length;
    }
  });
}

function comecarMusica() {
  if (!ac || !musica) return;
  if (tocando && tocando.nome === musica.nome && tocando.transpor === musica.transpor) return;
  tocando = { ...musica, vozes: MUSICAS[musica.nome].vozes.map(() => ({ i: 0, t: 0 })) };
  if (!relogio) relogio = setInterval(agendar, 25);
}

// Pede uma música (ou null para silêncio). Se o áudio ainda não foi liberado, ela começa
// assim que for.
export function tocarMusica(pedido) {
  musica = pedido;
  if (!pedido) {
    tocando = null;
    return;
  }
  comecarMusica();
}

export function musicaAtual() {
  return tocando ? tocando.nome : null;
}

export function desbloquear() {
  if (!ac) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return;
    ac = new C();
    mestre = ac.createGain();
    mestre.gain.value = mudo ? 0 : 1;
    mestre.connect(ac.destination);
    ganhoMusica = ac.createGain();
    ganhoMusica.gain.value = MUSICA_VOL;
    ganhoMusica.connect(mestre);
    comecarMusica();
  }
  if (ac.state !== 'running') ac.resume().catch(() => {});
}

// Segundo plano: suspende o áudio; ao voltar, retoma (o gesto do usuário já aconteceu antes).
export function suspender() {
  if (ac && ac.state === 'running') ac.suspend().catch(() => {});
}

export function retomar() {
  if (ac && ac.state === 'suspended') ac.resume().catch(() => {});
}

export function estado() {
  return ac ? ac.state : 'inexistente';
}

export function definirMudo(v) {
  mudo = v;
  if (mestre) mestre.gain.value = v ? 0 : 1;
}

export function tocar(nome) {
  if (!ac || ac.state !== 'running') return;
  const s = SONS[nome];
  let t = ac.currentTime + 0.005;
  const g = ac.createGain();
  g.connect(mestre);
  if (s.ruido) {
    if (!ruido) {
      ruido = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
      const d = ruido.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const src = ac.createBufferSource();
    src.buffer = ruido;
    const filtro = ac.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.frequency.setValueAtTime(2400, t);
    filtro.frequency.exponentialRampToValueAtTime(300, t + s.ruido);
    src.connect(filtro).connect(g);
    g.gain.setValueAtTime(s.vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + s.ruido);
    src.start(t);
    src.stop(t + s.ruido);
    return;
  }
  const osc = ac.createOscillator();
  osc.type = s.onda;
  osc.connect(g);
  g.gain.setValueAtTime(0, t);
  for (const [f, d] of s.notas) {
    osc.frequency.setValueAtTime(f || 1, t);
    g.gain.setValueAtTime(f ? s.vol : 0, t);
    g.gain.setValueAtTime(f ? s.vol : 0, t + d * 0.7);
    g.gain.linearRampToValueAtTime(0.0001, t + d);
    t += d;
  }
  osc.start(ac.currentTime);
  osc.stop(t + 0.02);
}
