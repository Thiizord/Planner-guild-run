// HeroPool.jsx - Biblioteca de heróis: busca e filtro por classe.
// Fluxo de posicionamento: clique no herói pega-o (SET_PLACEMENT_CHAR);
// clique num hexágono vazio posiciona (DROP_CHAR). Drag ainda funciona direto.

import { useMemo, useState } from 'react';
import { useApp } from '../../hooks/useApp';
import { getAvailableChars, isInTeam } from '../../utils/helpers';
import HeroCard from './HeroCard.jsx';
import Filters from './Filters.jsx';

export default function HeroPool() {
  const { state, dispatch } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  const filtered = useMemo(() => {
    const available = getAvailableChars(state.main, state.reserve);
    return available
      .filter((c) => {
        const matchClass =
          state.classFilter === 'all' ||
          c.class === state.classFilter ||
          c.class2 === state.classFilter;
        const q = state.searchQuery.toLowerCase();
        const matchSearch =
          c.name.toLowerCase().includes(q) ||
          c.role.toLowerCase().includes(q) ||
          c.class.toLowerCase().includes(q);
        return matchClass && matchSearch;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [state.main, state.reserve, state.classFilter, state.searchQuery]);

  const handleSelect = (charId) => {
    if (isInTeam(state.main, state.reserve, charId)) return;
    dispatch({ type: 'SET_PLACEMENT_CHAR', charId });
  };

  return (
    <div className={`library panel ${collapsed ? 'collapsed' : ''}`}>
      <button
        className="library-toggle"
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
      >
        Herois <span className="badge" id="poolCount">{filtered.length}</span>
        <span className="toggle-caret" aria-hidden="true">{collapsed ? '>' : 'v'}</span>
      </button>

      <div className="panel-title">
        <h2>Herois</h2>
        <span className="hint">{filtered.length} disponiveis</span>
      </div>

      <Filters />

      <div className="char-grid" id="characterPool">
        {filtered.length === 0 ? (
          <div className="synergy-empty">
            {getAvailableChars(state.main, state.reserve).length === 0
              ? 'Todos os herois ja estao no time'
              : 'Nenhum heroi encontrado com esses filtros'}
          </div>
        ) : (
          filtered.map((c) => (
            <HeroCard
              key={c.id}
              hero={c}
              onSelect={handleSelect}
              picked={state.placementCharId === c.id}
            />
          ))
        )}
      </div>

      {state.placementCharId && (
        <div className="placement-hint">
          Clique num hexagono vazio para posicionar
          <button className="btn btn-ghost btn-sm" onClick={() => dispatch({ type: 'CLEAR_PLACEMENT_CHAR' })}>
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
