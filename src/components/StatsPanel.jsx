// StatsPanel.jsx - Estatísticas totais e DPS (render.js → renderStats)

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
    <div className="card glass" id="statsPanel">
      <div className="card-header">
        <h2>📊 <span className="neon-text">Estatísticas do Time</span></h2>
        <span className="hint" id="dpsDisplay">DPS: {dps}</span>
      </div>
      <div className="stats-grid" id="statsGrid">
        {entries.length === 0 ? (
          <div className="synergy-empty">📊 Equipe heróis, itens e relíquias para ver as estatísticas.</div>
        ) : (
          entries.map(([key, value]) => {
            const label = STAT_ICONS[key] || key;
            const displayValue = typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(1)) : value;
            return (
              <div className="stat-item" key={key}>
                <div className="stat-value">{displayValue}</div>
                <div className="stat-label">{label}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
