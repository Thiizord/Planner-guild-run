// TeamGrid.jsx - Arena: tabuleiro hexagonal escalonado (3 titulares + 3 reservas).
// Fluxo de clique: 1o clique seleciona (itens), 2o clique no mesmo heroi o pega
// para mover, clique noutro hex move/troca. ESC ou clique no heroi cancela.
// Drag & drop continua funcionando direto (posicionamento imediato).

import { useEffect, useState } from 'react';
import { useApp } from '../../hooks/useApp.js';
import { countMain, countReserve } from '../../utils/helpers.js';
import HexCell from './HexCell.jsx';
import Equipment from './Equipment.jsx';
import ItemPicker from '../Items/ItemPicker.jsx';

export default function TeamGrid({ count }) {
  const { state, dispatch } = useApp();
  const [picker, setPicker] = useState(null);

  // ESC cancela o posicionamento/movimentacao
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && state.placementCharId) {
        dispatch({ type: 'CLEAR_PLACEMENT_CHAR' });
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [state.placementCharId, dispatch]);

  // clique num hex: fluxo completo de selecao, pegar e mover/trocar
  const handleHexClick = (type, index) => {
    const arr = type === 'main' ? state.main : state.reserve;
    const charId = arr[index];

    // ---- CASO 1: um heroi esta pego (posicionamento ou movimentacao ativa) ----
    if (state.placementCharId) {
      // clicou no proprio heroi pego: cancela
      if (state.placementCharId === charId) {
        dispatch({ type: 'CLEAR_PLACEMENT_CHAR' });
        return;
      }

      // veio do tabuleiro: move ou troca para qualquer hex
      if (state.placementFrom) {
        dispatch({
          type: 'SWAP_SLOTS',
          charId: state.placementCharId,
          fromType: state.placementFrom.teamType,
          fromIndex: state.placementFrom.index,
          toType: type,
          toIndex: index,
        });
        return;
      }

      // veio da biblioteca: so coloca em hex vazio
      if (!charId) {
        dispatch({
          type: 'DROP_CHAR',
          charId: state.placementCharId,
          teamType: type,
          slotIndex: index,
        });
      }
      // hex ocupado + veio da biblioteca = operacao invalida, nao faz nada
      return;
    }

    // ---- CASO 2: nenhum heroi pego ----
    if (charId) {
      if (state.selectedCharId === charId) {
        // 2o clique no mesmo heroi: pega para MOVER
        dispatch({ type: 'SET_PLACEMENT_CHAR', charId, fromType: type, fromIndex: index });
      } else {
        // 1o clique: seleciona para ver itens
        dispatch({ type: 'SELECT_SLOT', teamType: type, index });
      }
    }
    // hex vazio sem placement: nao faz nada
  };

  const handleItemSlotClick = (type, index, slotIdx) => {
    const arr = type === 'main' ? state.main : state.reserve;
    const charId = arr[index];
    if (!charId) return;
    setPicker({ charId, slot: slotIdx });
  };

  // determina o estado visual de cada celula
  const getCellState = (charId, type, idx) => {
    const isSelected = charId && state.selectedCharId === charId;
    const isPicked = state.placementCharId === charId;
    const isPlacementActive = Boolean(state.placementCharId);
    const isFromBoard = Boolean(state.placementFrom);
    const isSelf = isPicked && state.placementFrom?.teamType === type && state.placementFrom?.index === idx;

    // alvos validos durante placement:
    // da biblioteca: so hexes vazios
    // do tabuleiro: qualquer hex (exceto a origem)
    const isValidTarget = isPlacementActive && !isSelf && (isFromBoard || !charId);

    return { isSelected, isPicked, isValidTarget, isPlacementActive };
  };

  const renderRow = (teamArr, type) =>
    teamArr.map((charId, idx) => {
      const cellState = getCellState(charId, type, idx);
      return (
        <HexCell
          key={`${type}-${idx}`}
          cellId={`${type}-${idx}`}
          charId={charId}
          type={type}
          index={idx}
          isSelected={cellState.isSelected}
          isPicked={cellState.isPicked}
          isValidTarget={cellState.isValidTarget}
          isPlacementActive={cellState.isPlacementActive}
          onItemSlotClick={handleItemSlotClick}
          onHexClick={handleHexClick}
        />
      );
    });

  return (
    <div className="arena panel">
      <div className="arena-head">
        <h2 className="arena-title">Campo de Batalha</h2>
        <span className="badge" id="teamCount">{count}/6</span>
      </div>
      <div className="arena-sub">
        {state.placementCharId
          ? state.placementFrom
            ? 'Clique num hexagono para mover/trocar — ESC cancela'
            : 'Clique num hexagono vazio para posicionar — ESC cancela'
          : 'Clique num heroi para selecionar · clique de novo para mover'}
      </div>

      <div className="battlefield hex-grid-bg">
        <div className="hex-board">
          <div className="hex-row" aria-label="Titulares">
            {renderRow(state.main, 'main')}
          </div>
          <span className="visually-hidden" id="mainCount">{countMain(state.main)}/3</span>
          <div className="hex-row hex-row-offset" aria-label="Reservas">
            {renderRow(state.reserve, 'reserve')}
          </div>
          <span className="visually-hidden" id="reserveCount">{countReserve(state.reserve)}/3</span>
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
