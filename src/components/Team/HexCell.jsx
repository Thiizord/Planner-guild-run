// HexCell.jsx - Célula hexagonal individual do tabuleiro (flor de 7).
// Conteúdo DENTRO do hex: retrato + overlay com nome/classe/mini-itens.
// Cada hex corresponde a um índice do array main (0-6).

import { useState } from 'react';
import { useApp } from '../../hooks/useApp.js';
import { getCharacter, getItem, getCharItems } from '../../utils/helpers.js';
import ClassIcon from '../ClassIcon.jsx';
import MiniItems from './MiniItems.jsx';

export default function HexCell({
  hexId, hexIndex, charId,
  isSelected, isPicked, isValidTarget, isPlacementActive,
  onHexClick, onItemSlotClick,
}) {
  const { state, dispatch } = useApp();
  const [dragOver, setDragOver] = useState(false);

  // --- drag & drop ---
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const raw = e.dataTransfer.getData('text/plain');
    if (!raw) return;
    let drag;
    try { drag = JSON.parse(raw); } catch { drag = { source: 'pool', charId: raw }; }
    if (!drag.charId) return;

    if (drag.source === 'team') {
      dispatch({
        type: 'SWAP_SLOTS',
        charId: drag.charId,
        fromType: drag.teamType,
        fromIndex: drag.index,
        toType: 'main',
        toIndex: hexIndex,
      });
    } else {
      dispatch({
        type: 'DROP_CHAR',
        charId: drag.charId,
        teamType: 'main',
        slotIndex: hexIndex,
      });
    }
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ source: 'team', charId, teamType: 'main', index: hexIndex }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleClick = () => onHexClick(hexIndex);

  // --- vazio ---
  if (!charId) {
    const classes = [
      'hex-cell', 'empty',
      dragOver ? 'drag-over' : '',
      isValidTarget ? 'valid-target' : '',
    ].filter(Boolean).join(' ');

    return (
      <div
        className={classes}
        data-hex={hexId}
        data-index={hexIndex}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="hex-portrait empty-portrait">
          <span className="hex-plus">+</span>
        </div>
        <span className="hex-label">Vazio</span>
      </div>
    );
  }

  const c = getCharacter(charId);
  if (!c) return null;

  const items = getCharItems(state.items, charId);
  const equippedItems = items.filter((id) => id !== null);
  const itemCount = equippedItems.length;

  const tooltipItems = equippedItems.map((itemId) => {
    const item = getItem(itemId);
    if (!item) return null;
    const statsText = Object.entries(item.stats).map(([k, v]) => `${k}: ${v}`).join(' ');
    return (
      <div className="tooltip-item" key={itemId}>
        {item.icon && <img src={item.icon} alt="" className="tooltip-item-icon" draggable="false" />}
        <span>{item.name} ({statsText})</span>
      </div>
    );
  });

  const classes = [
    'hex-cell', 'filled',
    isSelected ? 'selected' : '',
    isPicked ? 'picked' : '',
    isValidTarget ? 'valid-target' : '',
    dragOver ? 'drag-over' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      data-hex={hexId}
      data-index={hexIndex}
      data-char={charId}
      onClick={handleClick}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      title={`${c.name} -- ${c.class}${c.class2 ? '/' + c.class2 : ''} -- clique de novo para mover`}
    >
      <div className="hex-portrait">
        {c.image
          ? <img src={c.image} alt={c.name} draggable="false" />
          : <div className="avatar-initial">{c.name.charAt(0)}</div>}

        {/* overlay: nome + classe + mini-itens na base do hex */}
        <div className="hex-overlay">
          <div className="hex-overlay-name">{c.name}</div>
          <div className="hex-overlay-class">
            <ClassIcon name={c.class} size={10} />
            {c.class2 && <ClassIcon name={c.class2} size={10} />}
          </div>
          <MiniItems
            items={items}
            interactive={isSelected && !isPlacementActive}
            onSlotClick={onItemSlotClick ? (slot) => onItemSlotClick('main', hexIndex, slot) : undefined}
          />
        </div>

        {/* contagem de itens no canto */}
        <span className={`hex-item-count ${itemCount > 0 ? 'has' : ''}`}>{itemCount}/5</span>
      </div>

      {/* tooltip */}
      {tooltipItems.length > 0 && (
        <div className="hex-tooltip">
          {tooltipItems}
        </div>
      )}
    </div>
  );
}
