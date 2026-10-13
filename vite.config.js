import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' funciona tanto em GitHub Pages quanto abrindo dist/index.html
// direto no navegador (file://) — caminhos relativos em vez de absolutos
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    watch: {
      usePolling: true,
      interval: 300,
      ignored: [
        '**/..*.tmpdir/**',
        '**/*.tmp',
        '**/.npm-cache/**',
        '**/dist/**',
      ],
    },
  },
});
