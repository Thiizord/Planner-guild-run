// Header.jsx - Logo + botões Limpar e Exportar (export.js vanilla)
// Fluxo sem popups: confirmação de limpeza é INLINE (dois cliques no botão),
// feedback de exportação é o próprio botão ("Copiado!") — nada de confirm()
// nativo (bloqueado em browsers embutidos) nem toasts.

import { useState } from 'react';
import { useApp } from '../hooks/useApp.js';
import { exportBuild } from '../utils/exportBuild.js';

export default function Header() {
  const { state, dispatch } = useApp();
  const [confirmReset, setConfirmReset] = useState(false);
  const [exported, setExported] = useState(false);

  const handleReset = () => {
    if (!confirmReset) {
      // primeiro clique: arma a confirmação inline (desarma sozinho em 4s)
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 4000);
      return;
    }
    dispatch({ type: 'RESET_TEAM' });
    setConfirmReset(false);
  };

  const handleExport = async () => {
    const ok = await exportBuild(state);
    setExported(ok);
    setTimeout(() => setExported(false), 2000);
  };

  return (
    <header className="header glass">
      <div className="logo">
        GuildRun <span className="logo-sub">Team Builder Pro</span>
      </div>
      <div className="header-right">
        <div className="actions">
          <button
            id="btnReset"
            className={`btn-glow ${confirmReset ? 'confirm-reset' : ''}`}
            onClick={handleReset}
            title={confirmReset ? 'Clique de novo para confirmar' : undefined}
          >
            {confirmReset ? 'Confirmar limpeza?' : 'Limpar'}
          </button>
          <button id="btnExport" className="btn-primary btn-glow" onClick={handleExport}>
            {exported ? 'Copiado!' : 'Exportar'}
          </button>
        </div>
      </div>
    </header>
  );
}
