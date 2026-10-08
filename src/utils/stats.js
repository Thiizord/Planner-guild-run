// stats.js - Cálculo de estatísticas do time
// (adaptado: recebe time, itens e relíquias como parâmetros)

import { getItem, getRelic } from './helpers.js';

export function calculateTeamStats(teamChars, items, teamRelics) {
  const totalStats = {};
  // Stats base dos heróis
  for (const char of teamChars) {
    if (char.baseStats) {
      for (const [key, value] of Object.entries(char.baseStats)) {
        totalStats[key] = (totalStats[key] || 0) + value;
      }
    }
    // Stats dos itens equipados
    const charItems = items[char.id] || [null, null, null, null, null];
    for (const itemId of charItems) {
      const item = getItem(itemId);
      if (item && item.stats) {
        for (const [key, value] of Object.entries(item.stats)) {
          totalStats[key] = (totalStats[key] || 0) + value;
        }
      }
    }
  }
  // Stats das relíquias (globais)
  for (const relicId of teamRelics) {
    const relic = getRelic(relicId);
    if (relic && relic.stats) {
      for (const [key, value] of Object.entries(relic.stats)) {
        totalStats[key] = (totalStats[key] || 0) + value;
      }
    }
  }
  return totalStats;
}

export function calculateDPS(stats) {
  const attack = stats.attack || 0;
  const magic = stats.magic || 0;
  const attackSpeed = stats.attackSpeed || 0.4;
  const crit = stats.crit || 0;
  const critDamage = stats.critDamage || 50;
  const baseDPS = (attack + magic) * attackSpeed;
  const critDPS = baseDPS * (1 + (crit / 100) * (critDamage / 100));
  return Math.round(critDPS);
}
