# Brainstorming (Etapa 2, GATE 1)

Três conceitos para o jogo, com comparação e recomendação. As referências e fontes estão em
`referencias.md` (P1 a P5 são as boas práticas numeradas lá).

## Premissas comuns aos três conceitos

- **Aparelhos:** Samsung Galaxy A56 e Motorola moto g55, ambos Android com tela de ~6,5" a 6,7".
- **Orientação:** os desenhos abaixo usam **paisagem**. Motivo preliminar: deitado, a altura útil
  da tela é de ~7 cm, e os dois polegares alcançam toda a área de toque. A decisão final fica no
  ADR (etapa 3).
- **Toque:** a ação acontece ao encostar o dedo (`pointerdown`), com som e resposta visual
  imediatos (P2). Zonas de jogo têm pelo menos 2 cm (~115 px CSS) e encostam na borda da tela
  (P1). Sem toque duplo, sem multitoque, sem arraste.
- **Princípio "toque onde você quer ir":** o jogador toca na região da tela para onde o pinguim
  deve ir. É fácil de demonstrar com uma mão fantasma e não exige ler (P3).
- **Botões fixos:** pausa no canto superior esquerdo e som no canto superior direito, cada um com
  2 cm, longe da borda de apoio (P5).
- **Ajuda:** demonstração animada no início de cada fase. Se o jogador ficar parado por 6 a 8 s,
  aparece uma seta brilhando com um som (P3, P4).
- **Palavras:** só poucas e sempre as mesmas ("VAI!", "BOA!", "FIM"), junto de ícone e som (P3).
- **Personalização:** nome do jogador opcional, digitado no jogo e salvo só no aparelho.
- **Dificuldade:** dois modos escolhidos por ícone. **Pinguim pequeno** é o do jogador de 6 anos;
  **pinguim grande**, o do jogador de 10.

Legenda dos desenhos: `(P)` é o pinguim, `[II]` a pausa, `[som]` o botão de som. A linha
pontilhada separa as zonas de toque.

---

## Conceito A: base Antarctic Adventure, "Corrida ao Polo"

**Loop central:** o pinguim corre sozinho por uma pista em pseudo-3D rumo à estação. O jogador
troca de faixa e pula para desviar de buracos e fendas e para pegar peixes.

### Controle por toque

```
+--------------------------------------------------------------+
|[II]            estacao ao longe no horizonte            [som]|
|                        /          \                          |
|                 ZONA PULAR (metade de cima)                  |
|                   toque aqui = pinguim pula                  |
|                  /                    \                      |
|- - - - - - - - - - - - - - - -+- - - - - - - - - - - - - - - |
|   ZONA ESQUERDA               |             ZONA DIREITA     |
|   toque = vai uma faixa       |      toque = vai uma faixa   |
|   para a esquerda            (P)          para a direita     |
|   (polegar esquerdo)          |       (polegar direito)      |
+--------------------------------------------------------------+
```

- A pista tem 3 faixas discretas: cada toque move uma faixa, sem precisar segurar o dedo.
- A velocidade é automática. Não há botão de acelerar nem de frear: isso seria uma quarta zona.

### As 4 fases

| Fase | Cenário | Novidade mecânica | Obstáculo | Recompensa |
|---|---|---|---|---|
| 1 | Planície Branca, dia claro | Trocar de faixa | Buracos no gelo; focas espiam e acenam | Peixes que saltam; bandeira na estação |
| 2 | Vale das Fendas | Pular | Fendas que cruzam a pista toda, mais buracos | Peixe dourado no ar sobre as fendas |
| 3 | Colinas com neve caindo leve | Curvas: a pista puxa para o lado | Focas que mudam de buraco | 3 bandeirinhas escondidas (desafio) |
| 4 | Noite de aurora | Rampas de gelo: voo longo | Tudo junto, mais rápido | Chegada à colônia e festa final |

### Jogador de 6 anos e jogador de 10 anos

- **6 anos:** sem relógio (um sol decorativo marca o progresso). Tropeçar faz o pinguim rolar e
  levantar em 1 s, sem perder nada. Os peixes são puxados de leve para o pinguim ("ímã").
- **10 anos:** relógio com recorde de tempo por fase. Percorrer um trecho sem tropeçar acelera o
  pinguim (risco e recompensa sem botão extra). Placar com peixes, bandeirinhas e tempo; medalha
  de ouro, prata ou bronze por fase.

### O que tende a frustrar

- Leitura de profundidade em baixa resolução: o obstáculo parece pequeno até chegar perto.
- Pular cedo ou tarde demais é comum em pseudo-3D para quem tem 6 anos.
- Nas curvas (fase 3), a sensação de perder o controle.
- O cenário de pista tende a parecer igual entre as fases.

### Custo: médio

- É preciso desenhar a pista em perspectiva, escalar os sprites (4 tamanhos pré-desenhados por
  objeto) e ordenar por profundidade.
- A técnica é conhecida, mas a arte em vários tamanhos dobra o trabalho de sprites.
- A colisão depende da profundidade, o que torna o ajuste fino mais demorado.

---

## Conceito B: base Frostbite, "Iglu no Gelo"

**Loop central:** o pinguim pula entre quatro fileiras de blocos de gelo que deslizam. Cada bloco
branco pisado fica azul e põe um tijolo no iglu da margem; com o iglu pronto, o pinguim entra.

### Adaptações de coerência

- **Iglu:** mantido, como fantasia (o pinguim constrói sua casinha de gelo).
- **Urso-polar:** substituído. Não existe urso na Antártida (ver `referencias.md`). No lugar entra
  a **foca-dorminhoca**, que rola na margem na frente do iglu. Encostar nela só faz o pinguim
  quicar de volta.
- **Inimigos:** passam a ser personagens travessos, não perigosos. Aves viram **gaivotas
  travessas** que dão um empurrãozinho. Caranguejos viram **caranguejos dançarinos** que andam
  sobre os blocos. Não há mariscos (evita "mordida").
- **Temperatura:** trocada pelo **pôr do sol**. Frio não ameaça um pinguim. A meta passa a ser
  terminar o iglu antes de anoitecer.
- **Cair na água não é morte:** pinguim nada. Ele dá um mergulho, faz *splash* e nada de volta
  para a margem em ~1,5 s. É falha suave e coerente com o personagem.

### Controle por toque

```
+--------------------------------------------------------------+
|[II]    margem:  IGLU [#][#][#][ ][ ][ ][ ][ ]           [som]|
|==============================================================|
|  ZONA DE CIMA: toque acima do pinguim = pula uma fileira     |
|  para cima (o ponto tocado inclina o pulo para o lado)       |
|   <<==   [=====]        [=====]          [=====]   fileira 1 |
|   ==>>        [=====]         [==(P)==]            fileira 2 |
|- - - - - - - - - - - - - - (altura do pinguim) - - - - - - - |
|   <<==   [=====]        [=====]          [=====]   fileira 3 |
|   ==>>        [=====]         [=====]              fileira 4 |
|  ZONA DE BAIXO: toque abaixo do pinguim = pula para baixo    |
|~~~~~~~~~~~~~~~~~~~~~~~~~~~~ mar ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|
+--------------------------------------------------------------+
```

- A divisão das zonas acompanha a altura do pinguim, e cada zona tem pelo menos ~2,5 cm.
- Tocar mais à esquerda ou à direita inclina o pulo em diagonal. O jogador de 6 anos nem precisa
  saber disso: tocar "em cima" ou "embaixo" já funciona.
- Se o bloco levar o pinguim até a borda da tela, ele anda sozinho sobre o bloco para não sair.
  Se o bloco acabar debaixo dele, ele cai e nada.

### As 4 fases

| Fase | Cenário | Novidade mecânica | Obstáculo | Recompensa |
|---|---|---|---|---|
| 1 | Baía Calma, manhã | Pular para cima e para baixo | Nenhum além do mar; blocos longos e lentos | Peixes nadando entre as fileiras; iglu pequeno |
| 2 | Correnteza, tarde | Fileiras com velocidades diferentes; blocos mais curtos | Gaivotas travessas que empurram | Peixe dourado |
| 3 | Gelo Fino, entardecer | Blocos que afundam e voltam (piscam antes) | Caranguejos dançarinos sobre os blocos | 3 estrelas-do-mar escondidas (desafio) |
| 4 | Noite de aurora | Foca-dorminhoca rolando na frente do iglu: esperar o momento de entrar | Tudo junto | Iglu grande e festa final com a colônia |

### Jogador de 6 anos e jogador de 10 anos

- **6 anos:**
  - Sem pôr do sol, blocos largos e lentos.
  - Assistência de pouso: um pulo que cairia perto de um bloco "gruda" nele.
  - Cair na água não tira tijolo.
  - Gaivotas só fazem o pinguim balançar, sem derrubar.
  - Após 3 quedas seguidas no mesmo ponto, os blocos ficam mais largos por um tempo (P4).
- **10 anos:**
  - Pôr do sol como relógio, com bônus pelo tempo que sobrar.
  - Cair custa 1 tijolo.
  - Gaivotas derrubam.
  - Três "peixes de vida": ao perder os três, recomeça **a fase**, não o jogo.
  - Placar com peixes, estrelas-do-mar e tempo; medalha por fase.
  - Na fase 4, pulo em diagonal necessário para pegar as estrelas.

### O que tende a frustrar

- Esperar o bloco certo passar pode entediar o jogador de 6 anos. Mitigação: blocos longos e
  assistência de pouso.
- Cair várias vezes seguidas. Mitigação: a regra das 3 quedas e o nado divertido.
- O empurrão da gaivota pode parecer injusto. Mitigação: ela avisa com um grasnado e uma sombra
  antes.
- A tela de fileiras é sempre parecida. Mitigação: cenário e hora do dia mudam por fase.

### Custo: baixo

- 2D plano, com colisão por retângulos.
- As fileiras são listas de blocos com velocidade: dados, não código.
- Um só tamanho por sprite.
- O maior trabalho é calibrar a dificuldade, e isso vale para qualquer conceito.

---

## Conceito C: fusão, "Grande Viagem"

**Loop central:** as fases alternam entre correr pela pista (modo A) e atravessar a baía pulando
blocos para construir o iglu (modo B), numa viagem contínua até a colônia.

### Controle por toque

Os dois esquemas acima (A nas fases 1 e 3, B nas fases 2 e 4), ligados pelo mesmo princípio
"toque onde você quer ir". Nos dois modos, tocar em cima leva o pinguim "para cima": no A, um
pulo; no B, a fileira de cima. A diferença está embaixo:

```
Modo corrida (fases 1 e 3)            Modo blocos (fases 2 e 4)
+----------------------------+        +----------------------------+
|[II]      PULAR        [som]|        |[II]  CIMA: sobe       [som]|
|- - - - - - - + - - - - - - |        |- - - - - (P) - - - - - - - |
| ESQUERDA    (P)    DIREITA |        |  BAIXO: desce              |
+----------------------------+        +----------------------------+
```

### As 4 fases

| Fase | Modo | Cenário | Novidade mecânica | Obstáculo | Recompensa |
|---|---|---|---|---|---|
| 1 | Corrida | Planície Branca | Trocar de faixa | Buracos com focas | Peixes; chegada à baía |
| 2 | Blocos | Baía Calma | Pular fileiras | Mar; gaivotas na segunda metade | Iglu pequeno |
| 3 | Corrida | Vale das Fendas | Pular fendas; rampas | Fendas e buracos | Peixe dourado; chegada ao mar da aurora |
| 4 | Blocos | Noite de aurora | Blocos que afundam | Caranguejos, foca-dorminhoca | Iglu grande e festa final |

### Jogador de 6 anos e jogador de 10 anos

A soma das regras de A e B: no modo do jogador de 6 anos, sem relógio, com assistência e sem
perda. No modo do jogador de 10 anos, com relógio, perda leve, placar e coletáveis de desafio.

### O que tende a frustrar

- Trocar de regra entre as fases: a metade de baixo ora muda de faixa, ora desce de fileira. Isso
  pode confundir o jogador de 6 anos no começo de cada fase. Mitigação: demonstração obrigatória
  na primeira vez.
- Se uma criança gostar muito de um modo e pouco do outro, metade do jogo vira obstáculo.
- Duas curvas de dificuldade para calibrar no playtest, com metade das fases de cada modo.

### Custo: alto

- Dois motores de jogo (pseudo-3D e 2D plano), dois conjuntos de arte e duas calibrações.
- Dobram também os testes automatizados de conclusão de fase.
- A base comum (loop, cenas, toque, som, salvamento) é compartilhada. Estimativa: ~1,7 vez o
  esforço de B.

---

## Tabela comparativa

As notas de diversão são estimativas nossas (opinião) e serão testadas no playtest.

| Critério | A: Corrida ao Polo | B: Iglu no Gelo | C: Grande Viagem |
|---|---|---|---|
| Diversão estimada, jogador de 6 anos | Alta (velocidade, controle trivial) | Média-alta (depende da assistência de pouso) | Alta (variedade) |
| Diversão estimada, jogador de 10 anos | Média (decisão rasa, repetitivo) | Alta (tempo, fileira, diagonal, coletáveis) | Alta |
| Clareza do toque | Alta (3 zonas fixas) | Alta (2 zonas: acima e abaixo do pinguim) | Média (dois esquemas) |
| Risco técnico | Médio (legibilidade do pseudo-3D em baixa resolução) | Baixo | Médio-alto |
| Esforço | Médio | Baixo | Alto (~1,7 vez B) |

## Recomendação: conceito B, "Iglu no Gelo"

1. **Jogador de 6 anos (principal):**
   - A cada toque há uma decisão só, "cima ou baixo", tomada numa zona grande (P1, P2).
   - O iglu crescendo tijolo a tijolo dá retorno positivo constante e visível (P4).
   - A queda vira nado, uma falha suave que combina com o personagem e evita susto.
2. **Jogador de 10 anos:**
   - O loop do Frostbite tem mais decisões (quando pular, para qual fileira, em diagonal, desviar
     da gaivota, correr contra o pôr do sol).
   - Oferece desafio real sem nenhum botão extra.
3. **Custo e risco menores:**
   - O M1 chega mais cedo ao celular.
   - Sobra esforço para o que dá a cara de anos 80: pixel art bem feita, animação e trilha
     chiptune.
   - Em 2D plano a arte fica nítida na resolução baixa. O pseudo-3D é o maior risco de
     legibilidade para o jogador de 6 anos.
4. **O que B perde:** a sensação de velocidade do conceito A.
   - Se o playtest mostrar que isso faz falta, dá para acrescentar uma corrida como fase bônus
     depois da v1.0.
   - Isso fica fora do escopo inicial e seria decidido por você.

**Discordância registrada com a hipótese do prompt:** a fusão (C) é a opção mais divertida no
papel, mas custa ~1,7 vez mais. Ela também obriga o jogador de 6 anos a trocar de regra a cada
fase. Pela regra "a solução mais simples que entregue um jogo divertido e estável", eu não
começaria por C. Se você preferir C mesmo assim, a ordem sugerida é:
- M1 com o modo blocos (fase 2);
- M2 com o modo corrida.

## Sugestões de nome

Nenhum nome copia os originais: não uso "Penta", "Pentarou", "Frostbite Bailey" nem "Pingu".
Também não foi feita busca de registro de marca. O risco é baixo para uso doméstico, e dá para
fazer uma busca simples depois da escolha.

| Jogo | Pinguim |
|---|---|
| **Pulo no Polo** | **Picolé** |
| **Rumo ao Iglu** | **Tobogã** (pinguins deslizam de barriga no gelo) |
| **Pinguim Aventura** (nome atual do repositório) | **Farofa** |

## Decisões pedidas no GATE 1

1. Conceito: A, B (recomendado) ou C.
2. Nome do jogo e do pinguim: uma das sugestões ou outro.
3. **Alvos de toque:** adotar 2 cm (~115 px CSS) como mínimo, no lugar dos 64 px CSS do
   `CLAUDE.md`, que medem ~11 mm nesses aparelhos (ver `referencias.md`, P1). Proponho ajustar o
   `CLAUDE.md` na mesma linha.

## Decisão do GATE 1 (aprovada pelo mantenedor em 2026-09-27)

1. **Conceito: B**, "Iglu no Gelo" (base Frostbite), com as adaptações descritas acima.
2. **Nomes:** jogo **Aventura Pinguim**; pinguim **Pipo**.
3. **Alvos de toque:** mínimo de **2 cm** (~115 px CSS nos aparelhos-alvo). O `CLAUDE.md` foi
   ajustado.
