// helpers.js - Funções auxiliares gerais
// (Versão pura: o estado é passado como parâmetro, sem dependência de state externo)

import { HEROES_DATA, ITEMS_DATA, RELICS_DATA } from '../data/data.js';

export function getCharacter(id) {
  return HEROES_DATA.find(c => c.id === id);
}

export function getItem(id) {
  return ITEMS_DATA.find(i => i.id === id);
}

export function getRelic(id) {
  return RELICS_DATA.find(r => r.id === id);
}

export function getTeamSlots(main, reserve) {
  return [...main, ...reserve];
}

export function getTeamChars(main, reserve) {
  return getTeamSlots(main, reserve).filter(id => id !== null);
}

export function getTeamCharactersData(main, reserve) {
  return getTeamChars(main, reserve).map(id => getCharacter(id)).filter(c => c !== undefined);
}

export function isInTeam(main, reserve, charId) {
  return getTeamSlots(main, reserve).includes(charId);
}

export function countTeam(main, reserve) {
  return getTeamChars(main, reserve).length;
}

export function countMain(main) {
  return main.filter(id => id !== null).length;
}

export function countReserve(reserve) {
  return reserve.filter(id => id !== null).length;
}

export function getAvailableChars(main, reserve) {
  const inTeam = new Set(getTeamChars(main, reserve));
  return HEROES_DATA.filter(c => !inTeam.has(c.id));
}

// Leitura pura: no vanilla getCharItems criava o array no state caso
// não existisse (mutação); aqui o reducer é quem garante o array.
export function getCharItems(items, charId) {
  return items[charId] || [null, null, null, null, null];
}

export function getSelectedChar(selectedCharId) {
  return selectedCharId ? getCharacter(selectedCharId) : null;
}
