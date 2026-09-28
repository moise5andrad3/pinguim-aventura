// Gera os ícones PNG de instalação (192 e 512 px) a partir do desenho do Pinguinzinho em
// src/sprites.js. Ferramenta de desenvolvimento: roda uma vez (node ferramentas/icones.mjs) e os
// PNG são commitados. Usa o Chromium do Playwright só para desenhar num canvas.
import { readFileSync, writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const RAIZ = new URL('..', import.meta.url).pathname;
const fonte = readFileSync(RAIZ + 'src/sprites.js', 'utf8');
const paleta = [...fonte.slice(fonte.indexOf('PALETA'), fonte.indexOf('];')).matchAll(/'(#[0-9A-F]{6})'/gi)].map((m) => m[1]);
const bloco = fonte.slice(fonte.indexOf('  pinguim: ['), fonte.indexOf('  pinguim_pisca: ['));
const pinguim = [...bloco.matchAll(/'([0-9a-f.]+)'/g)].map((m) => m[1]);

const navegador = await chromium.launch();
const pagina = await navegador.newPage();
for (const lado of [192, 512]) {
  const png = await pagina.evaluate(({ lado, paleta, pinguim }) => {
    const c = document.createElement('canvas');
    c.width = c.height = lado;
    const g = c.getContext('2d');
    const px = lado / 32; // grade de 32x32 "pixels" de pixel art
    const ret = (x, y, w, h, cor) => { g.fillStyle = paleta[cor]; g.fillRect(x * px, y * px, w * px, h * px); };
    ret(0, 0, 32, 32, 4);          // céu
    ret(0, 21, 32, 11, 2);         // mar
    ret(0, 21, 32, 1, 3);
    ret(3, 24, 26, 3, 5);          // bloco de gelo
    ret(3, 27, 26, 1, 4);
    // Pinguinzinho em escala 1,5 (24x24 células), centralizado: fica dentro da zona segura
    // de ícones "maskable" (círculo central de 80%).
    const e = 1.5;
    pinguim.forEach((linha, y) => [...linha].forEach((ch, x) => {
      if (ch === '.') return;
      g.fillStyle = paleta[parseInt(ch, 16)];
      g.fillRect((4 + x * e) * px, (1.5 + y * e) * px, e * px + 0.5, e * px + 0.5);
    }));
    return c.toDataURL('image/png');
  }, { lado, paleta, pinguim });
  writeFileSync(`${RAIZ}icones/icone-${lado}.png`, Buffer.from(png.split(',')[1], 'base64'));
  console.log(`icones/icone-${lado}.png`);
}
await navegador.close();
