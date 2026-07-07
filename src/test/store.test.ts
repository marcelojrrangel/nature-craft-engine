import { describe, it, expect, beforeEach, vi } from 'vitest';
import { gameStore } from '../game/store';
import { ITEMS, RECIPES } from '../game/types';

// Mock do localStorage e window.location para evitar erros no ambiente de teste
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(window, 'location', { value: { reload: vi.fn() }, writable: true });
// Mock do alert para não travar os testes
window.alert = vi.fn();

describe('GameStore - Logica Central', () => {
  beforeEach(() => {
    gameStore.resetSave();
    vi.clearAllMocks();
  });

  describe('Gerenciamento de Inventario', () => {
    it('deve adicionar um item nao empilhavel corretamente', () => {
      const machado = ITEMS.axe; // Ferramentas nao sao empilhaveis
      gameStore.addItem(machado, 1);
      expect(gameStore.countItem(machado.id)).toBe(1);
      expect(gameStore.inventory[0].item?.id).toBe(machado.id);
    });

    it('deve empilhar itens empilhaveis no mesmo slot', () => {
      const madeira = ITEMS.wood;
      gameStore.addItem(madeira, 5);
      gameStore.addItem(madeira, 3);
      expect(gameStore.countItem(madeira.id)).toBe(8);
      expect(gameStore.inventory[0].quantity).toBe(8);
    });

    it('deve criar um novo slot quando o stack maximo for atingido', () => {
      const madeira = ITEMS.wood; // maxStack: 64
      gameStore.addItem(madeira, 70);
      expect(gameStore.inventory[0].quantity).toBe(64);
      expect(gameStore.inventory[1].quantity).toBe(6);
    });

    it('deve remover itens corretamente', () => {
      gameStore.addItem(ITEMS.stone, 10);
      gameStore.removeItem(ITEMS.stone.id, 4);
      expect(gameStore.countItem(ITEMS.stone.id)).toBe(6);
    });

    it('deve retornar falso se tentar remover mais itens do que possui', () => {
      gameStore.addItem(ITEMS.stone, 5);
      const result = gameStore.removeItem(ITEMS.stone.id, 10);
      expect(result).toBe(false);
      expect(gameStore.countItem(ITEMS.stone.id)).toBe(0);
    });
  });

  describe('Sistema de Crafting', () => {
    it('deve validar se o jogador tem ingredientes para uma receita', () => {
      // Receita da Picareta: 2 Madeira, 3 Pedra
      const receitaPicareta = RECIPES.find(r => r.id === 'pickaxe')!;
      expect(gameStore.canCraft(receitaPicareta)).toBe(false);

      gameStore.addItem(ITEMS.wood, 2);
      gameStore.addItem(ITEMS.stone, 3);
      expect(gameStore.canCraft(receitaPicareta)).toBe(true);
    });

    it('deve consumir ingredientes e adicionar resultado ao craftar', () => {
      const receitaPicareta = RECIPES.find(r => r.id === 'pickaxe')!;
      gameStore.addItem(ITEMS.wood, 2);
      gameStore.addItem(ITEMS.stone, 3);
      
      const success = gameStore.craft(receitaPicareta);
      expect(success).toBe(true);
      expect(gameStore.countItem(ITEMS.wood.id)).toBe(0);
      expect(gameStore.countItem(ITEMS.stone.id)).toBe(0);
      expect(gameStore.countItem(ITEMS.pickaxe.id)).toBe(1);
    });
  });

  describe('Status e Equipamentos', () => {
    it('deve aumentar a vida maxima ao equipar o Capacete Rustico', () => {
      gameStore.addItem(ITEMS.helmet_rustic, 1);
      // Simular uso para equipar (através do mapeamento interno do useItem)
      gameStore.useItem(0); 
      
      const stats = gameStore.getStats();
      expect(stats.maxHp).toBe(110); // 100 base + 10 do capacete
    });

    it('deve calcular o dano corretamente baseado no nível de skill', () => {
      // Começa com Machado (ToolDamage 1.5)
      gameStore.addItem(ITEMS.axe, 1);
      gameStore.assignToQuickBar(0, 0); // Slot 0 da quickbar aponta para slot 0 do inv
      
      const statsBase = gameStore.getStats();
      const danoBase = statsBase.attackDamage;

      // Ganhar XP para subir de nível (XP para level 1 é 100)
      gameStore.useTool('axe', 100); 
      
      const statsLevel1 = gameStore.getStats();
      expect(statsLevel1.attackDamage).toBeGreaterThan(danoBase);
    });
  });

  describe('Sistema de Dano e Morte', () => {
    it('deve reduzir o HP ao receber dano', () => {
      gameStore.receiveDamage(30);
      expect(gameStore.hp).toBe(70);
    });

    it('deve resetar o save ao morrer (HP <= 0)', () => {
      gameStore.receiveDamage(100);
      expect(window.alert).toHaveBeenCalled();
      expect(gameStore.inventory.every(s => s.item === null)).toBe(true);
    });
  });

  describe('Sistema de Quests', () => {
    beforeEach(() => {
      gameStore.resetSave();
    });

    it('deve inicializar quests disponíveis e bloqueadas', () => {
      gameStore.initQuests();
      const firstHunt = gameStore.quests['first_hunt'];
      expect(firstHunt).toBeDefined();
      expect(firstHunt.status).toBe('available');
      const bearSlayer = gameStore.quests['bear_slayer'];
      expect(bearSlayer).toBeDefined();
      expect(bearSlayer.status).toBe('locked');
    });

    it('deve aceitar quests disponíveis', () => {
      gameStore.initQuests();
      gameStore.acceptQuest('first_hunt');
      expect(gameStore.quests['first_hunt'].status).toBe('active');
    });

    it('não deve aceitar quests bloqueadas', () => {
      gameStore.initQuests();
      gameStore.acceptQuest('bear_slayer');
      expect(gameStore.quests['bear_slayer'].status).toBe('locked');
    });

    it('deve atualizar progresso de kill objective', () => {
      gameStore.initQuests();
      gameStore.acceptQuest('first_hunt');
      gameStore.updateQuestObjective('kill', 'chicken', 1);
      gameStore.updateQuestObjective('kill', 'chicken', 1);
      expect(gameStore.quests['first_hunt'].objectives[0].current).toBe(2);
    });

    it('deve atualizar progresso de gather objective', () => {
      gameStore.initQuests();
      gameStore.acceptQuest('wood_gatherer');
      gameStore.updateQuestObjective('gather', 'wood', 5);
      expect(gameStore.quests['wood_gatherer'].objectives[0].current).toBe(5);
    });

    it('deve completar quest quando todos objetivos forem atingidos', () => {
      gameStore.initQuests();
      gameStore.acceptQuest('first_hunt');
      gameStore.updateQuestObjective('kill', 'chicken', 3);
      expect(gameStore.quests['first_hunt'].status).toBe('completed');
    });

    it('deve distribuir recompensas ao completar quest', () => {
      gameStore.initQuests();
      gameStore.acceptQuest('first_hunt');
      const countBefore = gameStore.countItem('cooked_chicken');
      gameStore.updateQuestObjective('kill', 'chicken', 3);
      expect(gameStore.countItem('cooked_chicken')).toBe(countBefore + 2);
    });

    it('deve desbloquear quests com pré-requisitos', () => {
      gameStore.initQuests();
      gameStore.acceptQuest('first_hunt');
      expect(gameStore.quests['bear_slayer'].status).toBe('locked');
      gameStore.updateQuestObjective('kill', 'chicken', 3);
      gameStore.updateQuestObjective('kill', 'chicken', 3);
      expect(gameStore.quests['bear_slayer'].status).toBe('available');
    });

    it('deve atualizar progresso de craft objective via craft()', () => {
      gameStore.initQuests();
      gameStore.acceptQuest('chef');
      gameStore.addItem(ITEMS.chicken_meat, 1);
      const cookRecipe = RECIPES.find(r => r.id === 'cook_chicken')!;
      gameStore.addItem(ITEMS.chicken_meat, 1);
      gameStore.craft(cookRecipe);
      expect(gameStore.quests['chef'].objectives[0].current).toBe(1);
    });

    it('deve salvar e carregar estado de quests', () => {
      gameStore.initQuests();
      gameStore.acceptQuest('first_hunt');
      gameStore.updateQuestObjective('kill', 'chicken', 1);
      gameStore.save();
      const raw = localStorage.getItem('naturequest_save');
      expect(raw).toBeTruthy();
      const parsed = JSON.parse(raw!);
      expect(parsed.quests).toBeDefined();
      expect(parsed.quests['first_hunt'].status).toBe('active');
    });
  });
});
