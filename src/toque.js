// Entrada: Pointer Events no documento inteiro, agindo ao encostar (pointerdown).
// Teclado existe só para testes no desktop.
import { paraLogico } from './tela.js';

const HOLDOVER_MS = 120;
const HOLDOVER_PX = 8;

let ultimo = { t: -1e9, x: 0, y: 0 };

// aoToque(x, y): coordenadas lógicas; x === null significa "pulo reto" (teclado).
// aoGesto(): chamada nos eventos que o navegador aceita como gesto do usuário. No toque, isso é
// o pointerup (dedo saindo da tela), não o pointerdown (HTML Standard, "activation triggering
// input event"). Tela cheia e desbloqueio de áudio só funcionam a partir desses eventos.
export function iniciarToque(aoToque, aoGesto) {
  document.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (!e.isPrimary) return;
    const p = paraLogico(e.clientX, e.clientY);
    const agora = performance.now();
    const perto = Math.abs(p.x - ultimo.x) < HOLDOVER_PX && Math.abs(p.y - ultimo.y) < HOLDOVER_PX;
    if (agora - ultimo.t < HOLDOVER_MS && perto) return;
    ultimo = { t: agora, x: p.x, y: p.y };
    aoToque(p.x, p.y);
  }, { passive: false });

  document.addEventListener('pointerup', (e) => {
    if (e.isPrimary) aoGesto();
  });

  // Evita menu de toque longo e gestos residuais.
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  document.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    aoGesto();
    if (e.key === 'ArrowUp') aoToque(null, 0);
    else if (e.key === 'ArrowDown') aoToque(null, 180);
    else if (e.key === 'Escape') aoToque(0, 0);
    else if (e.key === 'm' || e.key === 'M') aoToque(320, 0);
    else if (e.key === 'Enter' || e.key === ' ') aoToque(160, 90);
  });
}
