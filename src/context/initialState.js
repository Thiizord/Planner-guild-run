// initialState.js - Estado inicial
// Tabuleiro: 4 linhas x 7 colunas (honeycomb horizontal) = 26 hexagonos.
// main tem 26 entradas. Limite: 3 herois ativos no tabuleiro.
// Reservas ficam num painel lateral separado.

import { getTeamChars } from '../utils/helpers.js';

export const STORAGE_KEY = 'guildrun_pro';
export const MAX_ACTIVE = 3;
export const BOARD_SIZE = 26;

export const initialState = {
  main: new Array(BOARD_SIZE).fill(null),
  reserve: [null, null, null],
  items: {},
  teamRelics: [],
  selectedCharId: null,
  placementCharId: null,
  placementFrom: null,
  tierFilter: 'all',
  classFilter: 'all',
  searchQuery: ''
};

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

export function saveState(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      main: data.main,
      reserve: data.reserve,
      items: data.items,
      teamRelics: data.teamRelics
    }));
  } catch (e) {
    console.warn('Erro ao salvar:', e);
  }
}

// Expande main de qualquer tamanho para BOARD_SIZE entradas
function expandMain(oldMain) {
  const expanded = new Array(BOARD_SIZE).fill(null);
  if (!Array.isArray(oldMain)) return expanded;
  if (oldMain.length >= BOARD_SIZE) return oldMain.slice(0, BOARD_SIZE);

  // save antiga: realoca herois para o centro do tabuleiro
  // centro do grid 4x7: linha 2 (indices 15-17)
  const centerPositions = [15, 16, 17];
  let placed = 0;
  for (const id of oldMain) {
    if (id && placed < centerPositions.length && placed < MAX_ACTIVE) {
      expanded[centerPositions[placed]] = id;
      placed++;
    }
  }
  return expanded;
}

export function createInitialState() {
  const data = loadState();
  let main = expandMain((data && data.main) || null);
  let reserve = (data && data.reserve) || initialState.reserve;
  const items = (data && data.items) || {};
  const teamRelics = (data && data.teamRelics) || [];

  if (!data || getTeamChars(main, reserve).length === 0) {
    main = new Array(BOARD_SIZE).fill(null);
    main[15] = 'dragomir';
    main[16] = 'aria';
    main[17] = 'fiona';
    reserve = ['funke', null, null];
  }

  const nextItems = { ...items };
  for (const id of getTeamChars(main, reserve)) {
    if (!nextItems[id]) nextItems[id] = [null, null, null, null, null];
  }

  return {
    ...initialState,
    main,
    reserve,
    items: nextItems,
    teamRelics,
    selectedCharId: getTeamChars(main, reserve)[0] || null
  };
}
