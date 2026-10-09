// MiniItems.jsx - Miniaturas dos itens equipados num slot do time.
// 5 mini-slots fixos com ícones oficiais e moldura colorida pela raridade.
// Quando o personagem está selecionado, ficam clicáveis (abrem o seletor inline).

import { getItem } from '../../utils/helpers.js';

// 'Épico' -> 'epico', 'Lendário' -> 'lendario'
const rarityClass = (r) => r
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

export default function MiniItems({ items, interactive, onSlotClick }) {
  return (
    <div className="mini-items">
      {items.map((itemId, idx) => {
        const item = itemId ? getItem(itemId) : null;

        if (!item) {
          return (
            <span
              key={idx}
              className={`mini-item mini-empty ${interactive ? 'clickable' : ''}`}
              title={interactive ? 'Equipar item' : undefined}
              onClick={interactive && onSlotClick
                ? (e) => { e.stopPropagation(); onSlotClick(idx); }
                : undefined}
            />
          );
        }

        const statsText = Object.entries(item.stats).map(([k, v]) => `${k}:${v}`).join(' ');
        return (
          <span
            key={idx}
            className={`mini-item has-item rarity-${rarityClass(item.rarity)} ${interactive ? 'clickable' : ''}`}
            title={`${item.name} (${statsText})${interactive ? ' — clique para trocar' : ''}`}
            onClick={interactive && onSlotClick
              ? (e) => { e.stopPropagation(); onSlotClick(idx); }
              : undefined}
          >
            {item.icon
              ? <img src={item.icon} alt={item.name} className="mini-item-icon" draggable="false" />
              : <span className="mini-item-fallback">{item.name.slice(0, 2)}</span>}
          </span>
        );
      })}
    </div>
  );
}
