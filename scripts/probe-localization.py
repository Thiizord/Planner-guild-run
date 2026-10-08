"""
probe-localization.py — Sonda o bundle de localização (EN) do jogo para descobrir
o mapeamento nome → id numérico dos itens/relíquias (chaves tipo Item_723).
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', '.pylibs'))

import UnityPy  # noqa: E402

EN_BUNDLE = (r"C:\Program Files (x86)\Steam\steamapps\common\Guildrun Demo\Guildrun_Data"
            r"\StreamingAssets\aa\StandaloneWindows64\localization-string-tables-english(en)_assets_all.bundle")

env = UnityPy.load(EN_BUNDLE)
print(f"objetos no bundle: {len(env.objects)}")

type_counts = {}
for obj in env.objects:
    t = obj.type.name
    type_counts[t] = type_counts.get(t, 0) + 1
print("tipos:", type_counts)

for obj in env.objects:
    if obj.type.name != "MonoBehaviour":
        continue
    try:
        data = obj.read()
        name = getattr(data, "m_Name", "?")
        print(f"\nMonoBehaviour: {name}")
        # tenta typetree completo
        try:
            tree = obj.read_typetree()
            keys = list(tree.keys())
            print("  chaves do typetree:", keys[:15])
            for k in ("m_Types", "m_Entries", "m_Key", "m_Value", "m_TableData"):
                if k in tree:
                    v = tree[k]
                    print(f"  {k}: {str(v)[:300]}")
        except Exception as e:
            print(f"  typetree falhou: {type(e).__name__}: {e}")
            raw = obj.get_raw_data()
            print(f"  raw: {len(raw)} bytes")
    except Exception as e:
        print(f"\nMonoBehaviour: FALHA ao ler ({type(e).__name__}: {e})")
