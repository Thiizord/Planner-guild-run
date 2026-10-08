// App.jsx - Componente raiz (layout do index.html vanilla)

import { useEffect } from 'react';
import { useApp } from './hooks/useApp.js';
import { countTeam } from './utils/helpers.js';
import Header from './components/Header.jsx';
import SynergyPanel from './components/SynergyPanel.jsx';
import StatsPanel from './components/StatsPanel.jsx';
import HeroPool from './components/HeroPool/HeroPool.jsx';
import TeamGrid from './components/Team/TeamGrid.jsx';
import ItemSlots from './components/Items/ItemSlots.jsx';
import RelicList from './components/Relics/RelicList.jsx';
import ItemModal from './components/Items/ItemModal.jsx';
import RelicModal from './components/Relics/RelicModal.jsx';
import ToastContainer from './components/Toast/ToastContainer.jsx';

export default function App() {
  const { state, dispatch } = useApp();

  // Fechar modais com ESC (main.js vanilla)
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        dispatch({ type: 'CLOSE_ITEM_MODAL' });
        dispatch({ type: 'CLOSE_RELIC_MODAL' });
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [dispatch]);

  return (
    <div>
      {/* PARTICLES BACKGROUND */}
      <div id="particles-bg"></div>

      <div className="app" id="app">
        <Header />
        <SynergyPanel />
        <StatsPanel />
        <HeroPool />

        {/* TIME */}
        <div className="card glass">
          <div className="card-header">
            <h2>🏹 <span className="neon-text">Time</span> <span className="badge" id="teamCount">{countTeam(state.main, state.reserve)}/6</span></h2>
            <span className="hint">Clique no slot para gerenciar itens</span>
          </div>
          <TeamGrid />
          <ItemSlots />
        </div>

        <RelicList />
        <ItemModal />
        <RelicModal />
        <ToastContainer />
      </div>
    </div>
  );
}
