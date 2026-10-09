// Equipment.jsx - Inspector de loadout do herói selecionado (padrão do builder
// oficial): 5 slots grandes de item, clique abre o seletor inline.

import { useApp } from '../../hooks/useApp.js';
import { getSelectedChar, getCharItems, getItem } from '../../utils/helpers.js';

const rarityClass = (r) => r
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

export default function Equipment({ onSlotClick }) {
  const { state } = useApp();
  const char = getSelectedChar(state.selectedCharId);

  if (!char) {
    return (
      <div className="equip-placeholder">
        Selecione um personagem no campo de batalha para gerenciar equipamentos
      </div>
    );
  }

  const items = getCharItems(state.items, char.id);

  return (
    <div className="equip" aria-label={`Equipamentos de ${char.name}`}>
      <div className="equip-title">
        <span>Equipamento</span>
        <strong>{char.name}</strong>
      </div>
      <div className="equip-slots" id="itemsGrid">
        {items.map((itemId, idx) => {
          const item = itemId ? getItem(itemId) : null;
          if (!item) {
            return (
              <button
                key={idx}
                className="equip-slot"
                onClick={() => onSlotClick(char.id, idx)}
                aria-label={`Slot ${idx + 1} de ${char.name} — vazio`}
              >
                <span className="equip-plus" aria-hidden="true">+</span>
              </button>
            );
          }
          const statsText = Object.entries(item.stats).map(([k, v]) => `${k}: ${v}`).join(' ');
          return (
            <button
              key={idx}
              className={`equip-slot filled rarity-${rarityClass(item.rarity)}`}
              onClick={() => onSlotClick(char.id, idx)}
              title={`${item.name} (${statsText})`}
              aria-label={`Slot ${idx + 1} de ${char.name} — ${item.name}`}
            >
              {item.icon && <img src={item.icon} alt="" className="equip-icon" draggable="false" />}
              <span className="equip-name">{item.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
