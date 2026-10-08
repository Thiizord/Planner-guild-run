// AppContext.jsx - Context + Provider (guia, Etapa 4)
// Estado global via useReducer; persistência automática no localStorage (Etapa 5).

import { createContext, useReducer, useEffect, useMemo } from 'react';
import { reducer } from './reducer.js';
import { createInitialState, saveState } from './initialState.js';

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);

  // Persistência automática (equivalente ao saveState() do state.js vanilla):
  // salva o mesmo subconjunto (main, reserve, items, teamRelics) a cada mudança.
  useEffect(() => {
    saveState(state);
  }, [state.main, state.reserve, state.items, state.teamRelics]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
