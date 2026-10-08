// TeamGrid.jsx - Seção do time: titulares + reservas (render.js → renderTeam)

import { useApp } from '../../hooks/useApp.js';
import { countMain, countReserve } from '../../utils/helpers.js';
import TeamSlot from './TeamSlot.jsx';

export default function TeamGrid() {
  const { state } = useApp();

  const renderSlots = (teamArr, type) =>
    teamArr.map((charId, idx) => (
      <TeamSlot key={`${type}-${idx}`} charId={charId} type={type} index={idx} />
    ));

  return (
    <div className="team-section">
      <div className="team-row">
        <div className="row-label">
          <span>⚡ Titulares</span>
          <span id="mainCount">{countMain(state.main)}/3</span>
        </div>
        <div className="team-slots" id="mainTeam">
          {renderSlots(state.main, 'main')}
        </div>
      </div>
      <div className="team-row">
        <div className="row-label">
          <span>🔄 Reservas</span>
          <span id="reserveCount">{countReserve(state.reserve)}/3</span>
        </div>
        <div className="team-slots" id="reserveTeam">
          {renderSlots(state.reserve, 'reserve')}
        </div>
      </div>
    </div>
  );
}
