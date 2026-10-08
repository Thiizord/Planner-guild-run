// Header.jsx - Logo + botões Limpar e Exportar (export.js vanilla)

import { useApp } from '../hooks/useApp.js';
import { useToast } from '../hooks/useToast.js';
import { exportBuild } from '../utils/exportBuild.js';

export default function Header() {
  const { state, dispatch } = useApp();
  const showToast = useToast();

  const handleReset = () => {
    // resetTeam vanilla: confirm() antes de limpar
    if (!confirm('Tem certeza que deseja limpar todo o time, itens e relíquias?')) return;
    dispatch({ type: 'RESET_TEAM' });
  };

  const handleExport = () => {
    exportBuild(state, showToast);
  };

  return (
    <header className="header glass">
      <div className="logo">
        <span className="logo-glow">⚔️</span> GuildRun <span className="logo-sub">Team Builder Pro</span>
      </div>
      <div className="header-right">
        <div className="actions">
          <button id="btnReset" className="btn-glow" onClick={handleReset}>🔄 Limpar</button>
          <button id="btnExport" className="btn-primary btn-glow" onClick={handleExport}>📋 Exportar</button>
        </div>
      </div>
    </header>
  );
}
