// useHeroDrag.js - Sistema de drag customizado baseado em Pointer Events.
// Substitui o HTML5 Drag & Drop nativo, que suprime eventos de wheel
// durante a operação de drag. Com Pointer Events, o scroll do mouse
// funciona normalmente enquanto o usuário arrasta um herói.
//
// Fluxo:
// 1. pointerdown num elemento arrastável → startHeroDrag(data, e, dispatch)
// 2. pointermove → se distancia > 5px, inicia drag real (mostra ghost)
// 3. wheel → funciona normalmente (não há drag nativo bloqueando)
// 4. pointerup → detecta alvo via elementFromPoint, despacha action
// 5. click suprimido se houve drag (evita placement fantasma)

let dragData = null;        // { charId, source, teamType?, index? }
let dragDispatch = null;
let dragStarted = false;
let startX = 0;
let startY = 0;
let ghostEl = null;

export function isDragging() {
  return dragStarted;
}

export function startHeroDrag(data, e, dispatch) {
  if (e.button !== 0) return; // só botão esquerdo
  dragData = data;
  dragDispatch = dispatch;
  dragStarted = false;
  startX = e.clientX;
  startY = e.clientY;

  document.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('pointerup', onPointerUp);
  document.addEventListener('pointercancel', onPointerCancel);
}

function onPointerMove(e) {
  if (!dragData) return;
  const dist = Math.hypot(e.clientX - startX, e.clientY - startY);
  if (!dragStarted && dist > 5) {
    dragStarted = true;
    document.body.classList.add('hero-dragging');
    createGhost(e);
  }
  if (dragStarted) {
    updateGhost(e);
  }
}

function onPointerUp(e) {
  cleanupListeners();
  if (dragStarted && dragData && dragDispatch) {
    handleDrop(e, dragDispatch);
  }
  removeGhost();
  document.body.classList.remove('hero-dragging');
  // limpa flags após o click handler checar (setTimeout 0 deixa o click rodar primeiro)
  setTimeout(() => {
    dragStarted = false;
    dragData = null;
    dragDispatch = null;
  }, 50);
}

function onPointerCancel() {
  cleanupListeners();
  removeGhost();
  document.body.classList.remove('hero-dragging');
  dragStarted = false;
  dragData = null;
  dragDispatch = null;
}

function cleanupListeners() {
  document.removeEventListener('pointermove', onPointerMove);
  document.removeEventListener('pointerup', onPointerUp);
  document.removeEventListener('pointercancel', onPointerCancel);
}

// ---- ghost (retrato que segue o cursor) ----
function createGhost(e) {
  removeGhost();
  ghostEl = document.createElement('div');
  ghostEl.className = 'hero-drag-ghost';

  const char = window.__HERO_LOOKUP__?.(dragData.charId);
  if (char?.image) {
    ghostEl.innerHTML = `<img src="${char.image}" alt="${char.name}" draggable="false" />`;
  } else if (char) {
    ghostEl.textContent = char.name.charAt(0);
  } else {
    ghostEl.textContent = '?';
  }

  document.body.appendChild(ghostEl);
  updateGhost(e);
}

function updateGhost(e) {
  if (!ghostEl) return;
  ghostEl.style.left = `${e.clientX - 28}px`;
  ghostEl.style.top = `${e.clientY - 28}px`;
}

function removeGhost() {
  if (ghostEl) {
    ghostEl.remove();
    ghostEl = null;
  }
}

// ---- drop detection ----
function handleDrop(e, dispatch) {
  const el = document.elementFromPoint(e.clientX, e.clientY);
  if (!el || !dragData) return;

  // hex do tabuleiro
  const hexEl = el.closest('[data-hex]');
  if (hexEl) {
    const hexIndex = parseInt(hexEl.dataset.index, 10);
    if (isNaN(hexIndex)) return;
    if (dragData.source === 'pool') {
      dispatch({ type: 'DROP_CHAR', charId: dragData.charId, teamType: 'main', slotIndex: hexIndex });
    } else {
      dispatch({
        type: 'SWAP_SLOTS',
        charId: dragData.charId,
        fromType: dragData.teamType,
        fromIndex: dragData.index,
        toType: 'main',
        toIndex: hexIndex,
      });
    }
    return;
  }

  // slot da reserva
  const reserveEl = el.closest('[data-reserve]');
  if (reserveEl) {
    const resIndex = parseInt(reserveEl.dataset.reserve, 10);
    if (isNaN(resIndex)) return;
    if (dragData.source === 'pool') {
      dispatch({ type: 'DROP_CHAR', charId: dragData.charId, teamType: 'reserve', slotIndex: resIndex });
    } else {
      dispatch({
        type: 'SWAP_SLOTS',
        charId: dragData.charId,
        fromType: dragData.teamType,
        fromIndex: dragData.index,
        toType: 'reserve',
        toIndex: resIndex,
      });
    }
  }
}
