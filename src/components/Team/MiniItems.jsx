// MiniItems.jsx - Miniaturas dos itens equipados num slot do time (v2 estética)
// Antes: pílulas de texto com o nome do item. Agora: 5 mini-slots fixos com
// os ícones oficiais extraídos do jogo e moldura colorida pela raridade.

import { getItem } from '../../utils/helpers.js';

// 'Épico' -> 'epico', 'Lendário' -> 'lendario' (o CSS original define as
// classes sem acento — normalizar aqui finalmente ativa as cores da raridade)
const rarityClass = (r) => r
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

export default function MiniItems({ items }) {
  return (
    <div className="mini-items">
      {items.map((itemId, idx) => {
        const item = itemId ? getItem(itemId) : null;

        // slot vazio: quadradinho tracejado discreto
        if (!item) {
          return <span key={idx} className="mini-item mini-empty" />;
        }

        const statsText = Object.entries(item.stats).map(([k, v]) => `${k}:${v}`).join(' ');
        return (
          <span
            key={idx}
            className={`mini-item has-item rarity-${rarityClass(item.rarity)}`}
            title={`${item.name} (${statsText})`}
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
