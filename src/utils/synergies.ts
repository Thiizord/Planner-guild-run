// synergies.ts - Cálculo de sinergias (recebe o time como parâmetro)

import { SYNERGY_CONFIG } from '../data/data';
import type { Hero, Synergy, ClassAnalysis } from '../types';

export function calculateSynergies(teamChars: Hero[]): Synergy[] {
  const classCount: Record<string, number> = {};
  for (const char of teamChars) {
    for (const cls of [char.class, char.class2].filter(Boolean) as string[]) {
      classCount[cls] = (classCount[cls] || 0) + 1;
    }
  }
  const activeSynergies: Synergy[] = [];
  for (const [className, count] of Object.entries(classCount)) {
    const config = (SYNERGY_CONFIG as Record<string, { icon: string; bonuses: Record<number, string> }>)[className];
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

// Análise completa de classes para o painel de sinergias (com limiares e
// progresso — padrão do builder oficial). Aditivo: calculateSynergies
// permanece intacta para a exportação da build.
const THRESHOLDS: number[] = [2, 3, 4];

export function analyzeClassCounts(teamChars: Hero[]): ClassAnalysis[] {
  const counts: Record<string, number> = {};
  for (const char of teamChars) {
    for (const cls of [char.class, char.class2].filter(Boolean) as string[]) {
      counts[cls] = (counts[cls] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .map(([className, count]): ClassAnalysis => {
      const config = (SYNERGY_CONFIG as Record<string, { icon?: string; bonuses?: Record<string, string> }>)[className] || {};
      let level = 0;
      for (const t of THRESHOLDS) if (count >= t) level = t;
      const next = THRESHOLDS.find((t) => t > count) ?? null;
      return {
        class: className,
        count,
        level,
        next,
        icon: config.icon || '',
        bonuses: config.bonuses || {},
      };
    })
    .sort((a, b) => b.count - a.count || a.class.localeCompare(b.class));
}
