# ⚔️ GuildRun Team Builder Pro

[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646cff?logo=vite&logoColor=white)](https://vitejs.dev)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES_Modules-f7df1e?logo=javascript&logoColor=black)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
[![Zero popups](https://img.shields.io/badge/UX-zero__popups-22c55e)](#arquitetura)

Planejador de times para o jogo **GuildRun** (Leyline): monte 3 titulares + 3 reservas,
equipe até 5 itens por personagem, adicione relíquias globais, veja sinergias ativas e
estatísticas totais (DPS, HP, defesa...) — tudo com a **arte oficial do jogo** e os
**stats validados contra os dados reais** da build do jogo.

---

## 🎯 Por que este projeto existe

Este planner nasceu de dois motivos:

1. **Estudo.** Ele começou como um app em JavaScript puro (ES6 Modules) e serviu de
   base para um estudo completo de migração para React: reescrever a camada de
   interface mantendo a lógica de negócio intacta, adotar uma arquitetura de estado
   moderna e exercitar toda a cadeia de engenharia (bundlers, testes automatizados,
   extração de dados, versionamento e CI de qualidade via smoke tests).

2. **Fã do jogo.** Somos fãs de GuildRun — um roguelike de auto-battle da Leyline —
   e queríamos uma ferramenta de fã, para planejar composições de time antes de
   jogar: testar sinergias de classes, distribuir itens e relíquias, e comparar
   estatísticas sem precisar entrar no jogo.

## ✨ Funcionalidades

- Pool dos 25 heróis com filtros por tier e classe + busca por nome/função
- Escalar por clique ou **arrastar**; dentro do time, arrastar **troca posições**
- 3 titulares + 3 reservas, com mover/remover inline nos slots
- 5 slots de itens por herói — seleção feita **direto no personagem selecionado**
  (mini-itens clicáveis abrem um seletor inline; clique no item atual desequipa)
- Relíquias globais ilimitadas, com seletor inline de adição
- Sinergias de classe calculadas ao vivo (heróis híbridos contam para as duas classes)
- Painel de estatísticas totais com DPS estimado
- Exportação da build em JSON para a área de transferência
- Persistência automática no `localStorage` (recarregue e o time continua lá)
- **Fluxo 100% sem popups**: nenhum modal, nenhum toast, nenhum `confirm()` nativo

## 🏗️ Arquitetura

Fluxo de dados unidirecional clássico do React, em camadas bem separadas:

```
                    ┌────────────────────────────────────────┐
                    │                data/                    │
                    │  HEROES_DATA · ITEMS_DATA · RELICS_DATA │
                    │  (stats oficiais validados no AssetRipper)│
                    └────────────────────┬───────────────────┘
                                         │ import
┌──────────────┐   dispatch   ┌──────────▼──────────┐  useApp()  ┌──────────────┐
│  components/ │ ───────────► │  context/ (reducer) │ ◄───────── │    views     │
│ (UI pura)    │              │  Context + useReducer│            │ (renderização)│
└──────┬───────┘              └──────────┬──────────┘            └──────────────┘
       │ consulta                       │ estado novo
       ▼                                ▼
┌──────────────┐                 ┌──────────────┐
│   utils/     │                 │  localStorage │
│ (puras, testáveis)│             │  (persistência) │
└──────────────┘                 └──────────────┘
```

- **Estado global**: um único `AppContext` com `useReducer` — toda mutação passa
  pelo reducer (funções puras e testáveis); nenhum componente muta estado direto.
- **Utils puras**: `helpers`, `synergies`, `stats` e `exportBuild` não conhecem o
  React — recebem o estado por parâmetro, o que permitiu validá-las isoladamente.
- **Componentes**: leem o estado via `useApp()` e só fazem `dispatch`; seletores
  inline (itens/relíquias) usam estado local, sem poluir o contexto global.
- **Persistência**: um `useEffect` no Provider sincroniza o subconjunto persistente
  (`main`, `reserve`, `items`, `teamRelics`) com o `localStorage`.

## 🧰 Tecnologias e por que

| Tecnologia | Motivo |
|---|---|
| **Vite 7** | O Create React App foi descontinuado pelo próprio time do React; o Vite é o bundler recomendado, mais rápido e simples |
| **React 19** | Camada de interface declarativa; hooks modernos sem classes |
| **Context API + useReducer** | Estado global compartilhado sem bibliotecas extras — Redux seria overkill para este porte (decisão arquitetural do guia de migração) |
| **CSS global único** | O visual glassmorphism/neon já existia; preservá-lo intacto (em vez de Tailwind/CSS-in-JS) manteve fidelidade visual e zero refatoração de estilos |
| **Drag & Drop HTML5 nativo** | `dataTransfer` resolve sem dependências (`react-dnd`, `dnd-kit`) |
| **localStorage** | Persistência sem backend, mesma chave/formato da versão original |
| **Python + UnityPy** (tooling) | Extração de assets Unity (`.assets`, bundles LZ4) direto por script, sem executáveis externos |
| **AssetRipper** (tooling) | Leitura da `HeroSheet` oficial do jogo (stats reais) via API headless |

## 📊 De onde vêm os dados e as imagens

O histórico de proveniência em três camadas (detalhado no `CHANGELOG.md`):

1. **Versão vanilla (ponto de partida)** — stats, itens e relíquias foram coletados
   manualmente a partir de **guias da comunidade** do jogo.
2. **Validação oficial (dados)** — a pasta do jogo (Steam, build Unity 6000.0.64f1)
   foi usada como **fonte da verdade**: os 25 nomes de heróis e as 7 classes foram
   validados contra os arquivos legíveis, e a **HeroSheet completa** (stats reais de
   todos os heróis, incluindo classes híbridas e mana inicial) foi extraída com o
   AssetRipper e sincronizada — **os 25 heróis tinham stats desatualizados**, hoje
   refletem o jogo. Snapshots brutos em `scripts/game-hero-sheet.yaml`.
3. **Arte oficial** — retratos dos heróis, ícones de itens e relíquias foram
   extraídos dos assets do jogo com **UnityPy** (18 retratos, 163 ícones de itens,
   293 de relíquias). 7 heróis sem arte na build atual da demo foram fornecidos
   pelo autor; o banner do topo também é arte oficial fornecida pelo autor.

> ⚠️ **Aviso legal**: GuildRun é propriedade da **Leyline**. Este é um projeto de
> fã, sem fins comerciais, para uso pessoal/educacional. Os assets do jogo não
> devem ser redistribuídos.

## 🚀 Rodando

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build de produção → dist/
npm run preview  # pré-visualiza o build
```

## 🔧 Scripts auxiliares

```bash
# Qualidade
node scripts/smoke-ssr.mjs            # smoke test: renderiza o app via SSR e valida o reducer

# Sincronia com o jogo (a pasta do jogo é apenas LIDA — nunca modificada)
node scripts/sync-game-data.js        # valida nomes/classes contra a pasta do jogo (Steam)
python scripts/extract-game-images.py --inventory   # inventaria texturas/sprites do jogo
python scripts/extract-game-images.py --extract     # extrai arte → public/assets/
python scripts/update-hero-stats.py   # sincroniza stats com a HeroSheet oficial (snapshot local)
python scripts/wire-image-fields.py   # insere image/icon no data.js (idempotente)
```

> Os scripts Python usam o **UnityPy** instalado em `.pylibs/` do workspace (não
> afetam o Python global).

## 📁 Estrutura

```
guildrun-planner/
├── index.html                  # entrada (Vite)
├── vite.config.js              # plugin-react + watcher tolerante a edições via agentes
├── public/assets/
│   ├── banner.webp             # banner oficial (fornecido pelo autor)
│   ├── heroes/                 # 25 retratos (18 extraídos do jogo + 7 do autor)
│   ├── items/                  # 163 ícones oficiais
│   └── relics/                 # 293 ícones oficiais
└── src/
    ├── main.jsx                # render + AppProvider
    ├── App.jsx                 # layout raiz (banner, time, seletores inline)
    ├── index.css               # CSS global (glassmorphism/neon original + extensões)
    ├── data/data.js            # HEROES_DATA · ITEMS_DATA · RELICS_DATA · SYNERGY_CONFIG
    ├── context/
    │   ├── AppContext.jsx      # Provider + persistência automática
    │   ├── initialState.js     # estado inicial + saveState/loadState
    │   └── reducer.js          # TODAS as ações (100% silencioso, sem popups)
    ├── hooks/                  # useApp, useLocalStorage
    ├── utils/                  # helpers · synergies · stats · exportBuild (puras)
    └── components/
        ├── Header.jsx          # Limpar (confirmação inline) e Exportar
        ├── SynergyPanel.jsx · StatsPanel.jsx
        ├── HeroPool/           # pool, filtros, cards (drag)
        ├── Team/               # grid, slots, mini-itens clicáveis, ItemPicker inline
        └── Relics/             # lista + seletor inline
```

## ✅ Qualidade

- **Smoke test SSR** (`scripts/smoke-ssr.mjs`): renderiza a aplicação inteira em
  Node, valida time inicial, sinergias, contadores, arte, ausência de popups e 13
  cenários do reducer — roda a cada mudança relevante.
- **Build de produção** verificado a cada entrega (54 módulos, 0 erros).
- Histórico completo de decisões e correções no [`CHANGELOG.md`](./CHANGELOG.md).
