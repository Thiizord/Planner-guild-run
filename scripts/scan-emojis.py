r"""scan-emojis.py — inventario de emojis no src/ (mostra arquivo:linha e o trecho)."""
import re
import os
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

PADRAO = re.compile(r"[\U0001F000-\U0001FAFF\u2600-\u26FF\u2700-\u27BF\u2B00-\u2BFF\uFE0F]")

for root, dirs, files in os.walk("src"):
    for f in files:
        p = os.path.join(root, f)
        for i, linha in enumerate(open(p, encoding="utf-8"), 1):
            em = PADRAO.findall(linha)
            if em:
                trecho = linha.strip()[:90]
                print(f"{p}:{i}: {' '.join(em)}  <<< {trecho}")
print("fim do inventario")
