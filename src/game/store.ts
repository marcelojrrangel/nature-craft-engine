// Reactive game store for shared state between Phaser & React
import { ITEMS, DEFAULT_EQUIPMENT, RECIPES, SKILLS_CONFIG, SKILL_XP_PER_LEVEL, MAX_SKILL_LEVEL, type InventorySlot, type Equipment, type Item, type EquipSlot, type GameSaveData, type CraftingRecipe, type ChickenState, type CrabState, type Skill } from './types';

type Listener = () => void;

class GameStore {
  private listeners: Set<Listener> = new Set();

  inventory: InventorySlot[] = Array.from({ length: 20 }, () => ({ item: null, quantity: 0 }));
  equipment: Equipment = JSON.parse(JSON.stringify(DEFAULT_EQUIPMENT));
  playerX = 800;
  playerY = 800;
  hp = 100;
  maxHp = 100;
  showInventory = false;
  showCrafting = false;
  showEquipment = false;
  quickBar: (number | null)[] = [null, null, null, null, null];
  selectedQuickBarIndex = 0;
  resourceStates: Record<string, number> = {};
  chickenStates: Record<string, ChickenState> = {};
  crabStates: Record<string, CrabState> = {};
  skills: Record<string, Skill> = {};
  showSkills = false;
  private saveInterval: number | null = null;

  constructor() {
    this.load();
    this.saveInterval = window.setInterval(() => this.save(), 30000);
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  // Inventory
  addItem(item: Item, qty = 1): boolean {
    // Try stacking first
    if (item.stackable) {
      for (const slot of this.inventory) {
        if (slot.item?.id === item.id && slot.quantity < item.maxStack) {
          const canAdd = Math.min(qty, item.maxStack - slot.quantity);
          slot.quantity += canAdd;
          qty -= canAdd;
          if (qty <= 0) { this.notify(); return true; }
        }
      }
    }
    // Find empty slots
    while (qty > 0) {
      const empty = this.inventory.find(s => !s.item);
      if (!empty) { this.notify(); return false; }
      const toAdd = item.stackable ? Math.min(qty, item.maxStack) : 1;
      empty.item = item;
      empty.quantity = toAdd;
      qty -= toAdd;
    }
    this.notify();
    return true;
  }

  removeItem(itemId: string, qty = 1): boolean {
    let remaining = qty;
    for (const slot of this.inventory) {
      if (slot.item?.id === itemId && remaining > 0) {
        const toRemove = Math.min(remaining, slot.quantity);
        slot.quantity -= toRemove;
        remaining -= toRemove;
        if (slot.quantity <= 0) { slot.item = null; slot.quantity = 0; }
      }
    }
    this.notify();
    return remaining <= 0;
  }

  countItem(itemId: string): number {
    return this.inventory.reduce((sum, s) => s.item?.id === itemId ? sum + s.quantity : sum, 0);
  }

  hasItems(itemId: string, qty: number): boolean {
    return this.countItem(itemId) >= qty;
  }

  // Equipment
  equip(slot: EquipSlot, inventoryIndex: number) {
    const invSlot = this.inventory[inventoryIndex];
    if (!invSlot.item) return;
    const current = this.equipment[slot];
    // Swap
    this.equipment[slot] = { item: invSlot.item, quantity: 1 };
    if (current.item) {
      this.inventory[inventoryIndex] = { item: current.item, quantity: 1 };
    } else {
      this.inventory[inventoryIndex] = { item: null, quantity: 0 };
    }
    this.notify();
  }

  unequip(slot: EquipSlot) {
    const current = this.equipment[slot];
    if (!current.item) return;
    if (this.addItem(current.item, 1)) {
      this.equipment[slot] = { item: null, quantity: 0 };
    }
    this.notify();
  }

  getEquippedTool(): Item | null {
    const quickBarItem = this.getQuickBarTool();
    if (quickBarItem) return quickBarItem;
    return this.equipment.mainHand.item;
  }

  getSelectedQuickBarItem(): Item | null {
    const invIndex = this.quickBar[this.selectedQuickBarIndex];
    if (invIndex === null) return null;
    return this.inventory[invIndex]?.item || null;
  }

  getQuickBarTool(): Item | null {
    const item = this.getSelectedQuickBarItem();
    if (item && (item.type === 'axe' || item.type === 'pickaxe' || item.type === 'shovel' || item.type === 'hoe' || item.type === 'sword' || item.type === 'knife')) {
      return item;
    }
    return null;
  }

  assignToQuickBar(quickBarIndex: number, inventoryIndex: number) {
    if (quickBarIndex < 0 || quickBarIndex >= 5) return;
    if (inventoryIndex < 0 || inventoryIndex >= this.inventory.length) return;
    if (!this.inventory[inventoryIndex].item) return;
    this.quickBar[quickBarIndex] = inventoryIndex;
    this.notify();
  }

  removeFromQuickBar(quickBarIndex: number) {
    if (quickBarIndex < 0 || quickBarIndex >= 5) return;
    this.quickBar[quickBarIndex] = null;
    this.notify();
  }

  selectQuickBar(index: number) {
    if (index < 0 || index >= 5) return;
    this.selectedQuickBarIndex = index;
    this.notify();
  }

  private validateQuickBarReferences() {
    for (let i = 0; i < 5; i++) {
      const invIndex = this.quickBar[i];
      if (invIndex !== null && (!this.inventory[invIndex] || !this.inventory[invIndex].item)) {
        this.quickBar[i] = null;
      }
    }
  }

  // Crafting
  canCraft(recipe: CraftingRecipe): boolean {
    return recipe.ingredients.every(ing => this.hasItems(ing.item.id, ing.quantity));
  }

  craft(recipe: CraftingRecipe): boolean {
    if (!this.canCraft(recipe)) return false;
    recipe.ingredients.forEach(ing => this.removeItem(ing.item.id, ing.quantity));
    this.addItem(recipe.result, recipe.resultQty);
    this.notify();
    return true;
  }

  // Stats based on equipment and skills
  getStats() {
    let miningSpeed = 1;
    let choppingSpeed = 1;
    let moveSpeed = 1;
    let attackDamage = 1;
    const tool = this.getEquippedTool();
    
    if (tool?.type === 'pickaxe') {
      miningSpeed = 1.5;
      const skill = this.skills[tool.type];
      if (skill) miningSpeed += skill.level * SKILLS_CONFIG.pickaxe.bonusPerLevel;
    }
    if (tool?.type === 'axe') {
      choppingSpeed = 1.5;
      const skill = this.skills[tool.type];
      if (skill) choppingSpeed += skill.level * SKILLS_CONFIG.axe.bonusPerLevel;
    }
    if (tool?.type === 'sword') {
      attackDamage = 1;
      const skill = this.skills[tool.type];
      if (skill) attackDamage += skill.level * SKILLS_CONFIG.sword.bonusPerLevel;
    }
    if (tool?.type === 'knife') {
      attackDamage = 1;
      const skill = this.skills[tool.type];
      if (skill) attackDamage += skill.level * SKILLS_CONFIG.knife.bonusPerLevel;
    }
    if (this.equipment.hands.item) moveSpeed = 1.1;
    return { miningSpeed, choppingSpeed, moveSpeed, attackDamage, hp: this.hp, maxHp: this.maxHp };
  }

  // Skills
  useTool(toolType: string) {
    if (!SKILLS_CONFIG[toolType]) return;
    
    let skill = this.skills[toolType];
    if (!skill) {
      skill = { toolType, xp: 0, level: 0 };
      this.skills[toolType] = skill;
    }
    
    if (skill.level >= MAX_SKILL_LEVEL) return;
    
    skill.xp += 10;
    while (skill.xp >= SKILL_XP_PER_LEVEL && skill.level < MAX_SKILL_LEVEL) {
      skill.xp -= SKILL_XP_PER_LEVEL;
      skill.level++;
    }
    this.notify();
    this.save();
  }

  getSkill(toolType: string): Skill | null {
    return this.skills[toolType] || null;
  }

  getSkillBonus(toolType: string): number {
    const skill = this.skills[toolType];
    if (!skill) return 0;
    const config = SKILLS_CONFIG[toolType];
    if (!config) return 0;
    return skill.level * config.bonusPerLevel;
  }

  unlearnSkill(toolType: string) {
    if (this.skills[toolType]) {
      this.skills[toolType] = { toolType, xp: 0, level: 0 };
      this.notify();
      this.save();
    }
  }

  // UI toggles
  toggleInventory() { this.showInventory = !this.showInventory; this.notify(); }
  toggleCrafting() { this.showCrafting = !this.showCrafting; if (!this.showCrafting) this.save(); this.notify(); }
  toggleEquipment() { this.showEquipment = !this.showEquipment; this.notify(); }
  toggleSkills() { this.showSkills = !this.showSkills; this.notify(); }
  closeAll() { this.showInventory = false; this.showCrafting = false; this.showEquipment = false; this.showSkills = false; this.notify(); }

  // Save/Load
  save() {
    const data: GameSaveData = {
      playerX: this.playerX,
      playerY: this.playerY,
      inventory: this.inventory,
      equipment: this.equipment,
      timestamp: Date.now(),
      resourceStates: this.resourceStates,
      chickenStates: this.chickenStates,
      crabStates: this.crabStates,
      quickBar: this.quickBar,
      selectedQuickBarIndex: this.selectedQuickBarIndex,
      skills: this.skills,
    };
    localStorage.setItem('naturequest_save', JSON.stringify(data));
  }

  load() {
    try {
      const raw = localStorage.getItem('naturequest_save');
      if (!raw) return;
      const data: GameSaveData = JSON.parse(raw);
      this.playerX = data.playerX;
      this.playerY = data.playerY;
      this.inventory = data.inventory;
      this.equipment = data.equipment;
      this.resourceStates = data.resourceStates || {};
      this.chickenStates = data.chickenStates || {};
      this.crabStates = data.crabStates || {};
      this.quickBar = data.quickBar || [null, null, null, null, null];
      this.selectedQuickBarIndex = data.selectedQuickBarIndex || 0;
      this.skills = data.skills || {};
      this.validateQuickBarReferences();
    } catch { /* ignore corrupt saves */ }
  }

  resetSave() {
    localStorage.removeItem('naturequest_save');
    this.inventory = Array.from({ length: 20 }, () => ({ item: null, quantity: 0 }));
    this.equipment = JSON.parse(JSON.stringify(DEFAULT_EQUIPMENT));
    this.playerX = 800;
    this.playerY = 800;
    this.hp = 100;
    this.resourceStates = {};
    this.chickenStates = {};
    this.crabStates = {};
    this.quickBar = [null, null, null, null, null];
    this.selectedQuickBarIndex = 0;
    this.skills = {};
    this.notify();
  }

  updatePlayerPos(x: number, y: number) {
    this.playerX = x;
    this.playerY = y;
  }
}

export const gameStore = new GameStore();
