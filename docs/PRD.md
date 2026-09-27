# PRD: Aventura Pinguim

- **Status:** proposto, aguardando o GATE 3
- **Data:** 2026-09-27
- **Base:**
  - conceito B aprovado no GATE 1 (`brainstorm.md`);
  - plataforma e orientação aprovadas no GATE 2 (`adr-001-plataforma.md`);
  - boas práticas P1 a P5 de `referencias.md`.

Números marcados como **(calibrar)** são pontos de partida e serão ajustados no playtest. Eles
ficam nos dados das fases, não no código.

## 1. Visão

Um jogo de celular em estilo anos 80 em que o pinguim Pipo pula entre blocos de gelo para
construir seu iglu. É feito para que o jogador de 6 anos termine sozinho e o de 10 anos queira
bater os próprios recordes.

## 2. Público e personas

| Persona | Perfil | Precisa de | Modo |
|---|---|---|---|
| Jogador de 6 anos (principal) | Lê algumas palavras simples. Segura o celular com as duas mãos. Motricidade fina em formação | Sucesso frequente, zonas de toque enormes, nenhum susto e nenhuma perda de progresso. Instruções por imagem e som | **Filhote** (ícone de pinguim pequeno) |
| Jogador de 10 anos | Lê bem. Quer desafio e comparar resultados | Relógio, placar, medalhas, coletáveis escondidos e risco real de errar, sem castigo longo | **Aventureiro** (ícone de pinguim grande) |
| Pai (operador) | Desenvolvedor, instala e atualiza | Instalar pela tela inicial, jogo offline, zero manutenção, silenciar e apagar recordes sem ajuda | Nenhum; usa telas de ajuste |

Os dois jogadores revezam o mesmo aparelho. Cada modo guarda os próprios recordes.

## 3. Escopo

**Dentro:**
- 4 fases com final comemorativo;
- 2 modos de dificuldade;
- controle só por toque (teclado apenas para testes no desktop);
- pixel art original;
- efeitos e músicas chiptune gerados por Web Audio;
- recordes locais;
- instalação na tela inicial e funcionamento offline;
- nome do jogador opcional, digitado no jogo e salvo só no aparelho.

**Fora (não-objetivos):**
- multiplayer simultâneo, contas, nuvem, sincronização entre aparelhos;
- anúncios, compras, links externos, analytics, qualquer rede em tempo de jogo;
- modo corrida estilo Antarctic Adventure (candidato a fase bônus depois da v1.0, se o playtest
  pedir);
- iPhone e iPad como alvo: vale só o melhor esforço, sem tela cheia nem trava de orientação;
- narração por voz (gravada ou sintetizada), tradução, editor de fases;
- fotos, vozes ou qualquer dado das crianças.

## 4. Loop de jogo e regras

### Loop

1. Pipo começa na **margem** (faixa de cima, onde fica o iglu).
2. Abaixo dela há **4 fileiras** de blocos de gelo deslizando, em sentidos alternados, e o mar.
3. O jogador toca **acima** ou **abaixo** do Pipo para pular uma fileira para cima ou para baixo.
4. Pousar numa fileira **branca** faz a fileira inteira ficar **azul** e acrescenta **1 tijolo**
   ao iglu, com som de "plim" e o tijolo voando até o iglu. Pousar numa fileira azul não dá
   tijolo.
5. Quando as 4 fileiras estão azuis, todas voltam a ficar brancas.
6. Com o iglu completo, aparece a **porta** brilhando. Pipo volta à margem e entra sozinho no
   iglu, e a fase termina.

### Regras de movimento

- **Direção do pulo:**
  - O pulo é sempre para a fileira vizinha.
  - A posição horizontal do toque inclina o pulo, no máximo **24 px lógicos** para o lado
    (calibrar).
  - Tocar exatamente acima do Pipo gera um pulo reto.
- **Margem:** na margem, tocar na própria faixa da margem faz o Pipo andar até aquele ponto.
  Tocar abaixo faz o Pipo pular para a fileira 1.
- **Borda da tela:** se o bloco levar o Pipo até a borda, ele anda sobre o bloco para ficar na
  tela. Se o bloco acabar debaixo dele, ele cai.
- **Queda na água:** mergulho com *splash*, depois Pipo nada de volta até a margem (~1,5 s). Não
  é morte.
- **Toques extras:**
  - Toques durante um pulo são ignorados, exceto nos últimos 150 ms: o toque fica guardado e é
    executado ao pousar.
  - Um toque repetido a menos de 120 ms do anterior é ignorado (P2, *holdover*).

### Regras por modo

| Regra | Filhote (6 anos) | Aventureiro (10 anos) |
|---|---|---|
| Relógio | Nenhum. O sol é só decorativo | **Pôr do sol:** 90 s por fase (calibrar). Se o sol se põe, a fase recomeça |
| Queda na água | Sem perda | Perde 1 **peixe-vida** (3 por fase). Sem peixes-vida, a fase recomeça |
| Game over | **Não existe** | Não existe game over do jogo. O pior caso é recomeçar a fase atual |
| Assistência de pouso | Um pulo que cairia até 12 px de um bloco "gruda" nele (calibrar) | 4 px (calibrar) |
| Blocos | Longos e lentos | Mais curtos e mais rápidos |
| Ajuda automática | Após 3 quedas seguidas, os blocos alargam 50% por 20 s e aparece uma seta brilhando | Não |
| Dica por inatividade | Após 7 s parado, a mão fantasma mostra onde tocar (P4) | Após 7 s parado, a mão fantasma mostra onde tocar (P4) |
| Gaivota | Só balança o Pipo | Empurra: se ele sair do bloco, cai |
| Caranguejo | Encostar faz os dois "dançarem" 0,5 s, sem perda | Empurra o Pipo para o lado; pode derrubá-lo |
| Tijolos do iglu por fase | 10 / 12 / 14 / 16 (calibrar) | 16 / 16 / 16 / 16 (calibrar) |

### Pontuação

Todos os valores abaixo são para calibrar.

| Evento | Pontos |
|---|---|
| Tijolo | 10 |
| Peixe comum (nada ao longo das fileiras; pega-se ao encostar) | 50 |
| Peixe dourado (1 por fase, a partir da fase 2) | 200 |
| Estrela-do-mar (3 escondidas por fase, nas fases 3 e 4) | 300 |
| Bônus de sol (Aventureiro: segundos restantes × 10) | variável |

- **Medalhas (Aventureiro):**
  - bronze: concluir;
  - prata: concluir com pelo menos 30 s de sol;
  - ouro: prata e todas as estrelas-do-mar da fase (nas fases 1 e 2, ouro é prata sem cair).
- **Filhote:** sem medalhas nem pontuação que "reprove". Cada fase concluída ganha um
  **carimbo do Pipo** no mapa. Os peixes aparecem como contagem de ícones mais o número, o que
  ajuda a reconhecer numerais (P3).

## 5. Controles por toque

Tela em paisagem, 320 × 180 px lógicos. As medidas são aproximadas.

```
+--------------------------------------------------------------+
|[II]  sol/lua          IGLU [#][#][#][ ][ ]    peixes    [som]|  margem
|      ZONA "ACIMA" = tudo acima da linha divisória            |  (y 0 a 36)
|==============================================================|
|   <<==   [======]        [======]          [======]          |  fileira 1
|   ==>>        [======]         [==(Pipo)==]                  |  fileira 2
|- - - - - - - - - - - (linha divisória) - - - - - - - - - - - |
|   <<==   [======]        [======]          [======]          |  fileira 3
|   ==>>        [======]         [======]                      |  fileira 4
|      ZONA "ABAIXO" = tudo abaixo da linha divisória          |
|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ mar ~~~~~~~~~~~~~~~~~~~~~~~~~~~~|  (y 132 a 180)
+--------------------------------------------------------------+
```

- **Faixas da tela:** margem de y 0 a 36, 4 fileiras de 24 px de y 36 a 132, e mar de y 132 a
  180.
- **Linha divisória:** fica na altura do Pipo, limitada ao intervalo de y 61 a 119. Assim cada
  zona tem pelo menos 61 px lógicos, o que dá ≥ 2 cm tanto na escala 6 quanto na 5 (ADR-001).
  - Na maior parte do tempo, "acima do Pipo" e "abaixo do Pipo" valem literalmente.
  - Só perto da margem e da fileira 4 existe uma faixa estreita em que a zona segue a linha
    limitada, não a posição do Pipo.
- **Cobertura:** as duas zonas cobrem a tela inteira, inclusive as sobras laterais fora da imagem
  de 320 × 180.
- **Botões fixos:** `[II]` pausa e `[som]` silenciar, nos cantos superiores. O ícone é pequeno,
  mas a área de toque é um quadrado de **2 cm** encostado no canto. Nessa área o toque aciona o
  botão, não o pulo.
- **Momento do toque:** a ação acontece em `pointerdown`. Não há toque duplo, multitoque nem
  arraste (P2). Com dois dedos ao mesmo tempo, vale só o primeiro.
- **Teclado (só desktop):** setas cima e baixo pulam; esquerda e direita inclinam; Esc pausa;
  M silencia.

## 6. As 4 fases

| # | Cenário | Mecânica nova | Obstáculos | Coletáveis | Duração-alvo (opinião, calibrar) | Critério de conclusão |
|---|---|---|---|---|---|---|
| 1 | Baía Calma, manhã | Pular para cima e para baixo; tijolos | Só o mar; blocos longos e lentos | Peixes | 2 a 3 min | Iglu completo e Pipo entra |
| 2 | Correnteza, tarde | Fileiras com velocidades diferentes; blocos mais curtos | Gaivotas travessas (sombra e grasnado 1 s antes do mergulho) | Peixes e 1 peixe dourado | 2 a 3 min | Igual |
| 3 | Gelo Fino, entardecer | Blocos que afundam por 1,5 s e voltam; piscam 1 s antes | Caranguejos dançarinos andando sobre blocos | Peixes e 3 estrelas-do-mar | ~3 min | Igual |
| 4 | Noite de Aurora | Foca-dorminhoca rolando na margem na frente do iglu; esperar a vez de entrar | Gaivotas e caranguejos; poucos blocos afundando | Peixes, 1 peixe dourado e 3 estrelas-do-mar | 3 a 4 min | Igual, e depois vem a tela final |

- **Foca-dorminhoca:** encostar nela faz Pipo quicar para trás, sem perda. Ela nunca bloqueia a
  porta por mais de 3 s.
- **Progressão:** a fase seguinte é desbloqueada ao concluir a anterior. Fases já concluídas
  podem ser rejogadas no mapa.

## 7. Telas e fluxo

```
Abertura -> Escolha do jogador -> Mapa -> [Demonstração] -> Jogo -> Fase concluída -> Mapa ...
                                                             |                          |
                                                          Pausa            (após fase 4) Final -> Recordes -> Mapa
```

| Tela | Conteúdo | Interação |
|---|---|---|
| Abertura | Título "AVENTURA PINGUIM" em fonte pixel, Pipo animado, música-tema | Um botão ▶ grande. O primeiro toque libera o áudio, pede tela cheia e trava paisagem (ADR) |
| Escolha do jogador | Dois cartões grandes: pinguim pequeno (Filhote) e pinguim grande (Aventureiro). Abaixo de cada um, o nome, se houver | Tocar no cartão. Um ícone de lápis abre um campo para digitar o nome (opcional, até 10 letras, salvo só no aparelho) |
| Mapa | 4 ilhas ligadas por um caminho; cadeado nas bloqueadas; carimbo ou medalha nas concluídas. Botões de voltar e de recordes | Tocar numa ilha |
| Demonstração | Na primeira vez em cada fase: mão fantasma toca acima e abaixo e Pipo pula; depois a palavra "VAI!" com som | Qualquer toque pula a demonstração |
| Jogo | Seção 5 | Seção 5 |
| Pausa | Jogo congelado e escurecido; 3 ícones grandes: ▶ continuar, ↻ recomeçar, mapa | Recomeçar e mapa pedem confirmação com ✔ verde e ✘ vermelho (Sesame) |
| Fase concluída | Pipo entra no iglu, fanfarra, tijolos e peixes contados com "plim", medalha ou carimbo, palavra "BOA!" | ▶ próxima fase, ou mapa |
| Final | A colônia faz festa na aurora com o iglu gigante; música de festa; palavra "FIM" | ▶ vai para os recordes |
| Recordes | Por modo e por fase: medalha, peixes, pontos e melhor tempo (Aventureiro) | Apagar recordes: botão de lixeira que exige **segurar 3 s**. É proteção para adulto; a criança nunca precisa desse gesto |
| Aviso de retrato | Celular desenhado girando para deitado, sem texto | Some ao girar |

Se o app for para segundo plano (`visibilitychange`), o jogo pausa sozinho.

## 8. Direção de arte

### Resolução e estilo

- 320 × 180 lógicos, escala inteira, sem suavização (ADR-001).
- Contorno escuro de 1 px nos personagens.
- Céu em faixas com *dithering* de 2 cores, como no NES.

### Paleta própria de 16 cores

| # | Hex | Uso |
|---|---|---|
| 0 | `#0B0E1A` | Contorno, noite |
| 1 | `#1D2B53` | Mar profundo, céu noturno |
| 2 | `#2A5FA8` | Mar |
| 3 | `#5B8FD9` | Bloco pisado (azul) |
| 4 | `#9FD8F5` | Sombra do gelo, céu de manhã |
| 5 | `#F4F8FF` | Bloco branco, neve, barriga do Pipo |
| 6 | `#C9D6E8` | Sombra da neve |
| 7 | `#FFD23F` | Sol, peixe dourado, destaque de dica (P3) |
| 8 | `#FF8C42` | Bico e pés do Pipo, entardecer |
| 9 | `#E84855` | Caranguejo, peixe-vida |
| 10 | `#7B2D8B` | Aurora, céu do entardecer |
| 11 | `#3BCEAC` | Aurora, peixes comuns |
| 12 | `#6BE36B` | Aurora |
| 13 | `#8A6A4F` | Pedras da margem |
| 14 | `#6B7280` | Foca, gaivota |
| 15 | `#FF9EC7` | Bochecha do Pipo, festa |

- **Branco contra azul:** a diferença entre bloco branco (5) e bloco pisado (3) está também no
  **brilho**, não só no matiz. O bloco pisado ganha ainda uma marca de pegada, para não depender
  só de cor.

### Sprites e animações

Os tamanhos estão em px lógicos. A arte será original, desenhada em código (matrizes de
caracteres convertidas em imagem na carga) ou em PNG próprio; a escolha fica em
`arquitetura.md`.

| Sprite | Tamanho | Animações (quadros) |
|---|---|---|
| Pipo | 16 × 16 | Parado (2), pulo (3), pouso (1), nado (4), balanço (2), dança (4), andar (2), entrar no iglu (3), comemorar (4) |
| Bloco de gelo | 8 × 10 por segmento; comprimento variável | Branco, azul com pegada, piscando (2), afundando (3) |
| Iglu | Tijolos 8 × 6; porta 10 × 12 | Tijolo chegando (3), porta brilhando (2) |
| Mar | Blocos de 16 × 8 | Ondas (2) |
| Peixe comum e dourado | 10 × 6 | Nadar (2), salto (2), brilho do dourado (2) |
| Estrela-do-mar | 8 × 8 | Brilho (2) |
| Gaivota e sombra | 16 × 10 | Voo (2), mergulho (1), grasnado (1) |
| Caranguejo | 12 × 8 | Andar (2), dançar (2) |
| Foca-dorminhoca | 24 × 12 | Dormir com "Zz" (2), rolar (4) |
| Sol, lua, aurora | Sol 16 × 16; aurora em faixas | Aurora ondulando (4) |
| Colônia (final) | 16 × 16, 3 variações | Dança (2) |
| Ícones de interface | 12 × 12 a 24 × 24 | ▶, pausa, som ligado e desligado, ↻, mapa, cadeado, ✔, ✘, lápis, lixeira, troféu, 3 medalhas, carimbo, mão fantasma (2), seta de dica (2), celular girando (4) |
| Fonte pixel própria | 5 × 7 | Maiúsculas, dígitos e as letras das palavras usadas |

## 9. Direção de som

Tudo é sintetizado com Web Audio: ondas quadrada, triangular e ruído. Não há arquivos de áudio.

**Efeitos:**
- toque registrado ("tic" curto);
- pulo;
- pouso em bloco branco ("plim") e tijolo chegando ("toc");
- pouso em bloco azul ("tuc");
- *splash*, nado (bolhas), sair da água;
- peixe (bip ascendente), peixe dourado (arpejo), estrela-do-mar (brilho);
- gaivota (grasnado de aviso), caranguejo (clique), foca (ronco);
- bloco piscando (aviso);
- porta aparecendo, entrar no iglu, fanfarra de fase concluída, medalha, carimbo;
- dica (sininho), pausa, botões de menu, "VAI!" (acorde);
- sol se pondo (Aventureiro), perda de peixe-vida (som descendente suave, sem susto).

**Músicas:**
- tema da abertura;
- música de fase (uma por fase ou uma com 4 variações de andamento e tom);
- jingle de fase concluída;
- música do final (festa).

**Regras:**
- Botão de silenciar sempre visível no jogo e na abertura. O estado fica salvo no aparelho.
- Música mais baixa que os efeitos (P4).
- Sem sons altos ou repentinos: o volume máximo dos efeitos é limitado.

## 10. Requisitos não funcionais

| Requisito | Meta | Como verificar |
|---|---|---|
| Desempenho | 60 atualizações de lógica por segundo em passo fixo; sem quedas perceptíveis no A56 e no g55 (as telas são de 120 Hz; o desenho acompanha o `requestAnimationFrame`) | Contador de quadros no modo de diagnóstico, **no aparelho** (feito pelo mantenedor) |
| Carregamento | Abaixo de 2 s em 4G | Peso total mais o perfil "4G" do Playwright com limitação de rede |
| Peso | ≤ 500 KB no total, meta de ≤ 150 KB | Script soma os bytes de todos os arquivos servidos |
| Offline | Funciona após a primeira visita | Playwright: visitar, ficar offline, recarregar |
| Rede em tempo de jogo | Zero requisições após o carregamento | Log de requisições no Playwright |
| Compatibilidade | Chrome Android e Samsung Internet atuais; iOS Safari em melhor esforço | Emulação Playwright e teste no aparelho |
| Bateria | Loop parado quando pausado ou em segundo plano | Teste: `visibilitychange` pausa o loop |

## 11. Segurança, privacidade e propriedade intelectual

- **Nenhum dado sai do aparelho:**
  - sem analytics, anúncios, compras, contas, links externos, fontes ou bibliotecas de CDN;
  - tudo é servido pelo próprio GitHub Pages;
  - o carregamento do site registra o IP no GitHub, como qualquer hospedagem (ADR-001);
  - depois disso, nenhuma requisição.
- **`localStorage` guarda só:** modo escolhido, nome opcional, recordes, fases desbloqueadas e
  estado do som. Nada disso sai do aparelho.
- **Repositório público:**
  - nenhum nome, foto ou voz das crianças no código, nos commits, nos docs ou nas issues;
  - anotações de playtest ficam no Drive do mantenedor;
  - o PRD usa "jogador de 6 anos" e "jogador de 10 anos".
- **Propriedade intelectual:**
  - nome ("Aventura Pinguim"), personagem ("Pipo"), arte, música e textos são originais;
  - nada de sprites, trilhas, logotipos, textos ou nomes de Antarctic Adventure ou Frostbite (ex.:
    "Penta", "Frostbite Bailey");
  - a inspiração se limita às mecânicas: pular entre fileiras e construir o iglu.
- **Licença:** a definir no README na Etapa 9. Sugestão: MIT para o código e CC BY 4.0 para a
  arte e o som.

## 12. Critérios de aceite

### Globais

| # | Critério | Verificação |
|---|---|---|
| G1 | O jogo carrega sem erro nem aviso no console em emulação de Pixel 7 e Galaxy S (toque ligado) | Playwright |
| G2 | Peso total ≤ 500 KB | Script |
| G3 | Zero requisições de rede após o evento `load`, incluindo 60 s de jogo | Playwright |
| G4 | Após a primeira visita, recarregar offline abre o jogo e permite jogar a fase 1 | Playwright |
| G5 | Toda área de toque tem ≥ 2 cm no A56 e no g55, pela densidade e pela escala medidas | Teste com a escala exposta pelo modo de diagnóstico e conferência no aparelho |
| G6 | Nenhum nome ou dado pessoal no repositório | `grep` com uma lista de termos mantida **fora** do repositório (variável de ambiente local) |
| G7 | Nenhuma URL externa carregada pelo código do jogo | `grep` por `http` nos arquivos servidos, mais G3 |
| G8 | Nenhum som antes do primeiro toque; o botão de silenciar funciona e persiste | Playwright, pelo estado do `AudioContext` e do `localStorage` |
| G9 | Em retrato aparece o aviso "gire o celular"; em paisagem, o jogo | Playwright |
| G10 | O jogo pausa sozinho ao ir para segundo plano | Playwright |
| G11 | Todas as telas são navegáveis sem ler: toda ação tem ícone, e as palavras são só "AVENTURA PINGUIM", "VAI!", "BOA!", "FIM" e o nome opcional | Revisão por lista de verificação e capturas de tela |
| G12 | No modo Filhote não existe tela nem estado de derrota | Teste por script: cair 20 vezes não reinicia nem tira tijolo |

### Por fase

Os testes por script usam semente aleatória fixa para serem reproduzíveis.

| Fase | Critério |
|---|---|
| Todas | Um script de toques conclui a fase nos dois modos. O iglu atinge o número de tijolos da fase, a porta aparece, Pipo entra e a tela de fase concluída surge. Há captura de tela de cada fase |
| 1 | Pousar numa fileira branca soma exatamente 1 tijolo e a torna azul; as 4 azuis voltam a branco; pousar na azul não soma |
| 2 | No Filhote, a gaivota nunca faz o Pipo cair (teste forçado). No Aventureiro, pode fazer. O aviso (sombra e som) acontece ≥ 1 s antes |
| 3 | Todo bloco pisca ≥ 1 s antes de afundar. Pipo sobre bloco que afunda cai e nada até a margem |
| 4 | A foca nunca impede a entrada por mais de 3 s. Após a fase, aparece a tela final e os recordes são gravados |

## 13. Plano de marcos

| Marco | Entrega | Critérios de aceite cobertos |
|---|---|---|
| **M1: fatia vertical** | Fase 1 jogável no celular, só no modo Filhote. Toque, colisão, tijolos, queda e nado, conclusão. Arte provisória simples, já na paleta. Modo de diagnóstico (escala, `devicePixelRatio`, fps). Publicação em GitHub Pages | G1, G3, G9, G12 parcial; fase 1 |
| **M2: quatro fases** | Fases 2 a 4, modo Aventureiro (sol, peixes-vida, medalhas), escolha do jogador, mapa, pausa, tela final, recordes | G10, G11, G12; fases 2 a 4 |
| **M3: polimento e som** | Efeitos e músicas, animações completas, arte final, demonstração e dicas, instalação na tela inicial, offline, nome opcional | G2, G4, G5, G6, G7, G8 |
| **M4: playtest e ajustes** | Roteiro de playtest, ajustes aprovados, README, tag v1.0.0 | Todos, mais a calibração dos valores marcados como "calibrar" |

Cada marco termina com um relatório de verificação: o que foi testado, o que passou, o que falhou
e o que não foi possível testar. A publicação acontece quando o mantenedor faz o merge na `main`.

## 14. Riscos e mitigação

| Risco | Impacto | Mitigação |
|---|---|---|
| O jogador de 6 anos acha chato esperar o bloco certo | Abandono | Blocos longos, assistência de pouso, peixes passando para manter ação. Medir no playtest onde ele para |
| Ele cai demais e desanima | Frustração | Queda sem perda, nado divertido, ajuda automática após 3 quedas (P4) |
| Pausa ou som tocados sem querer, perto do canto | Interrupção | Área de 2 cm só no canto. A pausa não perde nada. Sair para o mapa pede confirmação |
| Gestos do sistema Android (voltar, deslizar da borda) tiram o jogador do jogo | Interrupção | Pausa automática ao perder o foco. Retomada exata. Em tela cheia, os gestos exigem deslizar da borda, não toque |
| Loop desigual em telas de 120 Hz | Movimento irregular | Lógica em passo fixo de 60 Hz, desenho em cada quadro. Verificar com o contador de fps no aparelho |
| O áudio não libera em algum navegador | Jogo mudo | `resume()` em todo toque até o estado ser `running`. Teste no Chrome e no Samsung Internet |
| Escala real diferente da estimada | Pixels borrados ou alvos menores | Modo de diagnóstico no M1. O fator de escala vem da medida, não de suposição |
| Cache velho do service worker após atualização | Criança joga versão antiga | Cache com versão no nome e troca na próxima abertura com rede. Registrar a versão na tela de recordes (número pequeno) |
| As crianças preferem segurar em pé | Rejeição | Observar no playtest do M1, antes de investir em arte. Mudar a orientação exige novo ADR |
| Escopo crescer (fase corrida, mais inimigos) | Atraso | Fora de escopo explícito (seção 3). Novidades só depois da v1.0 e com aprovação |
| Vazamento de dado pessoal no repositório | Privacidade | G6 roda em todo marco. Anotações ficam no Drive |

## Perguntas em aberto para o GATE 3

1. **Nome do jogador:** confirmar que entra no M3 como opcional e que é cortado primeiro se houver
   atraso.
2. **Filhote:**
   - mostrar números (pontos e peixes) junto dos ícones? Proposta: sim, para ajudar a reconhecer
     numerais (P3);
   - todas as fases liberadas desde o início, ou desbloqueio progressivo? Proposta: progressivo,
     com rejogar livre.
3. **Aventureiro:** confirmar a regra de castigo máximo, "recomeçar a fase atual" (sem voltar à
   fase 1).
