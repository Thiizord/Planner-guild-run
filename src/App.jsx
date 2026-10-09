// App.jsx - Componente raiz (layout do index.html vanilla)
// Fluxo de itens/relíquias SEM modais: seletores inline (pedido do usuário).

import { useApp } from './hooks/useApp.js';
import { countTeam } from './utils/helpers.js';
import Header from './components/Header.jsx';
import SynergyPanel from './components/SynergyPanel.jsx';
import StatsPanel from './components/StatsPanel.jsx';
import HeroPool from './components/HeroPool/HeroPool.jsx';
import TeamGrid from './components/Team/TeamGrid.jsx';
import RelicList from './components/Relics/RelicList.jsx';

export default function App() {
  const { state } = useApp();

  return (
    <div>
      {/* PARTICLES BACKGROUND */}
      <div id="particles-bg"></div>

      <div className="app" id="app">
        <Header />

        {/* BANNER OFICIAL DO JOGO (fornecido pelo usuário) */}
        <div className="banner">
          <img src="/assets/banner.webp" alt="GuildRun — Team Builder Pro" draggable="false" />
        </div>

        <SynergyPanel />
        <StatsPanel />
        <HeroPool />

        {/* TIME */}
        <div className="card glass">
          <div className="card-header">
            <h2><span className="neon-text">Time</span> <span className="badge" id="teamCount">{countTeam(state.main, state.reserve)}/6</span></h2>
            <span className="hint">Clique no personagem para selecionar · nos mini-itens, para equipar</span>
          </div>
          <TeamGrid />
        </div>

        <RelicList />
      </div>
    </div>
  );
}
