// Game type definitions

export type ItemType = 'wood' | 'stone' | 'fiber' | 'seed' | 'food' | 'feather' | 'chicken_meat' | 'crab_shell' | 'crab_meat' | 'arrow';
export type ToolType = 'axe' | 'pickaxe' | 'shovel' | 'hoe' | 'sword' | 'knife' | 'bow';
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
};

export const BASE_DAMAGE = 1;
export const DROP_BONUS_CHANCE = 0.5;

export const TOOL_REQUIREMENTS: Record<string, (ToolType | 'hands')[]> = {
  tree: ['axe'],
  dead_tree: ['axe', 'hands'],
  rock: ['pickaxe', 'hands'],
  small_rock: ['hands', 'pickaxe'],
  bush: ['hands', 'axe', 'pickaxe', 'sword', 'knife', 'shovel', 'hoe'],
  workbench: ['axe', 'pickaxe'],
  chicken: ['sword', 'knife', 'bow'],
  crab: ['sword', 'knife', 'pickaxe', 'bow'],
  bear: ['sword', 'knife', 'bow', 'axe'],
};

export interface GameSaveData {
  playerX: number;
  playerY: number;
  inventory: InventorySlot[];
  equipment: Equipment;
  timestamp: number;
  resourceStates: Record<string, number>; // resource id -> remaining hp
  chickenStates: Record<string, ChickenState>;
  crabStates: Record<string, CrabState>;
  bearStates?: Record<string, BearState>;
  quickBar?: (number | null)[];
  selectedQuickBarIndex?: number;
  skills?: Record<string, Skill>;
  respawnQueue?: { x: number; y: number; type: string; hp: number; id: string; respawnAt: number }[];
}

export interface ChickenState {
  id: string;
  x: number;
  y: number;
  alive: boolean;
  respawnAt: number | null;
  hp: number;
}

export interface CrabState {
  id: string;
  x: number;
  y: number;
  alive: boolean;
  respawnAt: number | null;
  hp: number;
}

export interface BearState {
  id: string;
  x: number;
  y: number;
  alive: boolean;
  respawnAt: number | null;
  hp: number;
}

// Item definitions
export const ITEMS: Record<string, Item> = {
  wood: { id: 'wood', name: 'Madeira', type: 'wood', icon: '🪵', stackable: true, maxStack: 64, description: 'Madeira bruta coletada de árvores' },
  twig: { id: 'twig', name: 'Graveto', type: 'wood', icon: '🎋', stackable: true, maxStack: 64, description: 'Gravetos secos coletados de árvores mortas' },
  stone: { id: 'stone', name: 'Pedra', type: 'stone', icon: '🪨', stackable: true, maxStack: 64, description: 'Pedra bruta coletada de rochas' },
  fiber: { id: 'fiber', name: 'Fibra', type: 'fiber', icon: '🌿', stackable: true, maxStack: 64, description: 'Fibras naturais coletadas de arbustos' },
  seed: { id: 'seed', name: 'Semente', type: 'seed', icon: '🌱', stackable: true, maxStack: 32, description: 'Sementes para plantio' },
  food: { id: 'food', name: 'Fruta', type: 'food', icon: '🍎', stackable: true, maxStack: 16, description: 'Restaura HP ao consumir' },
  feather: { id: 'feather', name: 'Pena', type: 'feather', icon: '🪶', stackable: true, maxStack: 64, description: 'Pena coletada de aves' },
  chicken_meat: { id: 'chicken_meat', name: 'Carne de Galinha', type: 'chicken_meat', icon: '🍗', stackable: true, maxStack: 32, description: 'Carne fresca de galinha' },
  crab_shell: { id: 'crab_shell', name: 'Casca de Siri', type: 'crab_shell', icon: '🐚', stackable: true, maxStack: 64, description: 'Fragmento de carapaça coletado na orla' },
  crab_meat: { id: 'crab_meat', name: 'Carne de Siri', type: 'crab_meat', icon: '🦀', stackable: true, maxStack: 32, description: 'Carne fresca de siri/caranguejo' },
  arrow: { id: 'arrow', name: 'Flecha', type: 'arrow', icon: '🥢', stackable: true, maxStack: 64, description: 'Munição para o arco' },
  axe: { id: 'axe', name: 'Machado', type: 'axe', icon: '🪓', stackable: false, maxStack: 1, description: '+50% velocidade de corte' },
  pickaxe: { id: 'pickaxe', name: 'Picareta', type: 'pickaxe', icon: '⛏️', stackable: false, maxStack: 1, description: '+50% velocidade de mineração' },
  shovel: { id: 'shovel', name: 'Pá', type: 'shovel', icon: '🪏', stackable: false, maxStack: 1, description: 'Permite cavar e plantar' },
  knife: { id: 'knife', name: 'Faca', type: 'knife', icon: '🔪', stackable: false, maxStack: 1, description: 'Ferramenta afiada para coleta animal' },
  sword: { id: 'sword', name: 'Espada', type: 'sword', icon: '⚔️', stackable: false, maxStack: 1, description: '+100% dano de ataque' },
  bow: { id: 'bow', name: 'Arco', type: 'bow', icon: '🏹', stackable: false, maxStack: 1, description: 'Arma de longo alcance (Requer flechas)' },
};

export const RECIPES: CraftingRecipe[] = [
  {
    id: 'bow', name: 'Arco', result: ITEMS.bow, resultQty: 1,
    ingredients: [{ item: ITEMS.wood, quantity: 5 }, { item: ITEMS.fiber, quantity: 10 }],
    description: 'Ataque à distância',
  },
  {
    id: 'arrow', name: 'Flechas', result: ITEMS.arrow, resultQty: 5,
    ingredients: [{ item: ITEMS.wood, quantity: 2 }, { item: ITEMS.stone, quantity: 1 }, { item: ITEMS.feather, quantity: 2 }],
    description: 'Munição básica',
  },
  {
    id: 'axe', name: 'Machado', result: ITEMS.axe, resultQty: 1,
    ingredients: [{ item: ITEMS.wood, quantity: 3 }, { item: ITEMS.stone, quantity: 2 }],
    description: 'Corte árvores mais rápido',
  },
  {
    id: 'pickaxe', name: 'Picareta', result: ITEMS.pickaxe, resultQty: 1,
    ingredients: [{ item: ITEMS.wood, quantity: 2 }, { item: ITEMS.stone, quantity: 3 }],
    description: 'Minere pedras mais rápido',
  },
  {
    id: 'shovel', name: 'Pá', result: ITEMS.shovel, resultQty: 1,
    ingredients: [{ item: ITEMS.wood, quantity: 2 }, { item: ITEMS.stone, quantity: 1 }],
    description: 'Cave e prepare o solo',
  },
  {
    id: 'knife', name: 'Faca', result: ITEMS.knife, resultQty: 1,
    ingredients: [{ item: ITEMS.wood, quantity: 1 }, { item: ITEMS.stone, quantity: 1 }],
    description: 'Ferramenta afiada para coleta de animais',
  },
  {
    id: 'sword', name: 'Espada', result: ITEMS.sword, resultQty: 1,
    ingredients: [{ item: ITEMS.wood, quantity: 2 }, { item: ITEMS.stone, quantity: 5 }],
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
