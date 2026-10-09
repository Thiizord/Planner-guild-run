// reducer.js - Todas as ações do app (guia, Etapa 4)
// Toda a lógica de modificação de estado passa por aqui (regra 6.3 do guia).
// Fluxo 100% sem popups (pedido do usuário): nenhum toast, nenhum modal —
// o feedback visual acontece inline na própria interface.

import { getRelic, isInTeam, getCharItems } from '../utils/helpers.js';

export function reducer(state, action) {
  switch (action.type) {
    // ---------- Escalar personagem (actions.js → selectChar) ----------
    case 'SELECT_CHAR': {
      const charId = action.charId;
      if (isInTeam(state.main, state.reserve, charId)) return state;
      const mainIdx = state.main.indexOf(null);
      if (mainIdx !== -1) {
        const main = [...state.main];
        main[mainIdx] = charId;
        return { ...state, main };
      }
      const reserveIdx = state.reserve.indexOf(null);
      if (reserveIdx !== -1) {
        const reserve = [...state.reserve];
        reserve[reserveIdx] = charId;
        return { ...state, reserve };
      }
      return state; // time cheio — sem popup
    }

    // ---------- Arrastar para slot (dragdrop.js → dropOnSlot) ----------
    case 'DROP_CHAR': {
      const { charId, teamType, slotIndex } = action;
      if (!charId) return state; // sem dragData (dragdrop.js vanilla)
      if (isInTeam(state.main, state.reserve, charId)) return state;
      const arr = teamType === 'main' ? state.main : state.reserve;
      if (arr[slotIndex] !== null) return state; // slot ocupado — sem popup
      const newArr = [...arr];
      newArr[slotIndex] = charId;
      return { ...state, [teamType]: newArr, placementCharId: null, placementFrom: null };
    }

    // ---------- Pegar heroi para posicionamento/movimentacao (2 cliques) ----------
    case 'SET_PLACEMENT_CHAR': {
      const { charId, fromType, fromIndex } = action;
      // toggle: clicar no mesmo heroi cancela
      if (state.placementCharId === charId) {
        return { ...state, placementCharId: null, placementFrom: null };
      }
      return {
        ...state,
        placementCharId: charId,
        placementFrom: fromType != null ? { teamType: fromType, index: fromIndex } : null,
      };
    }

    case 'CLEAR_PLACEMENT_CHAR':
      return { ...state, placementCharId: null, placementFrom: null };

    // ---------- Arrastar entre slots do time (trocar/mover posição) ----------
    // Funcionalidade nova (o vanilla só suportava arrastar da pool; arrastar um
    // slot preenchido dava "já está no time!").
    case 'SWAP_SLOTS': {
      const { charId, fromType, fromIndex, toType, toIndex } = action;
      const fromArr = fromType === 'main' ? state.main : state.reserve;
      const toArr = toType === 'main' ? state.main : state.reserve;
      const moving = fromArr[fromIndex];
      if (!moving || moving !== charId) return state; // slot de origem mudou desde o dragstart
      if (fromType === toType && fromIndex === toIndex) return state; // dropou em si mesmo

      if (fromType === toType) {
        const arr = [...fromArr];
        const target = arr[toIndex];
        arr[toIndex] = moving;
        arr[fromIndex] = target;
        return { ...state, [fromType]: arr, placementCharId: null, placementFrom: null };
      }
      const from = [...fromArr];
      const to = [...toArr];
      const target = to[toIndex];
      to[toIndex] = moving;
      from[fromIndex] = target;
      return {
        ...state,
        main: fromType === 'main' ? from : to,
        reserve: fromType === 'main' ? to : from,
        placementCharId: null,
        placementFrom: null,
      };
    }

    // ---------- Remover personagem (actions.js → removeChar) ----------
    case 'REMOVE_CHAR': {
      const { teamType, index } = action;
      const arr = teamType === 'main' ? state.main : state.reserve;
      const charId = arr[index];
      if (!charId) return state;
      const newArr = [...arr];
      newArr[index] = null;
      const selectedCharId = state.selectedCharId === charId ? null : state.selectedCharId;
      return { ...state, [teamType]: newArr, selectedCharId };
    }

    // ---------- Mover entre titulares/reservas (actions.js → moveChar) ----------
    case 'MOVE_CHAR': {
      const { teamType, index } = action;
      const arr = teamType === 'main' ? state.main : state.reserve;
      const charId = arr[index];
      if (!charId) return state;
      if (teamType === 'main') {
        const reserveIdx = state.reserve.indexOf(null);
        if (reserveIdx === -1) return state; // reserva cheia — sem popup
        const reserve = [...state.reserve];
        reserve[reserveIdx] = charId;
        const main = [...state.main];
        main[index] = null;
        return { ...state, main, reserve };
      }
      const mainIdx = state.main.indexOf(null);
      if (mainIdx === -1) return state; // titulares cheios — sem popup
      const main = [...state.main];
      main[mainIdx] = charId;
      const reserve = [...state.reserve];
      reserve[index] = null;
      return { ...state, main, reserve };
    }

    // ---------- Selecionar slot (actions.js → selectSlot; sem popup) ----------
    case 'SELECT_SLOT': {
      const { teamType, index } = action;
      const arr = teamType === 'main' ? state.main : state.reserve;
      const charId = arr[index];
      if (charId) {
        return { ...state, selectedCharId: charId };
      }
      return state;
    }

    // ---------- Equipar item (modals.js → equipItem; seletor inline, sem popup) ----------
    case 'SET_ITEM': {
      const { charId, slot, itemId } = action;
      if (!charId) return state;
      const items = getCharItems(state.items, charId);
      for (let i = 0; i < items.length; i++) {
        if (items[i] === itemId && i !== slot) {
          return state; // já equipado em outro slot — o seletor inline desabilita esse caso
        }
      }
      const nextCharItems = items.map((id, i) => (i === slot ? itemId : id));
      return { ...state, items: { ...state.items, [charId]: nextCharItems } };
    }

    // ---------- Remover item (desequipar slot) ----------
    case 'REMOVE_ITEM': {
      const { charId, slot } = action;
      if (!charId) return state;
      const items = getCharItems(state.items, charId);
      const nextCharItems = items.map((id, i) => (i === slot ? null : id));
      return { ...state, items: { ...state.items, [charId]: nextCharItems } };
    }

    // ---------- Relíquias (modals.js → addRelic / removeRelic; seletor inline) ----------
    case 'ADD_RELIC': {
      const { relicId } = action;
      if (state.teamRelics.includes(relicId)) {
        return state; // o seletor inline só lista relíquias disponíveis
      }
      return { ...state, teamRelics: [...state.teamRelics, relicId] };
    }

    case 'REMOVE_RELIC': {
      const { index } = action;
      if (!getRelic(state.teamRelics[index])) return state;
      const teamRelics = state.teamRelics.filter((_, i) => i !== index);
      return { ...state, teamRelics };
    }

    // ---------- Filtros e busca (main.js vanilla) ----------
    case 'SET_TIER_FILTER':
      return { ...state, tierFilter: action.value };
    case 'SET_CLASS_FILTER':
      return { ...state, classFilter: action.value };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.value };

    // ---------- Resetar (export.js → resetTeam; confirmação inline no Header) ----------
    case 'RESET_TEAM': {
      return {
        ...state,
        main: [null, null, null],
        reserve: [null, null, null],
        items: {},
        teamRelics: [],
        selectedCharId: null
      };
    }

    default:
      return state;
  }
}
