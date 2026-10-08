"""
extract-game-images.py — Extrai imagens do Guildrun Demo (Unity) para o planner.
Guia de Migração, Apêndice A.5/A.7. READ-ONLY na pasta do jogo.

Fases:
  --inventory  : varre o jogo e grava texture-inventory.json (nomes/tamanhos/tipos)
  --extract    : extrai heróis/itens/relíquias para public/assets/ + extraction-report.json

Pipeline da extração:
  1. SharedTableData (bundle compartilhado): m_Id -> chave (ex.: 'Items.Item_101.Name')
  2. StringTable EN:               m_Id -> texto   (ex.: 'Hammer')
  3. Junção: nome inglês -> id numérico do sprite (ex.: 'Hammer' -> 'Item_101')
  4. Sprites do sharedassets1.assets -> PNG em public/assets/{heroes,items,relics}
"""

import sys
import os
import json
import re
import argparse

# Console do Windows usa cp1252 por padrão — sem isto, print('✔') crasha o loop
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

# UnityPy instalado dentro do workspace (não afeta o Python global)
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', '.pylibs'))

import UnityPy  # noqa: E402
from PIL import Image  # noqa: E402

GAME_DIR = r"C:\Program Files (x86)\Steam\steamapps\common\Guildrun Demo\Guildrun_Data"
BUNDLE_DIR = os.path.join(GAME_DIR, "StreamingAssets", "aa", "StandaloneWindows64")
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
INVENTORY_PATH = os.path.join(PROJECT_ROOT, "scripts", "texture-inventory.json")
REPORT_PATH = os.path.join(PROJECT_ROOT, "scripts", "extraction-report.json")
DATA_JS = os.path.join(PROJECT_ROOT, "src", "data", "data.js")
ASSETS_DIR = os.path.join(PROJECT_ROOT, "public", "assets")

SHARED_BUNDLE = os.path.join(BUNDLE_DIR, "localization-assets-shared_assets_all.bundle")
EN_BUNDLE = os.path.join(BUNDLE_DIR, "localization-string-tables-english(en)_assets_all.bundle")
SHAREDASSETS1 = os.path.join(GAME_DIR, "sharedassets1.assets")

# Heróis do planner cujo nome no jogo é diferente
HERO_NAME_OVERRIDES = {"nyx": "Nyxa"}

# Heróis sem ícone _round no jogo mas com retrato HalfBodyPortrait (2048x2048)
HERO_PORTRAIT_FALLBACK = {"grace", "kai"}


def game_files():
    """Arquivos serializados do jogo que podem conter texturas."""
    files = []
    for entry in os.listdir(GAME_DIR):
        full = os.path.join(GAME_DIR, entry)
        if not os.path.isfile(full):
            continue
        if entry.endswith(".assets") or entry.startswith("level") or entry.startswith("globalgamemanagers") or entry == "resources.resource":
            files.append(full)
    for entry in os.listdir(BUNDLE_DIR):
        if entry.endswith(".bundle"):
            files.append(os.path.join(BUNDLE_DIR, entry))
    return files


def inventory():
    """Fase 1: enumera Texture2D e Sprite de todos os arquivos do jogo."""
    items = []
    files = game_files()
    print(f"varrendo {len(files)} arquivos do jogo...")
    for i, path in enumerate(files, 1):
        name = os.path.basename(path)
        try:
            env = UnityPy.load(path)
        except Exception as e:
            print(f"  [{i}/{len(files)}] {name}: FALHA ao carregar ({e})")
            continue
        count = 0
        for obj in env.objects:
            kind = obj.type.name
            if kind not in ("Texture2D", "Sprite"):
                continue
            try:
                data = obj.read()
                if kind == "Texture2D":
                    w = getattr(data, "m_Width", 0)
                    h = getattr(data, "m_Height", 0)
                else:
                    rect = getattr(data, "m_Rect", None)
                    w, h = (int(rect.width), int(rect.height)) if rect is not None else (0, 0)
                items.append({
                    "name": getattr(data, "m_Name", "") or "",
                    "kind": kind,
                    "width": int(w),
                    "height": int(h),
                    "file": name,
                })
                count += 1
            except Exception:
                pass
        print(f"  [{i}/{len(files)}] {name}: {count} texturas/sprites")
    with open(INVENTORY_PATH, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=1)
    print(f"\n{len(items)} texturas/sprites inventariados -> {INVENTORY_PATH}")
    return items


def load_planner_entities():
    """Lê HEROES_DATA / ITEMS_DATA / RELICS_DATA do src/data/data.js (um objeto por linha)."""
    with open(DATA_JS, "r", encoding="utf-8") as f:
        text = f.read()
    # nome pode conter apóstrofo escapado (ex.: 'Assassin\'s Blade')
    name_group = r"'((?:\\.|[^'])+)'"
    heroes = re.findall(r"\{ id: '([a-z]+)', name: " + name_group, text[:text.index("SYNERGY_CONFIG")])
    items = re.findall(r"\{ id: '(item_\d+)', name: " + name_group, text)
    relics = re.findall(r"\{ id: '(rel_\d+)', name: " + name_group, text)
    # unescapa \' -> ' nos nomes capturados (data.js só escapa apóstrofos)
    fix = lambda lst: [(i, n.replace("\\'", "'")) for i, n in lst]
    return fix(heroes), fix(items), fix(relics)


def build_localization_maps():
    """Junta SharedTableData (id->chave) com StringTable EN (id->texto)."""
    print("lendo tabelas de localização (shared + english)...")
    # 1. id -> chave, por coleção
    key_by_id = {}
    env = UnityPy.load(SHARED_BUNDLE)
    for obj in env.objects:
        if obj.type.name != "MonoBehaviour":
            continue
        tree = obj.read_typetree()
        table = tree.get("m_TableCollectionName")
        if table not in ("Items", "Relics", "Heroes"):
            continue
        for entry in tree.get("m_Entries", []):
            key_by_id[(table, entry["m_Id"])] = entry["m_Key"]

    # 2. (tabela, id) -> texto inglês
    en_by_id = {}
    env = UnityPy.load(EN_BUNDLE)
    for obj in env.objects:
        if obj.type.name != "MonoBehaviour":
            continue
        tree = obj.read_typetree()
        table = (tree.get("m_Name") or "").replace("_en", "")
        if table not in ("Items", "Relics", "Heroes"):
            continue
        for entry in tree.get("m_TableData", []):
            en_by_id[(table, entry["m_Id"])] = entry["m_Localized"]

    # 3. nome inglês -> id numérico do sprite (ex.: 'Hammer' -> 101 em 'Items.Item_101.Name')
    maps = {"Items": {}, "Relics": {}, "Heroes": {}}
    game_roster = set()
    for (table, mid), key in key_by_id.items():
        text_value = en_by_id.get((table, mid))
        if not text_value:
            continue
        if table == "Heroes":
            game_roster.add(text_value)
            continue  # heróis: o sprite usa o próprio nome (ex.: Dragomir_round)
        m = re.match(rf"{table}\.{table[:-1]}_(\d+)\.Name$", key)
        if m:
            maps[table][text_value] = m.group(1)
    print(f"  mapa Items: {len(maps['Items'])} nomes | Relics: {len(maps['Relics'])} | roster do jogo: {len(game_roster)} heróis")
    return maps, game_roster


def save_image(img, path, max_size):
    """Redimensiona (se necessário) e grava PNG."""
    if img.mode not in ("RGBA", "RGB"):
        img = img.convert("RGBA")
    if max(img.size) > max_size:
        img = img.resize((max_size, max_size), Image.LANCZOS)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path, "PNG")


def extract():
    """Fase 2: extrai as imagens para public/assets/."""
    heroes, items, relics = load_planner_entities()
    print(f"planner: {len(heroes)} heróis, {len(items)} itens, {len(relics)} relíquias")
    maps, game_roster = build_localization_maps()

    print("carregando sharedassets1.assets (artes)...")
    env = UnityPy.load(SHAREDASSETS1)

    # índice nome -> (Sprite obj, Texture2D obj)
    by_name = {}
    for obj in env.objects:
        if obj.type.name not in ("Texture2D", "Sprite"):
            continue
        try:
            data = obj.read()
            name = getattr(data, "m_Name", "") or ""
            if name:
                by_name.setdefault(name, {})[obj.type.name] = obj
        except Exception:
            pass
    print(f"  {len(by_name)} nomes de texturas/sprites indexados")

    report = {"heroes": {}, "items": {}, "relics": {}, "skipped": {}}

    def get_object(name):
        """Prefere Sprite (recorte de atlas); cai para Texture2D."""
        entry = by_name.get(name)
        if not entry:
            return None
        return entry.get("Sprite") or entry.get("Texture2D")

    # ---------- Heróis ----------
    print("\nextraindo heróis...")
    for hero_id, hero_name in heroes:
        game_name = HERO_NAME_OVERRIDES.get(hero_id, hero_name)
        sprite_name = f"{game_name}_round"
        obj = get_object(sprite_name)
        source = sprite_name
        if not obj and hero_id in HERO_PORTRAIT_FALLBACK:
            # sem ícone redondo: usa retrato 2048x2048 (variante A, depois B/C/S)
            for variant in ("A", "B", "C", "S"):
                alt = f"HalfBodyPortrait_{game_name}_{variant}"
                obj = get_object(alt)
                if obj:
                    source = alt
                    break
        if not obj:
            report["skipped"][f"heroes:{hero_id}"] = f"sem arte no jogo ({game_name})"
            continue
        try:
            img = obj.read().image
            out = os.path.join(ASSETS_DIR, "heroes", f"{hero_id}.png")
            save_image(img, out, 256)
            report["heroes"][hero_id] = source
            print(f"  ✔ {hero_id} <- {source}")
        except Exception as e:
            report["skipped"][f"heroes:{hero_id}"] = f"erro ao decodificar {source}: {e}"

    # ---------- Itens ----------
    print("\nextraindo itens...")
    matched = 0
    for item_id, item_name in items:
        sprite_num = maps["Items"].get(item_name)
        if not sprite_num:
            report["skipped"][f"items:{item_id}"] = f"'{item_name}' fora da tabela do jogo"
            continue
        obj = get_object(f"Item_{sprite_num}")
        if not obj:
            report["skipped"][f"items:{item_id}"] = f"sprite Item_{sprite_num} não existe"
            continue
        try:
            img = obj.read().image
            out = os.path.join(ASSETS_DIR, "items", f"{item_id}.png")
            save_image(img, out, 128)
            report["items"][item_id] = f"Item_{sprite_num}"
            matched += 1
        except Exception as e:
            report["skipped"][f"items:{item_id}"] = f"erro ao decodificar Item_{sprite_num}: {e}"
    print(f"  {matched}/{len(items)} itens com ícone")

    # ---------- Relíquias ----------
    print("\nextraindo relíquias...")
    matched = 0
    for rel_id, rel_name in relics:
        sprite_num = maps["Relics"].get(rel_name)
        if not sprite_num:
            report["skipped"][f"relics:{rel_id}"] = f"'{rel_name}' fora da tabela do jogo"
            continue
        obj = get_object(f"Relic_{sprite_num}")
        if not obj:
            report["skipped"][f"relics:{rel_id}"] = f"sprite Relic_{sprite_num} não existe"
            continue
        try:
            img = obj.read().image
            out = os.path.join(ASSETS_DIR, "relics", f"{rel_id}.png")
            save_image(img, out, 128)
            report["relics"][rel_id] = f"Relic_{sprite_num}"
            matched += 1
        except Exception as e:
            report["skipped"][f"relics:{rel_id}"] = f"erro ao decodificar Relic_{sprite_num}: {e}"
    print(f"  {matched}/{len(relics)} relíquias com ícone")

    report["game_roster"] = sorted(game_roster)
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=1)
    print(f"\nrelatório -> {REPORT_PATH}")
    print(f"resumo: {len(report['heroes'])} heróis, {len(report['items'])} itens, "
          f"{len(report['relics'])} relíquias extraídos; {len(report['skipped'])} pulados")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--inventory", action="store_true")
    parser.add_argument("--extract", action="store_true")
    args = parser.parse_args()
    if args.inventory:
        inventory()
    elif args.extract:
        extract()
    else:
        print("use --inventory ou --extract")
