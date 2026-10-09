// Filters.jsx - Busca, chips de tier e classe (com SVG icons), ordenação.

import { useApp } from '../../hooks/useApp.js';
import ClassIcon from '../ClassIcon.jsx';

const TIER_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'S', label: 'S' },
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' }
];

const CLASS_OPTIONS = [
  { value: 'all', label: 'Todas' },
  { value: 'Warrior', label: 'Warrior' },
  { value: 'Tank', label: 'Tank' },
  { value: 'Vanguard', label: 'Vanguard' },
  { value: 'Assassin', label: 'Assassin' },
  { value: 'Duelist', label: 'Duelist' },
  { value: 'Mystic', label: 'Mystic' },
  { value: 'Mage', label: 'Mage' }
];

export default function Filters({ sortBy, onSortChange }) {
  const { state, dispatch } = useApp();

  return (
    <div className="filters">
      <input
        type="text"
        id="searchInput"
        placeholder="Buscar heroi..."
        value={state.searchQuery}
        onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', value: e.target.value })}
        aria-label="Buscar heroi por nome ou funcao"
      />

      <div className="chip-row" id="tierFilters" role="group" aria-label="Filtrar por tier">
        {TIER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`chip tier ${state.tierFilter === opt.value ? 'active' : ''}`}
            data-tier={opt.value}
            onClick={() => dispatch({ type: 'SET_TIER_FILTER', value: opt.value })}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="chip-row" id="classFilters" role="group" aria-label="Filtrar por classe">
        {CLASS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`chip class-chip ${state.classFilter === opt.value ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_CLASS_FILTER', value: opt.value })}
          >
            {opt.value !== 'all' && <ClassIcon name={opt.value} size={14} />}
            {opt.label}
          </button>
        ))}
      </div>

      <div className="sort-row">
        <label htmlFor="sortSelect">Ordenar por</label>
        <select id="sortSelect" value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
          <option value="tier">Tier</option>
          <option value="name">Nome</option>
        </select>
      </div>
    </div>
  );
}
