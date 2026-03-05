// Game type definitions

export type ItemType = 'wood' | 'stone' | 'fiber' | 'seed' | 'food' | 'feather' | 'chicken_meat';
export type ToolType = 'axe' | 'pickaxe' | 'shovel' | 'hoe' | 'sword' | 'knife';
export type EquipSlot = 'head' | 'hands' | 'legs' | 'accessory' | 'mainHand';

export interface Item {
  id: string;
  name: string;
  type: ItemType | ToolType;
  icon: string;  // emoji for MVP
  stackable: boolean;
  maxStack: number;
  description: string;
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
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  miningSpeed: number;
  choppingSpeed: number;
  moveSpeed: number;
}

export interface GameSaveData {
  playerX: number;
  playerY: number;
  inventory: InventorySlot[];
  equipment: Equipment;
  timestamp: number;
  resourceStates: Record<string, number>; // resource id -> remaining hp
  chickenStates: Record<string, ChickenState>;
}

export interface ChickenState {
  id: string;
  x: number;
  y: number;
  alive: boolean;
  respawnAt: number | null;
}

// Item definitions
export const ITEMS: Record<string, Item> = {
  wood: { id: 'wood', name: 'Madeira', type: 'wood', icon: '🪵', stackable: true, maxStack: 64, description: 'Madeira bruta coletada de árvores' },
  stone: { id: 'stone', name: 'Pedra', type: 'stone', icon: '🪨', stackable: true, maxStack: 64, description: 'Pedra bruta coletada de rochas' },
  fiber: { id: 'fiber', name: 'Fibra', type: 'fiber', icon: '🌿', stackable: true, maxStack: 64, description: 'Fibras naturais coletadas de arbustos' },
  seed: { id: 'seed', name: 'Semente', type: 'seed', icon: '🌱', stackable: true, maxStack: 32, description: 'Sementes para plantio' },
  food: { id: 'food', name: 'Fruta', type: 'food', icon: '🍎', stackable: true, maxStack: 16, description: 'Restaura HP ao consumir' },
  feather: { id: 'feather', name: 'Pena', type: 'feather', icon: '🪶', stackable: true, maxStack: 64, description: 'Pena coletada de aves' },
  chicken_meat: { id: 'chicken_meat', name: 'Carne de Galinha', type: 'chicken_meat', icon: '🍗', stackable: true, maxStack: 32, description: 'Carne fresca de galinha' },
  axe: { id: 'axe', name: 'Machado', type: 'axe', icon: '🪓', stackable: false, maxStack: 1, description: '+50% velocidade de corte' },
  pickaxe: { id: 'pickaxe', name: 'Picareta', type: 'pickaxe', icon: '⛏️', stackable: false, maxStack: 1, description: '+50% velocidade de mineração' },
  shovel: { id: 'shovel', name: 'Pá', type: 'shovel', icon: '🪏', stackable: false, maxStack: 1, description: 'Permite cavar e plantar' },
  knife: { id: 'knife', name: 'Faca', type: 'knife', icon: '🔪', stackable: false, maxStack: 1, description: 'Ferramenta afiada para coleta animal' },
  sword: { id: 'sword', name: 'Espada', type: 'sword', icon: '⚔️', stackable: false, maxStack: 1, description: '+100% dano de ataque' },
};

export const RECIPES: CraftingRecipe[] = [
  {
    id: 'axe', name: 'Machado', result: ITEMS.axe, resultQty: 1,
    ingredients: [{ item: ITEMS.wood, quantity: 5 }, { item: ITEMS.stone, quantity: 3 }],
    description: 'Corte árvores mais rápido',
  },
  {
    id: 'pickaxe', name: 'Picareta', result: ITEMS.pickaxe, resultQty: 1,
    ingredients: [{ item: ITEMS.wood, quantity: 3 }, { item: ITEMS.stone, quantity: 5 }],
    description: 'Minere pedras mais rápido',
  },
  {
    id: 'shovel', name: 'Pá', result: ITEMS.shovel, resultQty: 1,
    ingredients: [{ item: ITEMS.wood, quantity: 4 }, { item: ITEMS.stone, quantity: 2 }],
    description: 'Cave e prepare o solo',
  },
  {
    id: 'knife', name: 'Faca', result: ITEMS.knife, resultQty: 1,
    ingredients: [{ item: ITEMS.wood, quantity: 2 }, { item: ITEMS.stone, quantity: 1 }],
    description: 'Ferramenta afiada para coleta de animais',
  },
  {
    id: 'sword', name: 'Espada', result: ITEMS.sword, resultQty: 1,
    ingredients: [{ item: ITEMS.wood, quantity: 2 }, { item: ITEMS.stone, quantity: 8 }],
    description: 'Uma arma afiada',
  },
];

export const DEFAULT_EQUIPMENT: Equipment = {
  head: { item: null, quantity: 0 },
  hands: { item: null, quantity: 0 },
  legs: { item: null, quantity: 0 },
  accessory: { item: null, quantity: 0 },
  mainHand: { item: null, quantity: 0 },
};
