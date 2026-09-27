# ADR-001: Plataforma, empacotamento, orientação e resolução

- **Status:** proposto, aguardando o GATE 2
- **Data:** 2026-09-27
- **Decisores:** mantenedor (aprovação); proposta técnica registrada aqui

## Contexto

- **Jogo:** "Aventura Pinguim", conceito B aprovado no GATE 1 (`brainstorm.md`). É um jogo 2D de
  quatro fileiras de blocos de gelo, com controle por toque em duas zonas (acima e abaixo do
  pinguim).
- **Aparelhos-alvo:** Samsung Galaxy A56 (6,7", 2340 × 1080, ~385 ppi) e Motorola moto g55
  (6,49", 2400 × 1080, ~405 ppi) (`referencias.md`, fontes 11 e 12). Os dois são Android. O
  navegador padrão do Samsung é o Samsung Internet; o do Motorola é o Chrome. iPhone não é alvo,
  mas o jogo deve ao menos rodar no iOS Safari.
- **Restrições do `CLAUDE.md`:**
  - sem rede em tempo de jogo;
  - sem CDN;
  - sem build e sem dependências até que um ADR justifique;
  - repositório público;
  - hospedagem pretendida em GitHub Pages;
  - manutenção quase zero.
- **Metas:**
  - peso total abaixo de 500 KB;
  - carregamento abaixo de 2 s em 4G;
  - funcionamento offline após a primeira visita.

## Opções

- **0. Hipótese:** web app estático em HTML + JavaScript (módulos ES nativos) + Canvas 2D, sem
  build e sem dependências de runtime. Publicado em GitHub Pages e instalável com manifest e
  service worker.
- **a. Mesma base com biblioteca de jogos vendorizada** (arquivo copiado para o repositório, não
  CDN). Candidatas: Phaser 4.2.1 e Kaplay 3001.0.19.
- **b. Empacotamento nativo** com Capacitor, gerando um APK Android (e iOS em tese), instalado
  por arquivo ou por loja de apps.
- **c. Artifact do claude.ai:** página HTML hospedada no claude.ai, privada por padrão e
  compartilhável por link.

## Critérios e avaliação

| Critério | 0. Estático puro | a. Biblioteca vendorizada | b. Capacitor/loja | c. Artifact claude.ai |
|---|---|---|---|---|
| Tempo até a 1ª fase jogável | Curto. O jogo usa pouco: loop, retângulos, toque, sprites. São ~300 a 500 linhas próprias | Parecido. Economiza o loop e o input, mas cobra o aprendizado da API; o áudio chiptune continua sendo nosso | Longo. Soma o SDK Android, Gradle e a assinatura de APK ao trabalho da opção 0 | Curto para protótipo |
| Peso total (alvo < 500 KB) | Estimado < 150 KB (código + sprites pequenos; o som é gerado) | **Phaser:** 1.376 KB minificado, 352 KB com gzip (medido). Sozinho estoura ou come o orçamento. **Kaplay:** ~189 KB antes do gzip (medido). Cabe | APK de alguns MB (não medido); irrelevante offline | Não controlado por nós |
| Offline | Sim, com service worker (Chrome Android 40+, iOS Safari 11.3+) [B1] | Sim, igual à 0 | Sim, nativo | **Não.** A página vive no claude.ai e depende de rede e da plataforma |
| Instalar no celular | "Adicionar à tela inicial" no Chrome e no Samsung Internet. Ícone próprio e abre sem barra do navegador | Igual à 0 | Instalar APK de "fontes desconhecidas" ou publicar em loja (conta paga e política para apps infantis) | Só atalho para uma página do claude.ai |
| Atualizar | Automática: o service worker baixa a versão nova na próxima abertura com rede | Igual à 0 | Rebuild, reassinatura e reinstalação a cada mudança | Republicar |
| Manutenção zero | **Sim.** Sem dependências; as APIs usadas são estáveis | Atualizações da biblioteca; versão presa envelhece | SDK, Gradle e política de loja mudam todo ano | Depende de produto de terceiro |
| Sem rede em tempo de jogo | Sim | Sim | Sim | Não garantido: a casca da página é do claude.ai |
| Viola regra do `CLAUDE.md`? | Não | Adiciona dependência sem necessidade | Exige build | Hospeda fora do repositório; perde offline |

Fontes das medições: tamanhos da Phaser e da Kaplay obtidos da CDN jsDelivr em 2026-09-27, só
para medir. Phaser: `phaser/dist/phaser.min.js` com `curl | wc -c` e `gzip -9`. Kaplay: tamanho
listado para `kaplay/dist/kaplay.js`.

### Compatibilidade de navegador

Dados da MDN browser-compat-data 8.1.3 (2026-09-24) [B1], exceto quando indicado.

| Tema | Chrome Android e Samsung Internet (alvos) | iOS Safari (não é alvo) | Decisão |
|---|---|---|---|
| Desbloqueio de áudio | Um `AudioContext` criado antes de um gesto do usuário nasce `suspended`; é preciso chamar `resume()` após o gesto [B2] | Contextos novos ficam suspensos até `resume()` numa ação do usuário [B1] | Criar e retomar o `AudioContext` no primeiro toque (a tela inicial exige um toque para começar) |
| Tela cheia | `requestFullscreen()` suportado (Chrome 71+, Samsung 10+) e exige gesto do usuário [B1][B3] | Só no iPad; **no iPhone não existe** [B1] | Instalado: `display: fullscreen` no manifest. No navegador: pedir tela cheia no primeiro toque; sem suporte, seguir sem |
| Orientação | Manifest `orientation` suportado (Chrome 39+, Samsung 4+). `screen.orientation.lock()` suportado, "normalmente só com tela cheia" [B1][B4] | Nem manifest nem `lock()` [B1] | Manifest com `landscape`. `lock('landscape')` após entrar em tela cheia. Em retrato: animação "gire o celular", sem texto |
| `touch-action` | `manipulation` desativa zoom por toque duplo; `none` desativa todos os gestos do navegador [B5] | Suportado desde 9.3 [B1] | `touch-action: none` na área de jogo |
| Pointer Events | Chrome 55+, Samsung 6+ [B1] | 13+ [B1] | Input só por Pointer Events, agindo no `pointerdown` (P2 de `referencias.md`) |
| Safe areas e entalhe | `env(safe-area-inset-*)` em Chrome 69+ e Samsung 10+ [B1] | 11+ [B1] | `viewport-fit=cover` e margens com `env()`. Se houver câmera em furo ou entalhe, em paisagem ele fica na lateral; os botões de pausa e som respeitam o recuo |
| Instalação | Critérios do Chrome: HTTPS; manifest com `name` ou `short_name`, ícones de 192 e 512 px, `start_url` e `display`; interação mínima com a página [B6] | "Adicionar à Tela de Início" manual | Manifest completo e ícones próprios em pixel art |

## Decisão

**Confirmo a hipótese (opção 0):**
- HTML, CSS e JavaScript com módulos ES nativos (`<script type="module">`) e Canvas 2D;
- sem build e sem dependências de runtime;
- publicado em GitHub Pages a partir da `main` (raiz);
- instalável com `manifest.webmanifest` e `sw.js` para funcionar offline.

**Motivos:**
- é a única opção que atende a todos os critérios sem violar nenhuma regra do `CLAUDE.md`;
- o conceito B é simples demais para justificar uma biblioteca: retângulos, quatro fileiras,
  dois toques;
- a Phaser sozinha estouraria o peso;
- a Kaplay caberia, mas traria dependência e API para aprender, sem economia real.

**Orientação: paisagem.**
1. No conceito B, as fileiras de blocos são horizontais e longas. Paisagem mostra mais bloco e dá
   mais tempo para decidir o pulo.
2. Deitado, a altura útil é de ~71 mm (A56) e ~67 mm (g55). Os dois polegares alcançam as zonas
   acima e abaixo do pinguim sem soltar o aparelho.
3. Sesame Workshop observou que pré-escolares seguram **tablets** deitados (`referencias.md`,
   P5). Isso é evidência fraca para celular e será confirmado no playtest.

**Resolução interna: 320 × 180 px lógicos (16:9), fixa.**
- A escala é inteira em **pixels físicos**: fator = o menor entre `floor(largura/320)` e
  `floor(altura/180)`, com mínimo 1.
- Desenho sem suavização (`imageSmoothingEnabled = false`, `image-rendering: pixelated`).
- **Tela cheia instalada:** 1080 / 180 = **6**. Cada pixel lógico vira 6 × 6 físicos, e o jogo
  ocupa 1920 × 1080.
- **No navegador, com barra visível:** a altura útil cai abaixo de 1080 e o fator provável é 5
  (1600 × 900). Vou medir no aparelho no M1.
- **Sobras laterais** (a tela é 19,5:9 ou 20:9, mais larga que 16:9): de 210 (A56) a 240 (g55) px físicos de
  cada lado, preenchidos com a cor de fundo do cenário.
- **Por que 320 × 180:**
  - 180 divide 1080 exatamente;
  - dá pixels grandes e nítidos no estilo NES/MSX;
  - cabe margem, 4 fileiras e mar com folga.
- **Alvos de toque em pixels físicos:** o toque é medido em pixels físicos, não lógicos. A ~385
  a 405 ppi, 2 cm ≈ 300 a 320 pixels físicos, o que equivale a ~50 px lógicos com fator 6 e
  ~60 px com fator 5.
  - As zonas "acima" e "abaixo" do pinguim são sempre maiores que isso.
  - Pausa e som terão ícone pequeno e área de toque de 2 cm no canto (`referencias.md`, P1).

## Consequências

**Positivas:**
- Publicar é um `git merge` na `main`. Não há passo de build nem dependência para atualizar.
- O jogo roda offline depois da primeira visita, e o peso estimado fica bem abaixo do orçamento.
- Os testes com Playwright usam só ferramenta de desenvolvimento. Ela fica em `node_modules/`
  (ignorado pelo git) e nunca é carregada pelo jogo.

**Negativas e riscos:**
- Loop, input, colisão, cenas e áudio são código nosso. Mitigação: o escopo do conceito B é
  pequeno, e `arquitetura.md` define um módulo por arquivo.
- Módulos ES não abrem via `file://`; para testar no desktop é preciso um servidor estático local
  (ex.: `python3 -m http.server`). Não afeta o celular.
- No iPhone não há tela cheia nem trava de orientação. O jogo roda, com a animação "gire o
  celular" se estiver em retrato. Aceitável, porque iPhone não é alvo.
- O `devicePixelRatio` real do A56 e do g55 não foi medido. Será conferido no M1 com uma
  sobreposição de diagnóstico; se divergir, o fator de escala muda, não o jogo.
- **Privacidade, ponto honesto:**
  - Ao **carregar** o site, o GitHub registra o IP do visitante por segurança [B7]. Isso acontece
    em qualquer hospedagem web e ocorre antes do jogo, não durante.
  - Depois do carregamento, o jogo não faz nenhuma requisição. O navegador só procura atualização
    do `sw.js` ao abrir o jogo com rede, também no próprio GitHub Pages.
  - A Etapa 7 verifica com Playwright que não há requisições após o carregamento.
- **GitHub Pages sem Jekyll:** coloco um arquivo `.nojekyll` na raiz. Ele indica que a branch não
  precisa de build [B8] e evita que o Jekyll ignore arquivos.

**Passo que só o mantenedor pode fazer (no M1):** em GitHub, repositório `pinguim-aventura`, abrir
**Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main`,
pasta `/ (root)` → Save** [B8].

## Fontes

- B1. MDN browser-compat-data 8.1.3 (2026-09-24), baixado de https://cdn.jsdelivr.net/npm/@mdn/browser-compat-data/data.json. Chaves consultadas: `api.ScreenOrientation.lock`, `api.Element.requestFullscreen`, `api.AudioContext.AudioContext`, `api.ServiceWorker`, `api.PointerEvent`, `css.properties.touch-action.manipulation`, `css.types.env.safe-area-inset-top`, `manifests.webapp.orientation`, `manifests.webapp.display`.
- B2. Chrome for Developers, "Autoplay policy in Chrome". https://developer.chrome.com/blog/autoplay
- B3. MDN, `Element.requestFullscreen()`. https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen
- B4. MDN, `ScreenOrientation.lock()`. https://developer.mozilla.org/en-US/docs/Web/API/ScreenOrientation/lock
- B5. MDN, `touch-action`. https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action
- B6. web.dev, "What does it take to be installable?". https://web.dev/articles/install-criteria
- B7. GitHub Docs, "About GitHub Pages" (registro de IP do visitante). https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages
- B8. GitHub Docs, "Configuring a publishing source for your GitHub Pages site". https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
