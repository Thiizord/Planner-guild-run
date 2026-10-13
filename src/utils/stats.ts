// stats.ts - Cálculo de estatísticas do time (recebe time, itens e relíquias como parâmetros)

import { getItem, getRelic } from './helpers';
import type { Hero } from '../types';

export function calculateTeamStats(
  teamChars: Hero[],
  items: Record<string, (string | null)[]>,
  teamRelics: string[]
): Record<string, number> {
  const totalStats: Record<string, number> = {};
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
      if (!itemId) continue;
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

export function calculateDPS(stats: Record<string, number>): number {
  const attack = stats.attack || 0;
  const magic = stats.magic || 0;
  const attackSpeed = stats.attackSpeed || 0.4;
  const crit = stats.crit || 0;
  const critDamage = stats.critDamage || 50;
  const baseDPS = (attack + magic) * attackSpeed;
  const critDPS = baseDPS * (1 + (crit / 100) * (critDamage / 100));
  return Math.round(critDPS);
}
