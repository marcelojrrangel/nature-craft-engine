// Game type definitions

export type ItemType = 'wood' | 'stone' | 'fiber' | 'seed' | 'food' | 'feather' | 'chicken_meat' | 'crab_shell' | 'crab_meat' | 'arrow' | 'campfire' | 'pelt' | 'rabbit_meat' | 'cooked_chicken' | 'cooked_rabbit' | 'cooked_crab' | 'armor' | 'iron_ore' | 'bronze_ore' | 'gold_ore';
export type ToolType = 'axe' | 'pickaxe' | 'shovel' | 'hoe' | 'sword' | 'knife' | 'bow' | 'iron_axe' | 'iron_pickaxe' | 'iron_sword' | 'iron_bow' | 'bronze_axe' | 'bronze_pickaxe' | 'bronze_sword' | 'bronze_bow' | 'gold_axe' | 'gold_pickaxe' | 'gold_sword' | 'gold_bow';
export type EquipSlot = 'head' | 'hands' | 'legs' | 'accessory' | 'mainHand';
export type CraftStation = 'none' | 'workbench' | 'campfire';

export interface Item {
  id: string;
  name: string;
  type: ItemType | ToolType;
  icon: string;
  stackable: boolean;
  maxStack: number;
  description: string;
  bonus?: { hp?: number; moveSpeed?: number; dmg?: number };
}

export interface InventorySlot {
  item: Item | null;
  quantity: number;
}

export interface Equipment {
  head: InventorySlot;
  hands: InventorySlot;
  legs: InventorySlot;
  accessory: InventorySlot;
  mainHand: InventorySlot;
}

export interface CraftingRecipe {
  id: string;
  name: string;
  result: Item;
  resultQty: number;
  ingredients: { item: Item; quantity: number }[];
  description: string;
  station: CraftStation;
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  miningSpeed: number;
  choppingSpeed: number;
  moveSpeed: number;
  attackDamage: number;
}

export interface Skill {
  toolType: string;
  xp: number;
  level: number;
}

export const SKILL_XP_PER_LEVEL = 100;
export const MAX_SKILL_LEVEL = 10;

export const SKILLS_CONFIG: Record<string, { name: string; icon: string; bonusPerLevel: number; description: string }> = {
  axe: { name: 'Corte', icon: '🪓', bonusPerLevel: 0.1, description: 'Aumenta velocidade de corte de árvores' },
  pickaxe: { name: 'Mineração', icon: '⛏️', bonusPerLevel: 0.1, description: 'Aumenta velocidade de mineração' },
  sword: { name: 'Espada', icon: '⚔️', bonusPerLevel: 0.1, description: 'Aumenta dano de ataque' },
  knife: { name: 'Faca', icon: '🔪', bonusPerLevel: 0.08, description: 'Aumenta dano e coleta' },
  shovel: { name: 'Pá', icon: '🪏', bonusPerLevel: 0.1, description: 'Aumenta eficiência de escavação' },
  hoe: { name: 'Enxada', icon: '🌱', bonusPerLevel: 0.1, description: 'Aumenta eficiência de plantio' },
  bow: { name: 'Arco', icon: '🏹', bonusPerLevel: 0.1, description: 'Aumenta dano à distância' },
  iron_axe: { name: 'Corte Avançado', icon: '🪓', bonusPerLevel: 0.15, description: 'Aumenta velocidade de corte de árvores' },
  iron_pickaxe: { name: 'Mineração Avançada', icon: '⛏️', bonusPerLevel: 0.15, description: 'Aumenta velocidade de mineração' },
  iron_sword: { name: 'Espada Avançada', icon: '⚔️', bonusPerLevel: 0.15, description: 'Aumenta dano de ataque' },
  iron_bow: { name: 'Arco Avançado', icon: '🏹', bonusPerLevel: 0.15, description: 'Aumenta dano à distância' },
  bronze_axe: { name: 'Corte Superior', icon: '🪓', bonusPerLevel: 0.2, description: 'Aumenta velocidade de corte de árvores' },
  bronze_pickaxe: { name: 'Mineração Superior', icon: '⛏️', bonusPerLevel: 0.2, description: 'Aumenta velocidade de mineração' },
  bronze_sword: { name: 'Espada Superior', icon: '⚔️', bonusPerLevel: 0.2, description: 'Aumenta dano de ataque' },
  bronze_bow: { name: 'Arco Superior', icon: '🏹', bonusPerLevel: 0.2, description: 'Aumenta dano à distância' },
  gold_axe: { name: 'Corte Lendário', icon: '🪓', bonusPerLevel: 0.25, description: 'Aumenta velocidade de corte de árvores' },
  gold_pickaxe: { name: 'Mineração Lendária', icon: '⛏️', bonusPerLevel: 0.25, description: 'Aumenta velocidade de mineração' },
  gold_sword: { name: 'Espada Lendária', icon: '⚔️', bonusPerLevel: 0.25, description: 'Aumenta dano de ataque' },
  gold_bow: { name: 'Arco Lendário', icon: '🏹', bonusPerLevel: 0.25, description: 'Aumenta dano à distância' },
};

export const HARDNESS: Record<string, number> = {
  bush: 3,
  dead_tree: 6,
  tree: 12,
  rock: 18,
  workbench: 24,
  chicken: 5,
  crab: 10,
  bear: 30,
  small_rock: 2,
  rabbit: 3,
  iron_ore: 40,
  bronze_ore: 60,
  gold_ore: 80,
};

export const TOOL_DAMAGE: Record<string, number> = {
  hands: 0.5,
  axe: 1.5,
  pickaxe: 1.5,
  sword: 1.2,
  knife: 1.0,
  shovel: 1.5,
  hoe: 1.5,
  bow: 1.0,
  iron_axe: 2.5,
  iron_pickaxe: 2.5,
  iron_sword: 2.0,
  iron_bow: 1.5,
  bronze_axe: 3.5,
  bronze_pickaxe: 3.5,
  bronze_sword: 3.0,
  bronze_bow: 2.0,
  gold_axe: 5.0,
  gold_pickaxe: 5.0,
  gold_sword: 4.5,
  gold_bow: 3.0,
};

export const BASE_DAMAGE = 1;
export const DROP_BONUS_CHANCE = 0.5;

export const TOOL_REQUIREMENTS: Record<string, (ToolType | 'hands')[]> = {
  tree: ['axe', 'iron_axe', 'bronze_axe', 'gold_axe'],
  dead_tree: ['axe', 'iron_axe', 'bronze_axe', 'gold_axe', 'hands'],
  rock: ['pickaxe', 'iron_pickaxe', 'bronze_pickaxe', 'gold_pickaxe', 'hands'],
  small_rock: ['hands', 'pickaxe', 'iron_pickaxe', 'bronze_pickaxe', 'gold_pickaxe'],
  bush: ['hands', 'axe', 'iron_axe', 'bronze_axe', 'gold_axe', 'pickaxe', 'iron_pickaxe', 'bronze_pickaxe', 'gold_pickaxe', 'sword', 'iron_sword', 'bronze_sword', 'gold_sword', 'knife', 'shovel', 'hoe'],
  workbench: ['axe', 'iron_axe', 'bronze_axe', 'gold_axe', 'pickaxe', 'iron_pickaxe', 'bronze_pickaxe', 'gold_pickaxe'],
  chicken: ['sword', 'iron_sword', 'bronze_sword', 'gold_sword', 'knife', 'bow', 'iron_bow', 'bronze_bow', 'gold_bow'],
  crab: ['sword', 'iron_sword', 'bronze_sword', 'gold_sword', 'knife', 'pickaxe', 'iron_pickaxe', 'bronze_pickaxe', 'gold_pickaxe', 'bow', 'iron_bow', 'bronze_bow', 'gold_bow'],
  bear: ['sword', 'iron_sword', 'bronze_sword', 'gold_sword', 'knife', 'bow', 'iron_bow', 'bronze_bow', 'gold_bow', 'axe', 'iron_axe', 'bronze_axe', 'gold_axe'],
  rabbit: ['sword', 'iron_sword', 'bronze_sword', 'gold_sword', 'knife', 'bow', 'iron_bow', 'bronze_bow', 'gold_bow'],
  iron_ore: ['pickaxe', 'iron_pickaxe', 'bronze_pickaxe', 'gold_pickaxe'],
  bronze_ore: ['pickaxe', 'iron_pickaxe', 'bronze_pickaxe', 'gold_pickaxe'],
  gold_ore: ['pickaxe', 'iron_pickaxe', 'bronze_pickaxe', 'gold_pickaxe'],
};

export interface GameSaveData {
  playerX: number;
  playerY: number;
  inventory: InventorySlot[];
  equipment: Equipment;
  timestamp: number;
  resourceStates: Record<string, number>;
  chickenStates: Record<string, ChickenState>;
  crabStates: Record<string, CrabState>;
  bearStates?: Record<string, BearState>;
  rabbitStates?: Record<string, RabbitState>;
  placedItems?: PlacedItem[];
  quickBar?: (number | null)[];
  selectedQuickBarIndex?: number;
  skills?: Record<string, Skill>;
  respawnQueue?: { x: number; y: number; type: string; hp: number; id: string; respawnAt: number }[];
}

export interface PlacedItem {
  id: string;
  type: string;
  x: number;
  y: number;
}

export interface ChickenState { id: string; x: number; y: number; alive: boolean; respawnAt: number | null; hp: number; }
export interface CrabState { id: string; x: number; y: number; alive: boolean; respawnAt: number | null; hp: number; }
export interface BearState { id: string; x: number; y: number; alive: boolean; respawnAt: number | null; hp: number; }
export interface RabbitState { id: string; x: number; y: number; alive: boolean; respawnAt: number | null; hp: number; }

// Item definitions
export const ITEMS: Record<string, Item> = {
  wood: { id: 'wood', name: 'Madeira', type: 'wood', icon: '🪵', stackable: true, maxStack: 64, description: 'Madeira bruta coletada de árvores' },
  twig: { id: 'twig', name: 'Graveto', type: 'wood', icon: '🎋', stackable: true, maxStack: 64, description: 'Gravetos secos coletados de árvores mortas' },
  stone: { id: 'stone', name: 'Pedra', type: 'stone', icon: '🪨', stackable: true, maxStack: 64, description: 'Pedra bruta coletada de rochas' },
  fiber: { id: 'fiber', name: 'Fibra', type: 'fiber', icon: '🌿', stackable: true, maxStack: 64, description: 'Fibras naturais coletadas de arbustos' },
  seed: { id: 'seed', name: 'Semente', type: 'seed', icon: '🌱', stackable: true, maxStack: 32, description: 'Sementes para plantio' },
  food: { id: 'food', name: 'Fruta', type: 'food', icon: '🍎', stackable: true, maxStack: 16, description: 'Restaura HP ao consumir' },
  feather: { id: 'feather', name: 'Pena', type: 'feather', icon: '🪶', stackable: true, maxStack: 64, description: 'Pena coletada de aves' },
  chicken_meat: { id: 'chicken_meat', name: 'Carne de Galinha', type: 'chicken_meat', icon: '🍗', stackable: true, maxStack: 32, description: 'Carne crua. Precisa cozinhar' },
  rabbit_meat: { id: 'rabbit_meat', name: 'Carne de Coelho', type: 'rabbit_meat', icon: '🥩', stackable: true, maxStack: 32, description: 'Carne crua. Precisa cozinhar' },
  pelt: { id: 'pelt', name: 'Pele Macia', type: 'pelt', icon: '🧤', stackable: true, maxStack: 32, description: 'Pele coletada de pequenos animais' },
  cooked_chicken: { id: 'cooked_chicken', name: 'Frango Assado', type: 'food', icon: '🍖', stackable: true, maxStack: 16, description: 'Restaura 25 HP', bonus: { hp: 25 } },
  cooked_rabbit: { id: 'cooked_rabbit', name: 'Coelho Assado', type: 'food', icon: '🍢', stackable: true, maxStack: 16, description: 'Restaura 40 HP', bonus: { hp: 40 } },
  cooked_crab: { id: 'cooked_crab', name: 'Siri Cozido', type: 'food', icon: '🦐', stackable: true, maxStack: 16, description: 'Restaura 15 HP', bonus: { hp: 15 } },
  crab_shell: { id: 'crab_shell', name: 'Casca de Siri', type: 'crab_shell', icon: '🐚', stackable: true, maxStack: 64, description: 'Fragmento de carapaça' },
  crab_meat: { id: 'crab_meat', name: 'Carne de Siri', type: 'crab_meat', icon: '🦀', stackable: true, maxStack: 32, description: 'Carne de siri crua' },
  arrow: { id: 'arrow', name: 'Flecha', type: 'arrow', icon: '🥢', stackable: true, maxStack: 64, description: 'Munição para o arco' },
  campfire: { id: 'campfire', name: 'Fogueira', type: 'campfire', icon: '🔥', stackable: true, maxStack: 5, description: 'Permite cozinhar e iluminar' },

  // Ores
  iron_ore: { id: 'iron_ore', name: 'Minério de Ferro', type: 'iron_ore', icon: '🪨', stackable: true, maxStack: 64, description: 'Minério de ferro bruto' },
  bronze_ore: { id: 'bronze_ore', name: 'Minério de Bronze', type: 'bronze_ore', icon: '🟤', stackable: true, maxStack: 64, description: 'Minério de bronze bruto' },
  gold_ore: { id: 'gold_ore', name: 'Minério de Ouro', type: 'gold_ore', icon: '🟡', stackable: true, maxStack: 64, description: 'Minério de ouro bruto' },
  
  // Armor
  helmet_rustic: { id: 'helmet_rustic', name: 'Capacete Rústico', type: 'armor', icon: '🪖', stackable: false, maxStack: 1, description: '+10 Max HP', bonus: { hp: 10 } },
  gloves_rustic: { id: 'gloves_rustic', name: 'Luvas Rústicas', type: 'armor', icon: '🧤', stackable: false, maxStack: 1, description: '+10% Dano', bonus: { dmg: 0.1 } },
  boots_rustic: { id: 'boots_rustic', name: 'Botas Rústicas', type: 'armor', icon: '👞', stackable: false, maxStack: 1, description: '+15% Velocidade', bonus: { moveSpeed: 0.15 } },

  // Metal Armor
  iron_helmet: { id: 'iron_helmet', name: 'Capacete de Ferro', type: 'armor', icon: '🪖', stackable: false, maxStack: 1, description: '+25 Max HP', bonus: { hp: 25 } },
  iron_chestplate: { id: 'iron_chestplate', name: 'Peitoral de Ferro', type: 'armor', icon: '🦺', stackable: false, maxStack: 1, description: '+20% Dano', bonus: { dmg: 0.2 } },
  iron_boots: { id: 'iron_boots', name: 'Botas de Ferro', type: 'armor', icon: '👞', stackable: false, maxStack: 1, description: '+25% Velocidade', bonus: { moveSpeed: 0.25 } },
  bronze_helmet: { id: 'bronze_helmet', name: 'Capacete de Bronze', type: 'armor', icon: '🪖', stackable: false, maxStack: 1, description: '+35 Max HP', bonus: { hp: 35 } },
  bronze_chestplate: { id: 'bronze_chestplate', name: 'Peitoral de Bronze', type: 'armor', icon: '🦺', stackable: false, maxStack: 1, description: '+30% Dano', bonus: { dmg: 0.3 } },
  bronze_boots: { id: 'bronze_boots', name: 'Botas de Bronze', type: 'armor', icon: '👞', stackable: false, maxStack: 1, description: '+35% Velocidade', bonus: { moveSpeed: 0.35 } },

  // Tools
  axe: { id: 'axe', name: 'Machado', type: 'axe', icon: '🪓', stackable: false, maxStack: 1, description: '+50% velocidade de corte' },
  pickaxe: { id: 'pickaxe', name: 'Picareta', type: 'pickaxe', icon: '⛏️', stackable: false, maxStack: 1, description: '+50% velocidade de mineração' },
  shovel: { id: 'shovel', name: 'Pá', type: 'shovel', icon: '🪏', stackable: false, maxStack: 1, description: 'Permite cavar e plantar' },
  knife: { id: 'knife', name: 'Faca', type: 'knife', icon: '🔪', stackable: false, maxStack: 1, description: 'Ferramenta afiada para coleta animal' },
  sword: { id: 'sword', name: 'Espada', type: 'sword', icon: '⚔️', stackable: false, maxStack: 1, description: '+100% dano de ataque' },
  bow: { id: 'bow', name: 'Arco', type: 'bow', icon: '🏹', stackable: false, maxStack: 1, description: 'Arma de longo alcance (Requer flechas)' },

  // Metal Tools
  iron_sword: { id: 'iron_sword', name: 'Espada de Ferro', type: 'sword', icon: '⚔️', stackable: false, maxStack: 1, description: '+150% dano de ataque' },
  iron_pickaxe: { id: 'iron_pickaxe', name: 'Picareta de Ferro', type: 'pickaxe', icon: '⛏️', stackable: false, maxStack: 1, description: '+100% velocidade de mineração' },
  iron_axe: { id: 'iron_axe', name: 'Machado de Ferro', type: 'axe', icon: '🪓', stackable: false, maxStack: 1, description: '+100% velocidade de corte' },
  iron_bow: { id: 'iron_bow', name: 'Arco de Ferro', type: 'bow', icon: '🏹', stackable: false, maxStack: 1, description: 'Arma de longo alcance reforçada' },
  bronze_sword: { id: 'bronze_sword', name: 'Espada de Bronze', type: 'sword', icon: '⚔️', stackable: false, maxStack: 1, description: '+200% dano de ataque' },
  bronze_pickaxe: { id: 'bronze_pickaxe', name: 'Picareta de Bronze', type: 'pickaxe', icon: '⛏️', stackable: false, maxStack: 1, description: '+150% velocidade de mineração' },
  bronze_axe: { id: 'bronze_axe', name: 'Machado de Bronze', type: 'axe', icon: '🪓', stackable: false, maxStack: 1, description: '+150% velocidade de corte' },
  bronze_bow: { id: 'bronze_bow', name: 'Arco de Bronze', type: 'bow', icon: '🏹', stackable: false, maxStack: 1, description: 'Arco de longo alcance superior' },
  gold_sword: { id: 'gold_sword', name: 'Espada de Ouro', type: 'sword', icon: '⚔️', stackable: false, maxStack: 1, description: '+350% dano de ataque' },
  gold_pickaxe: { id: 'gold_pickaxe', name: 'Picareta de Ouro', type: 'pickaxe', icon: '⛏️', stackable: false, maxStack: 1, description: '+250% velocidade de mineração' },
  gold_axe: { id: 'gold_axe', name: 'Machado de Ouro', type: 'axe', icon: '🪓', stackable: false, maxStack: 1, description: '+250% velocidade de corte' },
  gold_bow: { id: 'gold_bow', name: 'Arco de Ouro', type: 'bow', icon: '🏹', stackable: false, maxStack: 1, description: 'Arco de longo alcance lendário' },

  // Gold Armor
  gold_helmet: { id: 'gold_helmet', name: 'Capacete de Ouro', type: 'armor', icon: '🪖', stackable: false, maxStack: 1, description: '+50 Max HP', bonus: { hp: 50 } },
  gold_chestplate: { id: 'gold_chestplate', name: 'Peitoral de Ouro', type: 'armor', icon: '🦺', stackable: false, maxStack: 1, description: '+45% Dano', bonus: { dmg: 0.45 } },
  gold_boots: { id: 'gold_boots', name: 'Botas de Ouro', type: 'armor', icon: '👞', stackable: false, maxStack: 1, description: '+50% Velocidade', bonus: { moveSpeed: 0.5 } },
};

export const RECIPES: CraftingRecipe[] = [
  // Campfire Cooking
  { id: 'cook_chicken', name: 'Assar Frango', result: ITEMS.cooked_chicken, resultQty: 1, ingredients: [{ item: ITEMS.chicken_meat, quantity: 1 }], description: 'Cura 25 HP', station: 'campfire' },
  { id: 'cook_rabbit', name: 'Assar Coelho', result: ITEMS.cooked_rabbit, resultQty: 1, ingredients: [{ item: ITEMS.rabbit_meat, quantity: 1 }], description: 'Cura 40 HP', station: 'campfire' },
  { id: 'cook_crab', name: 'Cozinhar Siri', result: ITEMS.cooked_crab, resultQty: 1, ingredients: [{ item: ITEMS.crab_meat, quantity: 1 }], description: 'Cura 15 HP', station: 'campfire' },
  
  // Workbench Advanced
  { id: 'helmet_rustic', name: 'Capacete Rústico', result: ITEMS.helmet_rustic, resultQty: 1, ingredients: [{ item: ITEMS.pelt, quantity: 4 }, { item: ITEMS.fiber, quantity: 2 }], description: '+10 HP Máximo', station: 'workbench' },
  { id: 'gloves_rustic', name: 'Luvas Rústicas', result: ITEMS.gloves_rustic, resultQty: 1, ingredients: [{ item: ITEMS.pelt, quantity: 2 }, { item: ITEMS.fiber, quantity: 4 }], description: '+10% Dano de ataque', station: 'workbench' },
  { id: 'boots_rustic', name: 'Botas Rústicas', result: ITEMS.boots_rustic, resultQty: 1, ingredients: [{ item: ITEMS.pelt, quantity: 3 }, { item: ITEMS.fiber, quantity: 2 }], description: '+15% Vel. Movimento', station: 'workbench' },

  // Metal Armor
  { id: 'iron_helmet', name: 'Capacete de Ferro', result: ITEMS.iron_helmet, resultQty: 1, ingredients: [{ item: ITEMS.iron_ore, quantity: 5 }, { item: ITEMS.stone, quantity: 2 }], description: '+25 HP Máximo', station: 'workbench' },
  { id: 'iron_chestplate', name: 'Peitoral de Ferro', result: ITEMS.iron_chestplate, resultQty: 1, ingredients: [{ item: ITEMS.iron_ore, quantity: 8 }, { item: ITEMS.wood, quantity: 4 }], description: '+20% Dano', station: 'workbench' },
  { id: 'iron_boots', name: 'Botas de Ferro', result: ITEMS.iron_boots, resultQty: 1, ingredients: [{ item: ITEMS.iron_ore, quantity: 6 }, { item: ITEMS.fiber, quantity: 3 }], description: '+25% Velocidade', station: 'workbench' },
  { id: 'bronze_helmet', name: 'Capacete de Bronze', result: ITEMS.bronze_helmet, resultQty: 1, ingredients: [{ item: ITEMS.bronze_ore, quantity: 5 }, { item: ITEMS.iron_ore, quantity: 2 }], description: '+35 HP Máximo', station: 'workbench' },
  { id: 'bronze_chestplate', name: 'Peitoral de Bronze', result: ITEMS.bronze_chestplate, resultQty: 1, ingredients: [{ item: ITEMS.bronze_ore, quantity: 8 }, { item: ITEMS.iron_ore, quantity: 4 }], description: '+30% Dano', station: 'workbench' },
  { id: 'bronze_boots', name: 'Botas de Bronze', result: ITEMS.bronze_boots, resultQty: 1, ingredients: [{ item: ITEMS.bronze_ore, quantity: 6 }, { item: ITEMS.fiber, quantity: 3 }], description: '+35% Velocidade', station: 'workbench' },

  // Metal Tools
  { id: 'iron_sword', name: 'Espada de Ferro', result: ITEMS.iron_sword, resultQty: 1, ingredients: [{ item: ITEMS.iron_ore, quantity: 6 }, { item: ITEMS.wood, quantity: 2 }], description: '+150% dano', station: 'workbench' },
  { id: 'iron_pickaxe', name: 'Picareta de Ferro', result: ITEMS.iron_pickaxe, resultQty: 1, ingredients: [{ item: ITEMS.iron_ore, quantity: 5 }, { item: ITEMS.wood, quantity: 2 }], description: '+100% mineração', station: 'workbench' },
  { id: 'iron_axe', name: 'Machado de Ferro', result: ITEMS.iron_axe, resultQty: 1, ingredients: [{ item: ITEMS.iron_ore, quantity: 5 }, { item: ITEMS.wood, quantity: 2 }], description: '+100% corte', station: 'workbench' },
  { id: 'iron_bow', name: 'Arco de Ferro', result: ITEMS.iron_bow, resultQty: 1, ingredients: [{ item: ITEMS.iron_ore, quantity: 4 }, { item: ITEMS.wood, quantity: 3 }, { item: ITEMS.fiber, quantity: 5 }], description: 'Arco reforçado', station: 'workbench' },
  { id: 'bronze_sword', name: 'Espada de Bronze', result: ITEMS.bronze_sword, resultQty: 1, ingredients: [{ item: ITEMS.bronze_ore, quantity: 6 }, { item: ITEMS.iron_ore, quantity: 3 }], description: '+200% dano', station: 'workbench' },
  { id: 'bronze_pickaxe', name: 'Picareta de Bronze', result: ITEMS.bronze_pickaxe, resultQty: 1, ingredients: [{ item: ITEMS.bronze_ore, quantity: 5 }, { item: ITEMS.iron_ore, quantity: 2 }], description: '+150% mineração', station: 'workbench' },
  { id: 'bronze_axe', name: 'Machado de Bronze', result: ITEMS.bronze_axe, resultQty: 1, ingredients: [{ item: ITEMS.bronze_ore, quantity: 5 }, { item: ITEMS.iron_ore, quantity: 2 }], description: '+150% corte', station: 'workbench' },
  { id: 'bronze_bow', name: 'Arco de Bronze', result: ITEMS.bronze_bow, resultQty: 1, ingredients: [{ item: ITEMS.bronze_ore, quantity: 5 }, { item: ITEMS.iron_ore, quantity: 3 }, { item: ITEMS.fiber, quantity: 5 }], description: 'Arco superior', station: 'workbench' },
  { id: 'gold_sword', name: 'Espada de Ouro', result: ITEMS.gold_sword, resultQty: 1, ingredients: [{ item: ITEMS.gold_ore, quantity: 8 }, { item: ITEMS.bronze_ore, quantity: 4 }], description: '+350% dano', station: 'workbench' },
  { id: 'gold_pickaxe', name: 'Picareta de Ouro', result: ITEMS.gold_pickaxe, resultQty: 1, ingredients: [{ item: ITEMS.gold_ore, quantity: 6 }, { item: ITEMS.bronze_ore, quantity: 3 }], description: '+250% mineração', station: 'workbench' },
  { id: 'gold_axe', name: 'Machado de Ouro', result: ITEMS.gold_axe, resultQty: 1, ingredients: [{ item: ITEMS.gold_ore, quantity: 6 }, { item: ITEMS.bronze_ore, quantity: 3 }], description: '+250% corte', station: 'workbench' },
  { id: 'gold_bow', name: 'Arco de Ouro', result: ITEMS.gold_bow, resultQty: 1, ingredients: [{ item: ITEMS.gold_ore, quantity: 6 }, { item: ITEMS.bronze_ore, quantity: 3 }, { item: ITEMS.fiber, quantity: 5 }], description: 'Arco lendário', station: 'workbench' },
  { id: 'gold_helmet', name: 'Capacete de Ouro', result: ITEMS.gold_helmet, resultQty: 1, ingredients: [{ item: ITEMS.gold_ore, quantity: 8 }, { item: ITEMS.bronze_ore, quantity: 3 }], description: '+50 HP Máximo', station: 'workbench' },
  { id: 'gold_chestplate', name: 'Peitoral de Ouro', result: ITEMS.gold_chestplate, resultQty: 1, ingredients: [{ item: ITEMS.gold_ore, quantity: 12 }, { item: ITEMS.bronze_ore, quantity: 5 }], description: '+45% Dano', station: 'workbench' },
  { id: 'gold_boots', name: 'Botas de Ouro', result: ITEMS.gold_boots, resultQty: 1, ingredients: [{ item: ITEMS.gold_ore, quantity: 8 }, { item: ITEMS.bronze_ore, quantity: 3 }], description: '+50% Velocidade', station: 'workbench' },

  // Basics
  { id: 'campfire', name: 'Fogueira', result: ITEMS.campfire, resultQty: 1, ingredients: [{ item: ITEMS.twig, quantity: 8 }], description: 'Cozinhe e ilumine', station: 'workbench' },
  { id: 'bow', name: 'Arco', result: ITEMS.bow, resultQty: 1, ingredients: [{ item: ITEMS.wood, quantity: 5 }, { item: ITEMS.fiber, quantity: 10 }], description: 'Ataque à distância', station: 'workbench' },
  { id: 'arrow', name: 'Flechas', result: ITEMS.arrow, resultQty: 5, ingredients: [{ item: ITEMS.wood, quantity: 2 }, { item: ITEMS.stone, quantity: 1 }, { item: ITEMS.feather, quantity: 2 }], description: 'Munição básica', station: 'workbench' },
  { id: 'axe', name: 'Machado', result: ITEMS.axe, resultQty: 1, ingredients: [{ item: ITEMS.wood, quantity: 3 }, { item: ITEMS.stone, quantity: 2 }], description: 'Corte árvores', station: 'workbench' },
  { id: 'pickaxe', name: 'Picareta', result: ITEMS.pickaxe, resultQty: 1, ingredients: [{ item: ITEMS.wood, quantity: 2 }, { item: ITEMS.stone, quantity: 3 }], description: 'Minere pedras', station: 'workbench' },
  { id: 'shovel', name: 'Pá', result: ITEMS.shovel, resultQty: 1, ingredients: [{ item: ITEMS.wood, quantity: 2 }, { item: ITEMS.stone, quantity: 1 }], description: 'Cave o solo', station: 'workbench' },
  { id: 'knife', name: 'Faca', result: ITEMS.knife, resultQty: 1, ingredients: [{ item: ITEMS.wood, quantity: 1 }, { item: ITEMS.stone, quantity: 1 }], description: 'Coleta animal', station: 'workbench' },
  { id: 'sword', name: 'Espada', result: ITEMS.sword, resultQty: 1, ingredients: [{ item: ITEMS.wood, quantity: 2 }, { item: ITEMS.stone, quantity: 5 }], description: 'Arma afiada', station: 'workbench' },
];

export const DEFAULT_EQUIPMENT: Equipment = {
  head: { item: null, quantity: 0 },
  hands: { item: null, quantity: 0 },
  legs: { item: null, quantity: 0 },
  accessory: { item: null, quantity: 0 },
  mainHand: { item: null, quantity: 0 },
};
