// Verificação do M1 em emulação mobile (paisagem, toque). Ver docs/PRD.md, seção 12.
const { test, expect, devices } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const CAPTURAS = path.join(__dirname, '..', 'docs', 'verificacao', 'm1');
fs.mkdirSync(CAPTURAS, { recursive: true });

// Toca num ponto em coordenadas lógicas (320x180).
async function tocar(page, x, y) {
  const p = await page.evaluate(([a, b]) => window.__jogo.paraTela(a, b), [x, y]);
  await page.touchscreen.tap(p.x, p.y);
}

const estado = (page) => page.evaluate(() => window.__jogo.jogo());

async function abrirEComecar(page) {
  await page.goto('/index.html');
  await page.waitForFunction(() => window.__jogo && window.__jogo.cena() === 'abertura');
  await tocar(page, 160, 140);
  await page.waitForFunction(() => window.__jogo.cena() === 'jogo');
}

// Um pulo é seguro se, sem inclinação, o ponto de pouso cai dentro de um bloco
// (com 4 px de folga para dentro, sem contar com a assistência de pouso).
function puloSeguro(s, destino) {
  if (destino < 0) return true;
  const vOrigem = s.linha >= 0 ? s.fileiras[s.linha].vel : 0;
  const xPouso = s.x + vOrigem * 21;
  const f = s.fileiras[destino];
  return f.blocos.some(([bx, bw]) => {
    const x = bx + f.vel * 21;
    return xPouso >= x + 4 && xPouso <= x + bw - 4;
  });
}

test('carrega sem erro, sem rede após o load, escala inteira e botões de 2 cm', async ({ page }) => {
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
  await page.screenshot({ path: path.join(CAPTURAS, `abertura-${test.info().project.name}.png`) });

  await tocar(page, 160, 140);
  await page.waitForFunction(() => window.__jogo.cena() === 'jogo');
  expect(await page.evaluate(() => window.__jogo.audio())).toBe('running');
  await page.waitForTimeout(3000);
  await tocar(page, 160, 175);
  await page.waitForTimeout(2000);

  const medidas = await page.evaluate(() => {
    const c = document.getElementById('tela');
    const k = window.__jogo.escala();
    const r = c.getBoundingClientRect();
    const dpr = window.devicePixelRatio;
    const canto = Math.ceil(115 * dpr / k);
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

test('modo Diversão: cair não tira tijolo e ativa a ajuda após 3 quedas', async ({ page }) => {
  await abrirEComecar(page);
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
  expect(await page.evaluate(() => window.__jogo.cena())).toBe('jogo');
});

test('pausa sozinho quando o app vai para segundo plano', async ({ page }) => {
  await abrirEComecar(page);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  expect(await page.evaluate(() => window.__jogo.loopParado())).toBe(true);
  expect((await estado(page)).pausado).toBe(true);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { value: false, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  expect(await page.evaluate(() => window.__jogo.loopParado())).toBe(false);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(CAPTURAS, `pausa-${test.info().project.name}.png`) });
  await tocar(page, 160, 100);
  expect((await estado(page)).pausado).toBe(false);
});

test('fase 1 no modo Diversão pode ser concluída por toques', async ({ page }) => {
  await abrirEComecar(page);
  let descendo = true;
  let capturouMeio = false;
  let capturouPorta = false;
  const inicio = Date.now();
  while (Date.now() - inicio < 200000) {
    if (await page.evaluate(() => window.__jogo.cena()) === 'concluida') break;
    const s = await estado(page);
    if (!capturouMeio && s.tijolos >= 4 && s.estado === 'bloco') {
      await page.screenshot({ path: path.join(CAPTURAS, `fase1-jogo-${test.info().project.name}.png`) });
      capturouMeio = true;
    }
    if (!capturouPorta && s.porta) {
      await page.screenshot({ path: path.join(CAPTURAS, `fase1-porta-${test.info().project.name}.png`) });
      capturouPorta = true;
    }
    if (s.estado === 'margem' || s.estado === 'bloco') {
      if (s.linha === 3) descendo = false;
      if (s.linha === -1) descendo = true;
      if (s.porta) descendo = false;
      const destino = descendo ? s.linha + 1 : s.linha - 1;
      const pular = s.estado === 'bloco' || (s.linha === -1 && !s.porta);
      if (pular && puloSeguro(s, destino)) {
        await tocar(page, s.x, descendo ? 175 : 59.5);
        await page.waitForTimeout(400);
        continue;
      }
    }
    await page.waitForTimeout(30);
  }
  await page.waitForFunction(() => window.__jogo.cena() === 'concluida');
  await page.waitForTimeout(1600);
  await page.screenshot({ path: path.join(CAPTURAS, `fase1-concluida-${test.info().project.name}.png`) });
  const salvo = await page.evaluate(() => JSON.parse(localStorage.getItem('aventura-pinguim')));
  expect(salvo.modos.diversao.carimbos[0]).toBe(true);
  expect(salvo.modos.diversao.liberada).toBe(2);
});

test('modo de diagnóstico mostra escala e quadrado de 2 cm', async ({ page }) => {
  await page.goto('/index.html?diag=1');
  await page.waitForFunction(() => window.__jogo && window.__jogo.cena() === 'abertura');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(CAPTURAS, `diagnostico-${test.info().project.name}.png`) });
});
