// TeamGrid.jsx - Arena central: campo de batalha com formação tática (3 titulares
// + 3 reservas), equipamento do herói selecionado e seletor de itens inline.
// Toda a lógica de estado/drag permanece no reducer — aqui é apresentação.

import { useState } from 'react';
import { useApp } from '../../hooks/useApp.js';
import { countMain, countReserve } from '../../utils/helpers.js';
import TeamSlot from './TeamSlot.jsx';
import Equipment from './Equipment.jsx';
import ItemPicker from '../Items/ItemPicker.jsx';

export default function TeamGrid({ count }) {
  const { state } = useApp();
  // seletor inline: { charId, slot } — aberto pelos mini-itens do herói
  // selecionado ou pelos slots de equipamento (mesma ação)
  const [picker, setPicker] = useState(null);

  const handleItemSlotClick = (type, index, slotIdx) => {
    const arr = type === 'main' ? state.main : state.reserve;
    const charId = arr[index];
    if (!charId) return;
    setPicker({ charId, slot: slotIdx });
  };

  const renderSlots = (teamArr, type, size) =>
    teamArr.map((charId, idx) => (
      <TeamSlot
        key={`${type}-${idx}`}
        charId={charId}
        type={type}
        index={idx}
        size={size}
        onItemSlotClick={handleItemSlotClick}
      />
    ));

  return (
    <div className="arena panel">
      <div className="arena-head">
        <h2 className="arena-title">Campo de Batalha</h2>
        <span className="badge" id="teamCount">{count}/6</span>
      </div>
      <div className="arena-sub">Clique num herói da biblioteca ou arraste até uma posição</div>

      <div className="battlefield hex-grid-bg">
        <div className="bf-row starters" aria-label="Titulares">
          {renderSlots(state.main, 'main', 'lg')}
        </div>

        <div className="bf-divider">
          <span>Titulares · {countMain(state.main)}/3</span>
        </div>

        <div className="bf-row reserves" aria-label="Reservas">
          {renderSlots(state.reserve, 'reserve', 'sm')}
          <span className="visually-hidden" id="reserveCount">{countReserve(state.reserve)}/3</span>
        </div>
        <span id="mainCount" className="visually-hidden">{countMain(state.main)}/3</span>
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
