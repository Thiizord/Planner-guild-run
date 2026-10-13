#!/usr/bin/env python3
# redesign_battlefield.py — Substitui as secoes CSS do tabuleiro hexagonal
# e remove o codigo morto do design antigo.

import re

CSS = r"C:\Users\Thiago\Desktop\Planner GuildRun\Codando fofo react\guildrun-planner\src\index.css"

with open(CSS, "r", encoding="utf-8") as f:
    content = f.read()

# ===== 1. Localiza e substitui a secao principal do hex grid =====
# Inicio: "/* ============================================================\n   TABULEIRO HEXAGONAL"
# Fim: ".hex-cell:hover .hex-tooltip { opacity: 1; }"

start_marker = "/* ============================================================\n   TABULEIRO HEXAGONAL"
end_marker = ".hex-cell:hover .hex-tooltip { opacity: 1; }"

start_idx = content.find(start_marker)
if start_idx == -1:
    print("ERRO: marcador inicial nao encontrado")
    exit(1)

end_idx = content.find(end_marker)
if end_idx == -1:
    print("ERRO: marcador final nao encontrado")
    exit(1)
end_idx += len(end_marker)

new_hex_css = """/* ============================================================
   TABULEIRO HEXAGONAL 4x7 (28 celulas) — geometria honeycomb real
   Cenário: battlefield-background.png com hexes translúcidos
   ============================================================ */
:root {
  --hex-w: 104px;
  --hex-h: 120px;
  --hex-gap: 3px;
}

@media (max-width: 1180px) {
  :root { --hex-w: 84px; --hex-h: 97px; --hex-gap: 3px; }
}

@media (max-width: 760px) {
  :root { --hex-w: 44px; --hex-h: 51px; --hex-gap: 2px; }
  .hex-battlefield { min-height: 220px; padding: 10px 6px 8px; }
}

/* ---- grid: 4 linhas x 7 colunas, honeycomb ---- */
.hex-grid {
  display: flex;
  flex-direction: column;
  align-items: center;
  /* overlap vertical: 25% da altura = encaixe honeycomb perfeito */
  gap: calc(var(--hex-h) * -0.25);
  position: relative;
  z-index: 2;
}

.hex-grid-row {
  display: flex;
  gap: var(--hex-gap);
}

/* linhas impares deslocadas meio hex (intercalacao) */
.hex-grid-row.offset {
  margin-left: calc(var(--hex-w) / 2 + var(--hex-gap) / 2);
}

/* ---- celula hexagonal ---- */
.hex-cell {
  position: relative;
  width: var(--hex-w);
  height: var(--hex-h);
  cursor: pointer;
  transition: transform 0.18s var(--ease), filter 0.18s var(--ease);
  animation: unitIn 0.2s var(--ease);
}

.hex-cell:focus-visible {
  outline: 2px solid var(--gold);
  outline-offset: 2px;
  z-index: 10;
}

/* moldura hexagonal: padding cria a borda entre o clip externo e interno */
.hex-cell .hex-portrait {
  width: 100%;
  height: 100%;
  clip-path: var(--hex);
  padding: 2px;
  position: relative;
  transition: filter 0.2s var(--ease), box-shadow 0.2s var(--ease);
}

/* imagem do herói dentro do hex */
.hex-cell .hex-portrait img,
.hex-cell .hex-portrait .avatar-initial {
  width: 100%;
  height: 100%;
  clip-path: var(--hex);
  object-fit: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  background: var(--inset);
}

.hex-cell .hex-portrait .avatar-initial {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 700;
  color: var(--gold-bright);
}

/* ---- hex vazio: slot translúcido sobre o terreno ---- */
.hex-cell.empty .hex-portrait {
  background: rgba(30, 42, 30, 0.45);
  padding: 1px;
  backdrop-filter: blur(1px);
}

.hex-cell.empty .empty-portrait {
  background: rgba(10, 16, 10, 0.30);
  display: flex;
  align-items: center;
  justify-content: center;
  clip-path: var(--hex);
  transition: background 0.2s var(--ease);
}

.hex-cell.empty:hover .empty-portrait {
  background: rgba(201, 162, 75, 0.12);
}

.hex-cell.empty:hover .hex-portrait {
  background: rgba(201, 162, 75, 0.35);
}

.hex-cell.empty .hex-plus {
  font-size: 22px;
  font-weight: 300;
  color: rgba(220, 215, 190, 0.35);
  transition: color 0.15s var(--ease), opacity 0.15s var(--ease);
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  clip-path: var(--hex);
}

.hex-cell.empty:hover .hex-plus {
  color: rgba(233, 205, 126, 0.75);
}

.hex-cell.empty.valid-target .hex-portrait {
  background: rgba(201, 162, 75, 0.40);
  animation: hexTargetPulse 1.4s ease-in-out infinite;
}

.hex-cell.empty.valid-target .hex-plus {
  color: rgba(233, 205, 126, 0.85);
}

/* label abaixo do hex vazio */
.hex-cell .hex-label {
  position: absolute;
  bottom: -14px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 8px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(200, 210, 190, 0.30);
  pointer-events: none;
  white-space: nowrap;
}

/* ---- hex ocupado: retrato + overlay ---- */
.hex-cell.filled .hex-portrait {
  background: linear-gradient(165deg, rgba(201,162,75,0.85), rgba(120,95,40,0.9) 55%, rgba(70,55,25,0.95));
  filter: drop-shadow(0 3px 6px rgba(0,0,0,0.45));
}

/* overlay: nome + classe + mini-itens na base do hex */
.hex-cell .hex-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px 6px 4px;
  background: linear-gradient(transparent, rgba(8, 12, 9, 0.88) 55%);
  pointer-events: none;
  z-index: 2;
}

.hex-cell .hex-overlay-name {
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
  text-shadow: 0 1px 2px rgba(0,0,0,0.6);
}

.hex-cell .hex-overlay-class {
  display: flex;
  justify-content: center;
  gap: 3px;
  margin: 1px 0;
  color: var(--text-faint);
}

.hex-cell .hex-overlay .mini-items {
  justify-content: center;
  gap: 2px;
  margin-top: 2px;
  width: 100%;
  flex-wrap: nowrap;
  overflow: hidden;
}

.hex-cell .hex-overlay .mini-item {
  width: 16px;
  height: 16px;
  min-width: 16px;
  max-width: 16px;
  border-radius: 2px;
  font-size: 0;
  border-width: 1px;
}

.hex-cell .hex-overlay .mini-item .mini-item-icon { width: 12px; height: 12px; }
.hex-cell .hex-overlay .mini-item .mini-item-fallback { display: none; }

/* contagem de itens */
.hex-cell .hex-item-count {
  position: absolute;
  top: 5px;
  right: 9px;
  font-size: 10px;
  font-weight: 700;
  color: var(--text-dim);
  background: rgba(8, 12, 9, 0.75);
  border: 1px solid rgba(60, 70, 55, 0.5);
  border-radius: 7px;
  padding: 1px 4px;
  z-index: 3;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

.hex-cell .hex-item-count.has {
  color: var(--gold-bright);
  border-color: rgba(201, 162, 75, 0.5);
}

/* ---- estados de interacao ---- */
.hex-cell.filled:hover {
  transform: scale(1.06);
  z-index: 5;
}

.hex-cell.filled:hover .hex-portrait {
  filter: brightness(1.12) drop-shadow(0 4px 10px rgba(0,0,0,0.5));
}

/* selecionado: contorno dourado */
.hex-cell.selected .hex-portrait {
  box-shadow: 0 0 0 2px rgba(233, 205, 126, 0.65), 0 0 16px rgba(201, 162, 75, 0.30);
  filter: brightness(1.08);
}

/* pego para mover: elevado com pulso */
.hex-cell.picked {
  transform: translateY(-4px) scale(1.06);
  z-index: 6;
}

.hex-cell.picked .hex-portrait {
  box-shadow: 0 0 0 3px rgba(233, 205, 126, 0.75), 0 6px 18px rgba(201, 162, 75, 0.35);
  animation: hexPulse 1.3s ease-in-out infinite;
}

/* destino de drag: realce verde */
.hex-cell.drag-over .hex-portrait {
  box-shadow: 0 0 0 2px rgba(126, 217, 138, 0.55), 0 0 14px rgba(126, 217, 138, 0.25);
}

/* destino valido (troca): realce dourado */
.hex-cell.filled.valid-target .hex-portrait {
  box-shadow: 0 0 0 2px rgba(201, 162, 75, 0.45);
}

/* tooltip */
.hex-cell .hex-tooltip {
  position: absolute;
  bottom: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(8, 12, 9, 0.95);
  padding: 5px 9px;
  border: 1px solid var(--line);
  border-radius: var(--radius-s);
  font-size: 10px;
  color: var(--text);
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s var(--ease);
  z-index: 50;
  box-shadow: var(--shadow);
  backdrop-filter: blur(6px);
}

.hex-cell:hover .hex-tooltip { opacity: 1; }

@keyframes hexTargetPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(233, 205, 126, 0); }
  50% { box-shadow: 0 0 0 4px rgba(233, 205, 126, 0.18); }
}"""

content = content[:start_idx] + new_hex_css + content[end_idx:]

# ===== 2. Remove o codigo morto do design antigo (hex-frame) =====
# Localiza: ".hex-cell {\n  position: relative; width: var(--hex-w); display: flex;"
# Fim: ".hex-cell:hover .item-tooltip { opacity: 1; }"

dead_start = ".hex-cell {\n  position: relative; width: var(--hex-w); display: flex;"
dead_end = ".hex-cell:hover .item-tooltip { opacity: 1; }"

dead_start_idx = content.find(dead_start)
if dead_start_idx != -1:
    dead_end_idx = content.find(dead_end)
    if dead_end_idx != -1:
        dead_end_idx += len(dead_end)
        content = content[:dead_start_idx] + content[dead_end_idx:]
        print("Codigo morto removido")
    else:
        print("AVISO: fim do codigo morto nao encontrado")
else:
    print("AVISO: inicio do codigo morto nao encontrado (ja removido?)")

with open(CSS, "w", encoding="utf-8") as f:
    f.write(content)

print("OK - CSS do tabuleiro redesenhado")
