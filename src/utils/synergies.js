// synergies.js - Cálculo de sinergias
// (adaptado: recebe os dados dos personagens do time como parâmetro)

import { SYNERGY_CONFIG } from '../data/data.js';

export function calculateSynergies(teamChars) {
  const classCount = {};
  for (const char of teamChars) {
    if (char.class) {
      classCount[char.class] = (classCount[char.class] || 0) + 1;
    }
  }
  const activeSynergies = [];
  for (const [className, count] of Object.entries(classCount)) {
    const config = SYNERGY_CONFIG[className];
    if (!config) continue;
    let level = 0;
    if (count >= 4) level = 4;
    else if (count >= 3) level = 3;
    else if (count >= 2) level = 2;
    if (level > 0) {
      activeSynergies.push({
        class: className,
        icon: config.icon,
        count,
        bonus: config.bonuses[level] || `+${level * 10}%`,
        level
      });
    }
  }
  return activeSynergies;
}
