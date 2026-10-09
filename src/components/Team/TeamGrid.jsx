// TeamGrid.jsx - Seção do time: titulares + reservas (render.js → renderTeam)
// + seletor de itens INLINE, aberto direto do personagem selecionado.

import { useState } from 'react';
import { useApp } from '../../hooks/useApp.js';
import { countMain, countReserve } from '../../utils/helpers.js';
import TeamSlot from './TeamSlot.jsx';
import ItemPicker from '../Items/ItemPicker.jsx';

export default function TeamGrid() {
  const { state } = useApp();
  // seletor inline: { charId, slot } — aberto ao clicar nos mini-itens do
  // personagem SELECIONADO no time (substitui o antigo modal de itens)
  const [picker, setPicker] = useState(null);

  const handleItemSlotClick = (type, index, slotIdx) => {
    const arr = type === 'main' ? state.main : state.reserve;
    const charId = arr[index];
    if (!charId) return;
    setPicker({ charId, slot: slotIdx });
  };

  const renderSlots = (teamArr, type) =>
    teamArr.map((charId, idx) => (
      <TeamSlot
        key={`${type}-${idx}`}
        charId={charId}
        type={type}
        index={idx}
        onItemSlotClick={handleItemSlotClick}
      />
    ));

  return (
    <div className="team-section">
      <div className="team-row">
        <div className="row-label">
          <span>Titulares</span>
          <span id="mainCount">{countMain(state.main)}/3</span>
        </div>
        <div className="team-slots" id="mainTeam">
          {renderSlots(state.main, 'main')}
        </div>
      </div>
      <div className="team-row">
        <div className="row-label">
          <span>Reservas</span>
          <span id="reserveCount">{countReserve(state.reserve)}/3</span>
        </div>
        <div className="team-slots" id="reserveTeam">
          {renderSlots(state.reserve, 'reserve')}
        </div>
      </div>

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
