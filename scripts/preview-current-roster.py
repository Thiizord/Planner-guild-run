"""
preview-current-roster.py — Extrai os ícones _round do roster visual ATUAL do jogo
(25 heróis, incluindo os 9 que não estão no planner) e monta uma folha de contato
com nomes, para o usuário confirmar visualmente eventuais heróis renomeados.

Saída: scripts/preview-new-heroes/
  - {Nome}.png (ícones individuais dos 9 heróis que não estão no planner)
  - roster-atual.png (folha de contato com os 25 do roster visual atual)
"""

import sys
import os

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', '.pylibs'))

import UnityPy  # noqa: E402
from PIL import Image, ImageDraw, ImageFont  # noqa: E402

GAME = (r"C:\Program Files (x86)\Steam\steamapps\common\Guildrun Demo\Guildrun_Data"
        r"\sharedassets1.assets")
OUT_DIR = os.path.join(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")),
                       "scripts", "preview-new-heroes")
os.makedirs(OUT_DIR, exist_ok=True)

# Roster visual atual (ícones _round existentes no jogo)
ROSTER_ATUAL = ["Ayaka", "Cenk", "Dragomir", "Fiona", "Floeria", "Funke", "Gustav",
                "Hoyoung", "Irini", "Javryn", "Joey", "Josephina", "Logan", "Ming",
                "Niklas", "Nyxa", "Pimenta", "Ratna", "Reyna", "Rook", "Sal",
                "Selkhera", "Seraphael", "Skorn", "Tilly"]

# Os que não estão no planner (candidatos a renomeações)
NOVOS = ["Ayaka", "Cenk", "Floeria", "Javryn", "Joey", "Josephina", "Rook",
         "Selkhera", "Seraphael"]

print("carregando sharedassets1.assets...")
env = UnityPy.load(GAME)
by_name = {}
for obj in env.objects:
    if obj.type.name not in ("Texture2D", "Sprite"):
        continue
    try:
        d = obj.read()
        nm = getattr(d, "m_Name", "") or ""
        if nm:
            by_name.setdefault(nm, {})[obj.type.name] = obj
    except Exception:
        pass

icons = {}
for name in ROSTER_ATUAL:
    entry = by_name.get(f"{name}_round")
    obj = entry and (entry.get("Sprite") or entry.get("Texture2D"))
    if not obj:
        print(f"  ✘ {name}: sem _round")
        continue
    icons[name] = obj.read().image.convert("RGBA")
    print(f"  ✔ {name}")

# ícones individuais dos 9 novos
for name in NOVOS:
    if name in icons:
        icons[name].save(os.path.join(OUT_DIR, f"{name}.png"), "PNG")
print(f"{len([n for n in NOVOS if n in icons])} ícones individuais salvos")

# ---- folha de contato 5x5 com nomes ----
CELL, LABEL, COLS = 256, 34, 5
rows = (len(ROSTER_ATUAL) + COLS - 1) // COLS
sheet = Image.new("RGBA", (COLS * CELL, rows * (CELL + LABEL)), (16, 20, 30, 255))
draw = ImageDraw.Draw(sheet)
try:
    font = ImageFont.load_default(size=18)
except Exception:
    font = ImageFont.load_default()

for i, name in enumerate(ROSTER_ATUAL):
    x = (i % COLS) * CELL
    y = (i // COLS) * (CELL + LABEL)
    if name in icons:
        sheet.paste(icons[name], (x, y), icons[name])
    is_new = name in NOVOS
    label = ("🆕 " if is_new else "") + name
    # texto: verde para os já extraídos no planner, âmbar para os 9 novos
    color = (247, 201, 72, 255) if is_new else (106, 214, 134, 255)
    bbox = draw.textbbox((0, 0), label, font=font)
    tw = bbox[2] - bbox[0]
    draw.text((x + (CELL - tw) // 2, y + CELL + 6), label, fill=color, font=font)

sheet_path = os.path.join(OUT_DIR, "roster-atual.png")
sheet.convert("RGB").save(sheet_path, "PNG")
print(f"folha de contato -> {sheet_path}")
