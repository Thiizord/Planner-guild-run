// helpers.ts - Funções auxiliares puras (recebem o estado como parâmetro)

import { HEROES_DATA, ITEMS_DATA, RELICS_DATA } from '../data/data';
import type { Hero, GameItem, Relic } from '../types';

// data.js e um arquivo JS sem tipagem — os casts abaixo garantem
// que as formas de dados inferidas pelo TS correspondem as interfaces
export function getCharacter(id: string): Hero | undefined {
  return HEROES_DATA.find((c) => c.id === id) as Hero | undefined;
}

export function getItem(id: string): GameItem | undefined {
  return ITEMS_DATA.find((i) => i.id === id) as GameItem | undefined;
}

export function getRelic(id: string): Relic | undefined {
  return RELICS_DATA.find((r) => r.id === id) as Relic | undefined;
}

export function getTeamSlots(main: (string | null)[], reserve: (string | null)[]): (string | null)[] {
  return [...main, ...reserve];
}

export function getTeamChars(main: (string | null)[], reserve: (string | null)[]): string[] {
  return getTeamSlots(main, reserve).filter((id): id is string => id !== null);
}

export function getTeamCharactersData(main: (string | null)[], reserve: (string | null)[]): Hero[] {
  return getTeamChars(main, reserve).map((id) => getCharacter(id)).filter((c): c is Hero => c !== undefined);
}

export function isInTeam(main: (string | null)[], reserve: (string | null)[], charId: string): boolean {
  return getTeamSlots(main, reserve).includes(charId);
}

export function countTeam(main: (string | null)[], reserve: (string | null)[]): number {
  return getTeamChars(main, reserve).length;
}

export function countMain(main: (string | null)[]): number {
  return main.filter((id) => id !== null).length;
}

export function countReserve(reserve: (string | null)[]): number {
  return reserve.filter((id) => id !== null).length;
}

export function getAvailableChars(main: (string | null)[], reserve: (string | null)[]): Hero[] {
  const inTeam = new Set(getTeamChars(main, reserve));
  return HEROES_DATA.filter((c) => !inTeam.has(c.id));
}

export function getCharItems(items: Record<string, (string | null)[]>, charId: string): (string | null)[] {
  return items[charId] || [null, null, null, null, null];
}

export function getSelectedChar(selectedCharId: string | null): Hero | null {
  return selectedCharId ? getCharacter(selectedCharId) ?? null : null;
}
