# Nature Craft Engine

Nature Craft Engine é um motor de jogo de sobrevivência e crafting 2D desenvolvido com **Phaser 3** e **React 18**. O projeto combina a potência de renderização e física do Phaser com a flexibilidade de interfaces do React, utilizando uma arquitetura modular baseada em componentes.

## 🚀 Tecnologias Core

- **Engine de Jogo**: [Phaser 3.90](https://phaser.io/)
- **Framework UI**: [React 18](https://reactjs.org/) com [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Gerenciamento de Estado**: Custom Reactive Store (Observer Pattern) com persistência em `LocalStorage`
- **Testes**: [Vitest](https://vitest.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)

## 🎮 Funcionalidades Principais

### 🏹 Sistema de Combate e Ferramentas
- **Combate Híbrido**: Suporte para ataques corpo-a-corpo (Espadas, Facas, Machados) e à distância (Arco e Flecha com física de projéteis).
- **Regras de Realidade**: Objetos exigem ferramentas específicas (ex: Árvores requerem Machado, Pedras requerem Picareta).
- **Munição**: Sistema de consumo de flechas integrado ao inventário.

### 🎒 Inventário e Crafting
- **Mesa de Trabalho**: Zona central para criação de ferramentas avançadas.
- **Barra Rápida (QuickBar)**: Atalhos numerados (1-5) para troca rápida de equipamentos.
- **Persistência**: Todo o progresso (inventário, posição, recursos coletados e estado dos NPCs) é salvo automaticamente no navegador.

### 🐻 NPCs e IA
- **Galinhas e Siris**: NPCs pacíficos com comportamento de perambulação (wander) e alimentação.
- **Urso Agressivo**: Primeiro inimigo hostil com detecção de raio, perseguição veloz e ataque de proximidade.
- **Barras de Vida**: Feedback visual dinâmico em todos os seres vivos e recursos em colheita.

### 🛡️ Safe Zone (Zona Segura)
- Raio de proteção ao redor da Bancada de Trabalho onde NPCs hostis são bloqueados fisicamente e perdem o interesse no jogador, permitindo a recuperação pós-morte.

## 🏗️ Arquitetura e Clean Code

O projeto segue princípios de **SOLID** e **Clean Architecture**, com foco em composição sobre herança:

- **HealthComponent**: Lógica pura de vida e dano, desacoplada da engine de física.
- **HealthBarRenderer**: Componente visual reutilizável para renderização de UI sobre sprites.
- **Event Bus**: Comunicação entre React e Phaser via `src/game/events.ts`, mantendo as camadas isoladas.
- **Snapshots de Estado**: Uso de `useSyncExternalStore` para re-renderizações eficientes da UI React apenas quando necessário.

## 🛠️ Guia de Desenvolvimento

### Instalação e Execução local

```sh
# Instalar dependências
npm install

# Rodar em modo desenvolvimento
npm run dev

# Executar testes unitários
npm test
```

### Comandos de Jogo
- **WASD / Setas**: Movimentação
- **Espaço**: Atacar / Usar Ferramenta
- **E / C**: Interagir com Bancada
- **I**: Abrir Inventário
- **Q**: Abrir Equipamentos
- **K**: Abrir Habilidades
- **1-5**: Selecionar Slot da Barra Rápida

## 📂 Estrutura de Pastas

- `src/components/game`: Componentes de UI do jogo (Modais, HUD).
- `src/game/components`: Componentes lógicos da nova arquitetura (Health, etc).
- `src/game/entities`: Classes de NPCs e IA.
- `src/game/scenes`: Cenas do Phaser (Boot, Main).
- `src/game/store.ts`: Store reativa central do jogo.
- `src/test`: Suite de testes automatizados.
- `docs/`: Documentação detalhada de processos (ex: `agent-refactor.md`).

---
Desenvolvido com ❤️ para entusiastas de jogos de sobrevivência.
