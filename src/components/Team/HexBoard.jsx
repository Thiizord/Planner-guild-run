// HexBoard.jsx - Tabuleiro hexagonal 4x7 (4 linhas, 7 colunas na base = 26 celulas).
// Herois da reserva ficam FORA do tabuleiro, num painel lateral.
// Linhas pares: 7 hexes | Linhas impares: 6 hexes com offset (honeycomb horizontal).

import { useApp } from '../../hooks/useApp.js';
import HexCell from './HexCell.jsx';

const ROWS = 4;
const BASE_COLS = 7;

// gera o layout com indices lineares corretos
let cell = 0;
const LAYOUT = [];
for (let r = 0; r < ROWS; r++) {
  const cols = r % 2 === 0 ? BASE_COLS : BASE_COLS - 1;
  const row = [];
  for (let c = 0; c < cols; c++) {
    row.push(cell++);
  }
  LAYOUT.push(row);
}

export const TOTAL_HEXES = cell; // 7+6+7+6 = 26

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
