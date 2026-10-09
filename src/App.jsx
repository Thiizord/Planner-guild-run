// App.jsx - Layout raiz: topbar + banner + 3 zonas (análise | arena | biblioteca).
// Fluxo sem popups preservado; arquitetura e reducer intactos.

import { useApp } from './hooks/useApp.js';
import { countTeam } from './utils/helpers.js';
import Header from './components/Header.jsx';
import HeroPool from './components/HeroPool/HeroPool.jsx';
import TeamGrid from './components/Team/TeamGrid.jsx';
import SynergyPanel from './components/SynergyPanel.jsx';
import StatsPanel from './components/StatsPanel.jsx';
import RelicList from './components/Relics/RelicList.jsx';

export default function App() {
  const { state } = useApp();

  return (
    <div>
      {/* fundo ambiental (vinheta + bruma) */}
      <div id="particles-bg"></div>

      <div className="app" id="app">
        <Header />

        {/* banner oficial do jogo (fornecido pelo autor) */}
        <div className="banner">
          <img src="/assets/banner.webp" alt="GuildRun — banner oficial do jogo" draggable="false" />
        </div>

        <main className="layout">
          <section className="col-analysis" aria-label="Análise da composição">
            <SynergyPanel />
            <StatsPanel />
            <RelicList />
          </section>

          <section className="col-arena" aria-label="Composição do time">
            <TeamGrid count={countTeam(state.main, state.reserve)} />
          </section>

          <section className="col-library" aria-label="Biblioteca de heróis">
            <HeroPool />
          </section>
        </main>
      </div>
    </div>
  );
}
