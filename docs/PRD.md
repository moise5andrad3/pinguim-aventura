# PRD: Aventura Pinguim

- **Status:** aprovado no GATE 3 (2026-09-27), com os ajustes registrados no fim do documento
- **Data:** 2026-09-27
- **Base:**
  - conceito B aprovado no GATE 1 (`brainstorm.md`);
  - plataforma e orientação aprovadas no GATE 2 (`adr-001-plataforma.md`);
  - boas práticas P1 a P5 de `referencias.md`.

Números marcados como **(calibrar)** são pontos de partida e serão ajustados no playtest. Eles
ficam nos dados das fases, não no código.

## 1. Visão

Um jogo de celular em estilo anos 80 em que o Pinguinzinho pula entre blocos de gelo para
construir seu iglu. É feito para que o jogador de 6 anos termine sozinho e o de 10 anos queira
bater os próprios recordes.

## 2. Público e personas

| Persona | Perfil | Precisa de | Modo |
|---|---|---|---|
| Jogador de 6 anos (principal) | Lê algumas palavras simples. Segura o celular com as duas mãos. Motricidade fina em formação | Sucesso frequente, zonas de toque enormes, nenhum susto e nenhuma perda de progresso. Instruções por imagem e som | **Diversão** (ícone de pinguim pequeno) |
| Jogador de 10 anos | Lê bem. Quer desafio e comparar resultados | Relógio, placar, coletáveis escondidos e risco real de errar, sem castigo longo | **Aventura** (ícone de pinguim grande) |
| Pai (operador) | Desenvolvedor, instala e atualiza | Instalar pela tela inicial, jogo offline, zero manutenção, silenciar e apagar recordes sem ajuda | Nenhum; usa telas de ajuste |

Os dois jogadores revezam o mesmo aparelho, e **os modos não pertencem a uma criança**: qualquer
um dos dois pode jogar qualquer modo. Por isso as regras e recompensas dos dois modos são
parecidas, e o modo Aventura só acrescenta relógio e risco. Cada modo guarda o próprio progresso e
os próprios recordes.

## 3. Escopo

**Dentro:**
- 4 fases com final comemorativo;
- 2 modos de dificuldade;
- controle só por toque (teclado apenas para testes no desktop);
- pixel art original;
- efeitos e músicas chiptune gerados por Web Audio;
- recordes locais;
- instalação na tela inicial e funcionamento offline.

**Fora (não-objetivos):**
- multiplayer simultâneo, contas, nuvem, sincronização entre aparelhos;
- anúncios, compras, links externos, analytics, qualquer rede em tempo de jogo;
- modo corrida estilo Antarctic Adventure (candidato a fase bônus depois da v1.0, se o playtest
  pedir);
- iPhone e iPad como alvo: vale só o melhor esforço, sem tela cheia nem trava de orientação;
- narração por voz (gravada ou sintetizada), tradução, editor de fases;
- nome do jogador ou qualquer outra personalização (retirado no GATE 3);
- fotos, vozes ou qualquer dado das crianças.

## 4. Loop de jogo e regras

### Loop

1. Pinguinzinho começa na **margem** (faixa de cima, onde fica o iglu).
2. Abaixo dela há **4 fileiras** de blocos de gelo deslizando, em sentidos alternados, e o mar.
3. O jogador toca **acima** ou **abaixo** do Pinguinzinho para pular uma fileira para cima ou para baixo.
4. Pousar numa fileira **branca** faz a fileira inteira ficar **azul** e acrescenta **1 tijolo**
   ao iglu, com som de "plim" e o tijolo voando até o iglu. Pousar numa fileira azul não dá
   tijolo.
5. Quando as 4 fileiras estão azuis, todas voltam a ficar brancas.
6. Com o iglu completo, aparece a **porta** brilhando. Pinguinzinho volta à margem e entra sozinho no
   iglu, e a fase termina.

### Regras de movimento

- **Direção do pulo:**
  - O pulo é sempre para a fileira vizinha.
  - A posição horizontal do toque inclina o pulo, no máximo **24 px lógicos** para o lado
    (calibrar).
  - Tocar exatamente acima do Pinguinzinho gera um pulo reto.
- **Margem:** na margem, tocar na própria faixa da margem faz o Pinguinzinho andar até aquele ponto.
  Tocar abaixo faz o Pinguinzinho pular para a fileira 1.
- **Borda da tela:** se o bloco levar o Pinguinzinho até a borda, ele anda sobre o bloco para ficar na
  tela. Se o bloco acabar debaixo dele, ele cai.
- **Queda na água:** mergulho com *splash*, depois Pinguinzinho nada de volta até a margem (~1,5 s). Não
  é morte.
- **Toques extras:**
  - Toques durante um pulo são ignorados, exceto nos últimos 150 ms: o toque fica guardado e é
    executado ao pousar.
  - Um toque repetido a menos de 120 ms do anterior é ignorado (P2, *holdover*).

### Regras por modo

| Regra | Diversão (6 anos) | Aventura (10 anos) |
|---|---|---|
| Relógio | Nenhum. O sol é só decorativo | **Pôr do sol:** 90 s por fase (calibrar). Se o sol se põe, a fase recomeça |
| Queda na água | Sem perda | Perde 1 **peixe-vida** (3 por fase). Sem peixes-vida, a fase recomeça |
| Game over | **Não existe** | Não existe game over do jogo. O pior caso é recomeçar a fase atual |
| Assistência de pouso | Um pulo que cairia até 12 px de um bloco "gruda" nele (calibrar) | 4 px (calibrar) |
| Blocos | Longos e lentos | Mais curtos e mais rápidos |
| Ajuda automática | Após 3 quedas seguidas, os blocos alargam 50% por 20 s e aparece uma seta brilhando | Não |
| Dica por inatividade | Após 7 s parado, a mão fantasma mostra onde tocar (P4) | Após 7 s parado, a mão fantasma mostra onde tocar (P4) |
| Gaivota | Só balança o Pinguinzinho | Empurra: se ele sair do bloco, cai |
| Caranguejo | Encostar faz os dois "dançarem" 0,5 s, sem perda | Empurra o Pinguinzinho para o lado; pode derrubá-lo |
| Tijolos do iglu por fase | 10 / 12 / 14 / 16 (calibrar) | 16 / 16 / 16 / 16 (calibrar) |

### Pontuação

Todos os valores abaixo são para calibrar.

| Evento | Pontos |
|---|---|
| Tijolo | 10 |
| Peixe comum (nada ao longo das fileiras; pega-se ao encostar) | 50 |
| Peixe dourado (1 por fase, a partir da fase 2) | 200 |
| Estrela-do-mar (3 escondidas por fase, nas fases 3 e 4) | 300 |
| Bônus de sol (Aventura: segundos restantes × 10) | variável |

- **Recompensa única, igual nos dois modos:** cada fase concluída ganha um **carimbo do Pinguinzinho** no
  mapa. Não há medalhas.
- **Números visíveis nos dois modos:** pontos e peixes aparecem como ícone mais número, o que
  ajuda a reconhecer numerais (P3).
- **Recorde por fase:** maior pontuação. No modo Aventura, também o menor tempo.

## 5. Controles por toque

Tela em paisagem, 320 × 180 px lógicos. As medidas são aproximadas.

```
+--------------------------------------------------------------+
|[II]  sol/lua          IGLU [#][#][#][ ][ ]    peixes    [som]|  margem
|      ZONA "ACIMA" = tudo acima da linha divisória            |  (y 0 a 36)
|==============================================================|
|   <<==   [======]        [======]          [======]          |  fileira 1
|   ==>>        [======]         [==(Pinguinzinho)==]                  |  fileira 2
|- - - - - - - - - - - (linha divisória) - - - - - - - - - - - |
|   <<==   [======]        [======]          [======]          |  fileira 3
|   ==>>        [======]         [======]                      |  fileira 4
|      ZONA "ABAIXO" = tudo abaixo da linha divisória          |
|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ mar ~~~~~~~~~~~~~~~~~~~~~~~~~~~~|  (y 132 a 180)
+--------------------------------------------------------------+
```

- **Faixas da tela:** margem de y 0 a 36, 4 fileiras de 24 px de y 36 a 132, e mar de y 132 a
  180.
- **Linha divisória:** é o próprio Pinguinzinho (o meio do desenho). Tocar no bloco para onde ele
  deve ir sempre funciona. Na margem, a linha é a beira da água: tocar na neve anda, tocar nos
  blocos pula. *(Mudou após o playtest do M2. Antes, a linha ficava limitada entre y 61 e 119 para
  cada zona ter 2 cm. Com isso, tocar num bloco perto do Pinguinzinho às vezes contava como o lado
  errado, e ele andava ou não fazia o que a criança queria.)*
- **Cobertura:** as duas zonas cobrem a tela inteira, inclusive as sobras laterais fora da imagem
  de 320 × 180.
- **Botões fixos:** `[II]` pausa e `[som]` silenciar, nos cantos superiores. O ícone é pequeno,
  mas a área de toque é um quadrado de **~1,3 cm** (72 px CSS) encostado no canto. Era 2 cm; foi
  reduzido após o playtest porque roubava toques de quem queria pular perto da margem. Nessa área o toque aciona o
  botão, não o pulo.
  - **Exceção (achada no M1):** com o Pinguinzinho numa fileira, um toque a menos de 24 px dele na
    horizontal é sempre pulo, mesmo dentro da área do canto. Sem isso, com o Pinguinzinho perto da borda,
    tocar "acima dele" pausaria o jogo. O botão continua funcionando em todo o resto da área.
- **Momento do toque:** a ação acontece em `pointerdown`. Não há toque duplo, multitoque nem
  arraste (P2). Com dois dedos ao mesmo tempo, vale só o primeiro.
- **Teclado (só desktop):** setas cima e baixo pulam; esquerda e direita inclinam; Esc pausa;
  M silencia.

## 6. As 4 fases

| # | Cenário | Mecânica nova | Obstáculos | Coletáveis | Duração-alvo (opinião, calibrar) | Critério de conclusão |
|---|---|---|---|---|---|---|
| 1 | Baía Calma, manhã | Pular para cima e para baixo; tijolos | Só o mar; blocos longos e lentos | Peixes | 2 a 3 min | Iglu completo e Pinguinzinho entra |
| 2 | Correnteza, tarde | Fileiras com velocidades diferentes; blocos mais curtos | Gaivotas travessas (sombra e grasnado 1 s antes do mergulho) | Peixes e 1 peixe dourado | 2 a 3 min | Igual |
| 3 | Gelo Fino, entardecer | Blocos que afundam por 1,5 s e voltam; piscam 1 s antes | Caranguejos dançarinos andando sobre blocos | Peixes e 3 estrelas-do-mar | ~3 min | Igual |
| 4 | Noite de Aurora | **Ursinho-polar** passeando na margem na frente do iglu; esperar a vez de entrar | Gaivotas e caranguejos; poucos blocos afundando | Peixes, 1 peixe dourado e 3 estrelas-do-mar | 3 a 4 min | Igual, e depois vem a tela final |

- **Ursinho-polar (pedido do mantenedor):**
  - vale igual nos dois modos;
  - é um filhote redondo e sorridente, sem dentes nem garras à mostra; anda devagar e às vezes
    senta e boceja;
  - encostar nele faz Pinguinzinho quicar para trás, sem perda;
  - não persegue o Pinguinzinho (o urso do Frostbite perseguia; aqui não);
  - nunca bloqueia a porta por mais de 3 s.
- **Progressão:** a fase seguinte é desbloqueada ao concluir a anterior. Fases já concluídas
  podem ser rejogadas no mapa.

## 7. Telas e fluxo

```
Abertura -> Escolha do modo -> Mapa -> [Demonstração] -> Jogo -> Fase concluída -> Mapa ...
                                                          |                          |
                                                        Pausa           (após fase 4) Final -> Recordes -> Mapa
```

| Tela | Conteúdo | Interação |
|---|---|---|
| Abertura | Título "AVENTURA PINGUIM" em fonte pixel, Pinguinzinho animado, música-tema | Um botão ▶ grande. O primeiro toque libera o áudio, pede tela cheia e trava paisagem (ADR) |
| Escolha do modo | Dois cartões grandes: pinguim pequeno com a palavra "DIVERSÃO" e pinguim grande com a palavra "AVENTURA" | Tocar no cartão |
| Mapa | 4 ilhas ligadas por um caminho; cadeado nas bloqueadas; carimbo nas concluídas. Botões de voltar e de recordes | Tocar numa ilha |
| Demonstração | Na primeira vez em cada fase: mão fantasma toca acima e abaixo e Pinguinzinho pula; depois a palavra "VAI!" com som | Qualquer toque pula a demonstração |
| Jogo | Seção 5 | Seção 5 |
| Pausa | Jogo congelado e escurecido; 3 ícones grandes: ▶ continuar, ↻ recomeçar, mapa | Recomeçar e mapa pedem confirmação com ✔ verde e ✘ vermelho (Sesame) |
| Fase concluída | Pinguinzinho entra no iglu, fanfarra, tijolos e peixes contados com "plim", carimbo, palavra "BOA!" | ▶ próxima fase, ou mapa |
| Final | A colônia faz festa na aurora com o iglu gigante; música de festa; palavra "FIM" | ▶ vai para os recordes |
| Recordes | Por modo e por fase: carimbo, peixes, pontos e melhor tempo (modo Aventura) | Apagar recordes: botão de lixeira que exige **segurar 3 s**. É proteção para adulto; a criança nunca precisa desse gesto |
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
| 5 | `#F4F8FF` | Bloco branco, neve, barriga do Pinguinzinho |
| 6 | `#C9D6E8` | Sombra da neve |
| 7 | `#FFD23F` | Sol, peixe dourado, destaque de dica (P3) |
| 8 | `#FF8C42` | Bico e pés do Pinguinzinho, entardecer |
| 9 | `#E84855` | Caranguejo, peixe-vida |
| 10 | `#7B2D8B` | Aurora, céu do entardecer |
| 11 | `#3BCEAC` | Aurora, peixes comuns |
| 12 | `#6BE36B` | Aurora |
| 13 | `#8A6A4F` | Pedras da margem |
| 14 | `#6B7280` | Gaivota, focinho do urso |
| 15 | `#FF9EC7` | Bochecha do Pinguinzinho, festa |

- **Branco contra azul:** a diferença entre bloco branco (5) e bloco pisado (3) está também no
  **brilho**, não só no matiz. O bloco pisado ganha ainda uma marca de pegada, para não depender
  só de cor.

### Sprites e animações

Os tamanhos estão em px lógicos. A arte será original, desenhada em código (matrizes de
caracteres convertidas em imagem na carga) ou em PNG próprio; a escolha fica em
`arquitetura.md`.

| Sprite | Tamanho | Animações (quadros) |
|---|---|---|
| Pinguinzinho | 16 × 16 | Parado (2), pulo (3), pouso (1), nado (4), balanço (2), dança (4), andar (2), entrar no iglu (3), comemorar (4) |
| Bloco de gelo | 8 × 10 por segmento; comprimento variável | Branco, azul com pegada, piscando (2), afundando (3) |
| Iglu | Tijolos 8 × 6; porta 10 × 12 | Tijolo chegando (3), porta brilhando (2) |
| Mar | Blocos de 16 × 8 | Ondas (2) |
| Peixe comum e dourado | 10 × 6 | Nadar (2), salto (2), brilho do dourado (2) |
| Estrela-do-mar | 8 × 8 | Brilho (2) |
| Gaivota e sombra | 16 × 10 | Voo (2), mergulho (1), grasnado (1) |
| Caranguejo | 12 × 8 | Andar (2), dançar (2) |
| Ursinho-polar | 24 × 16 | Andar (2), sentar (1), bocejar (2), quique ao encostar (1) |
| Sol, lua, aurora | Sol 16 × 16; aurora em faixas | Aurora ondulando (4) |
| Colônia (final) | 16 × 16, 3 variações | Dança (2) |
| Ícones de interface | 12 × 12 a 24 × 24 | ▶, pausa, som ligado e desligado, ↻, mapa, cadeado, ✔, ✘, lixeira, troféu, carimbo, mão fantasma (2), seta de dica (2), celular girando (4) |
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
- gaivota (grasnado de aviso), caranguejo (clique), ursinho (bocejo grave e curto, sem rugido);
- bloco piscando (aviso);
- porta aparecendo, entrar no iglu, fanfarra de fase concluída, carimbo;
- dica (sininho), pausa, botões de menu, "VAI!" (acorde);
- sol se pondo (Aventura), perda de peixe-vida (som descendente suave, sem susto).

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
- **`localStorage` guarda só:** modo escolhido, recordes, fases desbloqueadas e estado do som. Nada disso sai do aparelho.
- **Repositório público:**
  - nenhum nome, foto ou voz das crianças no código, nos commits, nos docs ou nas issues;
  - anotações de playtest ficam no Drive do mantenedor;
  - o PRD usa "jogador de 6 anos" e "jogador de 10 anos".
- **Propriedade intelectual:**
  - nome ("Aventura Pinguim"), personagem ("Pinguinzinho"), arte, música e textos são originais;
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
| G5 | Botões de canto com ≥ 72 px CSS (~1,3 cm medidos); zonas de pulo sempre do tamanho do espaço entre o Pinguinzinho e a borda; menus e cartões com ≥ 2 cm | Teste com a escala exposta pelo modo de diagnóstico e conferência no aparelho |
| G6 | Nenhum nome ou dado pessoal no repositório | `grep` com uma lista de termos mantida **fora** do repositório (variável de ambiente local) |
| G7 | Nenhuma URL externa carregada pelo código do jogo | `grep` por `http` nos arquivos servidos, mais G3 |
| G8 | Nenhum som antes do primeiro toque; o botão de silenciar funciona e persiste | Playwright, pelo estado do `AudioContext` e do `localStorage` |
| G9 | Em retrato aparece o aviso "gire o celular"; em paisagem, o jogo | Playwright |
| G10 | O jogo pausa sozinho ao ir para segundo plano | Playwright |
| G11 | Todas as telas são navegáveis sem ler: toda ação tem ícone, e as palavras são só "AVENTURA PINGUIM", "DIVERSÃO", "AVENTURA", "VAI!", "BOA!", "FIM" e os rótulos dos números ("PEIXES", "ESTRELAS", "PONTOS", "TEMPO", "RECORDE!", "RECORDES", "FASE"), sempre junto de um ícone | Revisão por lista de verificação e capturas de tela |
| G12 | No modo Diversão não existe tela nem estado de derrota | Teste por script: cair 20 vezes não reinicia nem tira tijolo |

### Por fase

Os testes por script usam semente aleatória fixa para serem reproduzíveis.

| Fase | Critério |
|---|---|
| Todas | Um script de toques conclui a fase nos dois modos. O iglu atinge o número de tijolos da fase, a porta aparece, Pinguinzinho entra e a tela de fase concluída surge. Há captura de tela de cada fase |
| 1 | Pousar numa fileira branca soma exatamente 1 tijolo e a torna azul; as 4 azuis voltam a branco; pousar na azul não soma |
| 2 | No Diversão, a gaivota nunca faz o Pinguinzinho cair (teste forçado). No Aventura, pode fazer. O aviso (sombra e som) acontece ≥ 1 s antes |
| 3 | Todo bloco pisca ≥ 1 s antes de afundar. Pinguinzinho sobre bloco que afunda cai e nada até a margem |
| 4 | O ursinho nunca impede a entrada por mais de 3 s nem faz o Pinguinzinho perder algo, nos dois modos. Após a fase, aparece a tela final e os recordes são gravados |

## 13. Plano de marcos

| Marco | Entrega | Critérios de aceite cobertos |
|---|---|---|
| **M1: fatia vertical** | Fase 1 jogável no celular, só no modo Diversão. Toque, colisão, tijolos, queda e nado, conclusão. Arte provisória simples, já na paleta. Modo de diagnóstico (escala, `devicePixelRatio`, fps). Publicação em GitHub Pages | G1, G3, G9, G12 parcial; fase 1 |
| **M2: quatro fases** | Fases 2 a 4, modo Aventura (sol, peixes-vida), escolha do modo, mapa com carimbos, pausa, tela final, recordes | G10, G11, G12; fases 2 a 4 |
| **M3: polimento e som** | Efeitos e músicas, animações completas, arte final, demonstração e dicas, instalação na tela inicial, offline | G2, G4, G5, G6, G7, G8 |
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
| Bloco leva o Pinguinzinho até a borda da tela e ele cai (achado no M2 pelo robô de teste: foi a causa de todas as quedas dele no Aventura) | Frustração, sobretudo no Aventura, onde a queda custa peixe-vida | Observar no playtest. Opções, se incomodar: parar o bloco na borda ou empurrar o Pinguinzinho de volta para dentro |
| Vazamento de dado pessoal no repositório | Privacidade | G6 roda em todo marco. Anotações ficam no Drive |

## Decisões do GATE 3 (mantenedor, 2026-09-27)

1. PRD aprovado. Os modos se chamam **Diversão** (pensado para o jogador de 6 anos) e **Aventura**
   (pensado para o de 10 anos). Como as crianças vão trocar de modo entre si, a Aventura não deve
   ficar complicada: ela só acrescenta relógio e risco.
2. Recompensa unificada: **carimbo do Pinguinzinho no mapa por fase, nos dois modos**. Não há medalhas.
3. **Nome do jogador retirado** do escopo.
4. Números (pontos e peixes) visíveis junto dos ícones.
5. Modo Diversão: fases desbloqueadas uma a uma, com rejogar livre.
6. Modo Aventura: castigo máximo é recomeçar a fase atual.
7. **Ursinho-polar na fase 4, nos dois modos** (pedido do mantenedor após o M1). Ele substitui a
   foca-dorminhoca. Registro de fato: não existem pinguins selvagens no Ártico, nem ursos-polares
   na Antártida; a espécie que chega mais ao norte é o pinguim-de-galápagos, na linha do Equador.
   O encontro dos dois é fantasia assumida do jogo. A aurora da fase 4 serve aos dois polos.
   Morsa e elefante-marinho-do-sul foram considerados como alternativas; o mantenedor manteve o
   urso.

## Mudanças após o M1

- **Tela cheia:** é pedida ao soltar o dedo (`pointerup`), em qualquer tela, sempre que o jogo não
  estiver em tela cheia. No M1 ela era pedida ao encostar (`pointerdown`), e o navegador recusava:
  pelo HTML Standard, no toque só `pointerup` e `touchend` contam como gesto do usuário. O
  desbloqueio de áudio foi para o mesmo evento.
- **Medida real no aparelho:** o quadrado de 115 px CSS mediu 2,1 cm nos dois celulares (medido
  pelo mantenedor). O mínimo de 2 cm está atendido.
- **Nome do protagonista:** trocado de "Pipo" para **"Pinguinzinho"** (pedido do mantenedor). É
  uma palavra comum do português e não identifica ninguém. Por enquanto o nome não aparece escrito
  no jogo; se aparecer, será só como texto dentro do jogo.

## Calibração inicial feita no M2 (antes do playtest)

Os testes automáticos jogam cada fase por script, pulando com inclinação como uma pessoa faria.
Com os valores originais, o robô não conseguia concluir as fases 3 e 4 no modo Aventura. Todas as
quedas vinham de duas causas: o bloco levava o Pinguinzinho até a borda da tela, ou o caranguejo
o empurrava para fora de um bloco estreito. Ajustes feitos em `src/fases.js`:

- **Modo Aventura:**
  - velocidade dos blocos de 1,4 para 1,25 vez a do Diversão;
  - largura de 80% para 90%;
  - empurrão do caranguejo de 12 para 8 px (a gaivota continua com 14 px).
- **Fases 3 e 4:** a fileira mais rápida ficou mais lenta (de 0,45 para 0,36 e de 0,50 para 0,40
  px por passo), com blocos de 60 px.

Mesmo assim, a fase 3 no Aventura ainda custa ao robô cerca de dois recomeços. É o primeiro ponto
a observar no playtest do jogador de 10 anos.

## Ajustes após o playtest do M2 (mantenedor, 2026-09-28)

O mantenedor relatou três pontos: a dificuldade está boa (é superada com o tempo), o jogo não trava
e cair pela borda não incomoda. Dois problemas foram corrigidos:

1. **Ícones de pontuação e recordes pouco claros.** Nas telas de fase concluída e de recordes,
   cada número ganhou uma palavra ao lado do ícone: PEIXES, ESTRELAS, PONTOS, TEMPO, RECORDE!,
   FASE e os nomes dos modos. Isso aproveita que o jogador de 6 anos lê palavras simples.
2. **Toques que não faziam o Pinguinzinho pular.** As crianças tocam perto do bloco de destino.
   Três ajustes:
   - a linha que separa "subir" de "descer" passou a ser o próprio Pinguinzinho;
   - os botões de canto encolheram de 2 cm para ~1,3 cm;
   - o toque dado durante o pulo fica guardado e é executado no pouso.

