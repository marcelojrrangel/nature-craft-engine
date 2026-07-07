# Nature Craft Engine — Roadmap de Desenvolvimento

## Estrutura de Fases

Organização incremental com entregas jogáveis ao final de cada fase.

---

### Fase 1 — Fundação (Concluída)

| Item | Escopo | Descrição |
|------|--------|-----------|
| Assets profissionais (urso, coelho) | M | Substituição de sprites procedurais por spritesheets CC0 do OpenGameArt.org |
| Mineração de minérios | M | Implementação de mineração para ferro, bronze e ouro com dureza e drop próprios |
| Ícones de itens na UI | P | Redesenho dos ícones para estilo Pixel Crawler, coesão visual |
| Bundle e build | P | Configuração Vite + SWC para build otimizado |
| VFX e partículas | M | Efeitos visuais de ataque, coleta, dano e morte |
| Ciclo dia/noite | M | Iluminação dinâmica com Light2D, ambiente escuro, tocha do jogador |
| Sistema de clima | M | Chuva com partículas, efeito sonoro, impacto visual no ambiente |
| NPCs — Chicken, Crab, Orc, Rabbit | G | Entidades com HealthComponent, HealthBarRenderer, máquina de estados, loot, respawn |
| Sistema de quests | M | Estrutura de missões com progresso e recompensas |
| Testes automatizados | M | Vitest + jsdom para store, health, durability, exemplo |
| Balanceamento inicial | M | Ajuste de dano, drop rates, XP, crafting costs |
| Sistema de som (SFX) | M | Efeitos sonoros para ações do jogador, NPCs e ambiente |

---

### Fase 2 — Expansão de Conteúdo

| Item | Escopo | Dependências | Descrição |
|------|--------|--------------|-----------|
| Bioma Deserto | G | Fase 1 | Novo bioma com areia, cactos, oasis; recursos: areia, vidro, escorpião NPC hostil |
| Bioma Neve | G | Fase 1 | Bioma gelado com neve, árvores congeladas, urso-polar; recursos: gelo, cristal |
| Bioma Pântano | G | Fase 1 | Região pantanosa com névoa, sapos, cobras; recursos: barro, plantas raras |
| Novos NPCs passivos | M | Fase 1 | Cervo, pássaro, peixe (decorativo / drop de carne e penas) |
| Novos NPCs hostis | M | Fase 1 | Lobo, aranha, esqueleto (cada um com padrão de ataque único) |
| Árvore de crafting expandida | G | Fase 2 — minérios | Lingotes de metal (ferro, bronze, ouro) → ferramentas, armaduras, armas superiores |
| Sistema de plantio/farming | G | Fase 1 — sementes | Enxada como ferramenta, arado, plantio, rega, colheita; ciclo sazonal básico |
| Save manual com múltiplos slots | M | Fase 1 | Interface de save/load com 3+ slots, confirmação antes de sobrescrever |

---

### Fase 3 — Polimento e Experiência

| Item | Escopo | Dependências | Descrição |
|------|--------|--------------|-----------|
| Tutorial interativo | G | Fase 2 | Sequência guiada de boas-vindas, movimentação, coleta, crafting, combate |
| Dicas iniciais (tooltips contextual) | P | Fase 2 | Tooltips nos primeiros segundos de jogo explicando UI e mecânicas |
| Upgrade visual dos modais | M | Fase 2 | Animações de entrada/saída, transições suaves, partículas decorativas |
| Modo mobile completo | G | Fase 3 — modais | Revisão da UI tátil, hotkeys adaptadas, joystick responsivo, testagem em dispositivo real |
| Música de fundo (BGM) | M | Fase 2 | Trilha sonora CC0 por bioma (calma para safe zone, tensa para hostis) |

---

### Fase 4 — Profissionalização

| Item | Escopo | Dependências | Descrição |
|------|--------|--------------|-----------|
| Otimização de performance | G | Fase 3 | Object pooling para partículas/projéteis, frustum culling, batched rendering |
| Suporte a múltiplos idiomas (i18n) | M | Fase 3 | Estrutura de tradução JSON, detecção automática + seletor manual |
| Tela de título / menu principal | M | Fase 3 | Tela inicial com arte conceitual, botões Novo Jogo, Carregar, Configurações |
| Sistema de achievements | M | Fase 3 | Conquistas desbloqueáveis com notificação visual e salvamento persistente |
