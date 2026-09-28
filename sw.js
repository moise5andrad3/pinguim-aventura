// Service worker: guarda todos os arquivos do jogo na primeira visita e depois os serve do
// aparelho (offline). Ao publicar uma versão nova, troque VERSAO: o navegador instala a nova
// na próxima abertura com rede e apaga o cache antigo.
const VERSAO = 'ap-v3';
const ARQUIVOS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icones/icone-192.png',
  'icones/icone-512.png',
  'src/main.js',
  'src/tela.js',
  'src/toque.js',
  'src/audio.js',
  'src/salvar.js',
  'src/sprites.js',
  'src/fonte.js',
  'src/fases.js',
  'src/cenas/abertura.js',
  'src/cenas/modo.js',
  'src/cenas/mapa.js',
  'src/cenas/jogo.js',
  'src/cenas/concluida.js',
  'src/cenas/final.js',
  'src/cenas/recordes.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== VERSAO).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

// Primeiro o cache; se não estiver lá, a rede (só a própria origem existe).
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((r) => r || fetch(e.request)),
  );
});
