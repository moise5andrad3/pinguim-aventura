// Arte original em pixel art, guardada como texto. Cada caractere é um índice da paleta
// (0-9, a-f); '.' é transparente. Na carga, cada desenho vira um canvas (e seu espelho).

export const PALETA = [
  '#0B0E1A', // 0 contorno, noite
  '#1D2B53', // 1 mar profundo, céu noturno
  '#2A5FA8', // 2 mar
  '#5B8FD9', // 3 bloco pisado (azul)
  '#9FD8F5', // 4 sombra do gelo, céu de manhã
  '#F4F8FF', // 5 bloco branco, neve, barriga
  '#C9D6E8', // 6 sombra da neve
  '#FFD23F', // 7 sol, destaque
  '#FF8C42', // 8 bico e pés
  '#E84855', // 9 vermelho
  '#7B2D8B', // a aurora, entardecer
  '#3BCEAC', // b peixes, aurora
  '#6BE36B', // c aurora
  '#8A6A4F', // d pedras
  '#6B7280', // e gaivota, focinho do urso
  '#FF9EC7', // f bochecha, festa
];

const DESENHOS = {
  pinguim: [
    '................',
    '.....000000.....',
    '....01111110....',
    '...0111111110...',
    '...0111155510...',
    '...0111150510...',
    '...011111111888.',
    '...0115555f18...',
    '..011555555550..',
    '..011555555550..',
    '.0111555555550..',
    '..011555555550..',
    '...01555555550..',
    '....055555550...',
    '....0888008880..',
    '................',
  ],
  pinguim_pisca: [
    '................',
    '.....000000.....',
    '....01111110....',
    '...0111111110...',
    '...0111111110...',
    '...0111100010...',
    '...011111111888.',
    '...0115555f18...',
    '..011555555550..',
    '..011555555550..',
    '.0111555555550..',
    '..011555555550..',
    '...01555555550..',
    '....055555550...',
    '....0888008880..',
    '................',
  ],
  pinguim_pulo: [
    '.....000000.....',
    '....01111110....',
    '...0111111110...',
    '...0111155510...',
    '...0111150510...',
    '...011111111888.',
    '0..0115555f18...',
    '10.011555555550.',
    '.10011555555550.',
    '..01155555555500',
    '...01555555550.1',
    '...01555555550..',
    '....055555550...',
    '....088800888...',
    '................',
    '................',
  ],
  peixe: [
    '..00000.0.',
    '.0bbbbb0b0',
    '0b0bbbbbb0',
    '0bbbbbbbb0',
    '.0bbbbb0b0',
    '..00000.0.',
  ],
  sol: [
    '....8888....',
    '..88777788..',
    '.8777777778.',
    '.8777777778.',
    '877777777778',
    '877777777778',
    '877777777778',
    '877777777778',
    '.8777777778.',
    '.8777777778.',
    '..88777788..',
    '....8888....',
  ],
  pausa: [
    '............',
    '............',
    '..111..111..',
    '..111..111..',
    '..111..111..',
    '..111..111..',
    '..111..111..',
    '..111..111..',
    '..111..111..',
    '..111..111..',
    '............',
    '............',
  ],
  som: [
    '............',
    '......1.....',
    '.....11..1..',
    '...1111...1.',
    '111111..1.1.',
    '111111..1.1.',
    '111111..1.1.',
    '111111..1.1.',
    '...1111...1.',
    '.....11..1..',
    '......1.....',
    '............',
  ],
  mudo: [
    '............',
    '......1.....',
    '.....11.....',
    '...1111.9..9',
    '111111...99.',
    '111111...99.',
    '111111..9..9',
    '111111......',
    '...1111.....',
    '.....11.....',
    '......1.....',
    '............',
  ],
};

export const IMG = {};

function paraCanvas(linhas, espelhar) {
  const c = document.createElement('canvas');
  c.width = linhas[0].length;
  c.height = linhas.length;
  const g = c.getContext('2d');
  linhas.forEach((linha, y) => {
    for (let x = 0; x < linha.length; x++) {
      const ch = linha[x];
      if (ch === '.') continue;
      g.fillStyle = PALETA[parseInt(ch, 16)];
      g.fillRect(espelhar ? c.width - 1 - x : x, y, 1, 1);
    }
  });
  return c;
}

export function carregarSprites() {
  for (const [nome, linhas] of Object.entries(DESENHOS)) {
    IMG[nome] = { normal: paraCanvas(linhas, false), espelho: paraCanvas(linhas, true) };
  }
}
