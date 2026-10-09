// RelicList.jsx - Card de relíquias do time (render.js → renderRelics)
// + seletor INLINE: expande na própria lista (substitui o modal de relíquias).

import { useState } from 'react';
import { useApp } from '../../hooks/useApp.js';
import { RELICS_DATA } from '../../data/data.js';
import RelicItem from './RelicItem.jsx';

export default function RelicList() {
  const { state, dispatch } = useApp();
  const [pickerOpen, setPickerOpen] = useState(false);
  const count = state.teamRelics.length;

  // getAvailableRelics vanilla — o seletor inline só lista as disponíveis
  const used = new Set(state.teamRelics);
  const available = RELICS_DATA.filter(r => !used.has(r.id));

  return (
    <div className="card glass" id="relicPanel">
      <div className="card-header">
        <h2>🔮 <span className="neon-text">Relíquias do Time</span></h2>
        <span className="hint" id="relicCount">
          {count} relíquia{count !== 1 ? 's' : ''} equipada{count !== 1 ? 's' : ''}
        </span>
      </div>
      <button className="btn-add-relic" onClick={() => setPickerOpen(o => !o)}>
        {pickerOpen ? '✕ Fechar seleção' : '➕ Adicionar Relíquia'}
      </button>

      {pickerOpen && (
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
      )}

      <div className="relic-list" id="relicList">
        {count === 0 ? (
          <div className="relic-empty">Nenhuma relíquia equipada. Adicione uma para potencializar seu time!</div>
        ) : (
          state.teamRelics.map((relicId, index) => (
            <RelicItem key={`${relicId}-${index}`} relicId={relicId} index={index} />
          ))
        )}
      </div>
    </div>
  );
}
