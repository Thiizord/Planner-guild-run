// HeroCard.jsx - Card compacto da biblioteca: retrato hexagonal, nome, classes (SVG).
// Drag customizado via Pointer Events (permite scroll do mouse durante drag).

import ClassIcon from '../ClassIcon.jsx';
import { useApp } from '../../hooks/useApp';
import { startHeroDrag, isDragging } from '../../hooks/useHeroDrag';

export default function HeroCard({ hero, onSelect, picked }) {
  const { dispatch } = useApp();

  const handlePointerDown = (e) => {
    if (e.button !== 0) return;
    startHeroDrag({ source: 'pool', charId: hero.id }, e, dispatch);
  };

  const handleClick = () => {
    if (isDragging()) return; // suprime click se houve drag
    onSelect(hero.id);
  };

  return (
    <div
      className={`hero-card ${picked ? 'picked' : ''}`}
      data-id={hero.id}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      title={`${hero.name} -- ${hero.role}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(hero.id);
        }
      }}
      aria-label={`${hero.name}, ${hero.class}${hero.class2 ? ' e ' + hero.class2 : ''}`}
    >
      <div className="hero-frame">
        {hero.image
          ? <img src={hero.image} alt={hero.name} draggable="false" />
          : <div className="avatar-initial">{hero.name.charAt(0)}</div>}
      </div>
      <div className="hero-name">{hero.name}</div>
      <span className="class-badge">
        <ClassIcon name={hero.class} size={12} />
        {hero.class2 && <ClassIcon name={hero.class2} size={12} />}
        <span className="class-names">{hero.class}{hero.class2 ? '/' + hero.class2 : ''}</span>
      </span>
    </div>
  );
}
