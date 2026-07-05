# Plano de Melhorias — Nature Craft Engine

> **Solicitado por:** Usuário  
> **Responsável:** Orion (Master Orchestrator)  
> **Agentes consultados:** architect, dev, qa, pm, analyst, ux  
> **Data:** 2026-07-05  
> **Status:** Rascunho — aguardando aprovação para estudos detalhados

---

## Sumário Executivo (Orion — Master)

Após analisar o projeto Nature Craft Engine (Phaser 3.90 + React 18 + TypeScript, Vite, TailwindCSS, shadcn/ui), a equipe de agentes AIOX identificou **25 oportunidades de melhoria** distribuídas em 7 categorias. Este documento consolida as recomendações de cada agente e propõe um plano de estudo prioritizado.

---

## 1. 🏛️ Architect (Aria) — Arquitetura e Stack

### 1.1 Performance da GameStore
**Problema:** A `GameStore` é um objeto monolítico com 40+ propriedades e métodos. Cada `notify()` dispara re-renderização completa de todos os hooks React que usam `useSyncExternalStore`.

**Recomendação:**
- Fragmentar a store em slices (inventorySlice, equipmentSlice, worldSlice, uiSlice) com notify granular
- Avaliar migração para Zustand (já presente nas dependências via `useSyncExternalStore` — mas poderia ser substituído)
- Implementar `selectors` memoizados para evitar snapshots completos

**Estudo necessário:** Benchmark de renderização React com DevTools Profiler; comparar solução atual vs Zustand vs Jotai.

### 1.2 Separação Phaser ↔ React
**Problema:** O acoplamento entre Phaser e React é feito via `TypedEventBus` e `gameStore` global. Não há barreira clara entre camadas.

**Recomendação:**
- Criar uma camada de adaptador (GameAdapter) que abstrai o Phaser para o React
- Transformar `gameStore` em um "estado do jogo" puro (sem depender de eventos Phaser)
- Usar portas e adaptadores (Clean Architecture) para isolar o motor de jogo

**Estudo necessário:** Analisar event bus atual; documentar todos os pontos de acoplamento; pesquisar padrões de integração Phaser + React em projetos maiores.

### 1.3 ECS (Entity Component System)
**Problema:** NPCs usam herança direta (`Phaser.Physics.Arcade.Sprite`) com `HealthComponent`, `HealthBarRenderer` injectados manualmente. À medida que mais entidades forem adicionadas, isso se torna difícil de manter.

**Recomendação:**
- Migrar para ECS completo usando biblioteca como `perform-ecs` ou `geotic`
- Cada entidade seria um conjunto de componentes (Position, Health, Render, AI, Combat)
- Sistemas processariam entidades por tipo de componente

**Estudo necessário:** Pesquisar ECS para Phaser 3; prototipar com 2 tipos de NPC; comparar performance.

### 1.4 State Persistence
**Problema:** `localStorage` síncrono com 5MB de limite. Para save blobs grandes (mundo procedural), será insuficiente.

**Recomendação:**
- Avaliar `IndexedDB` via `idb-keyval` para saves maiores
- Implementar compressão (lz-string) nos dados serializados
- Adicionar sistema de migração de schema para saves antigos

**Estudo necessário:** Testar limite de save atual; pesquisar soluções de armazenamento cross-browser.

### 1.5 Bundle Size
**Problema:** Phaser 3 tem ~1.2MB minified. shadcn/ui adiciona ~49 componentes, muitos não utilizados.

**Recomendação:**
- Implementar code splitting: carregar Phaser apenas quando a página do jogo for acessada (lazy load)
- Remover shadcn/ui não utilizado (auditar imports)
- Tree-shaking de assets não usados no BootScene

**Estudo necessário:** `npm run build` com `--report`; Auditar bundle com `vite-bundle-visualizer`.

---

## 2. 💻 Dev (Dex) — Código e Ferramentas

### 2.1 TypeScript Strict Mode
**Problema:** `strict: false`, `noImplicitAny: false`, `strictNullChecks: false`. Isso permite bugs silenciosos.

**Recomendação:**
- Ativar strict mode gradualmente, arquivo por arquivo
- Começar por `src/test/` (já tem tipos mais limpos)
- Depois `src/game/types.ts` e `src/game/store.ts`
- Por último `src/game/scenes/MainScene.ts` (mais complexo)

**Estudo necessário:** `tsc --noEmit` com strict ativado; contar e categorizar erros; estimar esforço de correção.

### 2.2 ESLint + Prettier
**Problema:** ESLint configurado mas sem Prettier integrado. Sem formatação consistente.

**Recomendação:**
- Adicionar Prettier com `eslint-plugin-prettier`
- Configurar husky + lint-staged para lint/format em pre-commit
- Adicionar script `npm run format`

**Estudo necessário:** Verificar conflitos ESLint ↔ Prettier; testar integração.

### 2.3 Test Coverage
**Problema:** Apenas 4 arquivos de teste (health.test.ts, store.test.ts, durability.test.ts, example.test.ts). Cobertura estimada < 10%.

**Recomendação:**
- Adicionar `@vitest/coverage-v8` e configurar `npm run coverage`
- Priorizar testes para: `store.ts` (core), `events.ts`, NPC entities, `types.ts` (constantes)
- Testar cenários de borda em `canCraft`, `useItem`, `getStats`

**Estudo necessário:** Executar `vitest --coverage` com configuração básica; mapear áreas críticas sem teste.

### 2.4 Docker/Dev Environment
**Problema:** Sem ambiente containerizado para desenvolvimento.

**Recomendação:**
- Docker Compose com Vite dev server + Nginx para produção
- `Dockerfile` multi-stage (build + serve)

**Estudo necessário:** Pesquisar melhor base image para Node + Vite.

### 2.5 Git Workflow
**Problema:** Repositório não inicializado como git (`Is a git repository: false`).

**Recomendação:**
- `git init` e configurar `.gitignore` adequado
- Branch strategy: `main` + `feature/` branches
- Conventional commits

**Estudo necessário:** N/A — ação imediata.

---

## 3. ✅ QA (Quinn) — Qualidade e Testes

### 3.1 Testes de Integração Phaser
**Problema:** Testes atuais mockam localStorage/jsdom mas não testam interação Phaser ↔ Store.

**Recomendação:**
- Usar `phaser-test-utils` ou `jest-phaser` para testes de integração
- Testar: ataque reduz HP do NPC, coleta adiciona ao inventário, morte → drop

**Estudo necessário:** Pesquisar ferramentas de teste para Phaser 3.

### 3.2 E2E Testing
**Problema:** Sem testes ponta-a-ponta.

**Recomendação:**
- Playwright para testes E2E (já configurado como MCP server no AIOX)
- Testar: fluxo completo de login → mover → coletar → craft → equipar

**Estudo necessário:** Instalar Playwright; criar 1 teste E2E de smoke test.

### 3.3 Accessibility
**Problema:** Jogo não considera acessibilidade (contraste, teclado, leitores de tela).

**Recomendação:**
- Auditoria de contraste nos modais
- Garantir que todos os elementos interativos são acessíveis por teclado
- Adicionar `aria-label` em elementos do HUD

**Estudo necessário:** Lighthouse Accessibility audit; lista de melhorias.

### 3.4 Error Boundaries
**Problema:** Sem Error Boundaries no React. Um erro no Phaser pode quebrar toda a UI.

**Recomendação:**
- Adicionar ErrorBoundary ao redor de `<PhaserGame />`
- Log de erros para console/dashboard

**Estudo necessário:** Implementar e testar fallback UI.

---

## 4. 📋 PM — Produto e Features

### 4.1 Missing Features (Market Gap)
**Problema:** Comparado a jogos similares (Stardew Valley, Craftopia), faltam:
- Missões/quests
- Dia/noite com ciclo
- Mapa mínimo (minimap)
- Sistema de clima

**Recomendação:**
- Priorizar ciclo dia/noite (maior impacto visual e de gameplay)
- Depois minimap
- Depois quests simples

**Estudo necessário:** Análise competitiva detalhada; survey de jogadores.

### 4.2 Mobiles First
**Problema:** Joystick touch implementado, mas UI não é responsiva para mobile.

**Recomendação:**
- Modais em fullscreen em telas < 768px
- QuickBar adaptável (deslizante)
- Botões maiores para touch

**Estudo necessário:** Testar em 3 dispositivos reais; criar protótipo mobile.

### 4.3 Onboarding/Tutorial
**Problema:** Jogador inicia sem tutorial ou guia.

**Recomendação:**
- Tutorial interativo (highlight nos controles)
- Missão inicial guiada (colete madeira, faça fogueira)
- Tooltips contextuais

**Estudo necessário:** Pesquisar padrões de tutorial em jogos 2D.

---

## 5. 🔍 Analyst (Atlas) — Pesquisa e Mercado

### 5.1 Competitor Analysis
**Problema:** Não há análise documentada de concorrentes.

**Recomendação:**
- Analisar: Stardew Valley (crafting/survival), Core Keeper (top-down 2D), Terraria (mineração/combate)
- Identificar diferenciais do Nature Craft (ex: arquitetura modular, AIOX agents)
- Documentar no `docs/competitor-analysis.md`

**Estudo necessário:** Pesquisa de mercado; matriz de features; SWOT.

### 5.2 Target Audience
**Problema:** Público-alvo não definido.

**Recomendação:**
- Definir personas: "Casual Gamer", "Survival Enthusiast", "Dev/Hacker" (que contribui)
- Priorizar features por persona

**Estudo necessário:** Pesquisa qualitativa; entrevistas com potenciais usuários.

### 5.3 Technology Radar
**Problema:** Stack atual foi escolhida sem análise comparativa documentada.

**Recomendação:**
- Comparar Phaser 3 vs Godot (web export) vs PixiJS vs Unity (WebGL)
- Comparar React + shadcn/ui vs SolidJS vs Svelte para UI overlay

**Estudo necessário:** Protótipo de 1 tela em cada alternativa; benchmark de performance.

---

## 6. 🎨 UX (Uma) — Experiência e Design

### 6.1 Design System & Tokens
**Problema:** Cores definidas em CSS variables misturadas com Tailwind. Sem design system coeso.

**Recomendação:**
- Extrair tokens de design: cores, tipografia, spacing, radius
- Criar tema consistente no Tailwind
- Documentar no Storybook

**Estudo necessário:** Auditar cores atuais; criar palette unificada.

### 6.2 HUD Redesign
**Problema:** HUD atual é funcional mas sem polimento visual.

**Recomendação:**
- Barra de HP com gradiente e animação suave
- Ícones para recursos (madeira/pedra/ferro)
- Transições suaves entre modais (fade/slide)

**Estudo necessário:** Criar mockups no Figma; prototipar animações.

### 6.3 Responsive & Mobile UX
**Problema:** Joystick funciona mas UX mobile é pobre (modais não adaptados).

**Recomendação:**
- Redesenhar InventoryModal para mobile (grid adaptável)
- QuickBar vertical na lateral em landscape
- Gestos: swipe para fechar modal, tap-and-hold para info

**Estudo necessário:** Protótipo mobile interativo; teste de usabilidade.

### 6.4 Game Feel & Juice
**Problema:** Falta "juice" — feedback visual/sonoro para ações.

**Recomendação:**
- Screen shake ao tomar dano (já tem básico — melhorar)
- Partículas em todas as ações (coleta, ataque, craft)
- Efeitos sonoros (passos, ataque, coleta, craft, UI)
- Transições de cena (fade in/out)

**Estudo necessário:** Pesquisar ferramentas de áudio para web (Howler.js, WebAudio API); coletar assets sonoros gratuitos.

---

## 7. ⚡ DevOps — Infraestrutura

### 7.1 CI/CD Pipeline
**Problema:** Sem integração contínua.

**Recomendação:**
- GitHub Actions para CI: lint → test → build
- Deploy automático para GitHub Pages ou Vercel
- Quality gates: lint + test + build + typecheck

### 7.2 Git Init
**Problema:** Repositório não inicializado.

**Recomendação:**
```bash
git init
git add .
git commit -m "feat: initial commit — Nature Craft Engine"
```

### 7.3 MCP + AIOX Integration
Já há suporte MCP via `.aiox-core`. Explorar uso de agentes AIOX para:
- `@dev` para implementar histórias
- `@qa` para validar PRs
- `@architect` para revisões de arquitetura

---

## Priorização

| Prioridade | Área | Item | Esforço | Impacto |
|-----------|------|------|---------|---------|
| P0 | DevOps | Git init + CI | 1h | 🔥 Crítico |
| P0 | Code | TypeScript strict | 4h | 🔥 Crítico |
| P0 | QA | Test coverage (store) | 3h | 🔥 Crítico |
| P1 | Arch | Store fragmentation | 8h | ⚡ Alto |
| P1 | UX | HUD redesign | 12h | ⚡ Alto |
| P1 | Dev | ESLint + Prettier | 2h | ⚡ Alto |
| P1 | QA | Error Boundaries | 2h | ⚡ Alto |
| P2 | Arch | Bundle size | 4h | 📊 Médio |
| P2 | Product | Mobile first | 16h | 📊 Médio |
| P2 | Analyst | Competitor analysis | 6h | 📊 Médio |
| P3 | Arch | ECS migration | 40h | 🔮 Futuro |
| P3 | UX | Game feel/juice | 20h | 🔮 Futuro |
| P3 | Product | Day/night cycle | 30h | 🔮 Futuro |

---

## Plano de Estudo Recomendado

### Fase 1 — Diagnóstico (1-2 dias)
1. `@analyst` — Análise competitiva (competitor-analysis)
2. `@architect` — Auditoria de bundle (vite-bundle-visualizer)
3. `@qa` — Cobertura de testes atual (vitest --coverage)
4. `@dev` — TypeScript strict scan (tsc --noEmit)

### Fase 2 — Quick Wins (3-5 dias)
1. `@devops` — Git init + CI + lint-staged
2. `@dev` — ESLint + Prettier + husky
3. `@dev` — TypeScript strict (modo file-by-file)
4. `@qa` — Testes para store.ts e types.ts
5. `@qa` — Error Boundaries

### Fase 3 — Arquitetura (1-2 semanas)
1. `@architect` — Store fragmentation (Zustand ou slices)
2. `@architect` — Bundle splitting (Phaser lazy load)
3. `@architect` — State persistence (IndexedDB)

### Fase 4 — Produto (2-4 semanas)
1. `@ux` — HUD redesign + design tokens
2. `@ux` — Mobile responsive
3. `@pm` — Tutorial/onboarding
4. `@dev` — Game feel improvements

### Fase 5 — Evolução (1-2 meses)
1. `@architect` — ECS research + prototyping
2. `@pm` — Day/night cycle
3. `@pm` — Quest system
4. `@ux` — Sound effects

---

> **Próximo passo:** Deseja que eu ative agentes específicos para iniciar alguma fase?  
> Use `@agent *command` para ativar, ex: `@analyst *create-deep-research-prompt`  
> — Orion, orquestrando o sistema 🎯
