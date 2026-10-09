// TeamSlot.jsx - Um slot do time (render.js → renderTeamSlots + dragdrop.js)

import { useApp } from '../../hooks/useApp.js';
import { getCharacter, getItem, getCharItems, countMain, countReserve } from '../../utils/helpers.js';
import MiniItems from './MiniItems.jsx';

export default function TeamSlot({ charId, type, index, onItemSlotClick }) {
  const { state, dispatch } = useApp();

  const handleDragOver = (e) => {
    // dragOver vanilla
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e) => {
    // dropOnSlot vanilla + troca de posições dentro do time (novidade)
    e.preventDefault();
    const raw = e.dataTransfer.getData('text/plain');
    if (!raw) return;
    let drag;
    try {
      drag = JSON.parse(raw);
    } catch {
      drag = { source: 'pool', charId: raw }; // compatibilidade com payload de texto simples
    }
    if (!drag.charId) return;
    if (drag.source === 'team') {
      // arrastado de outro slot do time: mover para vazio ou trocar posições
      dispatch({
        type: 'SWAP_SLOTS',
        charId: drag.charId,
        fromType: drag.teamType,
        fromIndex: drag.index,
        toType: type,
        toIndex: index
      });
    } else {
      // arrastado da pool: comportamento vanilla
      dispatch({ type: 'DROP_CHAR', charId: drag.charId, teamType: type, slotIndex: index });
    }
  };

  const handleDragStart = (e) => {
    // dragStart vanilla (slots preenchidos também são arrastáveis) — marca a origem
    e.dataTransfer.setData('text/plain', JSON.stringify({ source: 'team', charId, teamType: type, index }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleClick = () => dispatch({ type: 'SELECT_SLOT', teamType: type, index });

  const handleRemove = (e) => {
    e.stopPropagation();
    dispatch({ type: 'REMOVE_CHAR', teamType: type, index });
  };

  const handleMove = (e) => {
    e.stopPropagation();
    dispatch({ type: 'MOVE_CHAR', teamType: type, index });
  };

  if (!charId) {
    // Slot vazio
    return (
      <div
        className="team-slot"
        data-team={type}
        data-index={index}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <span className="empty-label">⬜ Vazio</span>
      </div>
    );
  }

  const c = getCharacter(charId);
  if (!c) return null;

  const items = getCharItems(state.items, charId);
  const equippedItems = items.filter(id => id !== null);
  const itemCount = equippedItems.length;

  // Botão de mover (renderTeamSlots vanilla)
  const canMoveToMain = (type === 'reserve' && countMain(state.main) < 3);
  const canMoveToReserve = (type === 'main' && countReserve(state.reserve) < 3);
  const moveEnabled = type === 'main' ? canMoveToReserve : canMoveToMain;
  const isSelected = state.selectedCharId === charId;

  // Tooltip com itens equipados (renderTeamSlots vanilla + ícones oficiais)
  const tooltipItems = equippedItems.map(itemId => {
    const item = getItem(itemId);
    if (!item) return null;
    const statsText = Object.entries(item.stats).map(([k, v]) => `${k}: ${v}`).join(' ');
    return (
      <div className="tooltip-item" key={itemId}>
        {item.icon && <img src={item.icon} alt="" className="tooltip-item-icon" draggable="false" />}
        <span>
          {item.name} <span style={{ color: '#6a7b8f' }}>({statsText})</span>
        </span>
      </div>
    );
  });
  const tooltipContent = tooltipItems.filter(Boolean).length > 0
    ? tooltipItems
    : <div className="tooltip-item">Nenhum item equipado</div>;

  return (
    <div
      className={`team-slot filled ${isSelected ? 'selected' : ''}`}
      data-team={type}
      data-index={index}
      onClick={handleClick}
      draggable="true"
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <button className="slot-btn remove-btn" onClick={handleRemove}>✕</button>
      {moveEnabled && (
        <button
          className={`slot-btn move-btn ${type === 'main' ? '' : 'to-main'}`}
          onClick={handleMove}
        >
          {type === 'main' ? '⬇️' : '⬆️'}
        </button>
      )}
      <span className={`item-count-badge ${itemCount > 0 ? 'has-items' : ''}`}>{itemCount}/5</span>
      <div className="slot-content">
        <div className="avatar">
          {c.image
            ? <img src={c.image} alt={c.name} className="hero-portrait" draggable="false" />
            : c.emoji}
        </div>
        <div className="name">{c.name}</div>
        <div className="details">{c.tier} · {c.class}{c.class2 ? '/' + c.class2 : ''}</div>
        <MiniItems
          items={items}
          interactive={isSelected}
          onSlotClick={onItemSlotClick ? (slotIdx) => onItemSlotClick(type, index, slotIdx) : undefined}
        />
      </div>
      <div className="item-tooltip">{tooltipContent}</div>
    </div>
  );
}
