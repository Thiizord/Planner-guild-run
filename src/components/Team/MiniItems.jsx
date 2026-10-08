// MiniItems.jsx - Miniaturas dos itens de um slot do time (renderTeamSlots vanilla)

import { getItem } from '../../utils/helpers.js';

export default function MiniItems({ items }) {
  const equippedItems = items.filter(id => id !== null);
  const emptySlots = Array(5 - equippedItems.length).fill(null);

  return (
    <div className="mini-items">
      {equippedItems.map(itemId => {
        const item = getItem(itemId);
        if (!item) return null;
        const rarityClass = `rarity-${item.rarity.toLowerCase()}`;
        const statsText = Object.entries(item.stats).map(([k, v]) => `${k}:${v}`).join(' ');
        return (
          <span
            key={itemId}
            className={`mini-item has-item ${rarityClass}`}
            title={`${item.name} (${statsText})`}
          >
            {item.name}
          </span>
        );
      })}
      {emptySlots.map((_, i) => (
        <span key={`empty-${i}`} className="mini-item">⬜</span>
      ))}
    </div>
  );
}
