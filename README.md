# GuildRun Team Builder Pro (React)

Planejador de times para o jogo **GuildRun**: monte 3 titulares + 3 reservas, equipe até 5
itens por personagem, adicione relíquias globais ilimitadas, veja sinergias ativas e
estatísticas totais (DPS, HP, defesa...), exporte a build em JSON e persista tudo no
localStorage.

Migração fiel do projeto original em JavaScript puro (ES6 Modules), mantendo toda a
lógica de negócio e o visual (CSS global glassmorphism/neon) — ver `CHANGELOG.md` para
o histórico completo e o `Guia de Migração` na pasta raiz do workspace para as decisões
arquiteturais.

## Stack

- **React 19** + **Vite 7** (CRA foi descontinuado; conversão documentada no changelog)
- Estado global: **Context API + useReducer** (um único Context, sem Redux)
- CSS global único (`src/index.css`, copiado integralmente do vanilla)
- Persistência: `localStorage` (chave `guildrun_pro`, mesmo formato do original)
- Drag & drop: **HTML5 nativo** (`onDragStart`/`onDragOver`/`onDrop`)

## Rodando

```bash
npm install
npm run dev      # servidor de desenvolvimento → http://localhost:5173
npm run build    # build de produção → dist/
npm run preview  # pré-visualizar o build
```

> ⚠️ Abra a **URL do dev server** no navegador — abrir `index.html` direto via
> `file://` não funciona em projetos empacotados (o JS é servido/compilado pelo Vite).

## Scripts auxiliares

```bash
node scripts/sync-game-data.js        # valida os dados do planner contra a pasta do jogo (Steam)
node scripts/smoke-ssr.mjs            # smoke test: renderiza o app inteiro via SSR e valida o reducer

# Python (usa UnityPy instalado em ../../.pylibs — extração de arte do jogo):
python scripts/extract-game-images.py --inventory   # inventaria as 4205 texturas/sprites do jogo
python scripts/extract-game-images.py --extract     # extrai heróis/itens/relíquias para public/assets/
python scripts/wire-image-fields.py                 # insere image/icon no data.js (idempotente)
```

O `sync-game-data.js` é **somente leitura** na pasta do jogo e reporta versão
(build-guid), inventário dos assets e validação dos 25 heróis e 7 classes contra os
arquivos legíveis. Ele não altera `src/data/` automaticamente — mudanças de stats
exigem extração com AssetRipper/UABE (documentado no changelog).

## Estrutura

```
guildrun-planner/
├── index.html                  # entrada (Vite)
├── vite.config.js              # plugin-react + watcher tolerante a edições de agente IA
├── public/
│   └── assets/
│       ├── heroes/             # retratos dos 25 heróis (18 extraídos do jogo + 7 fornecidos pelo usuário)
│       ├── items/              # ícones oficiais dos itens (163 PNGs)
│       └── relics/             # ícones oficiais das relíquias (293 PNGs)
└── src/
    ├── main.jsx                # render + AppProvider
    ├── App.jsx                 # layout raiz (espelha o index.html vanilla) + ESC fecha modais
    ├── index.css               # CSS original do projeto (global)
    ├── data/
    │   └── data.js            # HEROES_DATA, ITEMS_DATA, RELICS_DATA, SYNERGY_CONFIG, CLASS_ICONS
    ├── context/
    │   ├── AppContext.jsx      # Context + Provider + persistência automática
    │   ├── initialState.js     # estado inicial + loadState/saveState (chave guildrun_pro)
    │   └── reducer.js          # todas as ações (incl. toasts, com as mensagens originais)
    ├── hooks/
    │   ├── useApp.js           # useContext(AppContext)
    │   ├── useToast.js         # showToast(msg, type)
    │   └── useLocalStorage.js  # hook genérico de persistência
    ├── utils/                   # funções puras (estado passado como parâmetro)
    │   ├── helpers.js
    │   ├── synergies.js
    │   ├── stats.js
    │   └── exportBuild.js
    └── components/
        ├── Header.jsx          # Limpar / Exportar
        ├── SynergyPanel.jsx    # sinergias ativas
        ├── StatsPanel.jsx      # estatísticas totais + DPS
        ├── HeroPool/           # pool com filtros e busca + drag
        ├── Team/               # grid de slots, mover/remover, mini-itens, tooltip
        ├── Items/              # 5 slots do personagem selecionado + modal de itens
        ├── Relics/             # lista de relíquias + modal de seleção
        └── Toast/              # container de toasts
```

## Origem dos dados e arte

- **Arte**: 25/25 heróis com imagem real — 18 retratos extraídos do jogo via UnityPy
  (Apêndice A.5 do guia; inclui Grace/Kai via retratos 2048²→256²) e 7 fornecidos pelo
  usuário (Aria, Karsu, Pollen, Rip, Rowan, Yuuna, Zuri, que não têm arte nesta build
  da demo). Ícones de 163/170 itens e 293/298 relíquias também extraídos do jogo.
- **Dados** (stats/classes): os do projeto vanilla. Os stats numéricos do jogo estão
  serializados em binário; a validação exigiria AssetRipper (ver `CHANGELOG.md`).
- Os 9 heróis do roster visual novo da demo ficam fora do planner (decisão do usuário;
  referência em `scripts/preview-new-heroes/`).

> ⚠️ Assets do jogo são propriedade da Leyline/Steam — planner de fã, uso pessoal.
