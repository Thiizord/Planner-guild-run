// smoke-ssr.mjs - Smoke test: renderiza o App completo via react-dom/server
// Verifica o time inicial de exemplo, sinergias, contadores e estrutura dos painÃ©is.

// Polyfill de localStorage (SSR nÃ£o tem DOM; mesmo comportamento de navegador limpo)
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
    console.log(`  âœ” ${label}`);
  } else {
    failures++;
    console.error(`  âœ˜ FALTANDO: ${label} (busca: ${JSON.stringify(needle)})`);
  }
};

try {
  const { AppProvider } = await vite.ssrLoadModule('/src/context/AppContext.jsx');
  const { default: App } = await vite.ssrLoadModule('/src/App.jsx');

  const htmlRaw = renderToString(
    React.createElement(AppProvider, null, React.createElement(App))
  );
  // renderToString insere <!-- --> entre nÃ³s de texto adjacentes; no DOM real isso nÃ£o existe.
  const html = htmlRaw.replaceAll('<!-- -->', '');

  console.log(`HTML renderizado: ${html.length} caracteres\n`);
  console.log('Time inicial de exemplo (main.js vanilla):');
  check(html, 'Aria', 'Aria nos titulares');
  check(html, 'Dragomir', 'Dragomir nos titulares');
  check(html, 'Fiona', 'Fiona nos titulares');
  check(html, 'Funke', 'Funke na reserva');
  check(html, 'Vazio', 'slots vazios renderizados');

  console.log('\nContadores e painÃ©is:');
  check(html, '4/6', 'teamCount 4/6');
  check(html, '3/3', 'mainCount 3/3');
  check(html, '1/3', 'reserveCount 1/3');
  check(html, 'Campo de Batalha', 'arena do time');
  check(html, 'Sinergias Ativas', 'painel de sinergias');
  check(html, '(2x)', 'sinergia Mage 2x ativa');
  check(html, 'Nivel ', 'nivel da sinergia (sem mojibake)');
  check(html, 'Estat', 'painel de estatísticas');
  check(html, 'DPS estimado', 'display de DPS');
  check(html, 'dpsDisplay', 'valor de DPS renderizado');
  check(html, 'Adicionar Rel', 'botão de adicionar relíquia');
  check(html, 'Nenhuma rel', 'estado vazio de relíquias');
  const semPopups = !html.includes('modal-overlay') && !html.includes('id="itemModal"') && !html.includes('id="relicModal"') && !html.includes('toast-container');
  console.log(`  ${semPopups ? 'âœ”' : 'âœ˜'} fluxo 100% sem popups (sem modais, sem toasts)`);
  if (!semPopups) failures++;
  check(html, 'mini-empty clickable', 'mini-itens do personagem selecionado sÃ£o clicÃ¡veis');

  console.log('\nArte do jogo (ApÃªndice A.5):');
  check(html, '/assets/heroes/dragomir.png', 'Dragomir renderiza com imagem oficial');
  check(html, '/assets/heroes/fiona.png', 'Fiona renderiza com imagem oficial');
  check(html, '/assets/heroes/aria.png', 'Aria renderiza com imagem (fornecida pelo usuÃ¡rio)');
  check(html, '/assets/banner.webp', 'banner oficial do jogo no topo da pÃ¡gina');

  console.log('\nTabuleiro hexagonal 4x7 (26 celulas):');
  check(html, 'data-hex="h0"', 'primeiro hex h0');
  check(html, 'data-hex="h25"', 'ultimo hex h25');
  check(html, 'hex-grid-row', 'linhas do tabuleiro');
  check(html, 'hex-grid-row offset', 'linhas com offset (honeycomb)');
  check(html, 'hex-portrait', 'molduras hexagonais');
  check(html, 'reserve-panel', 'painel lateral de reservas');
  check(html, 'reserve-panel-slot', 'slots de reserva');
  const hexCount = (html.match(/data-hex=/g) || []).length;
  console.log(`  ${hexCount === 26 ? 'âœ”' : 'âœ˜'} 26 hexagonos renderizados (atual: ${hexCount})`);
  if (hexCount !== 26) failures++;
  const semHexBg = !html.includes('hex-grid-bg');
  console.log(`  ${semHexBg ? 'âœ”' : 'âœ˜'} fundo limpo (sem padrao de hexagonos)`);
  if (!semHexBg) failures++;
  const semMojibake = !html.includes('Ã°Å¸') && !html.includes('Ã¯Â¿Â½') && !html.includes('Ãƒ');
  console.log(`  ${semMojibake ? 'âœ”' : 'âœ˜'} zero mojibake no HTML renderizado`);
  if (!semMojibake) failures++;
  const temSVG = html.includes('<svg');
  console.log(`  ${temSVG ? 'âœ”' : 'âœ˜'} SVG icons renderizados (sem emojis)`);
  if (!temSVG) failures++;

  // PersistÃªncia: saveState roda em efeitos (nÃ£o no SSR) â€” testa direto o createInitialState + reducer
  const { createInitialState } = await vite.ssrLoadModule('/src/context/initialState.js');
  const { reducer } = await vite.ssrLoadModule('/src/context/reducer.js');
  const s0 = createInitialState();
  const ok0 = s0.main[16] === 'aria' && s0.main[15] === 'dragomir' && s0.main[17] === 'fiona' && s0.reserve[0] === 'funke' && s0.selectedCharId === 'dragomir';
  console.log(`\ncreateInitialState: ${ok0 ? 'âœ” time de exemplo + seleÃ§Ã£o inicial' : 'âœ˜ estado inicial errado: ' + JSON.stringify(s0)}`);

  const s1 = reducer(s0, { type: 'REMOVE_CHAR', teamType: 'main', index: 15 });
  const ok1 = s1.main[15] === null && s1.selectedCharId === null;
  console.log(`reducer REMOVE_CHAR: ${ok1 ? 'OK' : 'FAIL ' + JSON.stringify(s1)}`);

  const s2 = reducer(s1, { type: 'SELECT_CHAR', charId: 'kai' });
  const ok2 = s2.main.includes('kai');
  console.log(`reducer SELECT_CHAR: ${ok2 ? 'OK' : 'FAIL ' + JSON.stringify(s2)}`);

  const s3 = reducer(s2, { type: 'SELECT_CHAR', charId: 'kai' });
  const ok3 = s3 === s2;
  console.log(`reducer SELECT_CHAR duplicado: ${ok3 ? 'OK' : 'FAIL ' + JSON.stringify(s3)}`);

  const s4 = reducer(s3, { type: 'ADD_RELIC', relicId: 'rel_001' });
  const ok4 = s4.teamRelics.includes('rel_001');
  console.log(`reducer ADD_RELIC: ${ok4 ? 'OK' : 'FAIL ' + JSON.stringify(s4)}`);

  const sEq = reducer(s4, { type: 'SET_ITEM', charId: 'kai', slot: 0, itemId: 'item_001' });
  const okEq = sEq.items.kai[0] === 'item_001';
  console.log(`reducer SET_ITEM: ${okEq ? 'OK' : 'FAIL ' + JSON.stringify(sEq)}`);

  const sDup = reducer(sEq, { type: 'SET_ITEM', charId: 'kai', slot: 1, itemId: 'item_001' });
  const okDup = sDup === sEq;
  console.log(`reducer SET_ITEM duplicado: ${okDup ? 'OK' : 'FAIL ' + JSON.stringify(sDup)}`);

  const sRm = reducer(sEq, { type: 'REMOVE_ITEM', charId: 'kai', slot: 0 });
  const okRm = sRm.items.kai[0] === null;
  console.log(`reducer REMOVE_ITEM: ${okRm ? 'OK' : 'FAIL ' + JSON.stringify(sRm)}`);

  const sSel = reducer(sRm, { type: 'SELECT_SLOT', teamType: 'main', index: 16 });
  const okSel = sSel.selectedCharId === 'aria';
  console.log(`reducer SELECT_SLOT: ${okSel ? 'OK' : 'FAIL ' + JSON.stringify(sSel)}`);

  const sPl = reducer(s0, { type: 'SET_PLACEMENT_CHAR', charId: 'kai' });
  const okPl = sPl.placementCharId === 'kai' && sPl.placementFrom === null;
  console.log(`reducer SET_PLACEMENT_CHAR (biblioteca): ${okPl ? 'OK' : 'FAIL ' + JSON.stringify(sPl)}`);

  const sPlB = reducer(s0, { type: 'SET_PLACEMENT_CHAR', charId: 'dragomir', fromType: 'main', fromIndex: 15 });
  const okPlB = sPlB.placementCharId === 'dragomir' && sPlB.placementFrom?.teamType === 'main' && sPlB.placementFrom?.index === 15;
  console.log(`reducer SET_PLACEMENT_CHAR (tabuleiro): ${okPlB ? 'OK' : 'FAIL ' + JSON.stringify(sPlB)}`);

  const sPlT = reducer(sPl, { type: 'SET_PLACEMENT_CHAR', charId: 'kai' });
  const okPlT = sPlT.placementCharId === null && sPlT.placementFrom === null;
  console.log(`reducer SET_PLACEMENT_CHAR toggle: ${okPlT ? 'OK' : 'FAIL ' + JSON.stringify(sPlT)}`);

  const sRmForDrop = reducer(sPl, { type: 'REMOVE_CHAR', teamType: 'main', index: 16 });
  const sDrop = reducer(sRmForDrop, { type: 'DROP_CHAR', charId: 'kai', teamType: 'main', slotIndex: 16 });
  const okDrop = sDrop.main[16] === 'kai' && sDrop.placementCharId === null && sDrop.placementFrom === null;
  console.log(`reducer DROP_CHAR c/ placement: ${okDrop ? 'OK' : 'FAIL ' + JSON.stringify(sDrop)}`);

  const sSwapPl = reducer(sPlB, { type: 'SWAP_SLOTS', charId: 'dragomir', fromType: 'main', fromIndex: 15, toType: 'main', toIndex: 16 });
  const okSwapPl = sSwapPl.main[16] === 'dragomir' && sSwapPl.main[15] === 'aria' && sSwapPl.placementCharId === null;
  console.log(`reducer SWAP_SLOTS via placement: ${okSwapPl ? 'OK' : 'FAIL ' + JSON.stringify(sSwapPl)}`);

  const sClr = reducer(sPl, { type: 'CLEAR_PLACEMENT_CHAR' });
  const okClr = sClr.placementCharId === null && sClr.placementFrom === null;
  console.log(`reducer CLEAR_PLACEMENT_CHAR: ${okClr ? 'OK' : 'FAIL ' + JSON.stringify(sClr)}`);

  const sSw = reducer(s3, { type: 'SWAP_SLOTS', charId: 'kai', fromType: 'main', fromIndex: 0, toType: 'main', toIndex: 16 });
  const okSw = sSw.main[16] === 'kai' && sSw.main[0] === 'aria';
  console.log(`reducer SWAP_SLOTS (troca): ${okSw ? 'OK' : 'FAIL ' + JSON.stringify(sSw)}`);

  const sMv = reducer(sSw, { type: 'SWAP_SLOTS', charId: 'aria', fromType: 'main', fromIndex: 0, toType: 'reserve', toIndex: 1 });
  const okMv = sMv.main[0] === null && sMv.reserve[1] === 'aria';
  console.log(`reducer SWAP_SLOTS (move p/ reserva): ${okMv ? 'OK' : 'FAIL ' + JSON.stringify(sMv)}`);

  const sSelf = reducer(sMv, { type: 'SWAP_SLOTS', charId: 'kai', fromType: 'main', fromIndex: 16, toType: 'main', toIndex: 16 });
  const okSelf = sSelf === sMv;
  console.log(`reducer SWAP_SLOTS (drop em si): ${okSelf ? 'OK' : 'FAIL ' + JSON.stringify(sSelf)}`);

  const s5 = reducer(s4, { type: 'RESET_TEAM' });
  const ok5 = s5.main.every(v => v === null) && s5.main.length === 26 && s5.items && Object.keys(s5.items).length === 0 && s5.teamRelics.length === 0;
  console.log(`reducer RESET_TEAM: ${ok5 ? 'OK' : 'FAIL ' + JSON.stringify(s5)}`);

  const todosOk = failures === 0 && [ok0, ok1, ok2, ok3, ok4, okEq, okDup, okRm, okSel, okPl, okPlB, okPlT, okDrop, okSwapPl, okClr, okSw, okMv, okSelf, ok5].every(Boolean);
  console.log(todosOk ? '\nSMOKE TEST COMPLETO PASSOU' : `\n${failures} falha(s) no smoke test`);
  process.exitCode = todosOk ? 0 : 1;
} finally {
  await vite.close();
}
