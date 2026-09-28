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
    largura: 1.0,
    empurra: false,    // gaivota e caranguejo só balançam o Pinguinzinho
  },
  aventura: {
    assistencia: 4,
    sol: 90,
    vidas: 3,
    ajudaApos: 0,
    ajudaFator: 1,
    ajudaSeg: 0,
    velocidade: 1.4,
    largura: 0.8,
    empurra: true,     // gaivota e caranguejo empurram; pode cair
  },
};

// Blocos: [x inicial, largura] ou [x, largura, atraso] para blocos que afundam (atraso em s
// dentro do ciclo). O mundo dá a volta entre x -64 e 384 (448 px).
// Céu: cor de cima e cor da faixa do horizonte (índices da paleta).
export const FASES = [
  {
    nome: 'BAIA CALMA',
    ceu: [4, 5],
    tijolos: { diversao: 10, aventura: 16 },
    fileiras: [
      { vel: -0.30, blocos: [[0, 64], [112, 64], [224, 64], [336, 64]] },
      { vel: 0.25, blocos: [[40, 72], [189, 72], [338, 72]] },
      { vel: -0.35, blocos: [[20, 56], [132, 56], [244, 56], [356, 56]] },
      { vel: 0.30, blocos: [[70, 72], [219, 72], [368, 72]] },
    ],
    peixes: { intervalo: 4, vel: 0.5 },
  },
  {
    nome: 'CORRENTEZA',
    ceu: [4, 7],
    tijolos: { diversao: 12, aventura: 16 },
    fileiras: [
      { vel: -0.40, blocos: [[0, 60], [150, 60], [300, 60]] },
      { vel: 0.30, blocos: [[40, 64], [152, 64], [264, 64], [376, 64]] },
      { vel: -0.50, blocos: [[20, 52], [169, 52], [318, 52]] },
      { vel: 0.40, blocos: [[70, 56], [182, 56], [294, 56], [406, 56]] },
    ],
    peixes: { intervalo: 4, vel: 0.6 },
    peixeDourado: 25,
    gaivotas: { intervalo: 7, vel: 2.2 },
  },
  {
    nome: 'GELO FINO',
    ceu: [10, 8],
    tijolos: { diversao: 14, aventura: 16 },
    fileiras: [
      { vel: -0.40, blocos: [[0, 60], [150, 60, 3], [300, 60]] },
      { vel: 0.35, blocos: [[40, 60], [189, 60, 1], [338, 60]] },
      { vel: -0.45, blocos: [[20, 56, 5], [132, 56], [244, 56, 2], [356, 56]] },
      { vel: 0.35, blocos: [[70, 64], [219, 64, 4], [368, 64]] },
    ],
    afundar: { ciclo: 7 },
    peixes: { intervalo: 5, vel: 0.6 },
    caranguejos: [{ fileira: 1, bloco: 0 }, { fileira: 3, bloco: 2 }],
    estrelas: [{ fileira: 0, bloco: 2, dx: 20 }, { fileira: 2, bloco: 1, dx: 12 }, { fileira: 3, bloco: 0, dx: 34 }],
  },
  {
    nome: 'NOITE DE AURORA',
    ceu: [1, 10],
    noite: true,
    tijolos: { diversao: 16, aventura: 16 },
    fileiras: [
      { vel: -0.45, blocos: [[0, 60], [150, 60, 2], [300, 60]] },
      { vel: 0.40, blocos: [[40, 60], [189, 60], [338, 60]] },
      { vel: -0.50, blocos: [[20, 56], [132, 56, 5], [244, 56], [356, 56]] },
      { vel: 0.40, blocos: [[70, 64], [219, 64], [368, 64]] },
    ],
    afundar: { ciclo: 8 },
    peixes: { intervalo: 5, vel: 0.6 },
    peixeDourado: 30,
    gaivotas: { intervalo: 9, vel: 2.2 },
    caranguejos: [{ fileira: 2, bloco: 0 }],
    estrelas: [{ fileira: 1, bloco: 1, dx: 24 }, { fileira: 2, bloco: 2, dx: 10 }, { fileira: 3, bloco: 1, dx: 40 }],
    urso: true,
  },
];

// Blocos que afundam: tempo de cada etapa do ciclo (PRD: pisca 1 s antes, afunda por 1,5 s).
export const PISCA_SEG = 1;
export const AFUNDADO_SEG = 1.5;
