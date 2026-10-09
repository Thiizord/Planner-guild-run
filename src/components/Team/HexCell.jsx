// HexCell.jsx - Célula hexagonal individual do tabuleiro.
// Estados: vazio, ocupado (selecionado), pego-para-mover, alvo-válido, drag-over.
// Fluxo: 1o clique seleciona, 2o clique no mesmo pega, clique noutro hex move/troca.

import { useState } from 'react';
import { useApp } from '../../hooks/useApp.js';
import { getCharacter, getItem, getCharItems, countMain, countReserve } from '../../utils/helpers.js';
import ClassIcon from '../ClassIcon.jsx';
import MiniItems from './MiniItems.jsx';

export default function HexCell({
  cellId, charId, type, index,
  isSelected, isPicked, isValidTarget, isPlacementActive,
  onItemSlotClick, onHexClick,
}) {
  const { state, dispatch } = useApp();
  const [dragOver, setDragOver] = useState(false);

  // --- drag & drop (preservado integralmente) ---
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
        toType: type,
        toIndex: index,
      });
    } else {
      dispatch({
        type: 'DROP_CHAR',
        charId: drag.charId,
        teamType: type,
        slotIndex: index,
      });
    }
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ source: 'team', charId, teamType: type, index }));
    e.dataTransfer.effectAllowed = 'move';
  };

  // --- clique ---
  const handleClick = () => onHexClick(type, index);

  const handleRemove = (e) => {
    e.stopPropagation();
    dispatch({ type: 'REMOVE_CHAR', teamType: type, index });
  };

  const handleMove = (e) => {
    e.stopPropagation();
    dispatch({ type: 'MOVE_CHAR', teamType: type, index });
  };

  // --- vazio ---
  if (!charId) {
    const cellClasses = [
      'hex-cell',
      'empty',
      dragOver ? 'drag-over' : '',
      isValidTarget ? 'valid-target' : '',
    ].filter(Boolean).join(' ');

    return (
      <div
        className={cellClasses}
        data-cell={cellId}
        data-team={type}
        data-index={index}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="hex-frame empty-frame">
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

  const canMoveToMain = type === 'reserve' && countMain(state.main) < 3;
  const canMoveToReserve = type === 'main' && countReserve(state.reserve) < 3;
  const moveEnabled = type === 'main' ? canMoveToReserve : canMoveToMain;

  const tooltipItems = equippedItems.map((itemId) => {
    const item = getItem(itemId);
    if (!item) return null;
    const statsText = Object.entries(item.stats).map(([k, v]) => `${k}: ${v}`).join(' ');
    return (
      <div className="tooltip-item" key={itemId}>
        {item.icon && <img src={item.icon} alt="" className="tooltip-item-icon" draggable="false" />}
        <span>{item.name} <span style={{ color: '#77826f' }}>({statsText})</span></span>
      </div>
    );
  });

  const cellClasses = [
    'hex-cell',
    'filled',
    isSelected ? 'selected' : '',
    isPicked ? 'picked' : '',
    isValidTarget ? 'valid-target' : '',
    dragOver ? 'drag-over' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cellClasses}
      data-cell={cellId}
      data-team={type}
      data-index={index}
      onClick={handleClick}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      title={`${c.name} -- ${c.class}${c.class2 ? '/' + c.class2 : ''}`}
    >
      <button className="slot-btn remove-btn" onClick={handleRemove} aria-label={`Remover ${c.name}`}>
        X
      </button>
      {moveEnabled && (
        <button
          className="slot-btn move-btn"
          onClick={handleMove}
          aria-label={type === 'main' ? `Mover ${c.name} para reservas` : `Mover ${c.name} para titulares`}
        >
          {type === 'main' ? 'v' : '^'}
        </button>
      )}
      <span className={`item-count-badge ${itemCount > 0 ? 'has-items' : ''}`}>{itemCount}/5</span>

      <div className="hex-frame">
        {c.image
          ? <img src={c.image} alt={c.name} draggable="false" />
          : <div className="avatar-initial">{c.name.charAt(0)}</div>}
      </div>

      <div className="hex-info">
        <div className="hex-plate">
          <span className="hex-name">{c.name}</span>
        </div>
        <div className="hex-class">
          <ClassIcon name={c.class} size={11} />
          {c.class2 && <ClassIcon name={c.class2} size={11} />}
          <span>{c.class}{c.class2 ? '/' + c.class2 : ''}</span>
        </div>
        <MiniItems
          items={items}
          interactive={isSelected && !isPlacementActive}
          onSlotClick={onItemSlotClick ? (slotIdx) => onItemSlotClick(type, index, slotIdx) : undefined}
        />
      </div>

      {tooltipItems.length > 0 ? (
        <div className="item-tooltip">{tooltipItems}</div>
      ) : (
        <div className="item-tooltip">
          <div className="tooltip-item">Nenhum item equipado</div>
        </div>
      )}
    </div>
  );
}
