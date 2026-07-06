# Visual Review: Animations

## Objetivo
Revisar os estados de animação de todas as entidades do jogo (idle, walk, run, attack, death, etc.)

## O que verificar
1. **Transições suaves** — As animações fluem naturalmente entre estados?
2. **Timing adequado** — Frame rate consistente com o estilo do jogo
3. **Direcional** — 4 direções (cima, baixo, esquerda, direita) implementadas?
4. **Sincronia** — Animação de ataque sincronizada com o frame de dano?
5. **Death effect** — Animação de morte + decalque no chão?
6. **Physics sync** — Corpo físico acompanha a animação corretamente?

## Código a revisar
- `src/game/entities/*.ts` — Definições de animação de cada entidade
- `src/game/scenes/BootScene.ts` — Carregamento de spritesheets
- `src/game/scenes/MainScene.ts` — Criação de animações no Phaser
