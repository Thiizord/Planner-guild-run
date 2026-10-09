// SynergyPanel.jsx - Painel de sinergias ativas (render.js → renderSynergies)

import { useApp } from '../hooks/useApp.js';
import { getTeamCharactersData } from '../utils/helpers.js';
import { calculateSynergies } from '../utils/synergies.js';

export default function SynergyPanel() {
  const { state } = useApp();
  const synergies = calculateSynergies(getTeamCharactersData(state.main, state.reserve));

  return (
    <div className="card synergy-panel glass" id="synergyPanel">
      <div className="card-header">
        <h2><span className="neon-text">Sinergias Ativas</span></h2>
        <span className="hint" id="synergyCount">{synergies.length} sinergia{synergies.length > 1 ? 's' : ''}</span>
      </div>
      <div className="synergy-grid" id="synergyGrid">
        {synergies.length === 0 ? (
          <div className="synergy-empty">Monte seu time para ativar as sinergias!</div>
        ) : (
          synergies.map(s => (
            <div className="synergy-item" key={s.class}>
              <span className="class-icon">{s.icon}</span>
              <span><strong>{s.class}</strong> ({s.count}x)</span>
              <span className="bonus">{s.bonus}</span>
              <span className="count">Nível {s.level}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
