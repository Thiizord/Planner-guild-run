// AppContext.tsx - Context + Provider
// Estado global via useReducer; persistência automática no localStorage.

import { createContext, useReducer, useEffect, useMemo, type ReactNode } from 'react';
import { reducer } from './reducer';
import { createInitialState, saveState } from './initialState';
import type { AppState, AppAction } from '../types';

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);

  // Persistência automática: salva o subconjunto persistido a cada mudança
  useEffect(() => {
    saveState(state);
  }, [state.main, state.reserve, state.items, state.teamRelics, state.heroConfigs]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
