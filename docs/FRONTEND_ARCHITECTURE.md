# Frontend Architecture & Technical Design - GuildRun Team Builder Pro

Este documento detalha os fundamentos arquiteturais, padrões de design de interface (UI/UX), modelo de estado e especificações matemáticas dos componentes do **GuildRun Team Builder Pro**.

---

## 1. Visão Arquitetural

A aplicação adota um padrão arquitetural reativo baseado em **React 18 + TypeScript + Vite**, estruturado em torno de fluxo unidirecional de dados (Flux/Redux-like pattern via React Context e `useReducer`).

```
+---------------------------------------------------------------------------------+
|                                AppContext                                       |
|  (Centralized AppState: main[28], reserve[3], selectedCharId, heroConfigs...)   |
+---------------------------------------+-----------------------------------------+
                                        |
       +--------------------------------+--------------------------------+
       |                                |                                |
       v                                v                                v
+---------------+              +-----------------+              +----------------+
| Analysis Zone |              |   Arena Zone    |              | Library Zone   |
| (Left Column) |              | (Center Column) |              | (Right Column) |
|               |              |                 |              |                |
| - SynergyPanel|              | - HexBoard (4x7)|              | - HeroPool     |
| - StatsPanel  |              | - HeroInspector |              | - HeroCard     |
| - RelicList   |              | - Equipment     |              | - Filters      |
+---------------+              +-----------------+              +----------------+
```

### 1.1 Divisão das Zonas Visuais (Layout em 3 Colunas)
1. **Zona de Análise (Analysis Zone)**:
   - `SynergyPanel.jsx`: Renderiza sinergias de classe ativas, níveis de bônus atingidos (2/3/4) e cálculo preditivo de heróis necessários para o próximo tier.
   - `StatsPanel.jsx`: Painel consolidado com DPS global estimado e grade de atributos somados (HP, Atk, Def, Magia, Velocidade, Crítico, Mana).
   - `RelicList.jsx`: Gerenciador de relíquias globais de equipe com filtro por raridade e inserção inline.

2. **Zona da Arena Central (Arena Zone)**:
   - `HexBoard.jsx`: Campo de batalha com 28 células hexagonais montadas em geometria favo de mel (honeycomb), sobreposto ao cenário tático.
   - `HeroInspector.jsx`: Painel de inspeção do herói selecionado, permitindo configuração de Ranks (C, B, A, S), especializações e visualização de atributos individuais.
   - `Equipment.jsx` & `ItemPicker.jsx`: Gerenciamento de 5 slots de itens por personagem com restrição de duplicatas no mesmo herói.

3. **Zona de Biblioteca (Library Zone)**:
   - `HeroPool.jsx`: Grade com os 25 heróis do catálogo, busca instantânea e filtros por classe com ícones SVG customizados.

---

## 2. Tabuleiro Hexagonal (Honeycomb Coordinate System)

### 2.1 Mapeamento da Grade Uniforme
O tabuleiro utiliza um grid 4x7 (28 células uniformes):
- **4 linhas (r = 0..3)** e **7 colunas (c = 0..6)**.
- O array de estado principal é um vetor contíguo indexado de 0 a 27:
  $$\text{index}(r, c) = r \times 7 + c$$

### 2.2 Deslocamento de Linhas (Staggered Row Offset)
Para criar a malha favo de mel realista sem bibliotecas 3D pesadas, linhas ímpares recebem a classe CSS `.offset`, sofrendo um deslocamento horizontal de meio diâmetro de célula:
- Linhas 0 e 2: alinhamento padrão à esquerda.
- Linhas 1 e 3: margem/transform horizontal de offset (+50% do raio apotemático).

### 2.3 Máquina de Estados da Célula (`HexCell`)
Cada célula computa seu estado de forma pura via `getCellState`:
- `isSelected`: o herói nesta célula é o foco ativo no inspetor de detalhes.
- `isPicked`: herói destacado para translocação após primeiro clique.
- `isValidTarget`: célula vazia ou elegível para troca tática de posição.
- `isPlacementActive`: sinalizador global de que uma operação de posicionamento está em curso.

---

## 3. Motor Customizado de Drag & Drop (`useHeroDrag.js`)

### 3.1 Motivação Técnica
A API nativa de **HTML5 Drag and Drop** suprime deliberadamente eventos de rolagem de roda do mouse (`wheel`) durante o arraste. Em interfaces táticas densas, o usuário precisa ser capaz de rolar a página verticalmente enquanto move uma peça entre a biblioteca e o topo do tabuleiro.

### 3.2 Ciclo de Vida dos Pointer Events
```
[pointerdown] (botão esquerdo)
      |
      v
  Captura coordenadas iniciais (startX, startY)
  Registra listeners passivos de pointermove, pointerup, pointercancel
      |
      v
[pointermove]
      |
      +---> Se dist(hypot) <= 5px: Mantém como possível clique (evita jitter)
      |
      +---> Se dist(hypot) > 5px:
               - Ativa dragStarted = true
               - Adiciona classe 'hero-dragging' ao body
               - Renderiza elemento fantasma (ghost element) flutuante
               - Atualiza coordenadas transform: translate(x, y)
      |
      v
[pointerup]
      |
      +---> Identifica elemento sob o ponteiro via document.elementFromPoint(clientX, clientY)
      +---> Executa handleDrop com resolução de destino (célula hex ou slot reserva)
      +---> Remove elemento fantasma do DOM
      +---> Limpa listeners e suprime eventos de clique redundantes
```

---

## 4. Gerenciamento de Estado & Reducer

### 4.1 Estrutura do Estado (`AppState`)
- `main: (string | null)[]`: Array de 28 posições representando o campo.
- `reserve: (string | null)[]`: Array de 3 posições representando o banco de reservas.
- `selectedCharId: string | null`: ID do herói aberto no inspetor.
- `placementCharId: string | null`: ID do herói em trânsito de reposicionamento.
- `heroConfigs: Record<string, { rank: string, spec: string | null }>`: Configurações de progressão.
- `items: Record<string, (string | null)[]>`: Dicionário mapeando herói aos seus 5 slots de itens.
- `relics: string[]`: Lista global de relíquias ativas do time.

### 4.2 Invariantes de Regra de Negócio
1. **Limite Total de Membros**: $\text{count}(main) + \text{count}(reserve) \le 6$.
2. **Capacidade do Campo**: $\text{count}(main) \le 6$.
3. **Capacidade da Reserva**: $\text{count}(reserve) \le 3$.
4. **Unicidade de Itens**: Um mesmo herói não pode equipar instâncias duplicadas do mesmo item.
5. **Persistência Reativa**: A cada alteração bem-sucedida no reducer, o estado serializado é gravado no `localStorage` com sincronização de indicador de status (`savedState`).

---

## 5. Pipeline Matemático de Sinergias e Estatísticas

1. **Agregação de Classes**: Heróis híbridos (ex: primária e secundária) incrementam simultaneamente a contagem de ambas as classes.
2. **Resolução de Limiares (Thresholds)**: Limiares em 2, 3 e 4 membros concedem bônus escalonados definidos em `SYNERGY_CONFIG`.
3. **Cálculo de DPS & Atributos**:
   $$\text{TotalStat} = \text{BaseHeroStat} + \sum \text{ItemStats} + \sum \text{RelicStats}$$
   $$\text{EffectiveDPS} = f(\text{Atk}, \text{Speed}, \text{CritChance}, \text{CritDamage}, \text{SynergyMultipliers})$$
