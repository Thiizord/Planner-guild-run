r"""
update-hero-stats.py — Valida os stats dos heróis contra a fonte da verdade (o jogo)
e atualiza o src/data/data.js (guia, Apêndice A: "priorizar os dados do jogo").

Entradas (snapshots exportados do jogo via AssetRipper, salvos em scripts/):
  - game-hero-sheet.yaml       (HeroSheetHolder: 25 entradas Hero_N com stats reais)
  - game-hero-class-sheet.yaml (HeroClassSheetHolder: ID -> nome da classe)

Saídas:
  - src/data/data.js atualizado (baseStats + classe correta + class2 p/ híbridos)
  - scripts/stats-validation.json (relatório antes/depois de cada herói)
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
SHEET = os.path.join(ROOT, "scripts", "game-hero-sheet.yaml")
CLASS_SHEET = os.path.join(ROOT, "scripts", "game-hero-class-sheet.yaml")
DATA = os.path.join(ROOT, "src", "data", "data.js")
REPORT = os.path.join(ROOT, "scripts", "stats-validation.json")

FP = 65536  # Photon FP: 16 bits fracionários (RawValue/65536 = valor real)

# ---------- 1) mapa de classes: HeroClass_N -> título ----------
classes = {}
current = None
with open(CLASS_SHEET, encoding="utf-8") as f:
    for line in f:
        m = re.search(r"_sequentialId: (\d+)", line)
        if m:
            current = int(m.group(1))
        m = re.search(r"_title: (\w+)", line)
        if m and current is not None and current not in classes:
            classes[current] = m.group(1)

# ---------- 2) parse da sheet de heróis ----------
heroes = []
entry = None
field = None
with open(SHEET, encoding="utf-8") as f:
    for line in f:
        if "- <Id>k__BackingField:" in line:
            if entry:
                heroes.append(entry)
            entry = {"tags": []}
            field = None
            continue
        if entry is None:
            continue
        m = re.match(r"\s{4}<(\w+)>k__BackingField: ?(.*)", line)
        if m:
            field, value = m.group(1), m.group(2).strip()
            if field == "MaxHealth":
                entry["hp"] = int(value)
            elif field == "BaseAttackDamage":
                entry["attack"] = int(value)
            elif field == "Defense":
                entry["defense"] = int(value)
            elif field == "Magic":
                entry["magic"] = int(value)
            elif field == "Crit":
                entry["crit"] = int(value)
            elif field == "ManaRegen":
                entry["manaRegen"] = int(value)
            elif field == "MaxMana":
                entry["maxMana"] = int(value)
            elif field == "StartingMana":
                entry["startingMana"] = int(value)
            continue
        # campos internos (indentação 6+)
        if field == "BaseAttackSpeed":
            m = re.search(r"RawValue: (\d+)", line)
            if m:
                entry["attackSpeed"] = round(int(m.group(1)) / FP, 2)
                field = None
        m = re.search(r"_key: Lore\.Hero\.Title\.(\w+)", line)
        if m and "name" not in entry:
            entry["name"] = m.group(1)
        m = re.match(r"\s{4}_(class1ID|class2ID|guildID): (-?\d+)", line)
        if m:
            entry[m.group(1)] = int(m.group(2))
if entry:
    heroes.append(entry)

print(f"sheet de heróis: {len(heroes)} entradas")
by_name = {}
for h in heroes:
    h["class"] = classes.get(h.get("class1ID", -1), "?")
    h["class2"] = classes.get(h["class2ID"], None) if h.get("class2ID", -1) > 0 else None
    by_name[h["name"].lower()] = h

# ---------- 3) atualização do data.js ----------
with open(DATA, encoding="utf-8") as f:
    lines = f.read().split("\n")

report = []
updated = 0
out = []
for line in lines:
    m = re.match(r"\s*\{ id: '([a-z]+)', ", line)
    if m and "baseStats:" in line and "export const SYNERGY" not in line:
        hid = m.group(1)
        g = by_name.get(hid)
        if g:
            old_stats = re.search(r"baseStats: \{([^}]*)\}", line)
            old_class = re.search(r"class: '(\w+)'", line)
            old = {
                "class": old_class.group(1) if old_class else None,
                "stats": old_stats.group(1).strip() if old_stats else None,
            }
            new_stats = (
                f"hp: {g['hp']}, attack: {g['attack']}, defense: {g['defense']}, "
                f"magic: {g['magic']}, attackSpeed: {g['attackSpeed']}, crit: {g['crit']}, "
                f"manaRegen: {g['manaRegen']}, maxMana: {g['maxMana']}, startingMana: {g['startingMana']}"
            )
            line = re.sub(r"baseStats: \{[^}]*\}", f"baseStats: {{ {new_stats} }}", line)
            # classe primária (fonte da verdade)
            if old["class"] != g["class"]:
                line = re.sub(r"class: '\w+'", f"class: '{g['class']}'", line)
            # classe híbrida: remove class2 antiga e adiciona a correta (se houver)
            line = re.sub(r", class2: '\w+'", "", line)
            if g["class2"]:
                line = line.replace(f"class: '{g['class']}'", f"class: '{g['class']}', class2: '{g['class2']}'", 1)
            report.append({
                "hero": hid,
                "antes": old,
                "depois": {"class": g["class"], "class2": g["class2"], "stats": new_stats},
                "mudouClasse": old["class"] != g["class"],
            })
            updated += 1
    out.append(line)

with open(DATA, "w", encoding="utf-8", newline="") as f:
    f.write("\n".join(out))

with open(REPORT, "w", encoding="utf-8") as f:
    json.dump(report, f, ensure_ascii=False, indent=1)

print(f"{updated}/25 heróis atualizados no data.js")
print(f"relatório -> {REPORT}")
mudancas = [r for r in report if r["antes"]["stats"] != r["depois"]["stats"]]
print(f"heróis com stats diferentes do jogo: {len(mudancas)}")
for r in report:
    if r["mudouClasse"]:
        print(f"  classe corrigida: {r['hero']}: {r['antes']['class']} -> {r['depois']['class']}")
