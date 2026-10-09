// exportBuild.js - Exportar build (utilitário: recebe o estado por parâmetro)
// Feedback é inline no Header (botão "Copiado!") — sem popups.

import { getCharacter, getRelic, getTeamCharactersData } from './helpers.js';
import { calculateSynergies } from './synergies.js';
import { calculateTeamStats, calculateDPS } from './stats.js';

export function exportBuild(state) {
  const teamChars = getTeamCharactersData(state.main, state.reserve);
  const stats = calculateTeamStats(teamChars, state.items, state.teamRelics);
  const data = {
    main: state.main.map(id => id ? getCharacter(id) : null),
    reserve: state.reserve.map(id => id ? getCharacter(id) : null),
    items: state.items,
    relics: state.teamRelics.map(id => getRelic(id)),
    synergies: calculateSynergies(teamChars),
    stats,
    dps: calculateDPS(stats)
  };
  const json = JSON.stringify(data, null, 2);
  return navigator.clipboard.writeText(json).then(() => true).catch(() => {
    console.log('Build exportada (clipboard indisponível):', json);
    return false;
  });
}
