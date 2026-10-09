// smoke-ssr.mjs - Smoke test: renderiza o App completo via react-dom/server
// Verifica o time inicial de exemplo, sinergias, contadores e estrutura dos painéis.

// Polyfill de localStorage (SSR não tem DOM; mesmo comportamento de navegador limpo)
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => store.has(k) ? store.get(k) : null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear()
};

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

let failures = 0;
const check = (html, needle, label) => {
  if (html.includes(needle)) {
    console.log(`  ✔ ${label}`);
  } else {
    failures++;
    console.error(`  ✘ FALTANDO: ${label} (busca: ${JSON.stringify(needle)})`);
  }
};

try {
  const { AppProvider } = await vite.ssrLoadModule('/src/context/AppContext.jsx');
  const { default: App } = await vite.ssrLoadModule('/src/App.jsx');

  const htmlRaw = renderToString(
    React.createElement(AppProvider, null, React.createElement(App))
  );
  // renderToString insere <!-- --> entre nós de texto adjacentes; no DOM real isso não existe.
  const html = htmlRaw.replaceAll('<!-- -->', '');

  console.log(`HTML renderizado: ${html.length} caracteres\n`);
  console.log('Time inicial de exemplo (main.js vanilla):');
  check(html, 'Aria', 'Aria nos titulares');
  check(html, 'Dragomir', 'Dragomir nos titulares');
  check(html, 'Fiona', 'Fiona nos titulares');
  check(html, 'Funke', 'Funke na reserva');
  check(html, 'Vazio', 'slots vazios renderizados');

  console.log('\nContadores e painéis:');
  check(html, '4/6', 'teamCount 4/6');
  check(html, '3/3', 'mainCount 3/3');
  check(html, '1/3', 'reserveCount 1/3');
  check(html, 'Campo de Batalha', 'arena do time');
  check(html, 'Sinergias Ativas', 'painel de sinergias');
  check(html, '(2x)', 'sinergia Mage 2x ativa');
  check(html, 'Nível ', 'nível da sinergia');
  check(html, 'Estatísticas do Time', 'painel de estatísticas');
  check(html, 'DPS estimado', 'display de DPS');
  check(html, 'dpsDisplay', 'valor de DPS renderizado');
  check(html, 'Adicionar Relíquia', 'botão de adicionar relíquia');
  check(html, 'Nenhuma relíquia equipada', 'estado vazio de relíquias');
  const semPopups = !html.includes('modal-overlay') && !html.includes('id="itemModal"') && !html.includes('id="relicModal"') && !html.includes('toast-container');
  console.log(`  ${semPopups ? '✔' : '✘'} fluxo 100% sem popups (sem modais, sem toasts)`);
  if (!semPopups) failures++;
  check(html, 'mini-empty clickable', 'mini-itens do personagem selecionado são clicáveis');

  console.log('\nArte do jogo (Apêndice A.5):');
  check(html, '/assets/heroes/dragomir.png', 'Dragomir renderiza com imagem oficial');
  check(html, '/assets/heroes/fiona.png', 'Fiona renderiza com imagem oficial');
  check(html, '/assets/heroes/aria.png', 'Aria renderiza com imagem (fornecida pelo usuário)');
  check(html, '/assets/banner.webp', 'banner oficial do jogo no topo da página');

  // Persistência: saveState roda em efeitos (não no SSR) — testa direto o createInitialState + reducer
  const { createInitialState } = await vite.ssrLoadModule('/src/context/initialState.js');
  const { reducer } = await vite.ssrLoadModule('/src/context/reducer.js');
  const s0 = createInitialState();
  const ok0 = s0.main.join(',') === 'aria,dragomir,fiona' && s0.reserve[0] === 'funke' && s0.selectedCharId === 'aria';
  console.log(`\ncreateInitialState: ${ok0 ? '✔ time de exemplo + seleção inicial' : '✘ estado inicial errado: ' + JSON.stringify(s0)}`);

  const s1 = reducer(s0, { type: 'REMOVE_CHAR', teamType: 'main', index: 0 });
  const ok1 = s1.main[0] === null && s1.selectedCharId === null;
  console.log(`reducer REMOVE_CHAR: ${ok1 ? '✔ remove e desseleciona' : '✘ ' + JSON.stringify(s1)}`);

  const s2 = reducer(s1, { type: 'SELECT_CHAR', charId: 'kai' });
  const ok2 = s2.main[0] === 'kai';
  console.log(`reducer SELECT_CHAR: ${ok2 ? '✔ preenche primeira vaga de titular' : '✘ ' + JSON.stringify(s2)}`);

  const s3 = reducer(s2, { type: 'SELECT_CHAR', charId: 'kai' });
  const ok3 = s3 === s2; // duplicado: nenhuma mudança (sem popup)
  console.log(`reducer SELECT_CHAR duplicado: ${ok3 ? '✔ rejeita silenciosamente (estado intacto)' : '✘ ' + JSON.stringify(s3)}`);

  const s4 = reducer(s3, { type: 'ADD_RELIC', relicId: 'rel_001' });
  const ok4 = s4.teamRelics.includes('rel_001');
  console.log(`reducer ADD_RELIC: ${ok4 ? '✔ adiciona relíquia' : '✘ ' + JSON.stringify(s4)}`);

  // SET_ITEM / REMOVE_ITEM: equipar e desequipar (seletor inline)
  const sEq = reducer(s4, { type: 'SET_ITEM', charId: 'kai', slot: 0, itemId: 'item_001' });
  const okEq = sEq.items.kai[0] === 'item_001';
  console.log(`reducer SET_ITEM: ${okEq ? '✔ equipa item' : '✘ ' + JSON.stringify(sEq)}`);

  const sDup = reducer(sEq, { type: 'SET_ITEM', charId: 'kai', slot: 1, itemId: 'item_001' });
  const okDup = sDup === sEq; // item duplicado em outro slot: nenhuma mudança
  console.log(`reducer SET_ITEM duplicado: ${okDup ? '✔ rejeita silenciosamente' : '✘ ' + JSON.stringify(sDup)}`);

  const sRm = reducer(sEq, { type: 'REMOVE_ITEM', charId: 'kai', slot: 0 });
  const okRm = sRm.items.kai[0] === null;
  console.log(`reducer REMOVE_ITEM: ${okRm ? '✔ desequipa item' : '✘ ' + JSON.stringify(sRm)}`);

  // SELECT_SLOT: seleciona personagem (fluxo sem popups)
  // main = ['kai','dragomir','fiona'] — index 1 é o dragomir
  const sSel = reducer(sRm, { type: 'SELECT_SLOT', teamType: 'main', index: 1 });
  const okSel = sSel.selectedCharId === 'dragomir';
  console.log(`reducer SELECT_SLOT: ${okSel ? '✔ seleciona personagem' : '✘ ' + JSON.stringify(sSel)}`);

  // SWAP_SLOTS (arrastar dentro do time — trocar/mover posição)
  // estado aqui: main = ['kai','dragomir','fiona'], reserve = ['funke', null, null]
  const sSw = reducer(s3, { type: 'SWAP_SLOTS', charId: 'kai', fromType: 'main', fromIndex: 0, toType: 'main', toIndex: 1 });
  const okSw = sSw.main[0] === 'dragomir' && sSw.main[1] === 'kai' && sSw.main[2] === 'fiona';
  console.log(`reducer SWAP_SLOTS (troca): ${okSw ? '✔ troca dragomir <-> kai' : '✘ ' + JSON.stringify(sSw)}`);

  const sMv = reducer(sSw, { type: 'SWAP_SLOTS', charId: 'dragomir', fromType: 'main', fromIndex: 0, toType: 'reserve', toIndex: 1 });
  const okMv = sMv.main[0] === null && sMv.reserve[1] === 'dragomir' && sMv.reserve[0] === 'funke';
  console.log(`reducer SWAP_SLOTS (move p/ vazio): ${okMv ? '✔ dragomir main[0] -> reserve[1]' : '✘ ' + JSON.stringify(sMv)}`);

  const sSelf = reducer(sMv, { type: 'SWAP_SLOTS', charId: 'kai', fromType: 'main', fromIndex: 1, toType: 'main', toIndex: 1 });
  const okSelf = sSelf === sMv; // no-op: nenhuma mudança
  console.log(`reducer SWAP_SLOTS (drop em si): ${okSelf ? '✔ no-op' : '✘ ' + JSON.stringify(sSelf)}`);

  const s5 = reducer(s4, { type: 'RESET_TEAM' });
  const ok5 = s5.main.every(v => v === null) && s5.items && Object.keys(s5.items).length === 0 && s5.teamRelics.length === 0;
  console.log(`reducer RESET_TEAM: ${ok5 ? '✔ limpa tudo' : '✘ ' + JSON.stringify(s5)}`);

  const todosOk = failures === 0 && [ok0, ok1, ok2, ok3, ok4, okEq, okDup, okRm, okSel, okSw, okMv, okSelf, ok5].every(Boolean);
  console.log(todosOk
    ? '\n✅ SMOKE TEST COMPLETO PASSOU'
    : `\n❌ ${failures} falha(s) no smoke test`);
  process.exitCode = todosOk ? 0 : 1;
} finally {
  await vite.close();
}
