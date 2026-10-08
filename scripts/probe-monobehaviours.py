"""
probe-monobehaviours.py — Procura objetos de dados (MonoBehaviour/ScriptableObject)
nomeados como os heróis do planner. Se os typetrees estão embutidos no build,
os objetos revelam a referência à arte certa (e possivelmente os stats).

Saída: monobehaviour-names.json (nome -> arquivos onde aparece) + amostra de um herói.
"""

import sys
import os
import json
from collections import defaultdict

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', '.pylibs'))

import UnityPy  # noqa: E402

GAME_DIR = r"C:\Program Files (x86)\Steam\steamapps\common\Guildrun Demo\Guildrun_Data"
BUNDLE_DIR = os.path.join(GAME_DIR, "StreamingAssets", "aa", "StandaloneWindows64")
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.path.join(ROOT, "scripts", "monobehaviour-names.json")

HEROES = ["Aria", "Dragomir", "Fiona", "Funke", "Grace", "Gustav", "Hoyoung", "Irini",
          "Kai", "Karsu", "Logan", "Ming", "Niklas", "Nyx", "Pimenta", "Pollen",
          "Ratna", "Reyna", "Rip", "Rowan", "Sal", "Skorn", "Tilly", "Yuuna", "Zuri"]


def files():
    out = []
    for entry in os.listdir(GAME_DIR):
        full = os.path.join(GAME_DIR, entry)
        if os.path.isfile(full) and (entry.endswith(".assets") or entry.startswith("level")
                                     or entry.startswith("globalgamemanagers")):
            out.append(full)
    return out


names = defaultdict(set)      # nome -> arquivos
hero_hits = defaultdict(list)  # heroi -> [(arquivo, path_id)]

for path in files():
    fname = os.path.basename(path)
    try:
        env = UnityPy.load(path)
    except Exception:
        continue
    for obj in env.objects:
        if obj.type.name not in ("MonoBehaviour", "MonoScript"):
            continue
        try:
            data = obj.read()
            nm = getattr(data, "m_Name", "") or ""
            if nm:
                names[nm].add(fname)
                if nm in HEROES:
                    hero_hits[nm].append((fname, obj.path_id))
        except Exception:
            continue

print(f"{len(names)} nomes distintos de MonoBehaviour/ScriptableObjects")
with open(OUT, "w", encoding="utf-8") as f:
    json.dump({k: sorted(v) for k, v in sorted(names.items())}, f, ensure_ascii=False, indent=1)
print(f"lista completa -> {OUT}")

print("\n=== objetos nomeados como heróis do planner ===")
for hero in HEROES:
    hits = hero_hits.get(hero)
    if hits:
        print(f"  {hero}: {hits}")
    else:
        print(f"  {hero}: nenhum objeto")
