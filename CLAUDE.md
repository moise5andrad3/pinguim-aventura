# Aventura Pinguim (repositório `pinguim-aventura`)

Jogo web para celular em estilo anos 80: protagonista pinguim, quatro fases, controle 100% por
toque. Público: um jogador de 6 anos (principal) e um de 10 anos, da família do mantenedor. Uso
doméstico. Dev é meio, não fim: a solução mais simples que entregue um jogo divertido e estável.

Conceito aprovado (GATE 1): **B, base Frostbite**; protagonista **Pipo**. Ver `docs/brainstorm.md`.

## Regras invioláveis (repositório público)

1. **Nenhum dado pessoal das crianças ou da família** em código, commits, docs, issues ou PRs:
   nada de nomes, fotos ou vozes. Referir-se a elas como "jogador de 6 anos" e "jogador de 10
   anos". Personalização (nome na tela) só em tempo de execução, salva em `localStorage`.
   Anotações de playtest ficam fora do repo (Drive do mantenedor).
2. **Sem rede em tempo de jogo:** sem analytics, anúncios, compras, contas, links externos,
   fontes ou bibliotecas de CDN. Tudo é servido pelo próprio site; nenhum dado sai do aparelho.
3. **Propriedade intelectual:** a inspiração em Antarctic Adventure (Konami, 1983) e Frostbite
   (Activision, 1983) limita-se a mecânicas. Arte, música, textos e nomes são originais; não
   copiar sprites, trilhas, logotipos nem nomes de personagens.
4. Nunca commitar segredos.

## Adequação à idade

- Alvos de toque de no mínimo 2 cm (~115 px CSS nos aparelhos-alvo; ver `docs/referencias.md`,
  P1), encostados na borda da tela, sem gestos finos, toque duplo ou multitoque obrigatórios.
- Jogável sem saber ler: ícones, cores, sons e demonstração em vez de texto.
- Falha suave, sem sustos nem violência; no modo do jogador de 6 anos, sem game over punitivo.
- Um nível de dificuldade ou desafios opcionais que mantenham o jogador de 10 anos interessado.

## Padrão de trabalho

- Ordem: pesquisa → brainstorming → ADR de plataforma → PRD → arquitetura → implementação
  incremental → verificação → playtest. Decisões registradas em `docs/`.
- Portões de aprovação do mantenedor: conceito escolhido, ADR de plataforma, PRD, e todo merge
  na `main` (a `main` é a versão publicada). Não codar antes do PRD aprovado.
- Hospedagem pretendida: GitHub Pages a partir da `main`, sujeita ao ADR de plataforma.
- Simplicidade radical: sem build e sem dependências até que o ADR justifique o contrário;
  1 módulo = 1 arquivo; sem abstração sem 3 ou mais usos; dados das fases como dados.
- Verificar antes de afirmar. Relatório de verificação diz o que foi testado, o que passou, o que
  falhou e o que não foi possível testar.
- Respostas em português, técnicas e objetivas, sem emoji.
