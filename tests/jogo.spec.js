// Verificação em emulação mobile (paisagem, toque). Critérios em docs/PRD.md, seção 12.
// Testes longos (fases inteiras jogadas por script) rodam só no perfil pixel7.
const { test, expect, devices } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const CAPTURAS = path.join(__dirname, '..', 'docs', 'verificacao', 'm2');
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
    const m = () => ({ liberada: lib, carimbos: [false, false, false, false], recordes: [null, null, null, null] });
    localStorage.setItem('aventura-pinguim', JSON.stringify({ versao: 1, som: true, modos: { diversao: m(), aventura: m() } }));
  }, liberada);
}

async function abrirFase(page, modo, fase) {
  await page.goto('/index.html');
  await page.waitForFunction(() => window.__jogo && window.__jogo.cena() === 'abertura');
  await tocar(page, 160, 140);
  await page.waitForFunction(() => window.__jogo.cena() === 'modo');
  await tocar(page, modo === 'aventura' ? 240 : 80, 100);
  await page.waitForFunction(() => window.__jogo.cena() === 'mapa');
  await tocar(page, 40 + fase * 80, 120);
  await page.waitForFunction(() => window.__jogo.cena() === 'jogo');
}

// Pulo seguro: sem inclinação, o pouso cai dentro de um bloco (4 px de folga para dentro, sem
// contar com a assistência) que não vai afundar logo.
function puloSeguro(s, destino) {
  if (destino < 0) return true;
  if (destino > 3) return false;
  const vOrigem = s.linha >= 0 ? s.fileiras[s.linha].vel : 0;
  const xPouso = s.x + vOrigem * 21;
  const f = s.fileiras[destino];
  return f.blocos.some(([bx, bw, etapa, ate]) => {
    const x = bx + f.vel * 21;
    return etapa !== 'afundado' && ate > 1.2 && xPouso >= x + 4 && xPouso <= x + bw - 4;
  });
}

// Joga a fase por toques até sair da cena de jogo. "amostra" recebe o estado a cada leitura.
async function jogar(page, amostra = null, limite = 240000) {
  let descendo = true;
  const inicio = Date.now();
  while (Date.now() - inicio < limite) {
    if (await cenaAtual(page) !== 'jogo') break;
    const s = await estado(page);
    if (amostra) await amostra(s);
    if (!s.reiniciando && !s.pausa && (s.estado === 'margem' || s.estado === 'bloco')) {
      if (s.linha === 3) descendo = false;
      if (s.linha === -1) descendo = true;
      if (s.porta) descendo = false;
      let destino = null;
      if (s.estado === 'margem') {
        if (!s.porta && puloSeguro(s, 0)) destino = 0;
      } else {
        const preferido = descendo ? s.linha + 1 : s.linha - 1;
        const outro = descendo ? s.linha - 1 : s.linha + 1;
        if (puloSeguro(s, preferido)) destino = preferido;
        else if (s.ateAfundarAtual < 1.5 && puloSeguro(s, outro)) destino = outro;
      }
      if (destino !== null) {
        await tocar(page, s.x, destino < s.linha ? 59.5 : 175);
        await page.waitForTimeout(400);
        continue;
      }
    }
    await page.waitForTimeout(30);
  }
  return cenaAtual(page);
}

test('carrega sem erro, sem rede após o load, tela cheia, escala inteira e botões de 2 cm', async ({ page }) => {
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
    const canto = Math.ceil(115 * window.devicePixelRatio / k);
    return { k, w: c.width, h: c.height, cantoCss: canto * r.width / 320 };
  });
  expect(Number.isInteger(medidas.k) && medidas.k >= 1).toBe(true);
  expect(medidas.w).toBe(320 * medidas.k);
  expect(medidas.h).toBe(180 * medidas.k);
  expect(medidas.cantoCss).toBeGreaterThanOrEqual(115);
  expect(problemas).toEqual([]);
  expect(depois).toEqual([]);
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
  const salvo = await page.evaluate(() => JSON.parse(localStorage.getItem('aventura-pinguim')));
  expect(salvo.modos.aventura.carimbos[0]).toBe(true);
  expect(salvo.modos.aventura.recordes[0].segundos).toBeGreaterThan(0);
  expect(salvo.modos.aventura.recordes[0].pontos).toBeGreaterThan(160);
});

test('recordes: apagar só depois de segurar a lixeira por 3 s', async ({ page }) => {
  await comProgresso(page, 3);
  await page.goto('/index.html');
  await page.waitForFunction(() => window.__jogo && window.__jogo.cena() === 'abertura');
  await tocar(page, 160, 140);
  await tocar(page, 80, 100);
  await page.waitForFunction(() => window.__jogo.cena() === 'mapa');
  await tocar(page, 318, 2);
  await page.waitForFunction(() => window.__jogo.cena() === 'recordes');
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

test('modo de diagnóstico mostra escala e quadrado de 2 cm', async ({ page }) => {
  await page.goto('/index.html?diag=1');
  await page.waitForFunction(() => window.__jogo && window.__jogo.cena() === 'abertura');
  await page.waitForTimeout(1200);
  await captura(page, 'diagnostico');
});
