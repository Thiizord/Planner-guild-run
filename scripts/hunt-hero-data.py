"""
hunt-hero-data.py — Procura os objetos de dados dos heróis (MonoBehaviours) no build
IL2CPP do jogo usando typetrees geradas a partir do GameAssembly + global-metadata.
Objetivo: achar a referência da arte CORRETA de cada heróis (mesmo os sem _round).

Saída: hero-data-probe.json com os candidatos encontrados + amostras dos typetrees.
"""

import sys
import os
import json

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', '.pylibs'))

import UnityPy  # noqa: E402
from UnityPy.helpers.TypeTreeGenerator import TypeTreeGenerator  # noqa: E402

GAME_ROOT = r"C:\Program Files (x86)\Steam\steamapps\common\Guildrun Demo"
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.path.join(ROOT, "scripts", "hero-data-probe.json")

CANDIDATE_CLASSES = {
    "HeroData", "HeroEntry", "HeroPoolEntry", "HeroChoice", "HeroChoiceData",
    "CharacterEntry", "HeroClassEntry", "HeroSpecializationEntry", "HeroSheetHolder",
    "CharacterVisualConfig", "HeroId",
}

print("gerando typetrees a partir do IL2CPP (GameAssembly + global-metadata)...")
gen = TypeTreeGenerator("6000.0.64f1")
gen.load_local_game(GAME_ROOT)
print("  IL2CPP carregado")

print("carregando arquivos serializados do jogo...")
env = UnityPy.load(GAME_ROOT)
env.typetree_generator = gen
print(f"  {len(env.files)} arquivos")

# mapa: (arquivo, path_id) -> nome de classe MonoScript
script_class = {}
mono_scripts = 0
for obj in env.objects:
    if obj.type.name != "MonoScript":
        continue
    try:
        d = obj.read()
        cname = getattr(d, "m_ClassName", "") or ""
        fname = obj.assets_file.name
        script_class[(fname, obj.path_id)] = cname
        mono_scripts += 1
    except Exception:
        pass
print(f"  {mono_scripts} MonoScripts indexados")

# MonoBehaviours por classe
from collections import defaultdict  # noqa: E402
by_class = defaultdict(list)
for obj in env.objects:
    if obj.type.name != "MonoBehaviour":
        continue
    try:
        d = obj.read()
        ptr = getattr(d, "m_Script", None)
        if ptr is None:
            continue
        path_id = getattr(ptr, "path_id", None) or getattr(ptr, "m_PathID", None)
        fname = obj.assets_file.name
        cname = script_class.get((fname, path_id))
        if cname:
            by_class[cname].append(obj)
    except Exception:
        continue

print("\nclasses de interesse encontradas:")
interesting = {}
for cname, objs in sorted(by_class.items()):
    if cname in CANDIDATE_CLASSES:
        print(f"  {cname}: {len(objs)} objetos em {sorted(set(str(o.assets_file.name) for o in objs))[:4]}")
        interesting[cname] = objs
    elif "Hero" in cname and len(objs) <= 60:
        print(f"  [extra] {cname}: {len(objs)} objetos")

result = {}
for cname, objs in interesting.items():
    samples = []
    for obj in objs[:3]:
        try:
            tree = obj.read_typetree()
            # reduz PPtrs e listas grandes para o relatório
            def simpl(v, depth=0):
                if isinstance(v, dict):
                    if set(v.keys()) == {"m_FileID", "m_PathID"}:
                        return {"pptr": v["m_PathID"]}
                    return {k: simpl(x, depth + 1) for k, x in v.items() if depth < 6 or k == "m_Name"}
                if isinstance(v, list):
                    return [simpl(x, depth + 1) for x in v[:6]] + ([f"...+{len(v) - 6}"] if len(v) > 6 else [])
                return v
            samples.append({
                "arquivo": str(obj.assets_file.name),
                "nome": tree.get("m_Name", ""),
                "typetree": simpl(tree),
            })
        except Exception as e:
            samples.append({"erro": f"{type(e).__name__}: {e}"})
    result[cname] = {"total": len(objs), "amostras": samples}

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=1, default=str)
print(f"\nrelatório -> {OUT}")
