// Salvamento local. Nada sai do aparelho. Sem dado pessoal (nome do jogador retirado no GATE 3).
// Se o localStorage falhar (modo privado, bloqueio), o jogo segue com o estado em memória.

const CHAVE = 'aventura-pinguim';

function modoVazio() {
  return { liberada: 1, carimbos: [false, false, false, false], recordes: [null, null, null, null] };
}

function padrao() {
  return { versao: 1, som: true, modos: { diversao: modoVazio(), aventura: modoVazio() } };
}

export const dados = carregar();

function carregar() {
  try {
    const d = JSON.parse(localStorage.getItem(CHAVE));
    if (d && d.versao === 1) return d;
  } catch (e) { /* segue com o padrão */ }
  return padrao();
}

export function gravar() {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(dados));
  } catch (e) { /* segue em memória */ }
}

// Registra a conclusão de uma fase: carimbo, fase seguinte liberada e recordes
// (maior pontuação; menor tempo). Devolve true se algum recorde foi batido.
export function concluirFase(modo, fase, pontos, segundos) {
  const m = dados.modos[modo];
  m.carimbos[fase] = true;
  m.liberada = Math.max(m.liberada, Math.min(fase + 2, 4));
  const r = m.recordes[fase];
  let novo = false;
  if (!r) {
    m.recordes[fase] = { pontos, segundos };
    novo = true;
  } else {
    if (pontos > r.pontos) { r.pontos = pontos; novo = true; }
    if (segundos < r.segundos) { r.segundos = segundos; novo = true; }
  }
  gravar();
  return novo;
}

export function apagarTudo() {
  dados.modos = padrao().modos;
  gravar();
}
