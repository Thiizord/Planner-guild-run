// reducer.js - Todas as ações do app (guia, Etapa 4)
// Toda a lógica de modificação de estado passa por aqui (regra 6.3 do guia).
// Os toasts foram movidos para o reducer (toasts são estado), mantendo
// as mensagens originais de actions.js/dragdrop.js/modals.js/export.js.

import { getCharacter, getItem, getRelic, isInTeam, getCharItems } from '../utils/helpers.js';

// showToast via reducer: anexa o toast ao estado (equivalente ao toast.js vanilla)
function withToast(state, message, type = 'info') {
  const id = state.toastSeq;
  return {
    ...state,
    toasts: [...state.toasts, { id, message, type }],
    toastSeq: state.toastSeq + 1
  };
}

export function reducer(state, action) {
  switch (action.type) {
    // ---------- Escalar personagem (actions.js → selectChar) ----------
    case 'SELECT_CHAR': {
      const charId = action.charId;
      const char = getCharacter(charId);
      if (!char) return state;
      if (isInTeam(state.main, state.reserve, charId)) {
        return withToast(state, `${char.name} já está no time!`, 'info');
      }
      const mainIdx = state.main.indexOf(null);
      if (mainIdx !== -1) {
        const main = [...state.main];
        main[mainIdx] = charId;
        return withToast({ ...state, main }, `${char.name} escalado como titular!`, 'success');
      }
      const reserveIdx = state.reserve.indexOf(null);
      if (reserveIdx !== -1) {
        const reserve = [...state.reserve];
        reserve[reserveIdx] = charId;
        return withToast({ ...state, reserve }, `${char.name} escalado como reserva!`, 'success');
      }
      return withToast(state, 'Time cheio! (6/6)', 'error');
    }

    // ---------- Arrastar para slot (dragdrop.js → dropOnSlot) ----------
    case 'DROP_CHAR': {
      const { charId, teamType, slotIndex } = action;
      if (!charId) return state; // sem dragData (dragdrop.js vanilla)
      const char = getCharacter(charId);
      if (!char) return state;
      if (isInTeam(state.main, state.reserve, charId)) {
        return withToast(state, `${char.name} já está no time!`, 'info');
      }
      const arr = teamType === 'main' ? state.main : state.reserve;
      if (arr[slotIndex] !== null) {
        return withToast(state, 'Slot ocupado!', 'error');
      }
      const newArr = [...arr];
      newArr[slotIndex] = charId;
      return withToast({ ...state, [teamType]: newArr }, `${char.name} escalado com sucesso!`, 'success');
    }

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

      let main = state.main;
      let reserve = state.reserve;
      if (fromType === toType) {
        // mesmo grupo: troca os dois (ou move para vazio)
        const arr = [...fromArr];
        const target = arr[toIndex];
        arr[toIndex] = moving;
        arr[fromIndex] = target; // null vira vazio; personagem = swap
        if (fromType === 'main') main = arr; else reserve = arr;
      } else {
        // entre titulares e reservas
        const from = [...fromArr];
        const to = [...toArr];
        const target = to[toIndex];
        to[toIndex] = moving;
        from[fromIndex] = target; // swap entre grupos; null vira vazio
        main = fromType === 'main' ? from : to;
        reserve = fromType === 'main' ? to : from;
      }
      const char = getCharacter(moving);
      return withToast({ ...state, main, reserve }, `🔄 ${char ? char.name : 'Personagem'} movido.`, 'info');
    }

    // ---------- Remover personagem (actions.js → removeChar) ----------
    case 'REMOVE_CHAR': {
      const { teamType, index } = action;
      const arr = teamType === 'main' ? state.main : state.reserve;
      const charId = arr[index];
      if (!charId) return state;
      const char = getCharacter(charId);
      const newArr = [...arr];
      newArr[index] = null;
      const selectedCharId = state.selectedCharId === charId ? null : state.selectedCharId;
      return withToast(
        { ...state, [teamType]: newArr, selectedCharId },
        `${char ? char.name : 'Personagem'} removido.`,
        'info'
      );
    }

    // ---------- Mover entre titulares/reservas (actions.js → moveChar) ----------
    case 'MOVE_CHAR': {
      const { teamType, index } = action;
      const arr = teamType === 'main' ? state.main : state.reserve;
      const charId = arr[index];
      if (!charId) return state;
      const char = getCharacter(charId);
      if (!char) return state;
      if (teamType === 'main') {
        const reserveIdx = state.reserve.indexOf(null);
        if (reserveIdx === -1) {
          return withToast(state, 'Reserva está cheia!', 'error');
        }
        const reserve = [...state.reserve];
        reserve[reserveIdx] = charId;
        const main = [...state.main];
        main[index] = null;
        return withToast({ ...state, main, reserve }, `${char.name} movido para reserva.`, 'success');
      } else {
        const mainIdx = state.main.indexOf(null);
        if (mainIdx === -1) {
          return withToast(state, 'Titulares estão cheios!', 'error');
        }
        const main = [...state.main];
        main[mainIdx] = charId;
        const reserve = [...state.reserve];
        reserve[index] = null;
        return withToast({ ...state, main, reserve }, `${char.name} movido para titulares.`, 'success');
      }
    }

    // ---------- Selecionar slot (actions.js → selectSlot) ----------
    case 'SELECT_SLOT': {
      const { teamType, index } = action;
      const arr = teamType === 'main' ? state.main : state.reserve;
      const charId = arr[index];
      if (charId) {
        const char = getCharacter(charId);
        return withToast(
          { ...state, selectedCharId: charId },
          `👤 ${char.name} selecionado - Edite os itens abaixo`,
          'info'
        );
      }
      return withToast(state, 'Slot vazio. Clique em um personagem da lista para escalar.', 'info');
    }

    // ---------- Equipar item (modals.js → equipItem) ----------
    case 'SET_ITEM': {
      const { charId, slot, itemId } = action;
      if (!charId) return state;
      const items = getCharItems(state.items, charId);
      for (let i = 0; i < items.length; i++) {
        if (items[i] === itemId && i !== slot) {
          return withToast(state, 'Item já equipado em outro slot!', 'error');
        }
      }
      const nextCharItems = items.map((id, i) => (i === slot ? itemId : id));
      const item = getItem(itemId);
      return withToast(
        {
          ...state,
          items: { ...state.items, [charId]: nextCharItems },
          itemModal: { ...state.itemModal, open: false }
        },
        `✅ ${item ? item.name : 'Item'} equipado!`,
        'success'
      );
    }

    // ---------- Remover item (desequipar slot) ----------
    case 'REMOVE_ITEM': {
      const { charId, slot } = action;
      if (!charId) return state;
      const items = getCharItems(state.items, charId);
      const nextCharItems = items.map((id, i) => (i === slot ? null : id));
      return { ...state, items: { ...state.items, [charId]: nextCharItems } };
    }

    // ---------- Relíquias (modals.js → addRelic / removeRelic) ----------
    case 'ADD_RELIC': {
      const { relicId } = action;
      if (state.teamRelics.includes(relicId)) {
        return withToast(state, 'Esta relíquia já está equipada!', 'error');
      }
      const relic = getRelic(relicId);
      return withToast(
        { ...state, teamRelics: [...state.teamRelics, relicId], relicModalOpen: false },
        `🔮 ${relic ? relic.name : 'Relíquia'} equipada!`,
        'success'
      );
    }

    case 'REMOVE_RELIC': {
      const { index } = action;
      const relic = getRelic(state.teamRelics[index]);
      if (!relic) return state;
      const teamRelics = state.teamRelics.filter((_, i) => i !== index);
      return withToast({ ...state, teamRelics }, `🔄 ${relic.name} removida.`, 'info');
    }

    // ---------- Filtros e busca (main.js vanilla) ----------
    case 'SET_TIER_FILTER':
      return { ...state, tierFilter: action.value };
    case 'SET_CLASS_FILTER':
      return { ...state, classFilter: action.value };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.value };

    // ---------- Modais (modals.js vanilla) ----------
    case 'OPEN_ITEM_MODAL': {
      const char = state.selectedCharId ? getCharacter(state.selectedCharId) : null;
      if (!char) {
        return withToast(state, 'Selecione um personagem do time primeiro.', 'error');
      }
      return {
        ...state,
        itemModal: { open: true, charId: char.id, slot: action.slot }
      };
    }
    case 'CLOSE_ITEM_MODAL':
      return { ...state, itemModal: { ...state.itemModal, open: false } };
    case 'OPEN_RELIC_MODAL':
      return { ...state, relicModalOpen: true };
    case 'CLOSE_RELIC_MODAL':
      return { ...state, relicModalOpen: false };

    // ---------- Resetar (export.js → resetTeam) ----------
    case 'RESET_TEAM': {
      return withToast(
        {
          ...state,
          main: [null, null, null],
          reserve: [null, null, null],
          items: {},
          teamRelics: [],
          selectedCharId: null,
          itemModal: { open: false, charId: null, slot: null },
          relicModalOpen: false
        },
        '🔄 Time resetado.',
        'info'
      );
    }

    // ---------- Toasts (toast.js vanilla) ----------
    case 'ADD_TOAST': {
      const { id, message, toastType } = action;
      return {
        ...state,
        toasts: [...state.toasts, { id, message, type: toastType }],
        toastSeq: state.toastSeq + 1
      };
    }
    case 'REMOVE_TOAST': {
      const { id } = action;
      return { ...state, toasts: state.toasts.filter(t => t.id !== id) };
    }

    default:
      return state;
  }
}
