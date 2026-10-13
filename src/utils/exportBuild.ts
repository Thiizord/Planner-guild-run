// exportBuild.ts - Exportar build (utilitário: recebe o estado por parâmetro)
// Feedback é inline no Header (botão "Copiado!") — sem popups.

import { getCharacter, getRelic, getTeamCharactersData } from './helpers';
import { calculateSynergies } from './synergies';
import { calculateTeamStats, calculateDPS } from './stats';
import type { AppState } from '../types';

export function exportBuild(state: AppState): Promise<boolean> {
  const teamChars = getTeamCharactersData(state.main, state.reserve);
  const stats = calculateTeamStats(teamChars, state.items, state.teamRelics);
  const data = {
    main: state.main.map((id: string | null) => (id ? getCharacter(id) : null)),
    reserve: state.reserve.map((id: string | null) => (id ? getCharacter(id) : null)),
    items: state.items,
    relics: state.teamRelics.map((id: string) => getRelic(id)),
    synergies: calculateSynergies(teamChars),
    stats,
    dps: calculateDPS(stats),
  };
  const json = JSON.stringify(data, null, 2);
  return navigator.clipboard
    .writeText(json)
    .then(() => true)
    .catch(() => {
      console.log('Build exportada (clipboard indisponível):', json);
      return false;
    });
}
