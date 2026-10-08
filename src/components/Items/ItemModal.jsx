// ItemModal.jsx - Modal de seleção de item (modals.js → openItemModal/equipItem)

import { useApp } from '../../hooks/useApp.js';
import { getCharacter, getCharItems } from '../../utils/helpers.js';
import { ITEMS_DATA } from '../../data/data.js';

export default function ItemModal() {
  const { state, dispatch } = useApp();
  const { open, charId, slot } = state.itemModal;

  const char = charId ? getCharacter(charId) : null;
  const charItems = charId ? getCharItems(state.items, charId) : [null, null, null, null, null];
  const current = charItems[slot];
  const equipped = new Set(charItems.filter(id => id !== null));

  const close = () => dispatch({ type: 'CLOSE_ITEM_MODAL' });

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) close();
  };

  return (
    <div
      className={`modal-overlay ${open ? 'open' : ''}`}
      id="itemModal"
      onClick={handleOverlayClick}
    >
      <div className="modal glass">
        <div className="modal-header">
          <h3>🧰 <span className="neon-text">Equipar Item</span></h3>
          <button className="close-btn" id="closeItemModal" onClick={close}>✕</button>
        </div>
        <div id="modalCharInfo">
          Personagem: <strong id="modalCharName">{char ? char.name : '—'}</strong> · Slot <span id="modalSlotNum">{(slot ?? 0) + 1}</span>
        </div>
        <div className="item-list" id="itemList">
          {ITEMS_DATA.map(item => {
            const isEquipped = equipped.has(item.id) && current !== item.id;
            const isCurrent = current === item.id;
            const statsText = Object.entries(item.stats).map(([k, v]) => `${k}: ${v}`).join(' ');
            return (
              <div
                key={item.id}
                className="item-option"
                style={isEquipped ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                onClick={isEquipped ? undefined : () => dispatch({ type: 'SET_ITEM', charId, slot, itemId: item.id })}
              >
                <span className="item-option-name">
                  {item.icon && <img src={item.icon} alt="" className="item-icon" draggable="false" />}
                  <strong>{item.name}</strong>{' '}
                  <span style={{ fontSize: '11px', color: '#6a7b8f' }}>{item.type} · {item.rarity}</span>
                </span>
                <span>
                  <span className="item-stats">{statsText}</span> {isCurrent ? ' ✅' : ''} {isEquipped ? '(já equipado)' : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
