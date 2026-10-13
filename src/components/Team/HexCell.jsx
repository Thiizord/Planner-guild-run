// HexCell.jsx - Célula hexagonal individual do tabuleiro (flor de 7).
// Drag customizado via Pointer Events (permite scroll durante drag).
// Cada hex corresponde a um índice do array main (0-27).

import { useState } from 'react';
import { useApp } from '../../hooks/useApp';
import { getCharacter, getItem, getCharItems } from '../../utils/helpers';
import { startHeroDrag, isDragging } from '../../hooks/useHeroDrag';
import ClassIcon from '../ClassIcon.jsx';
import MiniItems from './MiniItems.jsx';

export default function HexCell({
  hexId, hexIndex, charId,
  isSelected, isPicked, isValidTarget, isPlacementActive,
  onHexClick, onItemSlotClick,
}) {
  const { state, dispatch } = useApp();
  const [hover, setHover] = useState(false);

  const handlePointerDown = (e) => {
    if (!charId || e.button !== 0) return;
    // não inicia drag se clicou no botão X
    if (e.target.closest('.hex-remove')) return;
    startHeroDrag({ source: 'team', charId, teamType: 'main', index: hexIndex }, e, dispatch);
  };

  const handleClick = () => {
    if (isDragging()) return; // suprime click se houve drag
    onHexClick(hexIndex);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    dispatch({ type: 'REMOVE_CHAR', teamType: 'main', index: hexIndex });
  };

  // --- vazio ---
  if (!charId) {
    const classes = [
      'hex-cell', 'empty',
      isValidTarget ? 'valid-target' : '',
    ].filter(Boolean).join(' ');

    return (
      <div
        className={classes}
        data-hex={hexId}
        data-index={hexIndex}
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
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      data-hex={hexId}
      data-index={hexIndex}
      data-char={charId}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={`${c.name} -- ${c.class}${c.class2 ? '/' + c.class2 : ''} -- clique de novo para mover`}
    >
      {/* botão X para remover (aparece no hover) */}
      <button
        className="hex-remove"
        onClick={handleRemove}
        aria-label={`Remover ${c.name}`}
        title="Remover do time"
      >
        X
      </button>

      <div className="hex-portrait">
        {c.image
          ? <img src={c.image} alt={c.name} draggable="false" />
          : <div className="avatar-initial">{c.name.charAt(0)}</div>}

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

        <span className={`hex-item-count ${itemCount > 0 ? 'has' : ''}`}>{itemCount}/5</span>
      </div>

      {tooltipItems.length > 0 && (
        <div className="hex-tooltip">
          {tooltipItems}
        </div>
      )}
    </div>
  );
}
