// TeamGrid.jsx - Arena: tabuleiro hexagonal 7x4 (25 celulas) + painel lateral de reservas.
// Fluxo: 1o clique seleciona (itens), 2o clique no mesmo pega para mover,
// clique em outro hex move/troca. ESC cancela. Drag&drop direto.

import { useEffect, useState } from 'react';
import { useApp } from '../../hooks/useApp.js';
import { getCharacter, countMain, countReserve } from '../../utils/helpers.js';
import HexBoard from './HexBoard.jsx';
import Equipment from './Equipment.jsx';
import ItemPicker from '../Items/ItemPicker.jsx';
import ClassIcon from '../ClassIcon.jsx';

export default function TeamGrid({ count }) {
  const { state, dispatch } = useApp();
  const [picker, setPicker] = useState(null);

  // ESC cancela
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && state.placementCharId) {
        dispatch({ type: 'CLEAR_PLACEMENT_CHAR' });
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [state.placementCharId, dispatch]);

  // clique num hex do tabuleiro
  const handleHexClick = (hexIndex) => {
    const charId = state.main[hexIndex];

    if (state.placementCharId) {
      if (state.placementCharId === charId) {
        dispatch({ type: 'CLEAR_PLACEMENT_CHAR' });
        return;
      }
      if (state.placementFrom) {
        dispatch({
          type: 'SWAP_SLOTS',
          charId: state.placementCharId,
          fromType: state.placementFrom.teamType,
          fromIndex: state.placementFrom.index,
          toType: 'main',
          toIndex: hexIndex,
        });
      } else if (!charId) {
        dispatch({
          type: 'DROP_CHAR',
          charId: state.placementCharId,
          teamType: 'main',
          slotIndex: hexIndex,
        });
      }
      return;
    }

    if (charId) {
      if (state.selectedCharId === charId) {
        dispatch({ type: 'SET_PLACEMENT_CHAR', charId, fromType: 'main', fromIndex: hexIndex });
      } else {
        dispatch({ type: 'SELECT_SLOT', teamType: 'main', index: hexIndex });
      }
    }
  };

  // clique num slot do painel de reservas
  const handleReserveClick = (index) => {
    const charId = state.reserve[index];

    if (state.placementCharId && state.placementFrom) {
      // move do tabuleiro para reserva
      dispatch({
        type: 'SWAP_SLOTS',
        charId: state.placementCharId,
        fromType: state.placementFrom.teamType,
        fromIndex: state.placementFrom.index,
        toType: 'reserve',
        toIndex: index,
      });
      return;
    }

    if (charId) {
      if (state.selectedCharId === charId) {
        // pega da reserva para posicionar no tabuleiro
        dispatch({ type: 'SET_PLACEMENT_CHAR', charId, fromType: 'reserve', fromIndex: index });
      } else {
        dispatch({ type: 'SELECT_SLOT', teamType: 'reserve', index });
      }
    }
  };

  // drop de drag num slot de reserva
  const handleReserveDrop = (e, index) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('text/plain');
    if (!raw) return;
    try {
      const drag = JSON.parse(raw);
      if (drag.charId && drag.source === 'team') {
        dispatch({
          type: 'SWAP_SLOTS',
          charId: drag.charId,
          fromType: drag.teamType,
          fromIndex: drag.index,
          toType: 'reserve',
          toIndex: index,
        });
      }
    } catch { /* noop */ }
  };

  const handleItemSlotClick = (type, index, slot) => {
    const arr = type === 'main' ? state.main : state.reserve;
    const charId = arr[index];
    if (!charId) return;
    setPicker({ charId, slot });
  };

  return (
    <div className="arena panel">
      <div className="arena-head">
        <h2 className="arena-title">Campo de Batalha</h2>
        <span className="badge" id="teamCount">{count}/6</span>
      </div>
      <div className="arena-sub">
        {state.placementCharId
          ? state.placementFrom
            ? 'Clique num hex ou reserva para mover / ESC cancela'
            : 'Clique num hex vazio / ESC cancela'
          : 'Clique num heroi para selecionar / de novo para mover / arraste'}
      </div>

      {/* tabuleiro hexagonal — os hexágonos SÃO o campo de batalha */}
      <div className="hex-battlefield">
        <HexBoard onHexClick={handleHexClick} onItemSlotClick={handleItemSlotClick} />
        <span className="visually-hidden" id="mainCount">{countMain(state.main)}/3</span>
      </div>

      {/* painel lateral de reservas */}
      <div className="reserve-panel" aria-label="Reservas">
        <div className="reserve-panel-title">
          <span>Reservas</span>
          <span className="badge" id="reserveCount">{countReserve(state.reserve)}/3</span>
        </div>
        <div className="reserve-panel-slots">
          {state.reserve.map((charId, idx) => {
            const c = charId ? getCharacter(charId) : null;
            if (!c) {
              return (
                <div
                  key={`res-${idx}`}
                  className="reserve-panel-slot empty"
                  onClick={() => handleReserveClick(idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleReserveDrop(e, idx)}
                >
                  <span className="rp-plus">+</span>
                </div>
              );
            }
            return (
              <div
                key={`res-${idx}`}
                className={`reserve-panel-slot ${state.selectedCharId === charId ? 'selected' : ''} ${state.placementCharId === charId ? 'picked' : ''}`}
                onClick={() => handleReserveClick(idx)}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', JSON.stringify({ source: 'team', charId, teamType: 'reserve', index: idx }));
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleReserveDrop(e, idx)}
                title={`${c.name} -- ${c.role}`}
              >
                <img src={c.image} alt={c.name} className="rp-portrait" draggable="false" />
                <span className="rp-name">{c.name}</span>
                <span className="rp-class">
                  <ClassIcon name={c.class} size={10} />
                  {c.class2 && <ClassIcon name={c.class2} size={10} />}
                </span>
                <button
                  className="rp-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch({ type: 'REMOVE_CHAR', teamType: 'reserve', index: idx });
                  }}
                  aria-label={`Remover ${c.name}`}
                >
                  X
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <Equipment onSlotClick={(charId, slot) => setPicker({ charId, slot })} />

      {picker && (
        <ItemPicker
          key={`${picker.charId}-${picker.slot}`}
          charId={picker.charId}
          slot={picker.slot}
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  );
}
