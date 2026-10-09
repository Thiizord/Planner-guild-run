// HeroPool.jsx - Card de personagens disponíveis (render.js → renderPool)

import { useApp } from '../../hooks/useApp.js';
import { getAvailableChars } from '../../utils/helpers.js';
import HeroCard from './HeroCard.jsx';
import Filters from './Filters.jsx';

export default function HeroPool() {
  const { state, dispatch } = useApp();

  const available = getAvailableChars(state.main, state.reserve);
  const filtered = available.filter(c => {
    const matchTier = state.tierFilter === 'all' || c.tier === state.tierFilter;
    const matchClass = state.classFilter === 'all' || c.class === state.classFilter;
    const matchSearch = c.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                        c.role.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                        c.class.toLowerCase().includes(state.searchQuery.toLowerCase());
    return matchTier && matchClass && matchSearch;
  });

  const handleSelect = (charId) => {
    dispatch({ type: 'SELECT_CHAR', charId });
  };

  return (
    <div className="card glass">
      <div className="card-header">
        <h2><span className="neon-text">Personagens</span> <span className="badge" id="poolCount">{filtered.length}</span></h2>
        <span className="hint">Clique ou arraste para escalar</span>
      </div>
      <Filters />
      <div className="char-grid" id="characterPool">
        {filtered.length === 0 ? (
          <div className="synergy-empty">Nenhum personagem disponível</div>
        ) : (
          filtered.map(c => (
            <HeroCard key={c.id} hero={c} onSelect={handleSelect} />
          ))
        )}
      </div>
    </div>
  );
}
