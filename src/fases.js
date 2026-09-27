// DADOS dos modos e das fases. Os números marcados "calibrar" no PRD vivem aqui.
// Unidades: px lógicos; velocidades em px por passo (1/60 s); tempos em segundos.

export const MODOS = {
  diversao: {
    assistencia: 12,   // um pulo que cairia até 12 px de um bloco gruda nele
    sol: 0,            // sem relógio
    vidas: 0,          // queda sem perda
    ajudaApos: 3,      // quedas seguidas até a ajuda automática
    ajudaFator: 1.5,   // blocos 50% mais largos
    ajudaSeg: 20,
    velocidade: 1.0,
  },
  aventura: {
    assistencia: 4,
    sol: 90,
    vidas: 3,
    ajudaApos: 0,
    ajudaFator: 1,
    ajudaSeg: 0,
    velocidade: 1.4,
  },
};

// Blocos: [x inicial, largura]. O mundo dá a volta entre x -64 e 384 (448 px).
export const FASES = [
  {
    nome: 'BAIA CALMA',
    ceu: 4,
    tijolos: { diversao: 10, aventura: 16 },
    fileiras: [
      { vel: -0.30, blocos: [[0, 64], [112, 64], [224, 64], [336, 64]] },
      { vel: 0.25, blocos: [[40, 72], [189, 72], [338, 72]] },
      { vel: -0.35, blocos: [[20, 56], [132, 56], [244, 56], [356, 56]] },
      { vel: 0.30, blocos: [[70, 72], [219, 72], [368, 72]] },
    ],
    peixes: { intervalo: 4, vel: 0.5 },
  },
];
