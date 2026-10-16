// reducer.test.ts — Testes do reducer: todas as ações e casos extremos.
import { describe, it, expect } from 'vitest';
import { reducer } from '../src/context/reducer';
import { createInitialState, initialState, BOARD_SIZE } from '../src/context/initialState';
import type { AppState } from '../src/types';

// helper: cria um estado vazio limpo
function blankState(): AppState {
  return {
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
    searchQuery: '',
  };
}

// helper: cria um estado com um time de teste
function teamState(): AppState {
  const s = blankState();
  s.main[16] = 'dragomir';
  s.main[17] = 'aria';
  s.main[18] = 'fiona';
  s.reserve[0] = 'funke';
  s.items = {
    dragomir: [null, null, null, null, null],
    aria: [null, null, null, null, null],
    fiona: [null, null, null, null, null],
    funke: [null, null, null, null, null],
  };
  s.selectedCharId = 'dragomir';
  return s;
}

describe('SELECT_CHAR', () => {
  it('adiciona heroi ao primeiro hex vazio', () => {
    const s = blankState();
    const next = reducer(s, { type: 'SELECT_CHAR', charId: 'kai' });
    expect(next.main[0]).toBe('kai');
  });

  it('rejeita heroi duplicado', () => {
    const s = teamState();
    const next = reducer(s, { type: 'SELECT_CHAR', charId: 'aria' });
    expect(next).toBe(s); // mesma referencia = sem mudanca
  });

  it('rejeita quando o campo tem 6 herois (total maximo)', () => {
    const s = blankState();
    for (let i = 0; i < 6; i++) s.main[i] = `hero-${i}`;
    const next = reducer(s, { type: 'SELECT_CHAR', charId: 'kai' });
    expect(next).toBe(s); // total 6 = limite, rejeita
  });

  it('rejeita quando o time total (campo+reserva) e 6', () => {
    const s = blankState();
    for (let i = 0; i < 6; i++) s.main[i] = `hero-${i}`;
    s.reserve[0] = 'extra';
    const next = reducer(s, { type: 'SELECT_CHAR', charId: 'kai' });
    expect(next).toBe(s);
  });
});

describe('DROP_CHAR', () => {
  it('posiciona heroi em hex especifico', () => {
    const s = blankState();
    const next = reducer(s, { type: 'DROP_CHAR', charId: 'kai', teamType: 'main', slotIndex: 5 });
    expect(next.main[5]).toBe('kai');
    expect(next.placementCharId).toBeNull();
  });

  it('rejeita hex ocupado', () => {
    const s = teamState();
    const next = reducer(s, { type: 'DROP_CHAR', charId: 'kai', teamType: 'main', slotIndex: 16 });
    expect(next).toBe(s);
  });

  it('rejeita quando campo tem 6 herois', () => {
    const s = blankState();
    for (let i = 0; i < 6; i++) s.main[i] = `hero-${i}`;
    const next = reducer(s, { type: 'DROP_CHAR', charId: 'kai', teamType: 'main', slotIndex: 10 });
    expect(next).toBe(s);
  });

  it('posiciona na reserva em slot especifico', () => {
    const s = blankState();
    const next = reducer(s, { type: 'DROP_CHAR', charId: 'kai', teamType: 'reserve', slotIndex: 2 });
    expect(next.reserve[2]).toBe('kai');
  });

  it('rejeita slot de reserva ocupado', () => {
    const s = teamState();
    const next = reducer(s, { type: 'DROP_CHAR', charId: 'kai', teamType: 'reserve', slotIndex: 0 });
    expect(next).toBe(s);
  });

  it('rejeita reserva com 3 herois', () => {
    const s = blankState();
    s.reserve = ['a', 'b', 'c'];
    const next = reducer(s, { type: 'DROP_CHAR', charId: 'kai', teamType: 'reserve', slotIndex: 2 });
    expect(next).toBe(s);
  });
});

describe('SWAP_SLOTS', () => {
  it('troca dois herois de posicao', () => {
    const s = teamState();
    const next = reducer(s, {
      type: 'SWAP_SLOTS',
      charId: 'dragomir', fromType: 'main', fromIndex: 16,
      toType: 'main', toIndex: 17,
    });
    expect(next.main[16]).toBe('aria');
    expect(next.main[17]).toBe('dragomir');
  });

  it('move heroi para hex vazio', () => {
    const s = teamState();
    const next = reducer(s, {
      type: 'SWAP_SLOTS',
      charId: 'dragomir', fromType: 'main', fromIndex: 16,
      toType: 'main', toIndex: 0,
    });
    expect(next.main[0]).toBe('dragomir');
    expect(next.main[16]).toBeNull();
  });

  it('troca entre campo e reserva', () => {
    const s = teamState();
    const next = reducer(s, {
      type: 'SWAP_SLOTS',
      charId: 'dragomir', fromType: 'main', fromIndex: 16,
      toType: 'reserve', toIndex: 1,
    });
    expect(next.main[16]).toBeNull();
    expect(next.reserve[1]).toBe('dragomir');
  });

  it('no-op quando from == to', () => {
    const s = teamState();
    const next = reducer(s, {
      type: 'SWAP_SLOTS',
      charId: 'dragomir', fromType: 'main', fromIndex: 16,
      toType: 'main', toIndex: 16,
    });
    expect(next).toBe(s);
  });

  it('no-op quando charId nao corresponde ao slot de origem', () => {
    const s = teamState();
    const next = reducer(s, {
      type: 'SWAP_SLOTS',
      charId: 'aria', fromType: 'main', fromIndex: 16, // slot 16 tem dragomir
      toType: 'main', toIndex: 0,
    });
    expect(next).toBe(s);
  });

  it('limpa placementCharId apos a troca', () => {
    const s = teamState();
    s.placementCharId = 'dragomir';
    s.placementFrom = { teamType: 'main', index: 16 };
    const next = reducer(s, {
      type: 'SWAP_SLOTS',
      charId: 'dragomir', fromType: 'main', fromIndex: 16,
      toType: 'main', toIndex: 17,
    });
    expect(next.placementCharId).toBeNull();
    expect(next.placementFrom).toBeNull();
  });
});

describe('SET_PLACEMENT_CHAR / CLEAR_PLACEMENT_CHAR', () => {
  it('pega heroi da biblioteca (from null)', () => {
    const s = blankState();
    const next = reducer(s, { type: 'SET_PLACEMENT_CHAR', charId: 'kai' });
    expect(next.placementCharId).toBe('kai');
    expect(next.placementFrom).toBeNull();
  });

  it('pega heroi do tabuleiro (com origem)', () => {
    const s = teamState();
    const next = reducer(s, {
      type: 'SET_PLACEMENT_CHAR', charId: 'dragomir', fromType: 'main', fromIndex: 16,
    });
    expect(next.placementCharId).toBe('dragomir');
    expect(next.placementFrom).toEqual({ teamType: 'main', index: 16 });
  });

  it('toggle: clicar no mesmo heroi cancela', () => {
    const s = blankState();
    s.placementCharId = 'kai';
    const next = reducer(s, { type: 'SET_PLACEMENT_CHAR', charId: 'kai' });
    expect(next.placementCharId).toBeNull();
    expect(next.placementFrom).toBeNull();
  });

  it('CLEAR limpa placement', () => {
    const s = teamState();
    s.placementCharId = 'dragomir';
    s.placementFrom = { teamType: 'main', index: 16 };
    const next = reducer(s, { type: 'CLEAR_PLACEMENT_CHAR' });
    expect(next.placementCharId).toBeNull();
    expect(next.placementFrom).toBeNull();
  });
});

describe('SET_HERO_RANK / SET_HERO_SPEC', () => {
  it('define rank do heroi', () => {
    const s = teamState();
    const next = reducer(s, { type: 'SET_HERO_RANK', charId: 'dragomir', rank: 'B' });
    expect(next.heroConfigs.dragomir.rank).toBe('B');
  });

  it('voltar para rank C limpa a spec', () => {
    const s = teamState();
    s.heroConfigs = { dragomir: { rank: 'B', spec: 'the-sanguine' } };
    const next = reducer(s, { type: 'SET_HERO_RANK', charId: 'dragomir', rank: 'C' });
    expect(next.heroConfigs.dragomir.rank).toBe('C');
    expect(next.heroConfigs.dragomir.spec).toBeUndefined();
  });

  it('rejeita spec quando rank e C', () => {
    const s = teamState();
    const next = reducer(s, { type: 'SET_HERO_SPEC', charId: 'dragomir', spec: 'the-sanguine' });
    expect(next).toBe(s);
  });

  it('aceita spec quando rank e B ou maior', () => {
    const s = teamState();
    s.heroConfigs = { dragomir: { rank: 'B' } };
    const next = reducer(s, { type: 'SET_HERO_SPEC', charId: 'dragomir', spec: 'the-sanguine' });
    expect(next.heroConfigs.dragomir.spec).toBe('the-sanguine');
  });
});

describe('REMOVE_CHAR', () => {
  it('remove heroi e desseleciona', () => {
    const s = teamState();
    const next = reducer(s, { type: 'REMOVE_CHAR', teamType: 'main', index: 16 });
    expect(next.main[16]).toBeNull();
    expect(next.selectedCharId).toBeNull();
  });

  it('remove da reserva', () => {
    const s = teamState();
    const next = reducer(s, { type: 'REMOVE_CHAR', teamType: 'reserve', index: 0 });
    expect(next.reserve[0]).toBeNull();
  });

  it('limpa heroConfigs do heroi removido', () => {
    const s = teamState();
    s.heroConfigs = { dragomir: { rank: 'B', spec: 'the-sanguine' } };
    const next = reducer(s, { type: 'REMOVE_CHAR', teamType: 'main', index: 16 });
    expect(next.heroConfigs.dragomir).toBeUndefined();
  });

  it('limpa items do heroi removido', () => {
    const s = teamState();
    const next = reducer(s, { type: 'REMOVE_CHAR', teamType: 'main', index: 16 });
    expect(next.items.dragomir).toBeUndefined();
  });

  it('nao afeta outros herois', () => {
    const s = teamState();
    const next = reducer(s, { type: 'REMOVE_CHAR', teamType: 'main', index: 16 });
    expect(next.main[17]).toBe('aria');
    expect(next.items.aria).toBeDefined();
  });
});

describe('SET_ITEM / REMOVE_ITEM', () => {
  it('equipa item no slot', () => {
    const s = teamState();
    const next = reducer(s, { type: 'SET_ITEM', charId: 'dragomir', slot: 0, itemId: 'item_001' });
    expect(next.items.dragomir[0]).toBe('item_001');
  });

  it('rejeita item duplicado em outro slot', () => {
    const s = teamState();
    s.items.dragomir = ['item_001', null, null, null, null];
    const next = reducer(s, { type: 'SET_ITEM', charId: 'dragomir', slot: 1, itemId: 'item_001' });
    expect(next).toBe(s);
  });

  it('desequipa item', () => {
    const s = teamState();
    s.items.dragomir = ['item_001', null, null, null, null];
    const next = reducer(s, { type: 'REMOVE_ITEM', charId: 'dragomir', slot: 0 });
    expect(next.items.dragomir[0]).toBeNull();
  });
});

describe('RESET_TEAM', () => {
  it('limpa todo o estado do time', () => {
    const s = teamState();
    s.heroConfigs = { dragomir: { rank: 'S' } };
    s.teamRelics = ['rel_001'];
    const next = reducer(s, { type: 'RESET_TEAM' });
    expect(next.main.every((v) => v === null)).toBe(true);
    expect(next.main).toHaveLength(BOARD_SIZE);
    expect(next.reserve.every((v) => v === null)).toBe(true);
    expect(next.items).toEqual({});
    expect(next.teamRelics).toEqual([]);
    expect(next.heroConfigs).toEqual({});
    expect(next.selectedCharId).toBeNull();
    expect(next.placementCharId).toBeNull();
  });
});
