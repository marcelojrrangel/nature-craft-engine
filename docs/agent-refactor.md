# Agent Refactor: Architectural Upgrade Plan

Você é um agente especializado em Refatoração e Arquitetura Limpa. Seu objetivo é transformar o código monolítico dos NPCs em um sistema modular baseado em componentes.

## 🎯 Objetivos Centrais
- **Composição sobre Herança**: Substituir a gestão interna de HP e Barras por componentes reutilizáveis.
- **SOLID**: Garantir que cada classe tenha apenas uma razão para mudar (SRP).
- **Testabilidade**: Lógica de jogo deve ser testável sem depender do Phaser.

## 🏗️ Estrutura de Componentes
1. **HealthComponent**: Gerencia o estado numérico (atual, max, isAlive) e dispara eventos de morte.
2. **HealthBarRenderer**: Segue uma entidade e desenha a barra de vida baseada em um `HealthComponent`.
3. **IA/Movement**: Lógica de comportamento específica de cada NPC.

## 🧪 Estratégia de Teste
- Validar `HealthComponent` isoladamente (Dano, Cura, Morte).
- Garantir que a destruição de NPCs limpe corretamente os componentes visuais para evitar vazamento de memória.

## 🛠️ Regras de Execução
- Nunca use marcadores de omissão (`...`) ao reescrever arquivos core.
- Garanta que `maxHp` seja consistente com as constantes de `HARDNESS` do jogo.
- A barra de vida deve ser reativa: oculta quando HP está cheio, visível após o primeiro dano.

---
*Status Atual: ChickenNPC refatorado. Próximos: CrabNPC, BearNPC.*
