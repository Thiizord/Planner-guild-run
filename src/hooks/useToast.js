// useToast.js - Hook para exibir toasts (equivalente ao showToast() do toast.js vanilla)

import { useCallback } from 'react';
import { useApp } from './useApp.js';

let toastId = 0; // ids únicos fora do reducer (mantém o reducer puro/determinístico)

export function useToast() {
  const { dispatch } = useApp();
  const showToast = useCallback((message, type = 'info') => {
    const id = ++toastId;
    dispatch({ type: 'ADD_TOAST', id, message, toastType: type });
    // toast.js vanilla: some aos 2500ms (o fade de 300ms era invisível —
    // o CSS de .toast não define transition de opacidade)
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', id }), 2500);
  }, [dispatch]);
  return showToast;
}
