// StatsPanel.jsx - Estatísticas do time: DPS em destaque + grade compacta de
// atributos com os ícones oficiais de estatística.

import { useApp } from '../hooks/useApp.js';
import { getTeamCharactersData } from '../utils/helpers.js';
import { calculateTeamStats, calculateDPS } from '../utils/stats.js';

const STAT_ICONS = {
  hp: '❤️ HP', attack: '⚔️ Ataque', magic: '🔮 Magia', defense: '🛡️ Defesa',
  attackSpeed: '⚡ Vel. Ataque', crit: '🎯 Crítico', critDamage: '💥 Dano Crítico',
  manaRegen: '🌀 Mana/s', maxMana: '💧 Mana', omnivamp: '🩸 Vampirismo',
  thorns: '🌵 Espinhos', rushDamage: '🔥 Rush', stallBuff: '⏳ Stall',
  shardBonus: '💎 Fragmentos', magicResist: '🛡️ Res. Mágica', magicResistPen: '🔻 Pen. Mágica',
  cooldownReduction: '⏱️ Red. Cooldown', hpRegen: '💚 HP/s', shield: '🛡️ Escudo',
  heal: '💚 Cura', mana: '💧 Mana', startingMana: '⚡ Mana Inicial'
};

export default function StatsPanel() {
  const { state } = useApp();
  const stats = calculateTeamStats(getTeamCharactersData(state.main, state.reserve), state.items, state.teamRelics);
  const dps = calculateDPS(stats);
  const entries = Object.entries(stats).filter(([key]) => key !== 'id' && key !== 'name');

  return (
    <div className="panel" id="statsPanel" aria-label="Estatísticas">
      <div className="panel-title">
        <h2>Estatísticas do Time</h2>
      </div>

      <div className="dps-hero">
        <div>
          <div className="dps-label">DPS estimado</div>
          <div className="dps-value" id="dpsDisplay">{dps}</div>
        </div>
      </div>

      <div id="statsGrid">
        {entries.length === 0 ? (
          <div className="synergy-empty">Equipe heróis, itens e relíquias para ver as estatísticas.</div>
        ) : (
          entries.map(([key, value]) => {
            const label = STAT_ICONS[key] || key;
            const displayValue = typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(1)) : value;
            return (
              <div className="stat-item" key={key}>
                <span className="stat-label">{label}</span>
                <span className="stat-value">{displayValue}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
