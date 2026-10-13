// HexBoard.jsx - Tabuleiro hexagonal 4x7 (28 celulas, grid uniforme).
// Todas as linhas tem 7 hexes; linhas impares tem offset (honeycomb).
// Herois da reserva ficam FORA do tabuleiro, num painel lateral.

import { useApp } from '../../hooks/useApp';
import HexCell from './HexCell.jsx';

const ROWS = 4;
const COLS = 7;

// grid uniforme: todas as linhas tem 7 hexes
let cell = 0;
const LAYOUT = [];
for (let r = 0; r < ROWS; r++) {
  const row = [];
  for (let c = 0; c < COLS; c++) {
    row.push(cell++);
  }
  LAYOUT.push(row);
}

export const TOTAL_HEXES = cell; // 28

export default function HexBoard({ onHexClick, onItemSlotClick }) {
  const { state } = useApp();

  const getCellState = (index, charId) => {
    const isSelected = charId && state.selectedCharId === charId;
    const isPicked = state.placementCharId === charId;
    const isPlacementActive = Boolean(state.placementCharId);
    const isFromBoard = Boolean(state.placementFrom);
    const isSelf = isPicked && state.placementFrom?.teamType === 'main' && state.placementFrom?.index === index;
    const isValidTarget = isPlacementActive && !isSelf && (isFromBoard || !charId);
    return { isSelected, isPicked, isValidTarget, isPlacementActive };
  };

  const renderCell = (index) => {
    const charId = state.main[index] || null;
    const cs = getCellState(index, charId);
    return (
      <HexCell
        key={`hex-${index}`}
        hexId={`h${index}`}
        hexIndex={index}
        charId={charId}
        isSelected={cs.isSelected}
        isPicked={cs.isPicked}
        isValidTarget={cs.isValidTarget}
        isPlacementActive={cs.isPlacementActive}
        onHexClick={onHexClick}
        onItemSlotClick={onItemSlotClick}
      />
    );
  };

  return (
    <div className="hex-grid" aria-label="Tabuleiro hexagonal" role="grid">
      {LAYOUT.map((row, r) => (
        <div
          key={`row-${r}`}
          className={`hex-grid-row ${r % 2 !== 0 ? 'offset' : ''}`}
          role="row"
        >
          {row.map(renderCell)}
        </div>
      ))}
    </div>
  );
}
