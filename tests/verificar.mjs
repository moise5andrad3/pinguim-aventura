// Checagens estáticas (PRD, seção 12): G2 peso, G7 URLs externas, G6 termos proibidos.
// Os termos proibidos (nomes, dados pessoais) NUNCA ficam no repositório: são lidos da
// variável de ambiente TERMOS_PROIBIDOS, separados por vírgula.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { execSync } from 'node:child_process';

const RAIZ = new URL('..', import.meta.url).pathname;
const LIMITE = 500 * 1024;

// Arquivos que o jogo serve e carrega.
const DO_JOGO = ['index.html', 'manifest.webmanifest', 'sw.js', 'src', 'icones'];

function listar(p) {
  const abs = join(RAIZ, p);
  if (!existsSync(abs)) return [];
  if (statSync(abs).isFile()) return [abs];
  return readdirSync(abs).flatMap((n) => listar(join(p, n)));
}

let falhou = false;
const jogo = DO_JOGO.flatMap(listar);

const total = jogo.reduce((s, f) => s + statSync(f).size, 0);
console.log(`G2 peso: ${jogo.length} arquivos, ${(total / 1024).toFixed(1)} KB (limite 500 KB)`);
if (total > LIMITE) falhou = true;

const externas = [];
for (const f of jogo) {
  if (!/\.(html|js|json|webmanifest|css)$/.test(f)) continue;
  const txt = readFileSync(f, 'utf8');
  for (const m of txt.matchAll(/https?:\/\/[^\s'"`)]+/g)) externas.push(`${relative(RAIZ, f)}: ${m[0]}`);
}
console.log(`G7 URLs externas no código do jogo: ${externas.length}`);
externas.forEach((e) => console.log('  ' + e));
if (externas.length) falhou = true;

const termos = (process.env.TERMOS_PROIBIDOS || '').split(',').map((t) => t.trim()).filter(Boolean);
if (!termos.length) {
  console.log('G6 termos proibidos: NÃO VERIFICADO (defina TERMOS_PROIBIDOS fora do repositório)');
} else {
  const rastreados = execSync('git ls-files', { cwd: RAIZ, encoding: 'utf8' }).split('\n').filter(Boolean);
  const achados = [];
  for (const f of rastreados) {
    let txt;
    try { txt = readFileSync(join(RAIZ, f), 'utf8').toLowerCase(); } catch { continue; }
    for (const t of termos) if (txt.includes(t.toLowerCase())) achados.push(`${f}: termo nº ${termos.indexOf(t) + 1}`);
  }
  const log = execSync('git log --format=%an%n%ae%n%s%n%b', { cwd: RAIZ, encoding: 'utf8' }).toLowerCase();
  for (const t of termos) if (log.includes(t.toLowerCase())) achados.push(`histórico de commits: termo nº ${termos.indexOf(t) + 1}`);
  console.log(`G6 termos proibidos: ${termos.length} termos, ${achados.length} ocorrências`);
  achados.forEach((a) => console.log('  ' + a));
  if (achados.length) falhou = true;
}

process.exit(falhou ? 1 : 0);
