// HeroCard.jsx - Card de herói da pool (dragStart + selectChar vanilla)

import { CLASS_ICONS } from '../../data/data.js';

export default function HeroCard({ hero, onSelect }) {
  const handleDragStart = (e) => {
    // dragStart vanilla: { charId, source: 'pool' } + effectAllowed 'move'
    e.dataTransfer.setData('text/plain', JSON.stringify({ source: 'pool', charId: hero.id }));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className="char-card"
      data-id={hero.id}
      draggable="true"
      onDragStart={handleDragStart}
      onClick={() => onSelect(hero.id)}
    >
      <span className="tier-badge">{hero.tier}</span>
      <span className="class-badge">{CLASS_ICONS[hero.class] || '🎯'} {hero.class}</span>
      <div className="avatar">
        {hero.image
          ? <img src={hero.image} alt={hero.name} className="hero-portrait" draggable="false" />
          : hero.emoji}
      </div>
      <div className="name">{hero.name}</div>
      <div className="role">{hero.role}</div>
      <div className="drag-hint">↕ Arraste</div>
    </div>
  );
}
