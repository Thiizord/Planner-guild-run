// Filters.jsx - Filtros de tier/classe e busca (main.js vanilla, inputs controlados)

import { useApp } from '../../hooks/useApp.js';

const TIER_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'S', label: 'S' },
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' }
];

const CLASS_OPTIONS = [
  { value: 'all', label: 'Todas' },
  { value: 'Warrior', label: '⚔️ Warrior' },
  { value: 'Tank', label: '🛡️ Tank' },
  { value: 'Vanguard', label: '💪 Vanguard' },
  { value: 'Assassin', label: '🗡️ Assassin' },
  { value: 'Duelist', label: '⚡ Duelist' },
  { value: 'Mystic', label: '🌀 Mystic' },
  { value: 'Mage', label: '🔮 Mage' }
];

export default function Filters() {
  const { state, dispatch } = useApp();

  return (
    <div className="filters">
      <div className="tier-filter" id="tierFilters">
        {TIER_OPTIONS.map(opt => (
          <button
            key={opt.value}
            className={state.tierFilter === opt.value ? 'active' : ''}
            onClick={() => dispatch({ type: 'SET_TIER_FILTER', value: opt.value })}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="class-filter" id="classFilters">
        {CLASS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            className={state.classFilter === opt.value ? 'active' : ''}
            onClick={() => dispatch({ type: 'SET_CLASS_FILTER', value: opt.value })}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <input
        type="text"
        id="searchInput"
        placeholder="Buscar herói..."
        value={state.searchQuery}
        onChange={e => dispatch({ type: 'SET_SEARCH_QUERY', value: e.target.value })}
      />
    </div>
  );
}
