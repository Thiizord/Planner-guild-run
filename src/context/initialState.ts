// initialState.ts - Estado inicial
// Tabuleiro: 4 linhas x 7 colunas (honeycomb horizontal) = 26 hexagonos.
// main tem 26 entradas. Limite: 3 herois ativos no tabuleiro.

import { getTeamChars } from '../utils/helpers';
import type { AppState } from '../types';

export const STORAGE_KEY = 'guildrun_pro';
export const MAX_ACTIVE = 6;     // max 6 herois no tabuleiro (campo)
export const MAX_RESERVE = 3;    // max 3 herois na reserva
export const MAX_TEAM = 6;       // total do time: main + reserve <= 6
export const BOARD_SIZE = 28;    // 4 linhas x 7 colunas

export const initialState: AppState = {
  main: new Array(BOARD_SIZE).fill(null),
  reserve: [null, null, null],
  items: {},
  teamRelics: [],
  heroConfigs: {},
  selectedCharId: null,
  placementCharId: null,
  placementFrom: null,
  tierFilter: 'all',
  classFilter: 'all',
  searchQuery: ''
};

// dados persistidos (subconjunto do estado)
interface PersistedData {
  main?: (string | null)[];
  reserve?: (string | null)[];
  items?: Record<string, (string | null)[]>;
  teamRelics?: string[];
  heroConfigs?: Record<string, { rank: string; spec?: string | null }>;
}

export function loadState(): PersistedData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

export function saveState(data: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      main: data.main,
      reserve: data.reserve,
      items: data.items,
      teamRelics: data.teamRelics,
      heroConfigs: data.heroConfigs || {}
    }));
  } catch (e) {
    console.warn('Erro ao salvar:', e);
  }
}

// Expande main de qualquer tamanho para BOARD_SIZE entradas
function expandMain(oldMain: (string | null)[] | null): (string | null)[] {
  const expanded: (string | null)[] = new Array(BOARD_SIZE).fill(null);
  if (!Array.isArray(oldMain)) return expanded;
  if (oldMain.length >= BOARD_SIZE) return oldMain.slice(0, BOARD_SIZE);

  // save antiga: realoca herois para o centro do tabuleiro
  // centro do grid 4x7: linha 2, colunas 2-4 (indices 16-18)
  const centerPositions = [16, 17, 18];
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
  const heroConfigs = (data && data.heroConfigs) || {};

  if (!data || getTeamChars(main, reserve).length === 0) {
    main = new Array(BOARD_SIZE).fill(null);
    main[16] = 'dragomir';
    main[17] = 'aria';
    main[18] = 'fiona';
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
