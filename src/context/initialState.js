// initialState.js - Estado inicial (mesmo formato do state.js vanilla)
// + carregamento do localStorage (mesma chave: 'guildrun_pro')

import { getTeamChars } from '../utils/helpers.js';

export const STORAGE_KEY = 'guildrun_pro';

export const initialState = {
  main: [null, null, null],
  reserve: [null, null, null],
  items: {},              // { charId: [itemId|null, ...5 slots] }
  teamRelics: [],          // array de relicIds
  selectedCharId: null,
  tierFilter: 'all',
  classFilter: 'all',
  searchQuery: ''
};

// Equivalente ao loadState() do state.js vanilla (retorna os dados persistidos ou null)
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data) return null;
    return data;
  } catch (e) {
    return null;
  }
}

// Equivalente ao saveState() do state.js vanilla (persiste apenas o subconjunto salvo no original)
export function saveState(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      main: data.main,
      reserve: data.reserve,
      items: data.items,
      teamRelics: data.teamRelics
    }));
  } catch (e) {
    console.warn('⚠️ Erro ao salvar:', e);
  }
}

// Inicialização idêntica ao main.js vanilla:
// carrega o estado salvo; se não houver time, cria o time inicial de exemplo
// e seleciona o primeiro personagem.
export function createInitialState() {
  const data = loadState();
  let main = (data && data.main) || initialState.main;
  let reserve = (data && data.reserve) || initialState.reserve;
  const items = (data && data.items) || {};
  const teamRelics = (data && data.teamRelics) || [];

  if (!data || getTeamChars(main, reserve).length === 0) {
    // Time inicial de exemplo
    main = ['aria', 'dragomir', 'fiona'];
    reserve = ['funke', null, null];
  }

  // Garante array de itens para cada personagem do time (main.js vanilla)
  const nextItems = { ...items };
  for (const id of getTeamChars(main, reserve)) {
    if (!nextItems[id]) nextItems[id] = [null, null, null, null, null];
  }

  // Seleciona o primeiro personagem do time (main.js vanilla)
  const selectedCharId = getTeamChars(main, reserve)[0] || null;

  return {
    ...initialState,
    main,
    reserve,
    items: nextItems,
    teamRelics,
    selectedCharId
  };
}
