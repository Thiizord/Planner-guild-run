r"""
wire-user-hero-images.py — Converte as imagens fornecidas pelo usuário
(C:/Users/Thiago/Pictures/*.webp) para PNG em public/assets/heroes/ e insere o
campo `image` no data.js (idempotente).
"""

import sys
import os
import re

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', '.pylibs'))

from PIL import Image  # noqa: E402

PIC_DIR = r"C:\Users\Thiago\Pictures"
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
HEROES_DIR = os.path.join(ROOT, "public", "assets", "heroes")
DATA = os.path.join(ROOT, "src", "data", "data.js")

# arquivo do usuário -> id do herói no planner (case-insensitive)
HEROES = ["aria", "karsu", "pollen", "rip", "rowan", "yuuna", "zuri"]

# ---------- 1) conversão webp -> png (máx. 256px) ----------
available = {f.lower(): f for f in os.listdir(PIC_DIR)
             if f.lower().endswith((".webp", ".png", ".jpg", ".jpeg"))}

converted = []
for hero in HEROES:
    match = available.get(f"{hero}.webp") or available.get(f"{hero}.png") \
        or available.get(f"{hero}.jpg") or available.get(f"{hero}.jpeg")
    if not match:
        print(f"  ✘ {hero}: nenhum arquivo em {PIC_DIR}")
        continue
    img = Image.open(os.path.join(PIC_DIR, match)).convert("RGBA")
    if max(img.size) > 256:
        img = img.resize((256, 256), Image.LANCZOS)
    out = os.path.join(HEROES_DIR, f"{hero}.png")
    img.save(out, "PNG")
    converted.append(hero)
    print(f"  ✔ {hero} <- {match} ({img.size[0]}x{img.size[1]})")

# ---------- 2) campo image no data.js ----------
with open(DATA, encoding="utf-8") as f:
    lines = f.read().split("\n")

count = 0
out = []
for line in lines:
    m = re.match(r"(\s*\{ id: '([A-Za-z0-9_]+)', )", line)
    if m and m.group(2) in converted and "image: '/assets/heroes/" not in line:
        path = f"/assets/heroes/{m.group(2)}.png"
        line = line.replace(m.group(1), f"{m.group(1)}image: '{path}', ", 1)
        count += 1
    out.append(line)

with open(DATA, "w", encoding="utf-8", newline="") as f:
    f.write("\n".join(out))

print(f"\n{count} campos image inseridos no data.js")
