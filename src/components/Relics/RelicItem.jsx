// RelicItem.jsx - Uma relíquia equipada na lista (renderRelics vanilla)

import { useApp } from '../../hooks/useApp.js';
import { getRelic } from '../../utils/helpers.js';

export default function RelicItem({ relicId, index }) {
  const { dispatch } = useApp();
  const relic = getRelic(relicId);
  if (!relic) return null;

  const statsText = Object.entries(relic.stats).map(([k, v]) => `${k}: ${v}`).join(' ');
  const rarityClass = relic.rarity.toLowerCase();

  return (
    <div className="relic-item">
      {relic.icon && <img src={relic.icon} alt={relic.name} className="relic-icon" draggable="false" />}
      <div className="relic-info">
        <div className="relic-name">{relic.name}</div>
        <div className="relic-stats">{statsText}</div>
        <div style={{ fontSize: '11px', color: '#4a5f78' }}>{relic.description}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className={`relic-rarity ${rarityClass}`}>{relic.rarity}</span>
        <button
          className="remove-relic"
          onClick={() => dispatch({ type: 'REMOVE_RELIC', index })}
          title="Remover relíquia"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
