// RelicList.jsx - Card de relíquias do time (render.js → renderRelics)

import { useApp } from '../../hooks/useApp.js';
import RelicItem from './RelicItem.jsx';

export default function RelicList() {
  const { state, dispatch } = useApp();
  const count = state.teamRelics.length;

  return (
    <div className="card glass" id="relicPanel">
      <div className="card-header">
        <h2>🔮 <span className="neon-text">Relíquias do Time</span></h2>
        <span className="hint" id="relicCount">
          {count} relíquia{count !== 1 ? 's' : ''} equipada{count !== 1 ? 's' : ''}
        </span>
      </div>
      <button className="btn-add-relic" onClick={() => dispatch({ type: 'OPEN_RELIC_MODAL' })}>
        ➕ Adicionar Relíquia
      </button>
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
