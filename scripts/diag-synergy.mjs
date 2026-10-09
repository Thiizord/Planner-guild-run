// diag-synergy.mjs — Renderiza o SynergyPanel via SSR e imprime o HTML para diagnóstico.

const { createServer } = await import('vite');
const { default: react } = await import('@vitejs/plugin-react');
const React = (await import('react')).default;
const { renderToString } = await import('react-dom/server');

const vite = await createServer({
  configFile: false,
  root: process.cwd(),
  server: { middlewareMode: true },
  appType: 'custom',
  plugins: [react()],
  logLevel: 'error',
});

try {
  const { AppProvider } = await vite.ssrLoadModule('/src/context/AppContext.jsx');
  const { default: SynergyPanel } = await vite.ssrLoadModule('/src/components/SynergyPanel.jsx');

  const html = renderToString(
    React.createElement(AppProvider, null, React.createElement(SynergyPanel))
  );

  // extrai só o painel de sinergias
  const idx = html.indexOf('synergyPanel');
  const slice = html.slice(Math.max(0, idx - 20), idx + 3000);

  // limpa comentários de hidratação pra leitura
  const clean = slice.replaceAll('<!-- -->', '');

  // imprime estruturado
  console.log('=== HTML DO PAINEL DE SINERGIAS ===');
  console.log(clean);

  // verifica problemas comuns
  console.log('\n=== DIAGNÓSTICO ===');
  console.log('tem undefined:', clean.includes('undefined'));
  console.log('tem NaN:', clean.includes('NaN'));
  console.log('tem [object:', clean.includes('[object'));
  console.log('tem (2x):', clean.includes('(2x)'));
  console.log('tem Nível:', clean.includes('Nível'));
  console.log('tem bonus:', clean.includes('bonus'));
  console.log('tem dot:', clean.includes('dot'));
  console.log('tem progress:', clean.includes('synergy-progress'));
  console.log('tem bar:', clean.includes('bar'));
  console.log('tem hint:', clean.includes('synergy-hint'));
  console.log('tem active:', clean.includes('active'));
  console.log('tem inactive:', clean.includes('inactive'));
} finally {
  await vite.close();
}
