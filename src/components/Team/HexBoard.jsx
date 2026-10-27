/**
 * @file HexBoard.jsx
 * @description Tabuleiro tatico hexagonal 4x7 (28 celulas uniformes em malha favo de mel).
 * 
 * Arquitetura de renderizacao:
 * - Grade matematica uniforme: 4 linhas x 7 colunas = 28 posicoes taticas.
 * - Deslocamento horizontal (offset): linhas impares recebem classe CSS offset (meio hexagono de recuo)
 *   para formar o encaixe perfeito de colmeia (honeycomb geometry).
 * - Desacoplamento da reserva: herois no banco (reserva) ficam fora do grid, num painel lateral dedicado,
 *   garantindo foco exclusivo das celulas do tabuleiro na formacao em combate.
 * 
 * Ciclo de interacao e estados de celula:
 * - isSelected: heroi na celula esta inspecionado no painel de detalhes.
 * - isPicked: heroi nesta celula foi selecionado para movimentacao tatica.
 * - isValidTarget: celula elegivel para drop via drag-and-drop ou segundo clique de movimentacao.
 * - isPlacementActive: modo de posicionamento ativo globalmente no contexto da aplicacao.
 */

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
