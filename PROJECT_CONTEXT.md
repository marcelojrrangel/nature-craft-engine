# Nature Quest: Survival & Craft - Contexto do Projeto

Este arquivo serve como um guia para retomar o desenvolvimento do jogo, contendo as decisões arquiteturais, assets utilizados e o estado atual da implementação.

## 🚀 Pilha Tecnológica
- **Motor**: Phaser 3.x
- **UI**: React 18 + TailwindCSS + Lucide Icons
- **Estado**: Custom Store (gameStore) para persistência e reatividade.
- **Estilo**: Pixel Art de alta fidelidade (16x16 grid).

## 🗺️ Configuração do Mundo
- **Grid (TILE)**: 16x16 pixels (Migrado de 32x32 para maior granularidade).
- **Tamanho do Mapa**: 100x100 tiles.
- **Safe Zone**: Raio de 100px ao redor da Bancada (Workbench) onde recursos não nascem. Visualizada com um pontilhado circular ultra-fino (120 pontos).
- **Chão**: Asset `chao_cascalho.png` aplicado em todo o continente.

## 🎨 Assets Utilizados (Pixel Crawler Pack)
- **Jogador**: `Body_A` (64x64 frames) com animações de Idle, Run e Attack em 4 direções.
- **Ambiente**:
  - Pedras: `pedra_pequena`, `pedra_media`, `pedra_grande` (assets individuais).
  - Árvores: `arvore_comum.png` (32x62) e `arvore_seca.png` (26x47).
  - Arbustos: 4 variações de `arbusto_verde` sorteados aleatoriamente.
  - Fogueira: `Bonfire_02-Sheet` (Base) e `Fire_01-Sheet` (Fogo Animado).
- **NPCs**:
  - Galinhas: 3 cores (Branca, Preta, Marrom) com animações completas.
  - Caranguejos: Asset profissional com animação de "Scuttle" lateral.

## 🧠 Lógica e Mecânicas
- **Iluminação**: Sistema `Light2D` nativo do Phaser. Luz ambiente 0x333333. Tochas, bancada e fogueiras emitem luz dinâmica.
- **Combate/Coleta**: 
  - Tecla `Espaço` para atacar/coletar.
  - Animação de ataque direcional bloqueia movimento momentaneamente.
  - Efeito de Morte: NPCs deixam uma mancha irregular no chão com a cor do animal, que sofre "decay" (some gradualmente após alguns segundos).
- **Segurança**: Eventos globais de input e posicionamento verificam `sys.isActive()` para evitar erros de "null references" em trocas de cena ou re-renderizações do React.

## 🛠️ Próximos Passos
1. Substituir assets do **Urso** e **Coelho** por versões profissionais.
2. Implementar mineração de minérios (Ferro, Bronze, Ouro).
3. Melhorar os ícones de itens na UI para combinar com o estilo Pixel Crawler.
