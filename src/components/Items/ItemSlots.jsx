// ItemSlots.jsx - Seção de itens do personagem selecionado (render.js → renderItems)

import { useApp } from '../../hooks/useApp.js';
import { getSelectedChar, getCharItems, getItem } from '../../utils/helpers.js';

export default function ItemSlots() {
  const { state, dispatch } = useApp();
  const char = getSelectedChar(state.selectedCharId);
  const items = char ? getCharItems(state.items, char.id) : [null, null, null, null, null];

  return (
    <div className="items-section">
      <div className="items-label">🧰 Itens de <span id="selectedCharName">{char ? char.name : '—'}</span></div>
      <div className="items-grid" id="itemsGrid">
        {items.map((itemId, idx) => {
          const item = itemId ? getItem(itemId) : null;
          if (item) {
            const rarityClass = `rarity-${item.rarity.toLowerCase()}`;
            const statsText = Object.entries(item.stats).map(([k, v]) => `${k}: ${v}`).join(' ');
            return (
              <div
                key={idx}
                className={`item-slot has-item ${rarityClass}`}
                onClick={() => dispatch({ type: 'OPEN_ITEM_MODAL', slot: idx })}
              >
                {item.icon && <img src={item.icon} alt={item.name} className="item-icon" draggable="false" />}
                <span className="item-name">{item.name}</span>
                <span className="item-stat">{statsText}</span>
                <span style={{ fontSize: '8px', color: '#4a5f78' }}>{item.type}</span>
              </div>
            );
          }
          return (
            <div key={idx} className="item-slot" onClick={() => dispatch({ type: 'OPEN_ITEM_MODAL', slot: idx })}>
              ⬜
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: '6px', fontSize: '11px', color: '#4a5f78', textAlign: 'center' }}>
        Clique em um slot para equipar/trocar item
      </div>
    </div>
  );
}
