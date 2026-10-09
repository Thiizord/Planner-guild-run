// HeroCard.jsx - Card compacto da biblioteca: retrato hexagonal, nome, classes (SVG).

import ClassIcon from '../ClassIcon.jsx';

export default function HeroCard({ hero, onSelect, picked }) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ source: 'pool', charId: hero.id }));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className={`hero-card ${picked ? 'picked' : ''}`}
      data-tier={hero.tier}
      data-id={hero.id}
      draggable="true"
      onDragStart={handleDragStart}
      onClick={() => onSelect(hero.id)}
      title={`${hero.name} -- ${hero.role}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(hero.id);
        }
      }}
      aria-label={`${hero.name}, ${hero.class}${hero.class2 ? ' e ' + hero.class2 : ''}, tier ${hero.tier}`}
    >
      <span className="tier-badge" aria-hidden="true">{hero.tier}</span>
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
      <span className="drag-hint" aria-hidden="true">+</span>
    </div>
  );
}
