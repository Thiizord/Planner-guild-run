// utils.test.ts — Testes dos utilitarios: helpers, synergies, stats.
import { describe, it, expect } from 'vitest';
import {
  getCharacter, getItem, getRelic,
  getTeamChars, getTeamSlots, isInTeam,
  countTeam, countMain, countReserve,
  getAvailableChars, getCharItems, getSelectedChar,
} from '../src/utils/helpers';
import { calculateSynergies, analyzeClassCounts } from '../src/utils/synergies';
import { calculateTeamStats, calculateDPS } from '../src/utils/stats';
import { HEROES_DATA } from '../src/data/data';

describe('helpers', () => {
  it('getCharacter encontra heroi por id', () => {
    const aria = getCharacter('aria');
    expect(aria).toBeDefined();
    expect(aria!.name).toBe('Aria');
  });

  it('getCharacter retorna undefined para id inexistente', () => {
    expect(getCharacter('nao-existe')).toBeUndefined();
  });

  it('getTeamChars filtra nulls', () => {
    const main = ['a', null, 'b', null];
    const reserve = ['c', null, null];
    expect(getTeamChars(main, reserve)).toEqual(['a', 'b', 'c']);
  });

  it('getTeamSlots concatena main + reserve', () => {
    const main = ['a', null];
    const reserve = ['b', null];
    expect(getTeamSlots(main, reserve)).toEqual(['a', null, 'b', null]);
  });

  it('isInTeam detecta heroi no time', () => {
    const main = ['aria', null, null];
    const reserve = [null, null, null];
    expect(isInTeam(main, reserve, 'aria')).toBe(true);
    expect(isInTeam(main, reserve, 'kai')).toBe(false);
  });

  it('countMain conta nao-nulos', () => {
    expect(countMain(['a', null, 'b', null, null])).toBe(2);
  });

  it('countReserve conta nao-nulos', () => {
    expect(countReserve(['a', 'b', null])).toBe(2);
  });

  it('countTeam soma main + reserve', () => {
    expect(countTeam(['a', null], ['b', null, null])).toBe(2);
  });

  it('getAvailableChars exclui herois do time', () => {
    const main = ['aria', null, null];
    const reserve = ['dragomir', null, null];
    const available = getAvailableChars(main, reserve);
    expect(available.length).toBe(23);
    expect(available.find((h) => h.id === 'aria')).toBeUndefined();
    expect(available.find((h) => h.id === 'dragomir')).toBeUndefined();
  });

  it('getCharItems retorna array padrao quando heroi nao tem items', () => {
    expect(getCharItems({}, 'aria')).toEqual([null, null, null, null, null]);
  });

  it('getSelectedChar retorna heroi ou null', () => {
    expect(getSelectedChar('aria')!.name).toBe('Aria');
    expect(getSelectedChar(null)).toBeNull();
  });
});

describe('synergies', () => {
  it('calculateSynergies ativa com 2+ da mesma classe', () => {
    const mages = HEROES_DATA.filter((h) => h.class === 'Mage').slice(0, 2);
    const synergies = calculateSynergies(mages);
    const mage = synergies.find((s) => s.class === 'Mage');
    expect(mage).toBeDefined();
    expect(mage!.count).toBe(2);
    expect(mage!.level).toBe(2);
  });

  it('nao ativa com apenas 1 da classe', () => {
    const one = [HEROES_DATA.find((h) => h.id === 'aria')!];
    const synergies = calculateSynergies(one);
    expect(synergies.find((s) => s.class === 'Mage')).toBeUndefined();
  });

  it('heroi hibrido conta para ambas as classes', () => {
    const zuri = HEROES_DATA.find((h) => h.id === 'zuri')!; // Tank/Assassin
    const otherTank = HEROES_DATA.find((h) => h.class === 'Tank' && h.id !== 'zuri')!;
    const synergies = calculateSynergies([zuri, otherTank]);
    expect(synergies.find((s) => s.class === 'Tank')!.count).toBe(2);
    // zuri sozinho nao ativa Assassin (precisa 2)
    expect(synergies.find((s) => s.class === 'Assassin')).toBeUndefined();
  });

  it('analyzeClassCounts inclui classes inativas', () => {
    const one = [HEROES_DATA.find((h) => h.id === 'aria')!];
    const analysis = analyzeClassCounts(one);
    const mage = analysis.find((a) => a.class === 'Mage');
    expect(mage).toBeDefined();
    expect(mage!.count).toBe(1);
    expect(mage!.level).toBe(0); // inativo
    expect(mage!.next).toBe(2); // proximo limiar
  });

  it('analyzeClassCounts ordena por contagem decrescente', () => {
    const three = [
      HEROES_DATA.find((h) => h.id === 'aria')!,      // Mage
      HEROES_DATA.find((h) => h.id === 'funke')!,     // Mage
      HEROES_DATA.find((h) => h.id === 'dragomir')!,  // Assassin
    ];
    const analysis = analyzeClassCounts(three);
    expect(analysis[0].count).toBeGreaterThanOrEqual(analysis[analysis.length - 1].count);
  });
});

describe('stats', () => {
  it('calculateTeamStats soma stats dos herois', () => {
    const aria = HEROES_DATA.find((h) => h.id === 'aria')!;
    const stats = calculateTeamStats([aria], {}, []);
    expect(stats.hp).toBe(aria.baseStats.hp);
    expect(stats.attack).toBe(aria.baseStats.attack);
  });

  it('calculateTeamStats soma stats de multiplos herois', () => {
    const a = HEROES_DATA.find((h) => h.id === 'aria')!;
    const d = HEROES_DATA.find((h) => h.id === 'dragomir')!;
    const stats = calculateTeamStats([a, d], {}, []);
    expect(stats.hp).toBe(a.baseStats.hp + d.baseStats.hp);
  });

  it('calculateTeamStats inclui stats de items', () => {
    const aria = HEROES_DATA.find((h) => h.id === 'aria')!;
    const item = getItem('item_001');
    if (item) {
      const items = { aria: ['item_001', null, null, null, null] };
      const stats = calculateTeamStats([aria], items, []);
      expect(stats.hp).toBe(aria.baseStats.hp + (item.stats.hp || 0));
    }
  });

  it('calculateDPS calcula com attack e magic', () => {
    const dps = calculateDPS({ attack: 100, magic: 50, attackSpeed: 1, crit: 0, critDamage: 50 });
    expect(dps).toBe(150); // (100+50)*1 sem crit
  });

  it('calculateDPS com attackSpeed padrao 0.4', () => {
    const dps = calculateDPS({ attack: 100, magic: 0 });
    expect(dps).toBe(40); // 100 * 0.4
  });
});
