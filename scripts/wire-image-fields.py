"""
wire-image-fields.py — Insere os campos image/icon no src/data/data.js a partir
do extraction-report.json (idempotente: linhas já com campo não são tocadas).

  heróis  -> image: '/assets/heroes/{id}.png'   (guia, A.5)
  itens   -> icon:  '/assets/items/{id}.png'
  relíquias -> icon: '/assets/relics/{id}.png'
"""

import sys
import os
import re
import json

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA = os.path.join(ROOT, "src", "data", "data.js")
REPORT = os.path.join(ROOT, "scripts", "extraction-report.json")

with open(REPORT, encoding="utf-8") as f:
    report = json.load(f)

hero_map = {hid: f"/assets/heroes/{hid}.png" for hid in report["heroes"]}
item_map = {iid: f"/assets/items/{iid}.png" for iid in report["items"]}
relic_map = {rid: f"/assets/relics/{rid}.png" for rid in report["relics"]}

with open(DATA, encoding="utf-8") as f:
    lines = f.read().split("\n")

section = None  # 'heroes' | 'items' | 'relics' | None
counts = {"heroes": 0, "items": 0, "relics": 0}
out = []
for line in lines:
    if "export const HEROES_DATA" in line:
        section = "heroes"
    elif "export const SYNERGY_CONFIG" in line:
        section = None
    elif "export const ITEMS_DATA" in line:
        section = "items"
    elif "export const RELICS_DATA" in line:
        section = "relics"

    m = re.match(r"(\s*\{ id: '([A-Za-z0-9_]+)', )", line)
    if m and section and not re.search(r"(image|icon): '/assets/", line):
        ent_id = m.group(2)
        if section == "heroes":
            field, path = "image", hero_map.get(ent_id)
        elif section == "items":
            field, path = "icon", item_map.get(ent_id)
        else:
            field, path = "icon", relic_map.get(ent_id)
        if path:
            line = line.replace(m.group(1), f"{m.group(1)}{field}: '{path}', ", 1)
            counts[section] += 1
    out.append(line)

with open(DATA, "w", encoding="utf-8", newline="") as f:
    f.write("\n".join(out))

print(f"campos inseridos: {counts['heroes']} heróis (image), "
      f"{counts['items']} itens (icon), {counts['relics']} relíquias (icon)")
print(f"esperado pelo relatório: {len(report['heroes'])} / {len(report['items'])} / {len(report['relics'])}")
