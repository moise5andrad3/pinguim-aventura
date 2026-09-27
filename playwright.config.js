// Testes em emulação mobile (paisagem, toque ligado). Servidor local estático.
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: 'tests',
  timeout: 240000,
  workers: 1,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:8080' },
  webServer: {
    command: 'python3 -m http.server 8080',
    url: 'http://localhost:8080/index.html',
    reuseExistingServer: true,
    stdout: 'ignore',
    stderr: 'ignore',
  },
  projects: [
    { name: 'pixel7', use: { ...devices['Pixel 7 landscape'] } },
    { name: 'galaxy-s24', use: { ...devices['Galaxy S24 landscape'] } },
  ],
});
