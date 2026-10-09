// Header.jsx - Topbar: identidade, nome da composição (persistido à parte),
// contagem de unidades, indicador de salvamento e ações Exportar/Limpar.
// Sem popups: confirmação inline + feedback inline.

import { useEffect, useState } from 'react';
import { useApp } from '../hooks/useApp.js';
import { countTeam } from '../utils/helpers.js';
import { exportBuild } from '../utils/exportBuild.js';

const BUILD_NAME_KEY = 'guildrun_build_name';

export default function Header() {
  const { state, dispatch } = useApp();
  const [buildName, setBuildName] = useState(() => {
    try { return localStorage.getItem(BUILD_NAME_KEY) || ''; } catch { return ''; }
  });
  const [confirmReset, setConfirmReset] = useState(false);
  const [exported, setExported] = useState(false);
  const [saved, setSaved] = useState(false);

  // indicador discreto de estado salvo: pisca quando a persistência roda
  useEffect(() => {
    setSaved(true);
    const t = setTimeout(() => setSaved(false), 1400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.main, state.reserve, state.items, state.teamRelics]);

  const handleNameChange = (e) => {
    setBuildName(e.target.value);
    try { localStorage.setItem(BUILD_NAME_KEY, e.target.value); } catch { /* noop */ }
  };

  const handleReset = () => {
    if (!confirmReset) {
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
    <header className="topbar">
      <div className="brand">
        <span className="brand-name">GUILDRUN</span>
        <span className="brand-sub">Team Builder Pro</span>
      </div>

      <div className="build-meta">
        <input
          className="build-name"
          type="text"
          value={buildName}
          onChange={handleNameChange}
          placeholder="Composição sem nome"
          aria-label="Nome da composição"
          maxLength={40}
        />
        <span className="unit-count">{countTeam(state.main, state.reserve)}/6 unidades</span>
        <span className={`save-state ${saved ? 'saved' : ''}`} role="status" aria-live="polite">
          <span className="save-dot" aria-hidden="true"></span>
          {saved ? 'Salvo' : 'Salvo automaticamente'}
        </span>
      </div>

      <div className="topbar-actions">
        <button
          id="btnReset"
          className={`btn btn-danger ${confirmReset ? 'confirm-reset' : ''}`}
          onClick={handleReset}
          title={confirmReset ? 'Clique de novo para confirmar' : undefined}
        >
          {confirmReset ? 'Confirmar limpeza?' : 'Limpar'}
        </button>
        <button id="btnExport" className="btn btn-primary" onClick={handleExport}>
          {exported ? 'Copiado!' : 'Exportar'}
        </button>
      </div>
    </header>
  );
}
