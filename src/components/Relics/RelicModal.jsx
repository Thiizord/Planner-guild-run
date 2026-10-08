// RelicModal.jsx - Modal de seleção de relíquia (modals.js → openRelicSelector/renderRelicSelector)

import { useApp } from '../../hooks/useApp.js';
import { RELICS_DATA } from '../../data/data.js';

export default function RelicModal() {
  const { state, dispatch } = useApp();
  const open = state.relicModalOpen;

  const close = () => dispatch({ type: 'CLOSE_RELIC_MODAL' });

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) close();
  };

  // getAvailableRelics vanilla
  const used = new Set(state.teamRelics);
  const available = RELICS_DATA.filter(r => !used.has(r.id));

  return (
    <div
      className={`modal-overlay ${open ? 'open' : ''}`}
      id="relicModal"
      onClick={handleOverlayClick}
    >
      <div className="modal glass">
        <div className="modal-header">
          <h3>🔮 <span className="neon-text">Selecionar Relíquia</span></h3>
          <button className="close-btn" onClick={close}>✕</button>
        </div>
        <div className="relic-grid" id="relicGrid">
          {available.length === 0 ? (
            <div className="synergy-empty" style={{ gridColumn: '1/-1', padding: '20px' }}>
              🎉 Todas as relíquias já estão equipadas!
            </div>
          ) : (
            available.map(relic => {
              const statsText = Object.entries(relic.stats).map(([k, v]) => `${k}: ${v}`).join(' ');
              const rarityClass = relic.rarity.toLowerCase();
              return (
                <div key={relic.id} className="relic-option" onClick={() => dispatch({ type: 'ADD_RELIC', relicId: relic.id })}>
                  {relic.icon && <img src={relic.icon} alt={relic.name} className="relic-icon" draggable="false" />}
                  <div className="relic-name">{relic.name}</div>
                  <div className="relic-stats">{statsText}</div>
                  <span className={`relic-rarity ${rarityClass}`}>{relic.rarity}</span>
                  <div style={{ fontSize: '11px', color: '#4a5f78', marginTop: '4px' }}>{relic.description}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
