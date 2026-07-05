# Diagnóstico Inicial — Nature Craft Engine

> Gerado em: 2026-07-05
> Branch: `feature/melhorias-aiox`

---

## 1. TypeScript Strict Mode

**Resultado: ✅ Zero erros**

O projeto compila sem erros com `--strict` ativado. A `tsconfig.json` atual tem `strict: false`, `noImplicitAny: false`, `strictNullChecks: false`, mas o código já é compatível com strict mode.

**Ação:** Ativar strict mode permanentemente na `tsconfig.json`.

---

## 2. Cobertura de Testes

**Resultado: ⚠️ 6,95% global**

| Área | Cobertura | Status |
|------|-----------|--------|
| `store.ts` | 93,1% statements | ✅ |
| `types.ts` | 100% | ✅ |
| `HealthComponent.ts` | 100% | ✅ |
| `HealthBarRenderer.ts` | 0% | ❌ |
| `ChickenNPC.ts` | 0% | ❌ |
| `CrabNPC.ts` | 0% | ❌ |
| `OrcNPC.ts` | 0% | ❌ |
| `RabbitNPC.ts` | 0% | ❌ |
| `MainScene.ts` | 0% | ❌ |
| `BootScene.ts` | 0% | ❌ |
| `events.ts` | 0% | ❌ |
| `PhaserGame.tsx` | 0% | ❌ |
| Hooks (useGameStore, etc.) | 0% | ❌ |
| Componentes React | 0% | ❌ |
| shadcn/ui (49 comps) | 0% | ❌ (não crítico) |

**Testes: 36 passing, 4 files**

---

## 3. Bundle Size

**Resultado: ⚠️ 2.113 KB JS (528 KB gzip)**

| Asset | Tamanho | Gzip |
|-------|---------|------|
| `index.html` | 1.24 KB | 0.57 KB |
| CSS | 66.38 KB | 11.55 KB |
| **JS (total)** | **2.113 KB** | **528 KB** |
| Chunk warning | >500 KB | — |

**Warning:** Vite reporta chunks maiores que 500 KB após minificação. Recomenda usar dynamic import ou `manualChunks`.

---

## Ações Recomendadas (Quick Wins)

1. **tsconfig.json** — Ativar `strict: true` (risco zero, já compila)
2. **Testes** — Priorizar `events.ts`, `HealthBarRenderer.ts`, `useGameStore.ts`
3. **Bundle** — Lazy load do Phaser (`PhaserGame.tsx`) e remover shadcn/ui não utilizado
