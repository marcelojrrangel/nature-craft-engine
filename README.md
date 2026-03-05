# Boas-vindas ao seu projeto Lovable

## Informações do projeto

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## Como posso editar este código?

Existem várias formas de editar sua aplicação.

**Usar o Lovable**

Basta acessar o [Projeto Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) e começar a enviar prompts.

As alterações feitas via Lovable serão commitadas automaticamente neste repositório.

**Usar sua IDE preferida**

Se você quiser trabalhar localmente com sua própria IDE, pode clonar este repositório e enviar suas alterações. Os pushes também serão refletidos no Lovable.

O único requisito é ter Node.js e npm instalados - [instalar com nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Siga estes passos:

```sh
# Passo 1: Clone o repositório usando a URL Git do projeto.
git clone <YOUR_GIT_URL>

# Passo 2: Navegue até o diretório do projeto.
cd <YOUR_PROJECT_NAME>

# Passo 3: Instale as dependências necessárias.
npm i

# Passo 4: Inicie o servidor de desenvolvimento com recarregamento automático e preview instantâneo.
npm run dev
```

**Editar um arquivo diretamente no GitHub**

- Navegue até o(s) arquivo(s) desejado(s).
- Clique no botão "Edit" (ícone de lápis) no canto superior direito da visualização do arquivo.
- Faça suas alterações e commit.

**Usar GitHub Codespaces**

- Navegue até a página principal do seu repositório.
- Clique no botão "Code" (botão verde) próximo ao canto superior direito.
- Selecione a aba "Codespaces".
- Clique em "New codespace" para iniciar um novo ambiente Codespace.
- Edite os arquivos diretamente no Codespace e faça commit/push quando terminar.

## Quais tecnologias são usadas neste projeto?

Este projeto foi construído com:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Arquitetura de eventos (React ↔ Phaser)

O jogo usa um pequeno event bus tipado para desacoplar os controles da UI da cena do Phaser.

- Componentes React emitem eventos (botões da HUD e joystick)
- A `MainScene` do Phaser assina esses eventos e executa as ações de gameplay
- Não é mais necessária uma ponte direta via `window.__game*`

Eventos atuais:

- `joystickMove` → vetor de movimento `{ x, y }`
- `attack` → dispara ação de ataque
- `interact` → dispara ação de interação

Arquivos principais:

- `src/game/events.ts`
- `src/components/game/GameHUD.tsx`
- `src/components/game/Joystick.tsx`
- `src/game/scenes/MainScene.ts`

## Como posso publicar este projeto?

Basta abrir o [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) e clicar em Share -> Publish.

## Posso conectar um domínio personalizado ao meu projeto Lovable?

Sim, você pode!

Para conectar um domínio, vá em Project > Settings > Domains e clique em Connect Domain.

Leia mais aqui: [Como configurar um domínio personalizado](https://docs.lovable.dev/features/custom-domain#custom-domain)
