// SynergyPanel.jsx - Painel de sinergias com SVG icons, limiares e progresso.

import { useApp } from '../hooks/useApp.js';
import { getTeamCharactersData } from '../utils/helpers.js';
import { analyzeClassCounts } from '../utils/synergies.js';
import ClassIcon from './ClassIcon.jsx';

export default function SynergyPanel() {
  const { state } = useApp();
  const teamChars = getTeamCharactersData(state.main, state.reserve);
  const analysis = analyzeClassCounts(teamChars);
  const activeCount = analysis.filter((a) => a.level > 0).length;

  return (
    <div className="panel" id="synergyPanel" aria-label="Sinergias">
      <div className="panel-title">
        <h2>Sinergias Ativas</h2>
        <span className="hint" id="synergyCount">
          {activeCount} sinergia{activeCount !== 1 ? 's' : ''}
        </span>
      </div>

      <div id="synergyGrid">
        {analysis.length === 0 ? (
          <div className="synergy-empty">Monte seu time para ativar as sinergias!</div>
        ) : (
          analysis.map((a) => {
            const thresholds = [2, 3, 4];
            const progress = a.next ? Math.min(100, (a.count / a.next) * 100) : 100;
            return (
              <div
                key={a.class}
                className={`synergy-item ${a.level > 0 ? 'active' : 'inactive'}`}
                title={a.level > 0 ? a.bonuses[a.level] : `Faltam ${a.next - a.count} para ativar`}
              >
                <span className="class-icon"><ClassIcon name={a.class} size={20} /></span>
                <div className="synergy-main">
                  <div className="synergy-top">
                    <strong>{a.class}</strong>
                    <span className="synergy-count">({a.count}x)</span>
                    {a.level > 0 && <span className="bonus">{a.bonuses[a.level]}</span>}
                    {a.level > 0 && <span className="count">Nivel {a.level}</span>}
                  </div>
                  <div className="threshold-dots" aria-hidden="true">
                    {thresholds.map((t) => (
                      <span key={t} className={`dot ${a.count >= t ? 'hit' : ''}`} />
                    ))}
                  </div>
                  <div className="synergy-progress">
                    <div className="bar" style={{ width: `${progress}%` }} />
                  </div>
                  {a.level === 0 && a.next && (
                    <div className="synergy-hint">+{a.next - a.count} para ativar</div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
