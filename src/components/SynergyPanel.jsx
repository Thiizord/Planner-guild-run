// SynergyPanel.jsx - Painel de sinergias com limiares e progresso por classe
// (padrão do builder oficial): ativas em destaque verde, próximas de ativar
// com barra de progresso e dica. Calculado a partir dos dados reais.

import { useApp } from '../hooks/useApp.js';
import { getTeamCharactersData } from '../utils/helpers.js';
import { analyzeClassCounts } from '../utils/synergies.js';

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
            const progress = a.next ? (a.count / a.next) * 100 : 100;
            return (
              <div
                key={a.class}
                className={`synergy-item ${a.level > 0 ? 'active' : 'inactive'}`}
              >
                <span className="class-icon" aria-hidden="true">{a.icon}</span>
                <div className="synergy-main">
                  <div className="synergy-top">
                    <strong>{a.class}</strong>
                    <span className="synergy-count">({a.count}x)</span>
                    {a.level > 0 && (
                      <span className="bonus">{a.bonuses[a.level]}</span>
                    )}
                    {a.level > 0 && <span className="count">Nível {a.level}</span>}
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
                    <div className="synergy-hint">
                      +{a.next - a.count} para ativar
                    </div>
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
