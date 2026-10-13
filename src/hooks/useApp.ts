// useApp.ts - Hook de acesso ao contexto global

import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import type { AppContextValue } from '../types';

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve ser usado dentro de <AppProvider>');
  return ctx;
}
