// RelicItem.jsx - Uma relíquia equipada na lista (com ícone oficial e raridade).

import { useApp } from '../../hooks/useApp.js';
import { getRelic } from '../../utils/helpers.js';

export default function RelicItem({ relicId, index }) {
  const { dispatch } = useApp();
  const relic = getRelic(relicId);
  if (!relic) return null;

  const statsText = Object.entries(relic.stats).map(([k, v]) => `${k}: ${v}`).join(' ');
  const rarityClass = relic.rarity.toLowerCase();

  return (
    <div className="relic-item" title={relic.description}>
      {relic.icon && (
        <img src={relic.icon} alt="" className="relic-icon" draggable="false" />
      )}
      <div className="relic-info">
        <div className="relic-name">{relic.name}</div>
        {statsText && <div className="relic-stats">{statsText}</div>}
        <div className="relic-desc">{relic.description}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <span className={`relic-rarity ${rarityClass}`}>{relic.rarity}</span>
        <button
          className="remove-relic"
          onClick={() => dispatch({ type: 'REMOVE_RELIC', index })}
          aria-label={`Remover relíquia ${relic.name}`}
          title="Remover relíquia"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
