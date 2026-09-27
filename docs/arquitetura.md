# Arquitetura (Etapa 5)

- **Base:** `adr-001-plataforma.md` (HTML, JavaScript com módulos ES nativos e Canvas 2D, sem
  build e sem dependências de runtime) e `PRD.md`.
- **Regras:**
  - 1 módulo = 1 arquivo;
  - abstração só com 3 ou mais usos;
  - dados das fases como dados.

## Árvore de arquivos

```
index.html              página única: <canvas>, CSS mínimo, carrega src/main.js
manifest.webmanifest    instalação (M3)
sw.js                   service worker: cache offline (M3)
.nojekyll               GitHub Pages sem Jekyll (ADR-001)
icones/                 ícones PNG 192 e 512 da instalação (M3)
src/
  main.js               inicialização, escala, loop de passo fixo, troca de cenas, pausa automática
  tela.js               renderizador pixel-perfect: canvas lógico 320x180 e escala inteira
  toque.js              entrada: Pointer Events em coordenadas lógicas; teclado só para teste
  audio.js              Web Audio: desbloqueio no 1º toque, efeitos, música, mudo
  salvar.js             localStorage: progresso, carimbos, recordes, som (com try/catch)
  sprites.js            arte como matrizes de caracteres, convertidas em imagens na carga
  fonte.js              fonte pixel 5x7 própria e função de escrever
  fases.js              DADOS: parâmetros dos modos e das 4 fases
  diag.js               modo de diagnóstico (?diag=1): dpr, escala, fps, quadrado de 2 cm
  cenas/
    abertura.js         título e botão de jogar
    modo.js             escolha Diversão ou Aventura (M2)
    mapa.js             4 ilhas, cadeados e carimbos (M2)
    jogo.js             a fase: regras, física, desenho e pausa
    concluida.js        fase concluída e carimbo
    final.js            festa final (M2)
    recordes.js         recordes por modo e fase (M2)
tests/
  jogo.spec.js          Playwright em emulação mobile (M1+)
  verificar.mjs         checagens estáticas: peso, URLs externas, termos proibidos
package.json            só devDependency (@playwright/test); nada disso é servido ao jogo
playwright.config.js    dispositivos emulados e servidor local
```

Os arquivos de `tests/`, `package.json` e `playwright.config.js` ficam no site publicado porque o
Pages serve a raiz. São inofensivos e nunca são carregados pelo jogo. `node_modules/` está no
`.gitignore`.

## Loop com passo fixo (`main.js`)

- **Passo:** a lógica roda em passo fixo de 1/60 s. Um acumulador soma o tempo real de cada
  `requestAnimationFrame` e executa `atualizar(1/60)` quantas vezes couber, com **máximo de 5
  passos por quadro**, para não entrar em "espiral" depois de um travamento.
- **Desenho:** acontece uma vez por quadro. Nas telas de 120 Hz, desenha-se o dobro de quadros com
  a mesma lógica (risco listado no PRD).
- **Pausa automática:** `visibilitychange` para `hidden` pausa a cena de jogo e para o loop. O
  loop volta quando a página fica visível, com o acumulador zerado.

## Máquina de estados de cenas

Cada cena é um objeto com a mesma forma. É o único contrato compartilhado (sete usos):

```js
export const cena = {
  entrar(dados) {},        // chamada ao trocar para esta cena
  atualizar(dt) {},        // passo fixo
  desenhar(tela) {},       // uma vez por quadro
  toque(x, y) {},          // pointerdown já convertido para coordenadas lógicas
};
```

- `main.js` guarda a cena atual e injeta em cada cena a função `trocar(nome, dados)`, que troca
  de cena.
- A pausa não é uma cena: é um estado dentro de `jogo.js`, para preservar a fase congelada.

## Entrada de toque (`toque.js`)

- **Onde escuta:** `pointerdown` no `document`, que cobre também as sobras laterais. Só vale
  `isPrimary`; ignora o segundo dedo.
- **Bloqueios do navegador:** `touch-action: none` em `html` e `body` e `preventDefault()` no
  evento. Isso desativa zoom por toque duplo, rolagem e menu de toque longo.
- **Conversão:** as coordenadas de tela viram coordenadas lógicas pelo retângulo do canvas.
  Valores fora de 0 a 320 são permitidos: as sobras também são zonas.
- **Filtro de *holdover*:** um toque a menos de 120 ms do anterior e a menos de 8 px lógicos dele
  é descartado (PRD, seção 4).
- **Gesto do usuário:** o jogo age no `pointerdown`, mas tela cheia, trava de paisagem e áudio
  são pedidos no `pointerup`, sempre que o jogo não estiver em tela cheia.
- **Prioridade do pulo:** perto do Pinguinzinho (menos de 24 px na horizontal), o toque é pulo mesmo
  dentro da área dos botões de canto (PRD, seção 5).
- **Teclado de teste:** setas, Esc e M viram toques sintéticos equivalentes. Não é requisito.

## Renderizador pixel-perfect (`tela.js`)

- **Duas telas:** um canvas de trabalho de 320 × 180 (fora do DOM) recebe todo o desenho. O
  canvas visível tem o tamanho em **pixels físicos**:
  - `k = max(1, floor(min(innerWidth*dpr/320, innerHeight*dpr/180)))`;
  - largura e altura = `320*k` × `180*k`;
  - tamanho CSS = esse valor dividido por `dpr`;
  - centralizado.
- **Ampliação:** a cada quadro, o canvas de trabalho é copiado para o visível com `drawImage`
  ampliado por `k`, com `imageSmoothingEnabled = false` e, no CSS, `image-rendering: pixelated`.
- **Recalcular escala:** em `resize` e `orientationchange`.
- **Cor das sobras:** a cor de fundo da página acompanha a cor de fundo da cena.
- **Sprites em cache:** cada sprite é convertido uma vez, na carga, num pequeno canvas (e no seu
  espelho horizontal).

## Arte (`sprites.js` e `fonte.js`)

- **Formato:** sprites são listas de strings. Cada caractere é um índice da paleta de 16 cores do
  PRD, de `0` a `9` e `a` a `f`; o ponto `.` é transparente.

  ```js
  pinguim_parado: [
    '....0000....',
    '...055550...',
    ...
  ]
  ```

- **Por quê:** a arte fica versionada como texto, diffs legíveis, peso mínimo, sem ferramenta
  externa. Isso atende à decisão pendente do PRD, seção 8.
- **Ícones da instalação (M3):** ícones PNG são gerados a partir dessas matrizes por um script de
  desenvolvimento e commitados como arquivos.

## Áudio (`audio.js`)

- **Criação e desbloqueio:** `AudioContext` criado no primeiro `pointerup` (dedo saindo da
  tela). Em todo `pointerup`, se `state !== 'running'`, chama `resume()` (ADR-001, B2). No
  toque, só `pointerup` e `touchend` contam como gesto do usuário (HTML Standard); o
  `pointerdown` não conta.
- **Efeitos:** oscilador (quadrada, triangular) ou ruído com envelope curto. Um efeito é uma
  entrada de dados (`{onda, notas, duracao}`), não uma função por efeito.
- **Música (M3):** sequenciador simples que agenda as notas 0,1 s à frente, com um `setInterval`
  de 25 ms.
- **Volumes e mudo:** ganho da música abaixo do ganho dos efeitos; mudo por um `GainNode` mestre,
  com estado salvo.

## Salvamento (`salvar.js`)

- **Formato:** uma chave `aventura-pinguim` com JSON:

  ```js
  { versao: 1, som: true,
    modos: { diversao: { liberada: 1, carimbos: [false,false,false,false], recordes: [...] },
             aventura: { liberada: 1, carimbos: [...], recordes: [...] } } }
  ```

- **Falhas:** toda leitura e escrita fica em `try/catch`. Se o armazenamento falhar, o jogo
  segue com o estado em memória.
- **Nenhum dado pessoal.** O nome do jogador foi retirado no GATE 3.

## Dados das fases (`fases.js`)

Os modos e as fases são objetos. O código de `jogo.js` só interpreta esses dados.

```js
export const MODOS = {
  diversao: { assistencia: 12, sol: 0,  vidas: 0, ajudaApos: 3, velocidade: 1.0, ... },
  aventura: { assistencia: 4,  sol: 90, vidas: 3, ajudaApos: 0, velocidade: 1.4, ... },
};
export const FASES = [
  { nome: 'Baía Calma', ceu: 4, tijolos: { diversao: 10, aventura: 16 },
    fileiras: [ { vel: -0.35, blocos: [ [0, 56], [96, 56], [200, 56] ] }, ... ],
    peixes: { intervalo: 5 }, gaivotas: null, caranguejos: null, afundar: null, foca: null },
  ...
];
```

- **Unidades:** `vel` em px lógicos por passo. Blocos como `[x, largura]`. Todos os números
  "calibrar" do PRD vivem aqui.
- **Sorteio:** o que tiver aleatoriedade (peixes, gaivotas) usa um gerador com semente (mulberry32,
  ~5 linhas em `jogo.js`), para os testes serem reproduzíveis.

## Regras da fase (`cenas/jogo.js`)

- **Estados do Pinguinzinho:** `margem`, `bloco`, `pulando`, `nadando`, `entrando`.
- **Faixas lógicas:**
  - margem: y 0 a 36;
  - fileira *i* (0 a 3): y `36 + 24*i` a `60 + 24*i`;
  - mar: y 132 a 180.
- **Blocos:** andam `vel` por passo e dão a volta num mundo de x -64 a 384.
- **Pulo:**
  - dura 0,35 s;
  - arco visual por parábola;
  - x anda com a velocidade do bloco de origem mais a inclinação do toque (até 24 px, PRD);
  - no pouso, testa a sobreposição com os blocos da fileira de destino, com a margem de
    assistência do modo. Se houver bloco, pousa e ajusta x para dentro dele; se não, cai.
- **Tijolos:** cada fileira tem cor, branca ou azul. Pousar em fileira branca a deixa azul e soma
  1 tijolo. Com as 4 azuis, todas voltam a branco. Quando os tijolos atingem a meta, a porta
  aparece.
- **Entrada no iglu:** com a porta aberta e o Pinguinzinho na margem, ele anda sozinho até a porta. Isso
  leva ao estado `entrando` e depois à cena `concluida`.
- **Borda da tela:** com o Pinguinzinho sobre um bloco, x fica limitado a 8 a 312. Se o bloco deixar de
  estar sob ele, ele cai.
- **Linha divisória do toque:** `clamp(yPinguinzinho, 61, 119)` (PRD, seção 5).
- **Ganchos de teste:** `window.__jogo` expõe só leitura do estado (cena, estado do Pinguinzinho,
  tijolos, fileiras). O teste de conclusão da fase lê o estado e toca quando há bloco sob o
  destino. Não altera o jogo.

## Service worker (`sw.js`, M3)

- **Cache:** estratégia *cache-first*, com lista fixa dos arquivos do jogo e nome de cache com
  versão (`ap-v1`, `ap-v2` ...).
- **Atualização:** na instalação de uma versão nova, `skipWaiting` e remoção dos caches antigos. A
  versão nova vale na próxima abertura.
- **Rede:** nenhuma requisição fora da origem (não existe nenhuma para interceptar).

## Testes (`tests/`)

- **Playwright:** usa `@playwright/test` como devDependency e o Chromium pré-instalado. Emula
  Pixel 7 e Galaxy S em paisagem, com toque ligado. O servidor local é
  `python3 -m http.server`.
- **`jogo.spec.js`:** cobre os critérios do marco:
  - console sem erro;
  - zero requisições após o `load`;
  - aviso de retrato;
  - conclusão da fase por script;
  - capturas de tela.
- **`verificar.mjs`:**
  - soma o peso dos arquivos servidos;
  - procura `http(s)://` nos arquivos do jogo;
  - procura termos proibidos lidos da variável de ambiente `TERMOS_PROIBIDOS`, que nunca entra no
    repositório.
- **Como rodar:** `npm install` e depois `npm test` e `node tests/verificar.mjs`.
