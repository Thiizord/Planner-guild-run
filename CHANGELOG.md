# Changelog — GuildRun Team Builder Pro (migração Vanilla JS → React)

## [0.6.0] — Zero popups: toasts removidos + Limpar corrigido

- **Sistema de toasts inteiro removido**: `ToastContainer`, hook `useToast`, estado
  `toasts`/`toastSeq`, actions `ADD_TOAST`/`REMOVE_TOAST` e o CSS de toast. Nenhuma
  notificação flutuante existe mais — o app é 100% silencioso; ações inválidas
  simplesmente não mudam o estado.
- **Limpar corrigido**: o `confirm()` nativo era bloqueado em browsers embutidos
  (VS Code Simple Browser), fazendo o botão falhar em silêncio. Agora a confirmação
  é inline no próprio botão: 1º clique arma "⚠️ Confirmar limpeza?" (pulsa vermelho,
  desarma sozinho em 4s), 2º clique limpa.
- **Exportar com feedback inline**: o botão mostra "✔ Copiado!" por 2s (fallback
  no console se o clipboard estiver indisponível) — sem toast.
- **Modelo de itens mais óbvio**: os mini-itens do herói selecionado agora **pulsam
  em âmbar** (animação sutil), sinalizando que são a entrada para equipar — clique
  abre o seletor inline; item atual (✅ verde) desequipa.
- Smoke test atualizado: garante que o HTML renderizado **não tem toasts nem modais**
  e que ações inválidas devolvem o estado intacto (identidade de referência).

## [0.5.0] — Fluxo sem modais: seletores inline (pedido do usuário)

- **Removidos**: modal de itens (`ItemModal`), modal de relíquias (`RelicModal`),
  seção de itens embaixo das reservas (`ItemSlots`), toasts de seleção de
  personagem/equipar item/adicionar e remover relíquia, e o handler de ESC
  (não existem mais modais).
- **Itens direto no personagem selecionado**: os mini-itens do herói selecionado
  no time ficam clicáveis; o clique abre o `ItemPicker` INLINE logo abaixo das
  linhas do time (dentro do mesmo card). Clicar num item equipa/troca; clicar no
  item atual (✅ destacado em verde) **desequipa** — novidade que o modal não tinha.
- **Relíquias**: o botão "➕ Adicionar Relíquia" expande um grid inline no próprio
  card, listando apenas as relíquias disponíveis (sem popup).
- Reducer enxugado: actions `OPEN/CLOSE_ITEM_MODAL` e `OPEN/CLOSE_RELIC_MODAL`
  removidas; campos `itemModal`/`relicModalOpen` fora do estado.
- CSS: o chrome de modal saiu (`.modal-overlay`, `.modal`, `#modalCharInfo`);
  `.modal-header`, `.close-btn`, `.item-list`, `.item-option`, `.relic-grid` e
  `.relic-option` foram reaproveitados pelos seletores inline.
- Smoke test atualizado: garante que NÃO há modais no HTML renderizado e valida
  os fluxos sem popup (`SELECT_SLOT`, `SET_ITEM`, `REMOVE_ITEM`, `ADD_RELIC`).

## [0.4.0] — Stats oficiais do jogo + itens equipados v2

### Itens equipados — redesign estético

- `MiniItems`: pílulas de texto viraram **5 mini-slots com os ícones oficiais**,
  moldura colorida pela raridade, slot vazio tracejado e hover com zoom.
- `ItemSlots` (personagem selecionado): ícone maior, nome com ellipsis e tipo em pílula.
- Tooltip do `TeamSlot` agora lista os itens com ícones.
- Fix de longa data: as classes de raridade do CSS original (`rarity-epico`,
  `rarity-lendario`) nunca eram atingíveis porque o data tem raridades acentuadas
  (quirk preservada do vanilla). A normalização (NFD, sem acentos) nas exibições de
  item finalmente ativa as cores pretendidas pelo CSS original.

### Stats validados contra a fonte da verdade (guia, Apêndice A)

- **AssetRipper 2.0** rodou headless (API HTTP) e, via `/Assets/Yaml`, extraímos a
  **HeroSheet completa do jogo** — 25 entradas com stats reais. Snapshots salvos em
  `scripts/game-hero-sheet.yaml` e `scripts/game-hero-class-sheet.yaml`.
- `scripts/update-hero-stats.py`: **25/25 heróis atualizados — todos os 25 tinham
  stats divergentes** (a demo foi rebalanceada em relação aos dados manuais do
  vanilla). Exemplos: Irini def 25→29, crit 25→15, maxMana 50→75; attackSpeed agora
  é o FP real do jogo (ex.: Irini 0.54, não 0.55).
- Novo stat em `baseStats`: `startingMana` (o painel de estatísticas já tinha o
  ícone "⚡ Mana Inicial" — agora ele mostra valor).
- **Heróis híbridos**: campo `class2` (Rowan Vanguard/Tank, Tilly Warrior/Duelist,
  Zuri Tank/Assassin) e `calculateSynergies` passa a contar **ambas** as classes —
  fidelidade à regra real do jogo.
- Relatório completo antes/depois: `scripts/stats-validation.json`.

## [0.3.2] — Arte completa: 25/25 heróis com imagem real

- O usuário forneceu imagens (webp) para os 7 heróis sem arte na build da demo:
  **Aria, Karsu, Pollen, Rip, Rowan, Yuuna, Zuri** (em `C:\Users\Thiago\Pictures`).
- `scripts/wire-user-hero-images.py`: converte webp→PNG (máx. 256px) para
  `public/assets/heroes/{id}.png` e insere o campo `image` no data.js (idempotente).
- **25/25 heróis com arte real** — nenhum emoji no planner. Os 9 heróis do roster
  visual novo da demo (Ayaka, Cenk, Floeria, Javryn, Joey, Josephina, Rook, Selkhera,
  Seraphael) ficam **fora do planner por decisão do usuário** (ficam apenas como
  referência em `scripts/preview-new-heroes/`).

## [0.3.1] — Arrastar dentro do time (trocar posições)

- Nova action `SWAP_SLOTS`: arrastar um herói de um slot do time para outro agora
  **troca as posições** (alvo preenchido) ou **move** (alvo vazio) — funciona dentro
  de titulares, dentro de reservas e entre os dois grupos. Toast `🔄 {nome} movido.`.
- O drag agora carrega a origem no `dataTransfer` (`{source, charId, teamType, index}`
  para slots, `{source:'pool', charId}` para a pool). O comportamento vanilla do
  pool→time foi preservado (herói já no time → "já está no time!"; slot ocupado →
  "Slot ocupado!").
- Smoke test: +3 casos (swap dentro de titulares, move para reserva vazia, drop em
  si mesmo = no-op sem toast).

### Investigação dos 7 heróis sem arte (Aria, Karsu, Pollen, Rip, Rowan, Yuuna, Zuri)

- A arte deles **não existe nesta build da demo**: nenhum Texture2D/Sprite com esses
  nomes, e nenhum MonoBehaviour do jogo inteiro referencia os sprites de heróis via
  PPtr (o carregamento é por convenção de nome em código).
- A demo está numa **versão de transição**: os dados/localização conhecem o roster
  antigo (os 25 do planner), mas a arte é do roster visual novo — 16 nomes mantidos
  (+ Nyx→Nyxa) e 9 heróis novos: Ayaka, Cenk, Floeria, Javryn, Joey, Josephina,
  Rook, Selkhera, Seraphael.
- Gerada a folha de contato `scripts/preview-new-heroes/roster-atual.png` com os
  25 ícones do roster atual (novos marcados) para identificação visual de eventuais
  renomeações. Se o usuário confirmar um mapeamento (ex.: "Ayaka é a Aria"), o ícone
  correspondente pode ser atribuído.

## [0.3.0] — Arte oficial do jogo (Apêndice A.5 do guia)

### Extração via UnityPy (sem executáveis externos)

- Instalada a biblioteca **UnityPy 1.25.4** (Python) em `.pylibs/` do workspace — lê
  `.assets` e bundles Addressables (LZ4) diretamente, sem precisar de AssetRipper/UABE.
- `scripts/extract-game-images.py`:
  - `--inventory` — enumera 4.205 Texture2D/Sprite do jogo → `texture-inventory.json`
  - `--extract` — junta o SharedTableData (chaves tipo `Items.Item_101.Name`) com as
    StringTables EN, obtendo nome inglês → id numérico do sprite; extrai de
    `sharedassets1.assets` para `public/assets/{heroes,items,relics}`
- `scripts/wire-image-fields.py` — insere os campos `image`/`icon` no `data.js`
  (idempotente, um campo por linha).

### O que foi extraído (474 PNGs, ~7 MB)

- **18/25 heróis**: 16 ícones redondos 256×256 (`{Hero}_round`) + Grace e Kai via
  `HalfBodyPortrait_*_A` (2048²→256²). Nota: a "Nyx" do planner chama-se **Nyxa** no jogo.
- **163/170 itens**: ícone 128×128 (sprite `Item_{id}`).
- **293/298 relíquias**: ícone 128×128 (sprite `Relic_{id}`).

### Sem arte nesta build (fallback para o visual original)

- 7 heróis do planner não têm arte no jogo (Aria, Karsu, Pollen, Rip, Rowan, Yuuna,
  Zuri) — o roster da demo atual é outro (tem Ayaka, Cenk, Floeria, Javryn, Joey,
  Josephina, Rook, Selkhera, Seraphael). Renderizam com o emoji original.
- 7 itens "Parcel" não existem na tabela do jogo; 5 relíquias ficaram sem sprite
  (`Relic_709/534/1029/5128/900` não existem no sharedassets1).

### Integração no planner

- `HEROES_DATA` ganhou `image` (padrão do guia A.5); `ITEMS_DATA`/`RELICS_DATA` ganharam `icon`.
- `HeroCard`/`TeamSlot`: retrato redondo (`<img className="hero-portrait">`) com
  **fallback para o emoji** quando não há arte.
- `ItemSlots`/`ItemModal`: ícone do item; `RelicItem`/`RelicModal`: ícone da relíquia.
  `MiniItems` continua com nomes (pílulas pequenas demais para ícones).
- CSS: bloco novo adicionado ao fim do `index.css` — nenhum estilo original alterado.
- Smoke test ampliado: valida render com imagem (Dragomir/Fiona) e fallback (Aria).
  `npm run build` ✔ com os 474 PNGs copiados para `dist/assets/`.

> ⚠️ Nota legal (guia, A.7): os assets são propriedade da Leyline/Steam. O planner é
> uma ferramenta de fã para uso pessoal — não redistribuir os assets.

## [0.2.0] — Migração React completa (Vanilla JS → React + Vite)

### Conversão de bundler: CRA → Vite (Etapa 0–1)

- O projeto tinha sido iniciado com Create React App (`react-scripts`), descontinuado.
  Convertido para **Vite 7** conforme o guia de migração:
  - `vite.config.js` criado na raiz
  - `index.html` movido de `public/` para a raiz, com `<script type="module" src="/src/main.jsx">`
  - `src/index.js` → `src/main.jsx`; `src/App.js` → `src/App.jsx`
  - Removidos: `react-scripts`, libs de teste, `public/index.html` (template), logos, `manifest.json`, `robots.txt`
- **Fix da tela branca**: abrir `public/index.html` via `file://` nunca funciona em projetos
  empacotados (o arquivo era só um template do CRA com placeholders `%PUBLIC_URL%` e sem
  bundle). A aplicação passa a ser servida pelo Vite em `http://localhost:5173/`.

### Configuração do dev server para coexistir com o agente de IA

- `server.watch.ignored`: pastas temporárias de escrita atômica do harness
  (`..*.tmpdir`) faziam o chokidar travar com `EBUSY` e derrubavam o servidor.
- `usePolling: true` (`interval: 300`): a escrita por renomeação do harness não gera
  eventos de `fs.watch` no Windows; com polling o HMR detecta qualquer edição.
  Custo desprezível (projeto pequeno).
- Também ignorados: `*.tmp`, `.npm-cache/`, `dist/`.

### Lógica de negócio portada (Etapas 2–3)

- `src/utils/helpers.js` — funções puras, estado passado como parâmetro
  (ex.: `getTeamChars(main, reserve)`), conforme o guia.
- `src/utils/synergies.js` — `calculateSynergies(teamChars)`.
- `src/utils/stats.js` — `calculateTeamStats(teamChars, items, teamRelics)` + `calculateDPS(stats)`.
- `src/utils/exportBuild.js` — exportação JSON idêntica à original (clipboard + fallback console).
- `src/data/data.js` — cópia integral do vanilla (HEROES_DATA, ITEMS_DATA, RELICS_DATA,
  SYNERGY_CONFIG, CLASS_ICONS).

### Estado global (Etapas 4–5)

- `src/context/initialState.js` — mesmo formato do `state.js` vanilla; mesma chave de
  persistência (`guildrun_pro`); time inicial de exemplo (`aria, dragomir, fiona` +
  `funke`) e seleção do primeiro personagem, idênticos ao `main.js` original.
- `src/context/reducer.js` — todas as ações: `SELECT_CHAR`, `DROP_CHAR`, `REMOVE_CHAR`,
  `MOVE_CHAR`, `SELECT_SLOT`, `SET_ITEM`, `REMOVE_ITEM`, `ADD_RELIC`, `REMOVE_RELIC`,
  `SET_TIER_FILTER`, `SET_CLASS_FILTER`, `SET_SEARCH_QUERY`, `OPEN/CLOSE_ITEM_MODAL`,
  `OPEN/CLOSE_RELIC_MODAL`, `RESET_TEAM`, `ADD_TOAST`, `REMOVE_TOAST`.
  Toasts migrados para o reducer (são estado) com todas as mensagens originais.
- `src/context/AppContext.jsx` — Provider + persistência automática via `saveState`
  (mesmo subconjunto do original: `main`, `reserve`, `items`, `teamRelics`).
- Hooks: `useApp`, `useToast` (2500ms, igual ao toast.js vanilla), `useLocalStorage`.

### Componentes (Etapas 6–8)

- `Header`, `SynergyPanel`, `StatsPanel`, `HeroPool/{HeroPool,HeroCard,Filters}`,
  `Team/{TeamGrid,TeamSlot,MiniItems}`, `Items/{ItemSlots,ItemModal}`,
  `Relics/{RelicList,RelicItem,RelicModal}`, `Toast/ToastContainer`.
- Drag & drop HTML5 nativo (Etapa 7): `onDragStart`/`onDragOver`/`onDrop` com
  `dataTransfer` — sem bibliotecas externas.
- Todos os IDs e classes CSS do vanilla preservados (regra 3.6 do guia).
- ESC fecha os dois modais (como no `main.js` original).

### Correções durante a migração

- **Imports quebrados** (arquivos portados referenciavam `./data.js`/`./state.js`
  em pastas erradas) — corrigidos para os caminhos relativos corretos.
- **Colisão de campo `type`** nas actions `REMOVE_CHAR`, `MOVE_CHAR` e `SELECT_SLOT`:
  o tipo do time (`main`/`reserve`) sobrescreveria o discriminador da action e os
  botões de remover/mover não funcionariam. Renomeado para `teamType` (detectado
  pelo smoke test e pelo warning do esbuild).
- **Rollup nativo**: o binário do Windows é `@rollup/rollup-win32-x64-msvc`
  (instalado como dependência opcional); removida uma entrada inválida `npm:null@*`.

### Quirk do original preservada propositalmente

- Raridades acentuadas no data (`Épico`, `Lendário`) geram classes CSS
  `rarity-épico`/`rarity-lendário`, mas o stylesheet define `rarity-epico`/
  `rarity-lendario` (sem acento). Resultado no vanilla: itens épicos/lendários não
  recebem a cor de borda especial. O comportamento foi reproduzido fielmente
  (prioridade nº 1 do guia: funcionalidade idêntica).

### Verificação

- Smoke test SSR (`scripts/smoke-ssr.mjs`): app inteiro renderizado com Node —
  time de exemplo, sinergia Mage 2x, contadores (4/6, 3/3, 1/3), DPS, modais,
  toasts e 6 cenários do reducer. **Tudo passou.**
- `npm run build`: 54 módulos transformados, 0 erros (JS 313KB → 88KB gzip).
- 27 módulos servidos pelo dev server com status 200.

## Apêndice A — Fonte de dados do jogo (Guildrun Demo, Steam)

### Estrutura explorada (`C:\Program Files (x86)\Steam\steamapps\common\Guildrun Demo`)

- Jogo **Unity 6000.0.64f1** (IL2CPP — `GameAssembly.dll`), editora **Leyline**,
  build-guid `0d6ce4240ab74b169b84e792b08c093a` (útil para detectar patches).
- `Guildrun_Data/StreamingAssets/aa/` — Addressables com **somente localização**
  (string tables de 9 idiomas, incluindo pt-BR) + bancos FMOD de áudio.
- `Guildrun_Data/*.assets` (24 arquivos, 420 MB) — cenas e objetos Unity serializados
  (ex.: `sharedassets1.assets` contém o modelo 3D do Dragomir com materiais HDRP).

### Validação contra a fonte do jogo (script `scripts/sync-game-data.js`)

- **Heróis: 25/25 nomes validados** nos arquivos legíveis do jogo
  (ex.: Dragomir ×124, Hoyoung ×152, Pimenta ×117).
- **Classes: 7/7 validadas** (Warrior, Tank, Vanguard, Assassin, Duelist, Mystic, Mage) —
  o catálogo Addressables confirma assets `HeroClasses` e `Heroes` por idioma.
- **Itens/relíquias**: nomes estão nos bundles de localização comprimidos com LZ4 —
  invisíveis em varredura bruta (ex.: "Vampirism" aparece por acaso da compressão;
  "Adaptive Sword" não). Não significa ausência.
- **Stats numéricos e imagens**: serializados em binário Unity (ScriptableObjects e
  Texture2D). Extração estruturada requer **AssetRipper** ou **UABE** (guia, A.8).
  Conforme o guia ("se não houver, manter os dados atuais"), os stats e os emojis
  foram mantidos até essa extração ser feita.

### Próximos passos sugeridos (pós-extração com AssetRipper)

1. Extrair `Texture2D` dos heróis → `public/assets/heroes/*.png`.
2. Adicionar campo `image` em `HEROES_DATA` e exibir no `HeroCard`/`TeamSlot`
   (`<img className="hero-portrait" />` — CSS novo, sem tocar nos estilos existentes).
3. Validar `baseStats` contra os ScriptableObjects e atualizar `HEROES_DATA`.
4. Preencher `skills` dos heróis a partir das string tables pt-BR.
5. Re-rodar `node scripts/sync-game-data.js` após cada patch do jogo.

## [0.1.0] — Base CRA inicial (substituída)

Projeto criado com Create React App; substituído pelo setup Vite nesta versão.
