// ItemPicker.jsx - Seletor de itens INLINE (substitui o modal de itens).
// Abre direto do personagem selecionado no time (clicando nos mini-itens).

import { useApp } from '../../hooks/useApp.js';
import { getCharacter, getCharItems } from '../../utils/helpers.js';
import { ITEMS_DATA } from '../../data/data.js';

export default function ItemPicker({ charId, slot, onClose }) {
  const { state, dispatch } = useApp();
  const char = getCharacter(charId);
  if (!char) return null;

  const items = getCharItems(state.items, charId);
  const current = items[slot];
  const equipped = new Set(items.filter(id => id !== null));

  const handlePick = (item, isEquippedElsewhere, isCurrent) => {
    if (isEquippedElsewhere) return;
    if (isCurrent) {
      dispatch({ type: 'REMOVE_ITEM', charId, slot });
    } else {
      dispatch({ type: 'SET_ITEM', charId, slot, itemId: item.id });
    }
  };

  return (
    <div className="item-picker glass" id="itemPicker">
      <div className="modal-header">
        <h3>🧰 Itens de <span className="neon-text">{char.name}</span> · Slot {slot + 1}</h3>
        <button className="close-btn" onClick={onClose} title="Fechar seletor">✕</button>
      </div>
      <div className="item-picker-hint">Clique para equipar · clique no item atual (✅) para remover</div>
      <div className="item-list" id="itemList">
        {ITEMS_DATA.map(item => {
          const isEquippedElsewhere = equipped.has(item.id) && current !== item.id;
          const isCurrent = current === item.id;
          const statsText = Object.entries(item.stats).map(([k, v]) => `${k}: ${v}`).join(' ');
          return (
            <div
              key={item.id}
              className={`item-option ${isCurrent ? 'current' : ''}`}
              style={isEquippedElsewhere ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
              onClick={() => handlePick(item, isEquippedElsewhere, isCurrent)}
            >
              <span className="item-option-name">
                {item.icon && <img src={item.icon} alt="" className="item-icon" draggable="false" />}
                <strong>{item.name}</strong>{' '}
                <span style={{ fontSize: '11px', color: '#6a7b8f' }}>{item.type} · {item.rarity}</span>
              </span>
              <span>
                <span className="item-stats">{statsText}</span>
                {isCurrent ? ' ✅' : ''} {isEquippedElsewhere ? '(já equipado)' : ''}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
