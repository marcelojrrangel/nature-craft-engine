# Nature Craft Engine — Contexto para Agentes

## Stack
- **Engine:** Phaser 3.90 (AUTO render, pixelArt, arcade physics, RESIZE scale)
- **UI:** React 18 + TailwindCSS + shadcn/ui + Lucide icons
- **State:** Custom reactive store (Observer pattern) with localStorage persistence
- **Build:** Vite + SWC, TypeScript 5.9
- **Tests:** Vitest + jsdom + testing-library
- **Alias:** `@` → `./src`

## Scripts
| Comando | Ação |
|---------|------|
| `npm run dev` | Dev server (port 8080) |
| `npm run build` | Production build |
| `npm run build:dev` | Dev build |
| `npm run lint` | ESLint check |
| `npm test` | Vitest run |
| `npm run test:watch` | Vitest watch |

## Estrutura de Pastas

```
src/
├── game/           # Motor do jogo (Phaser)
│   ├── components/ # HealthComponent, HealthBarRenderer
│   ├── core/       # interfaces.ts (IEntity, IHealth)
│   ├── entities/   # ChickenNPC, CrabNPC, OrcNPC, RabbitNPC
│   ├── scenes/     # BootScene, MainScene
│   ├── events.ts   # TypedEventBus (joystickMove, attack, interact, placeItem)
│   ├── PhaserGame.tsx  # Componente React que monta o Phaser
│   ├── store.ts    # GameStore (classe reativa central)
│   └── types.ts    # Itens, receitas, equipamentos, constantes
├── components/
│   ├── game/       # GameHUD, InventoryModal, CraftingModal, EquipmentModal,
│   │               # SkillsModal, Joystick, QuickBar
│   └── ui/         # 49 componentes shadcn/ui
├── hooks/          # useGameStore, useGameUI, useIsMobile, use-toast
├── lib/            # utils.ts (cn helper)
├── pages/          # Index (game page), NotFound
└── test/           # health.test, store.test, durability.test, example.test
```

## Arquitetura — GameStore (src/game/store.ts)

Classe singleton `GameStore` com subscribe/notify. Hooks React (`useGameStore`, `useGameUI`) usam `useSyncExternalStore` com snapshots cacheados.

### Estado principal
- `inventory: InventorySlot[]` (20 slots)
- `equipment: Equipment` (5 slots: head, hands, legs, accessory, mainHand)
- `quickBar: (string | null)[]` (5 slots, referenced by item ID)
- `playerX/Y, hp, maxHp`
- `skills: Record<string, Skill>` (cada ferramenta com level/xp)
- `resourceStates, chickenStates, crabStates, bearStates, rabbitStates` — estado dos NPCs/recursos no mapa
- `placedItems: PlacedItem[]`
- `respawnQueue: { id, delay, type }[]`
- UI booleans: `showInventory, showCrafting, showEquipment, showSkills`

### Métodos principais
- **Inventário:** `addItem`, `removeItem`, `countItem`, `hasItems`, `hasAmmo`, `consumeAmmo`
- **Uso:** `useItem` (comida → cura, fogueira → placeItem via event bus, armadura → equip)
- **Equipamento:** `equip`, `unequip`, `getEquippedTool`, `getQuickBarTool`
- **QuickBar:** `assignToQuickBar`, `removeFromQuickBar`, `selectQuickBar`, `validateQuickBarReferences`
- **Crafting:** `canCraft` (verifica ingredientes + estação), `craft` (consome ingredientes, adiciona resultado, dá XP)
- **Stats:** `getStats` (calcula dano/mineração/corte/velocidade base + bônus de equipamento + skill)
- **Skills:** `getXPForLevel` (100 * 1.5^level), `useTool` (ganha XP), `unlearnSkill`
- **Persistência:** `save`, `load`, `resetSave`
- **Dano:** `receiveDamage`, `gameOver`

### Arquitetura de dano e ferramentas
- `HARDNESS`: `wood: 10, stone: 20, iron_ore: 40, bronze_ore: 60, gold_ore: 80, none: 999`
- `TOOL_DAMAGE`: `fist: 5, wooden_sword: 10, stone_sword: 20, iron_sword: 35, bronze_sword: 50, gold_sword: 70, wooden_pickaxe: 8, ...`
- `TOOL_REQUIREMENTS`: map { recurso → toolType }
- `DROP_BONUS_CHANCE: 0.15` (chance de drop extra por nível da ferramenta)
- `BASE_DAMAGE: 10` (dano base corpo-a-corpo)

### Itens (ITEMS — 27 definidos em types.ts)
- **Recursos:** wood, stone, fiber, seed, stick, feather, flint, iron_ore, bronze_ore, gold_ore, raw_chicken, raw_crab_meat, raw_bear_meat, raw_rabbit_meat, chicken_egg, crab_shell, thick_fur, bone
- **Consumíveis:** cooked_chicken, cooked_crab_meat, cooked_bear_meat, cooked_rabbit_meat
- **Ferramentas:** wooden_sword, stone_sword, iron_sword, bronze_sword, gold_sword, wooden_pickaxe, stone_pickaxe, iron_pickaxe, bronze_pickaxe, gold_pickaxe, wooden_axe, stone_axe, iron_axe, bronze_axe, gold_axe, wooden_bow, stone_bow, iron_bow, bronze_bow, gold_bow, arrow
- **Armaduras:** wood_helmet, stone_helmet, iron_helmet, bronze_helmet, gold_helmet, wood_chestplate, stone_chestplate, iron_chestplate, bronze_chestplate, gold_chestplate, wood_boots, stone_boots, iron_boots, bronze_boots, gold_boots
- **Outros:** campfire, workbench
- **Comida:** cura 20-40 HP, bônus temporário de stats

### Receitas (RECIPES — 12 em types.ts)
- **Fogueira (campfire):** cooked_chicken, cooked_crab_meat, cooked_bear_meat, cooked_rabbit_meat
- **Bancada (workbench):** iron_helmet/chestplate/boots, bronze_helmet/chestplate/boots, iron_sword/pickaxe/axe/bow

## Event Bus (src/game/events.ts)
```ts
type GameEventMap = {
  joystickMove: { x: number; y: number };
  attack: undefined;
  interact: undefined;
  placeItem: { type: string; inventoryIndex: number };
};
```
Usado para comunicação React → Phaser (joystick, placeItem) e input (attack, interact).

## Configuração do Mundo (MainScene)

- **Grid:** 16x16 pixels por tile
- **Mapa:** 100x100 tiles, água nas bordas (5 tiles), chão de cascalho no centro
- **Recursos gerados:** ~60 árvores, ~20 árvores mortas, ~50 arbustos (4 variações), ~30 pedras grandes/médias/pequenas — fora da safe zone
- **Safe Zone:** Raio 100px ao redor da bancada central — NPCs hostis são repelidos fisicamente
- **NPCs:** 8 galinhas, 8 caranguejos, 2 orcs, 6 coelhos
- **Iluminação:** Light2D, luz ambiente 0x333333, luz do jogador (raio 120px, laranja suave)
- **Respawn:** Recursos e NPCs revivem após 30-120s (variável por tipo)

## Entidades (NPCs)

### Padrão arquitetural
Cada NPC é uma classe que estende `Phaser.Physics.Arcade.Sprite` com:
- `HealthComponent` (saúde, dano, morte)
- `HealthBarRenderer` (barra de vida visual)
- Máquina de estados (idle, walking, chasing, attacking, eating, scuttle, dead)
- Efeito de morte: mancha irregular no chão com fade out (decay)

### ChickenNPC
- 3 cores (white, black, brown) via `textureKey`
- Estados: idle → walking → eating (grama) → idle
- Passivo, foge ao tomar dano (moveSpeed: 60)

### CrabNPC
- Cor laranja/avermelhado
- Estados: idle → scuttle (movimento lateral)
- Fica perto da água (shore)
- Passivo

### OrcNPC
- Hostil, detectionRange: 140px, attackRange: 45px, attackCooldown: 1500ms
- Dano: 25 por ataque
- Persegue jogador, respeita safe zone (recua)
- moveSpeed: 80

### RabbitNPC
- Rápido (moveSpeed: 85), foge ao tomar dano
- Pequeno, difícil de acertar

## Sistema de Combate (MainScene)

- **Corpo-a-corpo:** Espaço + direção → animação de ataque, verifica sobreposição com NPCs/recursos
- **À distância:** Arco equipado → Espaço → projétil `ArrowProjectile` com física (velocity 400)
- **Flechas:** Consumidas do inventário via `gameStore.consumeAmmo()`
- **Coleta:** Recursos (árvores, pedras, arbustos) têm HP, dropam loot ao morrer
- **Particulas:** Ao acertar recurso/NPC

## Componentes React

### GameHUD
- Barra de HP com animação de hit (classe CSS `animate-pulse`)
- Recursos monitorados: madeira, pedra, ferro, bronze, ouro
- QuickBar embutida, efeito de shake ao tomar dano

### InventoryModal (5×4 grid, 20 slots)
- Click → usar item (comida, fogueira, armadura)
- Botão direito → contexto → atribuir à QuickBar
- Tooltip com info do item e bônus

### CraftingModal
- Filtrado por estação: `workbench` ou `campfire`
- Ingredientes em verde (suficiente) / vermelho (insuficiente)
- Botão "Criar" com validação

### EquipmentModal (5 slots)
- Slots: head, hands, legs, accessory, mainHand
- Click para desequipar
- Exibe stats atuais (mineração, corte, velocidade)

### SkillsModal
- Lista de skills com nível, XP, barra de progresso
- `unlearnSkill` (reset) com confirmação de duplo clique

## Persistência
- `localStorage` via `gameStore.save()/load()`
- Salva: inventário, equipamento, quickBar, posição, HP, skills, estados de recursos/NPCs, itens colocados, respawnQueue

## Convenções de Código

- **Estilo:** TypeScript estrito desabilitado (`strict: false`, `noImplicitAny: false`), sem comentários em código
- **Alias de import:** `@/game/store`, `@/components/ui/button`, etc.
- **shadcn/ui:** Componentes em `src/components/ui/`, prefix `cn()` do `tailwind-merge`
- **CSS:** Tema escuro via CSS variables em `src/index.css`, fontes pixel (`Press Start 2P`, `VT323`)
- **Testes:** Arquivos `*.test.ts` em `src/test/`, sem Phaser (mock localStorage/jsdom)
- **Segurança:** Verificações `sys.isActive()` em callbacks de input/posicionamento para evitar null references em trocas de cena

## Comandos de Jogo
| Tecla | Ação |
|-------|------|
| WASD / Setas | Movimentação |
| Espaço | Atacar / Usar ferramenta |
| E / C | Interagir com bancada |
| I | Abrir inventário |
| Q | Abrir equipamentos |
| K | Abrir habilidades |
| 1-5 | Selecionar slot da QuickBar |
| ESC | Fechar modais |

## Assets
- **Pack:** Pixel Crawler (jogador: Body_A 64x64 4 direções)
- **Ambiente:** árvores (32x62), arbustos (4 variações), pedras (3 tamanhos), bancada, fogueira
- **NPCs:** Galinhas 3 cores, caranguejo, orc, coelho
- **Formato:** Spritesheet PNG, tiles 16x16

## Procedimento — Substituir NPC procedural por Spritesheet Profissional

Quando um NPC usa textura gerada por Canvas2D (`this.make.graphics` ou `this.textures.createCanvas`), siga estes passos:

1. **Encontrar asset substituto** no OpenGameArt.org (filtro: LPC, CC-BY/CC0, pixel art, tamanho compatível)
2. **Extrair frames** necessários com Python/Pillow:
   - Abrir a spritesheet fonte, converter paleta → RGBA
   - Tornar magenta (255,0,220) transparente
   - Extrair as linhas/colunas de animação desejadas (ex: east-facing para usar flipX)
   - Montar strip vertical única: idle(1) + walk(N) + attack(N) + die(N)
   - Salvar em `public/assets/<npc>_sheet.png`
3. **Atualizar BootScene.ts**:
   - NO preload: `this.load.spritesheet('<npc>_sheet', 'assets/<npc>_sheet.png', { frameWidth: W, frameHeight: H })`
   - NO create: remover o bloco procedural correspondente, substituir por comentário
4. **Atualizar <Npc>NPC.ts**:
   - Ajustar `body.setSize(w, h).setOffset(x, y)` para o novo frame size
   - Ajustar `new HealthBarRenderer(..., width, ...)` (≈ frameWidth - 12)
   - Ajustar índices das animações: idle(0), walk(1..N), attack(N+1..M), die(M+1..K)
5. **Build & verificar**: `npm run build` sem erros; `npm run dev` e testar no navegador
6. **Commit**: mensagem descritiva em português

Exemplo real (urso):
- Fonte: https://opengameart.org/content/lpc-bears-deer-lions-and-more (CC-BY 4.0)
- Individual: `bear, grizzly.png` (320×768, 5×12 grid, frames 64×64)
- Usou east-facing (row 2 walk, row 6 attack, row 10 die) + frame 0 como idle
- Hitbox: 36×28, offset(14,18) num sprite 64×64

## Próximos Passos (do PROJECT_CONTEXT.md)
1. ~~Substituir assets do Urso~~ e Coelho por versões profissionais ✅ Concluído
2. ~~Implementar mineração de minérios (Ferro, Bronze, Ouro)~~ ✅ Concluído
3. ~~Melhorar os ícones de itens na UI para combinar com o estilo Pixel Crawler~~ ✅ Concluído
