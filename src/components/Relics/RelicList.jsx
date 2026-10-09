// RelicList.jsx - Relíquias do time: lista equipada + seletor inline com
// filtro por raridade (padrão do builder oficial). Sem popups.

import { useMemo, useState } from 'react';
import { useApp } from '../../hooks/useApp.js';
import { RELICS_DATA } from '../../data/data.js';
import RelicItem from './RelicItem.jsx';

const RARITY_OPTIONS = [
  { value: 'all', label: 'Todas' },
  { value: 'Comum', label: 'Comum' },
  { value: 'Incomum', label: 'Incomum' },
  { value: 'Raro', label: 'Raro' },
  { value: 'Épico', label: 'Épico' },
  { value: 'Lendário', label: 'Lendário' }
];

export default function RelicList() {
  const { state, dispatch } = useApp();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [rarityFilter, setRarityFilter] = useState('all');
  const count = state.teamRelics.length;

  const used = useMemo(() => new Set(state.teamRelics), [state.teamRelics]);

  const available = useMemo(() => {
    const pool = RELICS_DATA.filter((r) => !used.has(r.id));
    if (rarityFilter === 'all') return pool;
    return pool.filter((r) => r.rarity === rarityFilter);
  }, [used, rarityFilter]);

  return (
    <div className="panel" id="relicPanel" aria-label="Relíquias do time">
      <div className="panel-title">
        <h2>Relíquias do Time</h2>
        <span className="hint" id="relicCount">
          {count} relíquia{count !== 1 ? 's' : ''} equipada{count !== 1 ? 's' : ''}
        </span>
      </div>

      <button className="btn-add-relic" onClick={() => setPickerOpen((o) => !o)}>
        {pickerOpen ? 'Fechar seleção' : '+ Adicionar Relíquia'}
      </button>

      {pickerOpen && (
        <div>
          <div className="chip-row" style={{ marginBottom: 8 }}>
            {RARITY_OPTIONS.map((r) => (
              <button
                key={r.value}
                className={`chip ${rarityFilter === r.value ? 'active' : ''}`}
                onClick={() => setRarityFilter(r.value)}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div className="relic-grid" id="relicGrid">
            {available.length === 0 ? (
              <div className="synergy-empty" style={{ gridColumn: '1/-1', padding: '14px' }}>
                {RELICS_DATA.every((r) => used.has(r.id))
                  ? 'Todas as relíquias já estão equipadas!'
                  : 'Nenhuma relíquia dessa raridade disponível'}
              </div>
            ) : (
              available.map((relic) => {
                const statsText = Object.entries(relic.stats).map(([k, v]) => `${k}: ${v}`).join(' ');
                const rarityClass = relic.rarity.toLowerCase();
                return (
                  <div
                    key={relic.id}
                    className="relic-option"
                    onClick={() => dispatch({ type: 'ADD_RELIC', relicId: relic.id })}
                    title={relic.description}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        dispatch({ type: 'ADD_RELIC', relicId: relic.id });
                      }
                    }}
                  >
                    {relic.icon && (
                      <img src={relic.icon} alt="" className="relic-icon" draggable="false" />
                    )}
                    <div className="relic-name">{relic.name}</div>
                    {statsText && <div className="relic-stats">{statsText}</div>}
                    <span className={`relic-rarity ${rarityClass}`}>{relic.rarity}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <div className="relic-list" id="relicList">
        {count === 0 ? (
          <div className="synergy-empty">Nenhuma relíquia equipada. Adicione uma para potencializar seu time!</div>
        ) : (
          state.teamRelics.map((relicId, index) => (
            <RelicItem key={`${relicId}-${index}`} relicId={relicId} index={index} />
          ))
        )}
      </div>
    </div>
  );
}
