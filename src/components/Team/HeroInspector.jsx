// HeroInspector.jsx - Painel de detalhes do herói selecionado:
// retrato, habilidade base (rank C), rank pills, especializacao, stats.
// Redesenhado com foco UI/UX — X para remover do time.

import { useApp } from '../../hooks/useApp';
import { getSelectedChar, getCharItems, getItem } from '../../utils/helpers';
import { SPECIALIZATIONS, RANKS } from '../../data/specializations';
import { HERO_BASE_ABILITIES } from '../../data/heroAbilities';
import ClassIcon from '../ClassIcon.jsx';

export default function HeroInspector() {
  const { state, dispatch } = useApp();
  const char = getSelectedChar(state.selectedCharId);
  if (!char) return null;

  const config = state.heroConfigs[char.id] || {};
  const rank = config.rank || 'C';
  const spec = config.spec || null;
  const specs = SPECIALIZATIONS[char.id] || [];
  const base = HERO_BASE_ABILITIES[char.id];
  const items = getCharItems(state.items, char.id);
  const equipped = items.filter((id) => id !== null);

  // encontra onde o heroi esta (main ou reserve) para o botao X
  const mainIdx = state.main.indexOf(char.id);
  const resIdx = state.reserve.indexOf(char.id);

  const handleRank = (r) => {
    dispatch({ type: 'SET_HERO_RANK', charId: char.id, rank: r });
  };

  const handleSpec = (specId) => {
    dispatch({ type: 'SET_HERO_SPEC', charId: char.id, spec: specId });
  };

  const handleRemove = () => {
    if (mainIdx !== -1) {
      dispatch({ type: 'REMOVE_CHAR', teamType: 'main', index: mainIdx });
    } else if (resIdx !== -1) {
      dispatch({ type: 'REMOVE_CHAR', teamType: 'reserve', index: resIdx });
    }
  };

  return (
    <div className="hero-inspector" aria-label={`Detalhes de ${char.name}`}>
      <div className="inspector-head">
        <div className="inspector-portrait">
          {char.image
            ? <img src={char.image} alt={char.name} draggable="false" />
            : <div className="avatar-initial">{char.name.charAt(0)}</div>}
        </div>
        <div className="inspector-info">
          <div className="inspector-name-row">
            <span className="inspector-name">{char.name}</span>
            <button className="inspector-remove" onClick={handleRemove} aria-label={`Remover ${char.name}`} title="Remover do time">
              X
            </button>
          </div>
          <div className="inspector-role">{char.role}</div>
          <div className="inspector-classes">
            <ClassIcon name={char.class} size={14} />
            {char.class2 && <ClassIcon name={char.class2} size={14} />}
            <span>{char.class}{char.class2 ? ' / ' + char.class2 : ''}</span>
          </div>
        </div>
      </div>

      {/* habilidade base (rank C) */}
      {base && (
        <div className="inspector-section">
          <span className="inspector-label">
            {base.kind === 'active' ? 'Habilidade Ativa' : 'Habilidade Passiva'}
            <span className="base-tag">base</span>
          </span>
          <div className={`base-ability ${base.kind}`}>
            <span className={`ba-kind ${base.kind}`}>{base.kind === 'active' ? 'Ativa' : 'Passiva'}</span>
            <span className="ba-name">{base.name}</span>
            <p className="ba-desc">{base.description}</p>
          </div>
        </div>
      )}

      {/* rank selector */}
      <div className="inspector-section">
        <span className="inspector-label">Rank</span>
        <div className="rank-pills" role="radiogroup" aria-label="Rank do herói">
          {RANKS.map((r) => (
            <button
              key={r}
              className={`rank-pill ${rank === r ? 'active' : ''} rank-${r.toLowerCase()}`}
              onClick={() => handleRank(r)}
              aria-checked={rank === r}
              role="radio"
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* especializacao (rank B+) */}
      <div className="inspector-section">
        <span className="inspector-label">
          Especialização
          {rank === 'C' && <span className="inspector-hint"> (desbloqueia no rank B)</span>}
        </span>
        <div className={`spec-cards ${rank === 'C' ? 'locked' : ''}`}>
          {specs.map((s) => (
            <button
              key={s.id}
              className={`spec-card ${spec === s.id ? 'selected' : ''} spec-tier-${s.tier.toLowerCase()}`}
              onClick={() => rank !== 'C' && handleSpec(s.id)}
              disabled={rank === 'C'}
              title={s.description}
            >
              <span className="spec-tier">{s.tier}</span>
              <span className="spec-name">{s.name}</span>
              {s.extraSlots && <span className="spec-slots">+{s.extraSlots} slots</span>}
              <span className="spec-kind">{s.kind === 'active' ? 'Ativa' : 'Passiva'}</span>
            </button>
          ))}
        </div>
        {spec && (
          <div className="spec-description">
            {specs.find((s) => s.id === spec)?.description}
          </div>
        )}
      </div>

      {/* stats base */}
      <div className="inspector-section">
        <span className="inspector-label">Atributos base</span>
        <div className="inspector-stats">
          {char.baseStats && Object.entries(char.baseStats).map(([k, v]) => (
            <span key={k} className="insp-stat">
              <span className="insp-stat-label">{k}</span>
              <span className="insp-stat-value">{v}</span>
            </span>
          ))}
        </div>
      </div>

      {/* itens equipados */}
      {equipped.length > 0 && (
        <div className="inspector-section">
          <span className="inspector-label">Itens equipados ({equipped.length}/5)</span>
          <div className="inspector-items">
            {equipped.map((itemId, i) => {
              const item = getItem(itemId);
              if (!item) return null;
              return (
                <div key={i} className="insp-item" title={`${item.name} — ${item.rarity}`}>
                  {item.icon && <img src={item.icon} alt={item.name} className="insp-item-icon" />}
                  <span className="insp-item-name">{item.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
