r"""
fix-data-encoding.py — Corrige o mojibake no data.js:
1. SYNERGY_CONFIG: icon vira o nome da classe (o ClassIcon.jsx renderiza o SVG)
2. CLASS_ICONS: idem
3. Bonus text com acentos corrompidos (PowerShell UTF-8->Win-1252)
Escreve com encoding UTF-8 correto via Python (nao PowerShell).
"""

import re

try:
    import sys
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

import os
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA = os.path.join(ROOT, "src", "data", "data.js")

with open(DATA, "r", encoding="utf-8") as f:
    text = f.read()

# ---- 1) substitui o bloco SYNERGY_CONFIG inteiro ----
new_synergy = """export const SYNERGY_CONFIG = {
  Warrior: { icon: 'Warrior', label: 'Warrior', bonuses: { 2: '+10% Dano de Ataque', 3: '+20% Dano de Ataque', 4: '+30% Dano de Ataque' } },
  Tank: { icon: 'Tank', label: 'Tank', bonuses: { 2: '+10% Defesa', 3: '+20% Defesa', 4: '+30% Defesa' } },
  Vanguard: { icon: 'Vanguard', label: 'Vanguard', bonuses: { 2: '+10% Vida Maxima', 3: '+20% Vida Maxima', 4: '+30% Vida Maxima' } },
  Assassin: { icon: 'Assassin', label: 'Assassin', bonuses: { 2: '+10% Chance de Critico', 3: '+20% Chance de Critico', 4: '+30% Chance de Critico' } },
  Duelist: { icon: 'Duelist', label: 'Duelist', bonuses: { 2: '+10% Velocidade de Ataque', 3: '+20% Velocidade de Ataque', 4: '+30% Velocidade de Ataque' } },
  Mystic: { icon: 'Mystic', label: 'Mystic', bonuses: { 2: '+10% Regeneracao de Mana', 3: '+20% Regeneracao de Mana', 4: '+30% Regeneracao de Mana' } },
  Mage: { icon: 'Mage', label: 'Mage', bonuses: { 2: '+10% Dano Magico', 3: '+20% Dano Magico', 4: '+30% Dano Magico' } }
};"""

# encontra o bloco atual (da linha 'export const SYNERGY_CONFIG' até o '};' correspondente)
pattern = re.compile(
    r"export const SYNERGY_CONFIG = \{.*?\};",
    re.DOTALL,
)
match = pattern.search(text)
if match:
    text = text[:match.start()] + new_synergy + text[match.end():]
    print("[OK] SYNERGY_CONFIG substituido")
else:
    print("[ERRO] SYNERGY_CONFIG nao encontrado")

# ---- 2) substitui o bloco CLASS_ICONS ----
new_icons = (
    "export const CLASS_ICONS = {\n"
    "  Warrior: 'Warrior', Tank: 'Tank', Vanguard: 'Vanguard', Assassin: 'Assassin', "
    "Duelist: 'Duelist', Mystic: 'Mystic', Mage: 'Mage'\n"
    "};"
)
pattern_icons = re.compile(
    r"export const CLASS_ICONS = \{.*?\};",
    re.DOTALL,
)
match_icons = pattern_icons.search(text)
if match_icons:
    text = text[:match_icons.start()] + new_icons + text[match_icons.end():]
    print("[OK] CLASS_ICONS substituido")
else:
    print("[ERRO] CLASS_ICONS nao encontrado")

# ---- 3) corrige mojibake em textos acentuados (se ainda restarem) ----
# tabela de mojibake comum UTF-8 -> Windows-1252
FIXES = {
    "Ã¡": "á", "Ã ": "à", "Ã£": "ã", "Ã¢": "â",
    "Ã©": "é", "Ãª": "ê",
    "Ã­": "í",
    "Ã³": "ó", "Ãµ": "õ", "Ã´": "ô",
    "Ãº": "ú", "Ã¼": "ü",
    "Ã§": "ç",
    "Ã‰": "É",
    "Ã“": "Ó",
    "Ãš": "Ú",
}
for bad, good in FIXES.items():
    if bad in text:
        count = text.count(bad)
        text = text.replace(bad, good)
        print(f"[OK] {bad!r} -> {good!r} ({count}x)")

# ---- grava ----
with open(DATA, "w", encoding="utf-8", newline="\n") as f:
    f.write(text)

print("\nArquivo gravado com encoding UTF-8 correto.")
