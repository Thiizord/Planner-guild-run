import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: caminho do repositório no GitHub Pages (production)
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/Planner-guild-run/' : '/',
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
}));
