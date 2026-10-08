// useLocalStorage.js - Hook de persistência genérico (referência do guia, Etapa 5)
// Nota: a persistência do AppContext usa saveState() diretamente para persistir
// apenas o subconjunto do estado (main, reserve, items, teamRelics), igual ao
// state.js vanilla. Este hook fica disponível para usos futuros.

import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch { return initialValue; }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}
