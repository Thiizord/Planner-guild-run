"""
hunt-pptr-refs.py — v2: resolve PPtrs através dos m_Externals de cada arquivo
(fileID -> arquivo alvo). Coleta MonoBehaviours com >=1 referência a arte de herói.

Saída: pptr-hits.json
"""

import sys
import os
import json
import struct

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', '.pylibs'))

import UnityPy  # noqa: E402

GAME_ROOT = r"C:\Program Files (x86)\Steam\steamapps\common\Guildrun Demo\Guildrun_Data"
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.path.join(ROOT, "scripts", "pptr-hits.json")

ART_PATTERNS = ("_round", "Square_Portrait_", "HalfBodyPortrait_", "FullBody_", "_Portrait", "_Cropped_")

# ---------- passo 1: mapa global (arquivo -> {path_id: nome_arte}) ----------
print("indexando arte por arquivo...")
art_global = {}   # nome_arquivo -> {path_id: "Nome [Tipo]"}
all_files = []
for entry in os.listdir(GAME_ROOT):
    full = os.path.join(GAME_ROOT, entry)
    if os.path.isfile(full) and (entry.endswith(".assets") or entry.startswith("level")
                                 or entry.startswith("globalgamemanagers")):
        all_files.append(full)

for path in all_files:
    fname = os.path.basename(path)
    try:
        env = UnityPy.load(path)
    except Exception:
        continue
    arts = {}
    for obj in env.objects:
        if obj.type.name not in ("Texture2D", "Sprite"):
            continue
        try:
            d = obj.read()
            nm = getattr(d, "m_Name", "") or ""
            if nm and any(p in nm for p in ART_PATTERNS) and nm[0].isupper():
                arts[obj.path_id] = f"{nm} [{obj.type.name}]"
        except Exception:
            continue
    if arts:
        art_global[fname] = arts

print(f"  arte indexada em {len(art_global)} arquivos")

# ---------- passo 2: varre MonoBehaviours resolvendo externals ----------
print("varrendo MonoBehaviours...")
report = []
for path in all_files:
    fname = os.path.basename(path)
    try:
        env = UnityPy.load(path)
    except Exception:
        continue

    # externals: fileID -> nome do arquivo alvo
    ext_map = {}
    try:
        sfile = env.file
        exts = getattr(sfile, "externals", None) or getattr(sfile, "m_Externals", [])
        for i, ext in enumerate(exts):
            ext_path = getattr(ext, "path", "") or ""
            ext_name = os.path.basename(ext_path.replace("\\", "/"))
            ext_map[i + 1] = ext_name
    except Exception:
        pass

    script_names = {}
    for obj in env.objects:
        if obj.type.name == "MonoScript":
            try:
                d = obj.read()
                script_names[obj.path_id] = getattr(d, "m_ClassName", "") or ""
            except Exception:
                pass

    for obj in env.objects:
        if obj.type.name != "MonoBehaviour":
            continue
        try:
            raw = obj.get_raw_data()
            d = obj.read()
            mname = getattr(d, "m_Name", "") or ""
            ptr = getattr(d, "m_Script", None)
            cls = ""
            if ptr is not None:
                pid = getattr(ptr, "path_id", None) or getattr(ptr, "m_PathID", None)
                cls = script_names.get(pid, f"?pid={pid}")

            found = []
            for off in range(8, len(raw) - 8, 4):
                file_id = struct.unpack_from("<i", raw, off - 4)[0]
                path_id = struct.unpack_from("<q", raw, off)[0]
                if file_id == 0:
                    target = art_global.get(fname)
                else:
                    target = art_global.get(ext_map.get(file_id, ""))
                if target and path_id in target and target[path_id] not in found:
                    found.append(target[path_id])
            if found:
                report.append({
                    "arquivo": fname,
                    "m_Name": mname,
                    "classe": cls,
                    "referencias": found,
                })
        except Exception:
            continue

report.sort(key=lambda h: -len(h["referencias"]))
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(report, f, ensure_ascii=False, indent=1)

print(f"{len(report)} objetos com referências a arte")
for h in report[:15]:
    print(f"  {h['arquivo']} | classe={h['classe']} | m_Name={h['m_Name']!r} | refs={h['referencias'][:4]}{'...' if len(h['referencias']) > 4 else ''}")
print(f"relatório -> {OUT}")
