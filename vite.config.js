import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Polling: a escrita atômica do harness (temp + rename entre pastas)
      // não gera eventos de fs.watch no Windows. Com polling o HMR detecta
      // qualquer mudança, e o projeto é pequeno (custo desprezível).
      usePolling: true,
      interval: 300,
      // Ignorar pastas temporárias de escrita atômica do harness de IA
      // (ex.: '..gitignore.12345.<uuid>.tmpdir') — o chokidar crasha com
      // EBUSY se tentar vigiar esses arquivos efêmeros durante uma edição.
      ignored: [
        '**/..*.tmpdir/**',
        '**/*.tmp',
        '**/.npm-cache/**',
        '**/dist/**',
      ],
    },
  },
});
