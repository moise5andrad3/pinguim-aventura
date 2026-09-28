// Verificação em emulação mobile (paisagem, toque). Critérios em docs/PRD.md, seção 12.
// Testes longos (fases inteiras jogadas por script) rodam só no perfil pixel7.
const { test, expect, devices } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const CAPTURAS = path.join(__dirname, '..', 'docs', 'verificacao', 'm3');
fs.mkdirSync(CAPTURAS, { recursive: true });
const captura = (page, nome) =>
  page.screenshot({ path: path.join(CAPTURAS, `${nome}-${test.info().project.name}.png`) });
const soPixel = () => test.skip(test.info().project.name !== 'pixel7', 'teste longo: só no perfil pixel7');

// Toca num ponto em coordenadas lógicas (320x180).
async function tocar(page, x, y) {
  const p = await page.evaluate(([a, b]) => window.__jogo.paraTela(a, b), [x, y]);
  await page.touchscreen.tap(p.x, p.y);
}

const estado = (page) => page.evaluate(() => window.__jogo.jogo());
const cenaAtual = (page) => page.evaluate(() => window.__jogo.cena());

// Progresso salvo antes de abrir o jogo (ex.: todas as fases liberadas).
async function comProgresso(page, liberada) {
  await page.addInitScript((lib) => {
    const m = () => ({
      liberada: lib,
      carimbos: [lib > 1, lib > 2, lib > 3, false],
      recordes: [lib > 1 ? { pontos: 450, segundos: 52 } : null, lib > 2 ? { pontos: 610, segundos: 71 } : null, null, null],
    });
    localStorage.setItem('aventura-pinguim', JSON.stringify({ versao: 1, som: true, modos: { diversao: m(), aventura: m() } }));
  }, liberada);
}

async function abrirFase(page, modo, fase, pularDemo = true) {
  await page.goto('/index.html');
  await page.waitForFunction(() => window.__jogo && window.__jogo.cena() === 'abertura');
  await tocar(page, 160, 140);
  await page.waitForFunction(() => window.__jogo.cena() === 'modo');
  await tocar(page, modo === 'aventura' ? 240 : 80, 100);
  await page.waitForFunction(() => window.__jogo.cena() === 'mapa');
  await tocar(page, 40 + fase * 80, 120);
  await page.waitForFunction(() => window.__jogo.cena() === 'jogo');
  if (pularDemo && (await estado(page)).demo) await tocar(page, 160, 100);
}

// Pulo seguro: procura uma inclinação (-24 a 24 px, como um jogador faria ao tocar mais para o
// lado) em que o pouso caia dentro de um bloco (6 px de folga para dentro, sem contar com a
// assistência) que não vá afundar logo. Devolve a inclinação ou null.
function puloSeguro(s, destino) {
  if (destino < 0) return 0;
  if (destino > 3) return null;
  const vOrigem = s.linha >= 0 ? s.fileiras[s.linha].vel : 0;
  const xReto = s.x + vOrigem * 21;
  const f = s.fileiras[destino];
  let melhor = null;
  for (const [bx, bw, etapa, ate] of f.blocos) {
    if (etapa === 'afundado' || ate <= 1.2) continue;
    const a = bx + f.vel * 21 + 6;
    const b = bx + f.vel * 21 + bw - 6;
    if (a > b) continue;
    const alvo = Math.min(Math.max(xReto, a), b);
    const inc = alvo - xReto;
    if (Math.abs(inc) <= 20 && alvo >= 10 && alvo <= 310 && (melhor === null || Math.abs(inc) < Math.abs(melhor))) melhor = inc;
  }
  return melhor;
}

// O bloco está levando o Pinguinzinho para a borda da tela (onde ele cairia).
function pertoDaBorda(s) {
  const v = s.fileiras[s.linha].vel;
  return (v < 0 && s.x < 80) || (v > 0 && s.x > 240);
}

// Joga a fase por toques até sair da cena de jogo. "amostra" recebe o estado a cada leitura.
async function jogar(page, amostra = null, limite = 240000) {
  let descendo = true;
  const inicio = Date.now();
  while (Date.now() - inicio < limite) {
    if (await cenaAtual(page) !== 'jogo') break;
    const s = await estado(page);
    if (amostra) await amostra(s);
    if (s.demo) {
      await tocar(page, 160, 100);
      continue;
    }
    if (!s.reiniciando && !s.pausa && (s.estado === 'margem' || s.estado === 'bloco')) {
      if (s.linha === 3) descendo = false;
      if (s.linha === -1) descendo = true;
      if (s.porta) descendo = false;
      let destino = null;
      let inc = null;
      if (s.estado === 'margem') {
        if (!s.porta) {
          inc = puloSeguro(s, 0);
          if (inc !== null) destino = 0;
        }
      } else {
        const preferido = descendo ? s.linha + 1 : s.linha - 1;
        const outro = descendo ? s.linha - 1 : s.linha + 1;
        inc = puloSeguro(s, preferido);
        if (inc !== null) destino = preferido;
        else if (s.ateAfundarAtual < 1.5 || pertoDaBorda(s)) {
          inc = puloSeguro(s, outro);
          if (inc !== null) destino = outro;
        }
      }
      if (destino !== null) {
        // toca no próprio destino, como a criança faz: margem (y 28) ou o bloco da fileira
        await tocar(page, s.x + inc, destino < 0 ? 28 : 46 + 24 * destino);
        await page.waitForTimeout(400);
        continue;
      }
    }
    await page.waitForTimeout(30);
  }
  return cenaAtual(page);
}

test('carrega sem erro, sem rede após o load, tela cheia, escala inteira e botões de canto de 1,3 cm', async ({ page }) => {
  const problemas = [];
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') problemas.push(m.text());
  });
  page.on('pageerror', (e) => problemas.push(String(e)));
  await page.goto('/index.html');
  await page.waitForLoadState('load');
  const depois = [];
  page.on('request', (r) => depois.push(r.url()));

  await page.waitForFunction(() => window.__jogo && window.__jogo.cena() === 'abertura');
  expect(await page.evaluate(() => window.__jogo.audio())).toBe('inexistente');
  await captura(page, 'abertura');
  await tocar(page, 160, 140);
  await page.waitForFunction(() => window.__jogo.cena() === 'modo');
  await page.waitForFunction(() => window.__jogo.audio() === 'running');
  expect(await page.evaluate(() => window.__jogo.musica())).toBe('tema');
  // Tela cheia pedida ao soltar o dedo (pointerup), que é quando o navegador aceita o gesto.
  await page.waitForFunction(() => document.fullscreenElement !== null);
  await captura(page, 'modo');
  await tocar(page, 80, 100);
  await page.waitForFunction(() => window.__jogo.cena() === 'mapa');
  await tocar(page, 40, 120);
  await page.waitForFunction(() => window.__jogo.cena() === 'jogo');
  await page.waitForTimeout(3000);
  await tocar(page, 160, 175);
  await page.waitForTimeout(2000);

  const medidas = await page.evaluate(() => {
    const c = document.getElementById('tela');
    const k = window.__jogo.escala();
    const r = c.getBoundingClientRect();
    const canto = Math.ceil(72 * window.devicePixelRatio / k);
    return { k, w: c.width, h: c.height, cantoCss: canto * r.width / 320 };
  });
  expect(Number.isInteger(medidas.k) && medidas.k >= 1).toBe(true);
  expect(medidas.w).toBe(320 * medidas.k);
  expect(medidas.h).toBe(180 * medidas.k);
  expect(medidas.cantoCss).toBeGreaterThanOrEqual(72);
  expect(problemas).toEqual([]);
  // Depois do load, só a própria origem: instalação do service worker e manifest (G3/G7).
  const origem = new URL(page.url()).origin;
  expect(depois.filter((u) => new URL(u).origin !== origem)).toEqual([]);
});

test('retrato mostra o aviso de girar o celular', async ({ browser }) => {
  const ctx = await browser.newContext({ ...devices['Pixel 7'] });
  const page = await ctx.newPage();
  await page.goto('/index.html');
  await page.waitForFunction(() => window.__jogo && window.__jogo.retrato() === true);
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(CAPTURAS, 'retrato.png') });
  await ctx.close();
});

test('mapa: ilha bloqueada não abre; fase 1 concluída deixa carimbo e libera a fase 2', async ({ page }) => {
  await page.goto('/index.html');
  await page.waitForFunction(() => window.__jogo && window.__jogo.cena() === 'abertura');
  await tocar(page, 160, 140);
  await tocar(page, 80, 100);
  await page.waitForFunction(() => window.__jogo.cena() === 'mapa');
  await tocar(page, 200, 120);
  await page.waitForTimeout(300);
  expect(await cenaAtual(page)).toBe('mapa');
  await captura(page, 'mapa-inicio');
  await tocar(page, 40, 120);
  await page.waitForFunction(() => window.__jogo.cena() === 'jogo');
  expect(await jogar(page)).toBe('concluida');
  await page.waitForTimeout(1600);
  await captura(page, 'fase1-concluida');
  await tocar(page, 160, 100);
  await page.waitForFunction(() => window.__jogo.cena() === 'mapa');
  await captura(page, 'mapa-carimbo');
  const salvo = await page.evaluate(() => JSON.parse(localStorage.getItem('aventura-pinguim')));
  expect(salvo.modos.diversao.carimbos[0]).toBe(true);
  expect(salvo.modos.diversao.liberada).toBe(2);
  expect(salvo.modos.aventura.liberada).toBe(1);
});

test('tocar no bloco de destino faz pular (problema achado no playtest)', async ({ page }) => {
  await abrirFase(page, 'diversao', 0);
  // Na margem, tocar em cima da primeira fileira (y 46) tem de pular, não andar.
  let s = await estado(page);
  await tocar(page, s.x, 46);
  s = await estado(page);
  expect(s.estado).toBe('pulando');
  await page.waitForFunction(() => ['bloco', 'margem'].includes(window.__jogo.jogo().estado));
  // Se caiu, espera voltar à margem e tenta de novo até estar num bloco da fileira 1.
  for (let i = 0; i < 20 && (await estado(page)).estado !== 'bloco'; i++) {
    await page.waitForFunction(() => window.__jogo.jogo().estado === 'margem');
    s = await estado(page);
    const f = s.fileiras[0];
    const cabe = f.blocos.some(([bx, bw]) => s.x >= bx + f.vel * 21 + 4 && s.x <= bx + f.vel * 21 + bw - 4);
    if (cabe) {
      await tocar(page, s.x, 46);
      await page.waitForFunction(() => ['bloco', 'margem'].includes(window.__jogo.jogo().estado) && window.__jogo.jogo().estado !== 'pulando');
    } else {
      await page.waitForTimeout(50);
    }
  }
  s = await estado(page);
  expect(s.estado).toBe('bloco');
  expect(s.linha).toBe(0);
  // Na fileira 1, tocar logo abaixo dos pés (y 58) é descer; tocar na margem (y 28) é subir.
  await tocar(page, s.x, 58);
  s = await estado(page);
  expect(s.estado).toBe('pulando');
  expect(s.destino).toBe(1);
  await page.waitForFunction(() => window.__jogo.jogo().estado !== 'pulando');
  await page.waitForTimeout(100);
  s = await estado(page);
  if (s.estado === 'bloco') {
    await tocar(page, s.x, 28 + 24 * s.linha);
    s = await estado(page);
    expect(s.estado).toBe('pulando');
    expect(s.destino).toBe(s.linha - 1);
  }
});

test('Diversão: cair não tira tijolo e ativa a ajuda após 3 quedas', async ({ page }) => {
  await abrirFase(page, 'diversao', 0);
  let quedas = 0;
  const inicio = Date.now();
  while (quedas < 3 && Date.now() - inicio < 60000) {
    const s = await estado(page);
    if (s.estado === 'margem') {
      const f = s.fileiras[0];
      const vazio = !f.blocos.some(([bx, bw]) => {
        const x = bx + f.vel * 21;
        return s.x >= x - s.assistencia - 6 && s.x <= x + bw + s.assistencia + 6;
      });
      if (vazio) {
        await tocar(page, s.x, 175);
        await page.waitForFunction(() => window.__jogo.jogo().estado === 'nadando');
        quedas++;
        await page.waitForFunction(() => window.__jogo.jogo().estado === 'margem');
        continue;
      }
    }
    await page.waitForTimeout(30);
  }
  const s = await estado(page);
  expect(quedas).toBe(3);
  expect(s.tijolos).toBe(0);
  expect(s.ajuda).toBeGreaterThan(0);
  expect(s.reinicios).toBe(0);
});

test('Aventura: cada queda tira um peixe-vida; sem peixes-vida, a fase recomeça', async ({ page }) => {
  await abrirFase(page, 'aventura', 0);
  const vidas = [];
  const inicio = Date.now();
  while (vidas.length < 3 && Date.now() - inicio < 90000) {
    const s = await estado(page);
    if (s.estado === 'margem' && !s.reiniciando) {
      const f = s.fileiras[0];
      const vazio = !f.blocos.some(([bx, bw]) => {
        const x = bx + f.vel * 21;
        return s.x >= x - s.assistencia - 6 && s.x <= x + bw + s.assistencia + 6;
      });
      if (vazio) {
        await tocar(page, s.x, 175);
        await page.waitForFunction(() => window.__jogo.jogo().estado === 'nadando');
        vidas.push((await estado(page)).vidas);
        if (vidas.length === 3) break;
        await page.waitForFunction(() => window.__jogo.jogo().estado === 'margem');
        continue;
      }
    }
    await page.waitForTimeout(30);
  }
  expect(vidas).toEqual([2, 1, 0]);
  await page.waitForTimeout(300);
  await captura(page, 'aventura-recomeco');
  await page.waitForFunction(() => window.__jogo.jogo().reinicios === 1, null, { timeout: 5000 });
  const s = await estado(page);
  expect(s.vidas).toBe(3);
  expect(s.tijolos).toBe(0);
  expect(await cenaAtual(page)).toBe('jogo');
});

test('Aventura: quando o sol se põe a fase recomeça; no Diversão não há relógio', async ({ page }) => {
  // Relógio falso do Playwright: 90 s de jogo em poucos segundos. Sem waitForFunction aqui,
  // porque ele também depende do relógio da página.
  await page.clock.install();
  const entrarNaFase = async (modoX) => {
    await page.goto('/index.html');
    await page.clock.runFor(500);
    await tocar(page, 160, 140);
    await page.clock.runFor(300);
    await tocar(page, modoX, 100);
    await page.clock.runFor(300);
    await tocar(page, 40, 120);
    await page.clock.runFor(300);
    expect(await cenaAtual(page)).toBe('jogo');
    if ((await estado(page)).demo) await tocar(page, 160, 100);
    await page.clock.runFor(100);
  };
  await entrarNaFase(240);
  await page.clock.runFor(60000);
  await captura(page, 'aventura-sol-baixo');
  await page.clock.runFor(32000);
  let s = await estado(page);
  expect(s.reinicios === 1 || s.reiniciando > 0).toBe(true);
  await page.clock.runFor(2000);
  s = await estado(page);
  expect(s.reinicios).toBe(1);
  expect(s.sol).toBeGreaterThan(80);

  await entrarNaFase(80);
  await page.clock.runFor(100000);
  s = await estado(page);
  expect(s.sol).toBeNull();
  expect(s.reinicios).toBe(0);
});

test('pausa: recomeçar e sair pedem confirmação', async ({ page }) => {
  await abrirFase(page, 'diversao', 0);
  await page.waitForTimeout(2000);
  await tocar(page, 5, 5);
  expect((await estado(page)).pausa).toBe('menu');
  await captura(page, 'pausa');
  await tocar(page, 40, 100);
  expect((await estado(page)).pausa).toBe('recomecar');
  await captura(page, 'pausa-confirmar');
  await tocar(page, 60, 100);
  expect((await estado(page)).pausa).toBe('menu');
  const antes = (await estado(page)).passos;
  expect(antes).toBeGreaterThan(60);
  await tocar(page, 40, 100);
  await tocar(page, 260, 100);
  let s = await estado(page);
  expect(s.pausa).toBeNull();
  expect(s.passos).toBeLessThan(antes);
  await tocar(page, 5, 5);
  await tocar(page, 280, 100);
  expect((await estado(page)).pausa).toBe('mapa');
  await tocar(page, 260, 100);
  await page.waitForFunction(() => window.__jogo.cena() === 'mapa');
});

test('pausa sozinho quando o app vai para segundo plano', async ({ page }) => {
  await abrirFase(page, 'diversao', 0);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  expect(await page.evaluate(() => window.__jogo.loopParado())).toBe(true);
  expect((await estado(page)).pausa).toBe('menu');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { value: false, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  expect(await page.evaluate(() => window.__jogo.loopParado())).toBe(false);
  await tocar(page, 160, 100);
  expect((await estado(page)).pausa).toBeNull();
});

test('fase 3: todo bloco pisca pelo menos 1 s antes de afundar', async ({ page }) => {
  await comProgresso(page, 4);
  await abrirFase(page, 'diversao', 2);
  const registro = await page.evaluate(() => new Promise((ok) => {
    const log = [];
    const fim = performance.now() + 12000;
    const passo = () => {
      const s = window.__jogo.jogo();
      log.push({ p: s.passos, e: s.fileiras.map((f) => f.blocos.map((b) => b[2])) });
      if (performance.now() < fim) requestAnimationFrame(passo);
      else ok(log);
    };
    requestAnimationFrame(passo);
  }));
  let afundamentos = 0;
  const seq = {};
  for (const { p, e } of registro) {
    e.forEach((linha, i) => linha.forEach((etapa, j) => {
      const k = `${i}-${j}`;
      const atual = seq[k] || { etapa: 'normal', desde: 0, piscou: 0 };
      if (etapa !== atual.etapa) {
        if (etapa === 'afundado') {
          afundamentos++;
          if (atual.etapa === 'pisca' && atual.desde > registro[0].p) expect(p - atual.desde).toBeGreaterThanOrEqual(59);
          else if (atual.desde > registro[0].p) throw new Error(`bloco ${k} afundou sem piscar`);
        }
        seq[k] = { etapa, desde: p };
      }
    }));
  }
  expect(afundamentos).toBeGreaterThan(0);
  await captura(page, 'fase3-afundando');
});

for (const fase of [1, 2, 3]) {
  test(`Diversão: fase ${fase + 1} concluída por toques, sem quedas causadas por gaivota ou caranguejo`, async ({ page }) => {
    soPixel();
    await comProgresso(page, 4);
    await abrirFase(page, 'diversao', fase);
    let capturou = false;
    let desde = null;
    let maiorBloqueio = 0;
    let fim = null;
    const cena = await jogar(page, async (s) => {
      if (!capturou && s.tijolos >= 3 && s.estado === 'bloco') {
        await captura(page, `fase${fase + 1}-diversao`);
        capturou = true;
      }
      // Ursinho: com a porta aberta e o Pinguinzinho na margem, não pode ficar na frente
      // da porta por mais de 3 s.
      if (s.urso && s.porta && s.estado === 'margem' && Math.abs(s.urso.x - 160) < 20) {
        if (desde === null) desde = s.passos;
        maiorBloqueio = Math.max(maiorBloqueio, (s.passos - desde) / 60);
      } else {
        desde = null;
      }
      fim = s;
    });
    expect(cena).toBe('concluida');
    expect(fim.quedasPor).toEqual({ gaivota: 0, caranguejo: 0 });
    test.info().annotations.push({ type: 'toques', description: JSON.stringify(fim.toques) });
    expect(maiorBloqueio).toBeLessThan(3);
    if (fase === 3) {
      await page.waitForTimeout(1600);
      await tocar(page, 160, 100);
      await page.waitForFunction(() => window.__jogo.cena() === 'final');
      expect(await page.evaluate(() => window.__jogo.musica())).toBe('festa');
      await page.waitForTimeout(3200);
      await captura(page, 'final');
      await tocar(page, 160, 100);
      await page.waitForFunction(() => window.__jogo.cena() === 'recordes');
      await captura(page, 'recordes');
      const salvo = await page.evaluate(() => JSON.parse(localStorage.getItem('aventura-pinguim')));
      expect(salvo.modos.diversao.carimbos[3]).toBe(true);
      expect(salvo.modos.diversao.recordes[3].pontos).toBeGreaterThan(0);
    }
  });
}

test('Aventura: fase 1 concluída por toques, com bônus de sol e recorde de tempo', async ({ page }) => {
  soPixel();
  await abrirFase(page, 'aventura', 0);
  let capturou = false;
  const cena = await jogar(page, async (s) => {
    if (!capturou && s.tijolos >= 4 && s.estado === 'bloco') {
      await captura(page, 'fase1-aventura');
      capturou = true;
    }
  });
  expect(cena).toBe('concluida');
  await page.waitForTimeout(1600);
  await captura(page, 'fase1-concluida-aventura');
  const salvo = await page.evaluate(() => JSON.parse(localStorage.getItem('aventura-pinguim')));
  expect(salvo.modos.aventura.carimbos[0]).toBe(true);
  expect(salvo.modos.aventura.recordes[0].segundos).toBeGreaterThan(0);
  expect(salvo.modos.aventura.recordes[0].pontos).toBeGreaterThan(160);
});

for (const fase of [1, 2, 3]) {
  test(`Aventura: fase ${fase + 1} concluída por toques`, async ({ page }) => {
    soPixel();
    test.setTimeout(420000);
    await comProgresso(page, 4);
    await abrirFase(page, 'aventura', fase);
    let capturou = false;
    let fim = null;
    const cena = await jogar(page, async (s) => {
      if (!capturou && s.tijolos >= 3 && s.estado === 'bloco') {
        await captura(page, `fase${fase + 1}-aventura`);
        capturou = true;
      }
      fim = s;
    }, 400000);
    expect(cena).toBe('concluida');
    test.info().annotations.push({
      type: 'aventura',
      description: `recomeços ${fim.reinicios}; toques ${JSON.stringify(fim.toques)}; quedas por ${JSON.stringify(fim.quedasPor)}`,
    });
  });
}

test('recordes: apagar só depois de segurar a lixeira por 3 s', async ({ page }) => {
  await comProgresso(page, 3);
  await page.goto('/index.html');
  await page.waitForFunction(() => window.__jogo && window.__jogo.cena() === 'abertura');
  await tocar(page, 160, 140);
  await tocar(page, 80, 100);
  await page.waitForFunction(() => window.__jogo.cena() === 'mapa');
  await tocar(page, 318, 2);
  await page.waitForFunction(() => window.__jogo.cena() === 'recordes');
  await captura(page, 'recordes-com-progresso');
  const segurar = async (ms) => {
    const p = await page.evaluate(() => window.__jogo.paraTela(280, 158));
    await page.evaluate(({ x, y }) => document.dispatchEvent(new PointerEvent('pointerdown', { clientX: x, clientY: y, isPrimary: true, bubbles: true })), p);
    await page.waitForTimeout(ms);
    await page.evaluate(({ x, y }) => document.dispatchEvent(new PointerEvent('pointerup', { clientX: x, clientY: y, isPrimary: true, bubbles: true })), p);
  };
  await segurar(1000);
  let salvo = await page.evaluate(() => JSON.parse(localStorage.getItem('aventura-pinguim')));
  expect(salvo.modos.diversao.liberada).toBe(3);
  await segurar(3500);
  salvo = await page.evaluate(() => JSON.parse(localStorage.getItem('aventura-pinguim')));
  expect(salvo.modos.diversao.liberada).toBe(1);
  expect(await cenaAtual(page)).toBe('recordes');
});

test('demonstração da mão fantasma na 1ª vez; toque pula; depois não aparece mais', async ({ page }) => {
  await abrirFase(page, 'diversao', 0, false);
  let s = await estado(page);
  expect(s.demo).toBe(true);
  expect(await page.evaluate(() => window.__jogo.musica())).toBe('fase');
  await page.waitForTimeout(1500);
  await captura(page, 'demonstracao');
  await tocar(page, 160, 100);
  s = await estado(page);
  expect(s.demo).toBe(false);
  expect(s.estado).toBe('margem');
  const salvo = await page.evaluate(() => JSON.parse(localStorage.getItem('aventura-pinguim')));
  expect(salvo.demos[0]).toBe(true);
  await tocar(page, 5, 5);
  await tocar(page, 280, 100);
  await tocar(page, 260, 100);
  await page.waitForFunction(() => window.__jogo.cena() === 'mapa');
  await tocar(page, 40, 120);
  await page.waitForFunction(() => window.__jogo.cena() === 'jogo');
  expect((await estado(page)).demo).toBe(false);
});

test('dica aparece após 7 s sem tocar e some com um toque', async ({ page }) => {
  await abrirFase(page, 'diversao', 0);
  expect((await estado(page)).dica).toBe(false);
  await page.waitForTimeout(7600);
  expect((await estado(page)).dica).toBe(true);
  await captura(page, 'dica');
  await tocar(page, 160, 20);
  expect((await estado(page)).dica).toBe(false);
});

test('som desligado continua desligado ao abrir o jogo de novo (G8)', async ({ page }) => {
  await page.goto('/index.html');
  await page.waitForFunction(() => window.__jogo && window.__jogo.cena() === 'abertura');
  await tocar(page, 318, 2);
  let salvo = await page.evaluate(() => JSON.parse(localStorage.getItem('aventura-pinguim')));
  expect(salvo.som).toBe(false);
  await page.reload();
  await page.waitForFunction(() => window.__jogo && window.__jogo.cena() === 'abertura');
  salvo = await page.evaluate(() => JSON.parse(localStorage.getItem('aventura-pinguim')));
  expect(salvo.som).toBe(false);
  await captura(page, 'abertura-mudo');
});

test('offline: depois da 1ª visita, o jogo abre e roda sem rede (G3, G4)', async ({ page, context }) => {
  await page.goto('/index.html');
  await page.waitForFunction(() => window.__jogo && window.__jogo.cena() === 'abertura');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(async () => {
    const c = await caches.open('ap-v3');
    return (await c.keys()).length >= 20;
  });
  await context.setOffline(true);
  const falhas = [];
  const problemas = [];
  page.on('requestfailed', (r) => falhas.push(r.url()));
  page.on('console', (m) => { if (m.type() === 'error') problemas.push(m.text()); });
  page.on('pageerror', (e) => problemas.push(String(e)));
  await page.reload();
  await page.waitForFunction(() => window.__jogo && window.__jogo.cena() === 'abertura');
  await tocar(page, 160, 140);
  await tocar(page, 80, 100);
  await page.waitForFunction(() => window.__jogo.cena() === 'mapa');
  await tocar(page, 40, 120);
  await page.waitForFunction(() => window.__jogo.cena() === 'jogo');
  if ((await estado(page)).demo) await tocar(page, 160, 100);
  await page.waitForTimeout(3000);
  await tocar(page, 160, 175);
  await page.waitForTimeout(2000);
  await captura(page, 'offline');
  expect(falhas).toEqual([]);
  expect(problemas).toEqual([]);
  await context.setOffline(false);
});

test('manifest de instalação completo, com ícones de 192 e 512 px', async ({ page }) => {
  await page.goto('/index.html');
  const r = await page.evaluate(async () => {
    const m = await (await fetch('manifest.webmanifest')).json();
    const tamanhos = await Promise.all(m.icons.map((i) => new Promise((ok) => {
      const img = new Image();
      img.onload = () => ok(`${img.naturalWidth}x${img.naturalHeight}`);
      img.onerror = () => ok('erro');
      img.src = i.src;
    })));
    return { m, tamanhos };
  });
  expect(r.m.name).toBe('Aventura Pinguim');
  expect(r.m.display).toBe('fullscreen');
  expect(r.m.orientation).toBe('landscape');
  expect(r.m.start_url).toBeTruthy();
  expect(r.tamanhos).toEqual(r.m.icons.map((i) => i.sizes));
  expect(r.tamanhos).toEqual(['192x192', '512x512']);
});

test('modo de diagnóstico mostra escala e quadrado de 2 cm', async ({ page }) => {
  await page.goto('/index.html?diag=1');
  await page.waitForFunction(() => window.__jogo && window.__jogo.cena() === 'abertura');
  await page.waitForTimeout(1200);
  await captura(page, 'diagnostico');
});
