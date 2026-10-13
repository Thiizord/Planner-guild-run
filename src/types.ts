// types.ts — Tipos compartilhados da aplicação

// ---------- heróis ----------
export interface Hero {
  id: string;
  name: string;
  tier: string;  // 'S' | 'A' | 'B' | 'C' (data.js sem tipagem — string)
  class: string;
  class2?: string;
  role: string;
  image?: string;
  baseStats: Record<string, number>;
}

// ---------- itens ----------
export interface GameItem {
  id: string;
  name: string;
  type: string;
  rarity: string;
  icon?: string;
  stats: Record<string, number>;
}

// ---------- relíquias ----------
export interface Relic {
  id: string;
  name: string;
  rarity: string;
  icon?: string;
  stats: Record<string, number>;
  description: string;
}

// ---------- sinergias ----------
export interface SynergyConfig {
  icon: string;
  label: string;
  bonuses: Record<number, string>;
}

export interface Synergy {
  class: string;
  icon: string;
  count: number;
  bonus: string;
  level: number;
}

export interface ClassAnalysis {
  class: string;
  count: number;
  level: number;
  next: number | null;
  icon: string;
  bonuses: Record<string, string>;
}

// ---------- especializações ----------
export type Rank = 'C' | 'B' | 'A' | 'S';

export interface Specialization {
  id: string;
  name: string;
  tier: 'S' | 'A' | 'B' | 'C' | 'D';
  kind: 'active' | 'passive';
  description: string;
  extraSlots?: number;
}

// ---------- estado ----------
export interface HeroConfig {
  rank: Rank;
  spec?: string | null;  // optional para permitir delete
}

export interface PlacementFrom {
  teamType: 'main' | 'reserve';
  index: number;
}

export interface AppState {
  main: (string | null)[];
  reserve: (string | null)[];
  items: Record<string, (string | null)[]>;
  teamRelics: string[];
  heroConfigs: Record<string, HeroConfig>;
  selectedCharId: string | null;
  placementCharId: string | null;
  placementFrom: PlacementFrom | null;
  tierFilter: string;
  classFilter: string;
  searchQuery: string;
}

export type TeamType = 'main' | 'reserve';

// ---------- actions ----------
export type AppAction =
  | { type: 'SELECT_CHAR'; charId: string }
  | { type: 'DROP_CHAR'; charId: string; teamType: TeamType; slotIndex: number }
  | { type: 'SWAP_SLOTS'; charId: string; fromType: TeamType; fromIndex: number; toType: TeamType; toIndex: number }
  | { type: 'SET_PLACEMENT_CHAR'; charId: string; fromType?: TeamType; fromIndex?: number }
  | { type: 'CLEAR_PLACEMENT_CHAR' }
  | { type: 'SELECT_SLOT'; teamType: TeamType; index: number }
  | { type: 'REMOVE_CHAR'; teamType: TeamType; index: number }
  | { type: 'MOVE_CHAR'; teamType: TeamType; index: number }
  | { type: 'SET_ITEM'; charId: string; slot: number; itemId: string }
  | { type: 'REMOVE_ITEM'; charId: string; slot: number }
  | { type: 'ADD_RELIC'; relicId: string }
  | { type: 'REMOVE_RELIC'; index: number }
  | { type: 'SET_HERO_RANK'; charId: string; rank: Rank }
  | { type: 'SET_HERO_SPEC'; charId: string; spec: string }
  | { type: 'SET_TIER_FILTER'; value: string }
  | { type: 'SET_CLASS_FILTER'; value: string }
  | { type: 'SET_SEARCH_QUERY'; value: string }
  | { type: 'RESET_TEAM' };

// ---------- contexto ----------
export interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}
