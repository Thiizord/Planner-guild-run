// Filters.jsx - Busca e chips de classe (com SVG icons).

import { useApp } from '../../hooks/useApp';
import ClassIcon from '../ClassIcon.jsx';

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

export default function Filters() {
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
    </div>
  );
}
