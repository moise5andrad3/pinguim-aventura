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
};

export function desbloquear() {
  if (!ac) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return;
    ac = new C();
    mestre = ac.createGain();
    mestre.gain.value = mudo ? 0 : 1;
    mestre.connect(ac.destination);
  }
  if (ac.state !== 'running') ac.resume().catch(() => {});
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
    osc.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(s.vol, t);
    g.gain.setValueAtTime(s.vol, t + d * 0.7);
    g.gain.linearRampToValueAtTime(0.0001, t + d);
    t += d;
  }
  osc.start(ac.currentTime);
  osc.stop(t + 0.02);
}
