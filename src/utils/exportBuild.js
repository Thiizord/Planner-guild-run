// exportBuild.js - Exportar build (utilitário: recebe estado e showToast por parâmetro)

import { getCharacter, getRelic } from './helpers.js';
import { calculateSynergies } from './synergies.js';
import { calculateTeamStats, calculateDPS } from './stats.js';
import { getTeamCharactersData } from './helpers.js';

export function exportBuild(state, showToast) {
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
  navigator.clipboard.writeText(json).then(() => {
    showToast('📋 Build copiada para a área de transferência!', 'success');
  }).catch(() => {
    showToast('📋 Abra o console para ver a build', 'info');
    console.log('Build exportada:', json);
  });
}
