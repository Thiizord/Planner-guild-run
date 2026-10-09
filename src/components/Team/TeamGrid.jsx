// TeamGrid.jsx - Arena: tabuleiro hexagonal com formacao escalonada (3 titulares
// + 3 reservas), equipamento do heroi selecionado e seletor de itens inline.
// Cada hex tem um ID estavel (main-0..2, reserve-0..2) que mapeia direto
// para o estado (arrays main/reserve). Zero quebra de persistencia.

import { useState } from 'react';
import { useApp } from '../../hooks/useApp.js';
import { countMain, countReserve, getCharacter } from '../../utils/helpers.js';
import HexCell from './HexCell.jsx';
import Equipment from './Equipment.jsx';
import ItemPicker from '../Items/ItemPicker.jsx';

export default function TeamGrid({ count }) {
  const { state, dispatch } = useApp();
  const [picker, setPicker] = useState(null);

  // clique num hex: posiciona o heroi "pego" ou seleciona quem esta la
  const handleHexClick = (type, index) => {
    const charId = type === 'main' ? state.main[index] : state.reserve[index];

    // fluxo de posicionamento (heroi pego da biblioteca)
    if (state.placementCharId && !charId) {
      dispatch({
        type: 'DROP_CHAR',
        charId: state.placementCharId,
        teamType: type,
        slotIndex: index,
      });
      return;
    }

    // fluxo normal: seleciona o heroi no hex
    if (charId) {
      dispatch({ type: 'SELECT_SLOT', teamType: type, index });
    }
  };

  // clique num hex ocupado enquanto segura um heroi (swap)
  const handleHexClickOccupied = (type, index) => {
    if (state.placementCharId && charId) {
      dispatch({
        type: 'SWAP_SLOTS',
        charId: state.placementCharId,
        fromType: 'pool', // indica que veio da pool
        fromIndex: -1,
        toType: type,
        toIndex: index,
      });
    }
  };

  const handleItemSlotClick = (type, index, slotIdx) => {
    const arr = type === 'main' ? state.main : state.reserve;
    const charId = arr[index];
    if (!charId) return;
    setPicker({ charId, slot: slotIdx });
  };

  const renderRow = (teamArr, type, offset) =>
    teamArr.map((charId, idx) => (
      <HexCell
        key={`${type}-${idx}`}
        cellId={`${type}-${idx}`}
        charId={charId}
        type={type}
        index={idx}
        offset={offset}
        isSelected={charId && state.selectedCharId === charId}
        isPlacementTarget={Boolean(state.placementCharId)}
        onItemSlotClick={handleItemSlotClick}
        onHexClick={handleHexClick}
      />
    ));

  return (
    <div className="arena panel">
      <div className="arena-head">
        <h2 className="arena-title">Campo de Batalha</h2>
        <span className="badge" id="teamCount">{count}/6</span>
      </div>
      <div className="arena-sub">Clique num heroi, depois num hexagono vazio</div>

      <div className="battlefield hex-grid-bg">
        <div className="hex-board">
          <div className="hex-row" aria-label="Titulares">
            {renderRow(state.main, 'main', false)}
          </div>
          <span className="visually-hidden" id="mainCount">{countMain(state.main)}/3</span>
          <div className="hex-row offset" aria-label="Reservas">
            {renderRow(state.reserve, 'reserve', true)}
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
