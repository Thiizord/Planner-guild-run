// HeroPool.jsx - Biblioteca de heróis (coluna lateral): busca, filtros, ordenação
// e grid compacto de cards. Gaveta recolhível no mobile.

import { useMemo, useState } from 'react';
import { useApp } from '../../hooks/useApp.js';
import { getAvailableChars } from '../../utils/helpers.js';
import HeroCard from './HeroCard.jsx';
import Filters from './Filters.jsx';

const TIER_ORDER = { S: 0, A: 1, B: 2, C: 3 };

export default function HeroPool() {
  const { state, dispatch } = useApp();
  const [sortBy, setSortBy] = useState('tier');
  const [collapsed, setCollapsed] = useState(false);

  const filtered = useMemo(() => {
    const available = getAvailableChars(state.main, state.reserve);
    const list = available.filter((c) => {
      const matchTier = state.tierFilter === 'all' || c.tier === state.tierFilter;
      const matchClass =
        state.classFilter === 'all' ||
        c.class === state.classFilter ||
        c.class2 === state.classFilter;
      const q = state.searchQuery.toLowerCase();
      const matchSearch =
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.class.toLowerCase().includes(q);
      return matchTier && matchClass && matchSearch;
    });
    if (sortBy === 'name') {
      return [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortBy === 'tier') {
      return [...list].sort(
        (a, b) => (TIER_ORDER[a.tier] ?? 9) - (TIER_ORDER[b.tier] ?? 9) || a.name.localeCompare(b.name)
      );
    }
    return list;
  }, [state.main, state.reserve, state.tierFilter, state.classFilter, state.searchQuery, sortBy]);

  const handleSelect = (charId) => dispatch({ type: 'SELECT_CHAR', charId });

  return (
    <div className={`library panel ${collapsed ? 'collapsed' : ''}`}>
      <button
        className="library-toggle"
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
      >
        Heróis <span className="badge" id="poolCount">{filtered.length}</span>
        <span className="toggle-caret" aria-hidden="true">{collapsed ? '▸' : '▾'}</span>
      </button>

      <div className="panel-title">
        <h2>Heróis</h2>
        <span className="hint">{filtered.length} disponíveis</span>
      </div>

      <Filters sortBy={sortBy} onSortChange={setSortBy} />

      <div className="char-grid" id="characterPool">
        {filtered.length === 0 ? (
          <div className="synergy-empty">
            {getAvailableChars(state.main, state.reserve).length === 0
              ? 'Todos os heróis já estão no time'
              : 'Nenhum herói encontrado com esses filtros'}
          </div>
        ) : (
          filtered.map((c) => (
            <HeroCard key={c.id} hero={c} onSelect={handleSelect} />
          ))
        )}
      </div>
    </div>
  );
}
