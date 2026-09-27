# Referências e verificação (Etapa 1)

Data da pesquisa: 2026-09-27. As fontes foram consultadas na web. Quando uma página não pôde ser
aberta (erro 403) e o dado veio só do resumo de um buscador, isso está marcado como **não
verificado diretamente**. Nenhum dado deste arquivo serve para copiar arte, música, texto ou nome
dos jogos originais: eles servem só como referência de mecânica.

## 1. Antarctic Adventure (Konami, 1983)

### Dados confirmados

| Item | O que as fontes dizem | Fonte |
|---|---|---|
| Plataformas e datas | MSX (dezembro de 1983, Japão), ColecoVision (1984), Famicom (1985) e outras depois | [1] |
| Objetivo | Um pinguim corre até estações de pesquisa de vários países na Antártida, contra o relógio | [1] |
| Estilo | Corrida parecida com *Turbo* (Sega), porém mais lenta e com elementos de plataforma | [1] |
| Obstáculos | Fendas (*crevasses*) e buracos no gelo; de buracos menores saem focas/leões-marinhos | [1][2] |
| Efeito da colisão | Bater num obstáculo ou cair numa fenda **não mata**: o pinguim para ou tropeça e perde tempo | [2] |
| Tempo esgotado | Se o tempo zera antes da estação, é *game over* e o jogo recomeça do início | [2] |
| Coletáveis | Peixes saltam dos buracos e dão pontos de bônus | [1] |
| Bandeiras | Ao fim de cada fase o pinguim ergue a bandeira de um país na estação | [1][2] |
| Controles | Esquerda/direita e pulo; o pinguim avança sozinho; é possível acelerar e reduzir a velocidade | [2] |
| Final | Não há final: após a última estação o jogo recomeça, mais difícil | [1] |

### Não verificados diretamente

- **Dez fases** e uma **bandeira piscante** coletável que dá um chapéu-hélice (segundo toque no
  botão plana no ar). Ambos vieram do resumo de busca da StrategyWiki [3]. A página retornou 403.
- Mapeamento exato do Famicom (cima acelera, baixo freia, A ou B pula): mesma situação [3].

### Correções à seção 4 do prompt

- "Bandeiras" como coletável na pista não foi confirmado. O que as fontes confirmam é a bandeira
  erguida ao fim de cada fase. A versão coletável (piscante) está no item não verificado acima.
- "Focas" aparece como *seals* numa fonte [2] e como *sea lions* em outra [1]. Para o nosso jogo
  não faz diferença.
- O prompt não mencionava um ponto importante para o nosso desenho: no original, errar custa
  **tempo**, não vida. O *game over* só vem do relógio. Isso já é um modelo de falha suave.

## 2. Frostbite (Activision, 1983)

### Dados confirmados

| Item | O que as fontes dizem | Fonte |
|---|---|---|
| Plataforma, data e autor | Atari 2600, outubro de 1983, projetado por Steve Cartwright | [4] |
| Cenário | **Quatro fileiras** de blocos de gelo flutuantes | [5] |
| Direção | As fileiras se movem em sentidos opostos | [6] |
| Construção do iglu | Cada pulo num bloco **branco** o torna azul e acrescenta um bloco ao iglu. Bloco azul não dá bloco nem pontos | [5] |
| Conclusão | Quando o iglu está completo aparece uma porta; o personagem entra e avança de nível | [5] |
| Tempo | A temperatura começa em 45 graus e cai; é preciso entrar no iglu antes de 0. Se zerar, perde uma vida | [4][5] |
| Inimigos | Caranguejos, gansos-da-neve e mariscos **empurram** o personagem para a água, que é fatal | [5] |
| Urso | A partir do **nível 4** um urso-polar anda pela margem e, ao contato, persegue o personagem até fora da tela | [5][7] |
| Peixes | Valem 200 pontos cada | [5] |
| Controles | Joystick para frente pula para a fileira de cima; para trás, para a de baixo | [5] |
| Inverter o bloco | O botão vermelho inverte o sentido do bloco em que o personagem está, ao custo de um bloco do iglu | [5] |
| Vidas | Um personagem ativo e três de reserva; vida extra a cada 5.000 pontos | [4][5] |
| Bônus | Ao entrar no iglu, a temperatura restante e o número de rodadas viram pontos | [4] |
| Dificuldade | Chaves do console: modo normal (começa no nível 1) ou avançado (começa no nível 5) | [4] |

### Não verificado

- **Quantidade de blocos do iglu.** O manual não dá o número [5]. O valor 16 aparece em resumo de
  busca, mas não foi achado em nenhuma página aberta. Como vamos definir o nosso próprio número,
  isso não bloqueia nada.

### Correções à seção 4 do prompt

- Faltava no resumo do prompt: inverter o sentido do bloco (custa um bloco), 45 graus iniciais e
  quatro fileiras. Os inimigos **empurram** o personagem para a água, em vez de tirar vida só
  pelo toque.
- O urso aparece a partir do nível 4, não genericamente "em níveis posteriores".
- Coerência para o nosso jogo: urso-polar vive no Ártico, e pinguins (com uma exceção nas
  Galápagos) vivem no hemisfério sul. Um pinguim na Antártida não encontra urso. O `brainstorm.md`
  substitui o urso por outro personagem (opinião de design, não fato).

## 3. Boas práticas: jogos de toque para crianças de 5 a 7 anos

Nenhuma fonte encontrada estuda exatamente a faixa de 5 a 7 anos em jogos de celular. As fontes
abaixo cobrem as vizinhanças: pré-escolares ([8], até cerca de 5 anos), crianças pequenas em
geral ([9]) e crianças de 7 a 16 anos ([10]). A extrapolação para 6 anos é inferência nossa.

### P1. Alvos de toque de pelo menos 2 cm × 2 cm

- **Fonte:** Nielsen Norman Group (Feifei Liu, 2018) recomenda "at least 2cm × 2cm touch targets
  for young children", quatro vezes a área do 1 cm × 1 cm indicado para adultos [9].
- **Dado complementar:** crianças de 7 a 16 anos erraram o alvo na primeira tentativa em 23,1% das
  vezes, contra 16,9% dos adultos [10]. Alvos com margem até a borda da tela quase dobraram os
  erros (crianças: 30,2% contra 17,8%), e 99% desses erros caíram no vão entre o alvo e a borda
  [10].
- **Norma geral:** a WCAG 2.2 (nível AAA) pede 44 × 44 px CSS para qualquer público [13]. Isso é
  um piso para adultos, não uma referência para crianças.
- **Consequência para o projeto, com conta nossa:** a referência de 64 px CSS do `CLAUDE.md`
  fica **abaixo** de 2 cm nos aparelhos informados:

  | Aparelho | Tela | Densidade | Largura física em retrato | 1 px CSS (estimado) | 64 px CSS | 2 cm |
  |---|---|---|---|---|---|---|
  | Samsung Galaxy A56 | 6,7", 1080 × 2340 | ~385 ppi [11] | ~71 mm | ~0,17 mm | ~11 mm | ~115 px CSS |
  | Motorola moto g55 | 6,49", 1080 × 2400 | ~405 ppi [12] | ~68 mm | ~0,17 mm | ~11 mm | ~115 px CSS |

  A largura física é pixels ÷ ppi. O tamanho de 1 px CSS assume uma *viewport* de 390 a 412 px
  CSS, típica de Android com 1080 px físicos. Isso é **estimativa**: o valor real de
  `devicePixelRatio` será medido nos aparelhos no M1.
- **Recomendação:** zonas de jogo com pelo menos 2 cm (~115 px CSS) de lado; na prática, metades
  ou terços da tela. Alvos de jogo encostados na borda, sem vão. Botões de menu com pelo menos
  2 cm. Assim os 64 px CSS do `CLAUDE.md` viram piso, não alvo.

### P2. Toque simples; evitar toque duplo, multitoque, pinça e arraste preciso

- **Fonte:** Sesame Workshop (2012). O toque (*tap*) é o gesto mais intuitivo. Toque duplo faz a
  criança achar que o app não respondeu. Multitoque acontece sem querer e com pouca destreza.
  Pinça é difícil [8].
- **Fonte:** crianças arrastam, mas perdem a continuidade do dedo na tela [8]. A NN/g também
  recomenda toque, deslize e arraste para menores de 9 anos, e não recomenda ações rápidas em
  resposta a estímulo visual para menores de 5 anos [9].
- **Fonte:** registrar a entrada **ao encostar**, não ao soltar: crianças apertam forte, demorado
  ou várias vezes até ver resposta, o que provoca zoom indesejado [8]. Crianças também repetem o
  toque no lugar do alvo anterior (*holdover*): 96% desses casos foram de crianças [10].
- **Consequência:** agir no `pointerdown`, desativar zoom por toque duplo (`touch-action`),
  ignorar toques repetidos no mesmo ponto em intervalo curto e dar resposta visual e sonora
  imediata a cada toque.

### P3. Não depender de leitura: instrução por imagem, som e demonstração

- **Fonte:** assumir que pré-escolares não leem e passar as instruções principais por voz e
  imagem [8]. Crianças costumam ignorar instrução só em áudio; ela precisa de um componente visual,
  como destacar o caminho a fazer [8]. Objetos tocáveis devem parecer tocáveis (brilho, animação) e
  só parecer tocáveis quando forem [8].
- **Consequência:** demonstração animada com uma "mão fantasma" no início de cada fase e dica
  visual após inatividade. O jogador de 6 anos lê palavras simples. Por isso poucas palavras curtas
  e repetidas (ex.: "VAI!", "FIM") podem aparecer **junto** de ícone e som, nunca sozinhas. Isso
  reforça a leitura sem depender dela (opinião de design, baseada na resposta do mantenedor).

### P4. Frustração: erro vira dica, acerto vira festa

- **Fonte:** tratar erro como "momento de aprendizado", com retorno encorajador e gradual em três
  níveis. Na terceira tentativa o jogo destaca a resposta. Em alguns casos, deixar a criança seguir
  adiante se ela travar por muito tempo [8].
- **Fonte:** recompensas mantêm a criança motivada. Usar efeito sonoro (fanfarra, "ding-ding") e
  animação [8]. Cada ação deve ter um som correspondente [8].
- **Fonte:** dica automática (*time-out*) após **6 a 8 segundos** de inatividade em jogos [8].
- **Consequência:** no modo do jogador de 6 anos, errar não tira progresso. Após erros repetidos
  no mesmo ponto, o jogo ajuda (ex.: plataforma mais larga, seta brilhando). Há fanfarra curta a
  cada conquista.

### P5. Layout: tudo visível, nada importante na borda de apoio

- **Fonte:** todos os elementos interativos importantes devem estar na tela desde o início, sem
  rolagem [8]. Crianças apoiam os pulsos na borda inferior de tablets e tocam sem querer os ícones
  que estão ali [8]. Em tablet, pré-escolares tendem a segurar o aparelho **deitado** [8].
- **Consequência:** a pausa e o som ficam nos cantos superiores. A observação sobre paisagem é de
  **tablet** e de pré-escolares. Para celular, a orientação será decidida no ADR e confirmada no
  playtest.

### Sem fonte: marcado como opinião

- **Duração da fase (2 a 4 minutos) e da sessão.** Não achamos fonte primária sobre duração ideal
  de fase para 6 anos. Os 2 a 4 minutos do prompt são **opinião** e serão calibrados no playtest.
- **Um só botão por ação e zonas fixas** na tela, em vez de botões pequenos e móveis: **opinião**
  coerente com P1 e P2.

## Fontes

1. Wikipedia, "Antarctic Adventure". https://en.wikipedia.org/wiki/Antarctic_Adventure
2. Infinity Retro, "Antarctic Adventure Review (MSX, 1983)". https://infinityretro.com/antarctic-adventure-review/
3. StrategyWiki, "Antarctic Adventure" (403; lido só via resumo de busca). https://strategywiki.org/wiki/Antarctic_Adventure
4. Wikipedia, "Frostbite (video game)". https://en.wikipedia.org/wiki/Frostbite_(video_game)
5. Manual do Frostbite (Activision, 1983), texto no Internet Archive. https://archive.org/stream/Frostbite_1983_Activision/Frostbite_1983_Activision_djvu.txt
6. Atari Gaming Headquarters, resenha de Frostbite. http://www.atarihq.com/reviews/2600/frostbite.html
7. AtariOnline.org, "Frostbite". https://atarionline.org/atari-2600/frostbite
8. Sesame Workshop, "Best Practices: Designing Touch Tablet Experiences for Preschoolers" (2012). https://joanganzcooneycenter.org/wp-content/uploads/2020/02/SesameWorkshop-2012.pdf
9. Nielsen Norman Group, F. Liu, "Design for Kids Based on Their Stage of Physical Development" (2018). https://www.nngroup.com/articles/children-ux-physical-development/
10. L. Anthony, Q. Brown, J. Nias, B. Tate, S. Mohan, "Interaction and Recognition Challenges in Interpreting Children's Touch and Gesture Input on Mobile Devices", ACM ITS 2012. https://lisa-anthony.com/wp-content/uploads/2012/09/anthony-et-al-tabletop20121.pdf
11. GSMArena, "Samsung Galaxy A56". https://m.gsmarena.com/samsung_galaxy_a56-13603.php
12. Especificações do Motorola moto g55 (resumo de busca de devicespecifications.com / GSMArena). https://www.gsmarena.com/motorola_moto_g55-13278.php
13. W3C, WCAG 2.2, Critério 2.5.5 (Target Size, Enhanced, AAA): 44 × 44 px CSS; o px CSS é independente da densidade física. https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html
