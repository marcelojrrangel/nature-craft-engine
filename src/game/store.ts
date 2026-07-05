// Reactive game store for shared state between Phaser & React
import { ITEMS, DEFAULT_EQUIPMENT, RECIPES, SKILLS_CONFIG, SKILL_XP_PER_LEVEL, MAX_SKILL_LEVEL, TOOL_DAMAGE, BASE_DAMAGE, type InventorySlot, type Equipment, type Item, type EquipSlot, type GameSaveData, type CraftingRecipe, type ChickenState, type CrabState, type BearState, type RabbitState, type Skill, type PlacedItem } from './types';
import { saveToIndexedDB, loadFromIndexedDB, deleteFromIndexedDB } from './persistence';

type Listener = () => void;
type SliceKey = 'inventory' | 'equipment' | 'player' | 'ui' | 'world' | 'skills';

class GameStore {
  private allListeners: Set<Listener> = new Set();
  private sliceListeners = new Map<SliceKey, Set<Listener>>();

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
  bearStates: Record<string, BearState> = {};
  rabbitStates: Record<string, RabbitState> = {};
  placedItems: PlacedItem[] = [];
  skills: Record<string, Skill> = {};
  showSkills = false;
  respawnQueue: { x: number; y: number; type: string; hp: number; id: string; respawnAt: number }[] = [];
  private saveInterval: number | null = null;

  constructor() {
    this.load();
    this.saveInterval = window.setInterval(() => this.save(), 30000);
  }

  receiveDamage(amount: number) {
    this.hp = Math.max(0, this.hp - amount);
    this.notify('player');
    if (this.hp <= 0) { this.gameOver(); }
  }

  private gameOver() {
    alert('Você morreu! O jogo será reiniciado.');
    this.resetSave();
    window.location.reload();
  }

  subscribe(sliceOrFn: SliceKey | Listener, fn?: Listener): () => void {
    if (typeof sliceOrFn === 'function') {
      this.allListeners.add(sliceOrFn);
      return () => this.allListeners.delete(sliceOrFn);
    }
    if (!this.sliceListeners.has(sliceOrFn)) {
      this.sliceListeners.set(sliceOrFn, new Set());
    }
    this.sliceListeners.get(sliceOrFn)!.add(fn!);
    return () => this.sliceListeners.get(sliceOrFn)?.delete(fn!);
  }

  private notify(slice?: SliceKey) {
    if (slice) {
      this.sliceListeners.get(slice)?.forEach(fn => fn());
    } else {
      this.sliceListeners.forEach(set => set.forEach(fn => fn()));
    }
    this.allListeners.forEach(fn => fn());
  }

  addItem(item: Item, qty = 1): boolean {
    if (item.stackable) {
      for (const slot of this.inventory) {
        if (slot.item?.id === item.id && slot.quantity < item.maxStack) {
          const canAdd = Math.min(qty, item.maxStack - slot.quantity);
          slot.quantity += canAdd; qty -= canAdd;
          if (qty <= 0) { this.notify('inventory'); this.save(); return true; }
        }
      }
    }
    while (qty > 0) {
      const empty = this.inventory.find(s => !s.item);
      if (!empty) { this.notify('inventory'); return false; }
      const toAdd = item.stackable ? Math.min(qty, item.maxStack) : 1;
      empty.item = item; empty.quantity = toAdd; qty -= toAdd;
    }
    this.notify('inventory'); this.save(); return true;
  }

  removeItem(itemId: string, qty = 1): boolean {
    let remaining = qty;
    for (const slot of this.inventory) {
      if (slot.item?.id === itemId && remaining > 0) {
        const toRemove = Math.min(remaining, slot.quantity);
        slot.quantity -= toRemove; remaining -= toRemove;
        if (slot.quantity <= 0) { slot.item = null; slot.quantity = 0; }
      }
    }
    this.validateQuickBarReferences(); this.notify('inventory'); this.save(); return remaining <= 0;
  }

  countItem(itemId: string): number {
    return this.inventory.reduce((sum, s) => s.item?.id === itemId ? sum + s.quantity : sum, 0);
  }

  hasItems(itemId: string, qty: number): boolean { return this.countItem(itemId) >= qty; }
  hasAmmo(): boolean { return this.hasItems('arrow', 1); }
  consumeAmmo(): boolean { return this.removeItem('arrow', 1); }

  useItem(index: number) {
    const slot = this.inventory[index];
    if (!slot.item) return;
    if (slot.item.type === 'food') {
      const bonusHp = slot.item.bonus?.hp || 20;
      this.hp = Math.min(this.maxHp, this.hp + bonusHp);
      this.removeItem(slot.item.id, 1);
      this.notify('player');
    } else if (slot.item.id === 'campfire') {
      import('./events').then(m => { m.gameEvents.emit('placeItem', { type: 'campfire', inventoryIndex: index }); });
    } else if (slot.item.type === 'armor') {
      const slotMap: Record<string, EquipSlot> = { 'helmet_rustic': 'head', 'gloves_rustic': 'hands', 'boots_rustic': 'legs' };
      const equipSlot = slotMap[slot.item.id];
      if (equipSlot) this.equip(equipSlot, index);
    } 
  }

  placeItem(type: string, x: number, y: number, inventoryIndex: number) {
    this.placedItems.push({ id: `${type}_${Date.now()}`, type, x, y });
    this.removeItem(this.inventory[inventoryIndex].item!.id, 1);
    this.notify('world'); this.save();
  }

  equip(slot: EquipSlot, inventoryIndex: number) {
    const invSlot = this.inventory[inventoryIndex];
    if (!invSlot.item) return;
    const current = this.equipment[slot];
    this.equipment[slot] = { item: invSlot.item, quantity: 1 };
    if (current.item) { this.inventory[inventoryIndex] = { item: current.item, quantity: 1 }; }
    else { this.inventory[inventoryIndex] = { item: null, quantity: 0 }; }
    this.notify('equipment');
  }

  unequip(slot: EquipSlot) {
    const current = this.equipment[slot];
    if (!current.item) return;
    if (this.addItem(current.item, 1)) { this.equipment[slot] = { item: null, quantity: 0 }; }
    this.notify('equipment');
  }

  getEquippedTool(): Item | null {
    const quickBarItem = this.getQuickBarTool();
    if (quickBarItem) return quickBarItem;
    return null; 
  }

  getSelectedQuickBarItem(): Item | null {
    const invIndex = this.quickBar[this.selectedQuickBarIndex];
    if (invIndex === null) return null;
    return this.inventory[invIndex]?.item || null;
  }

  getQuickBarTool(): Item | null {
    const item = this.getSelectedQuickBarItem();
    if (item && (item.type === 'axe' || item.type === 'pickaxe' || item.type === 'shovel' || item.type === 'hoe' || item.type === 'sword' || item.type === 'knife' || item.type === 'bow')) {
      return item;
    }
    return null;
  }

  assignToQuickBar(quickBarIndex: number, inventoryIndex: number) {
    if (quickBarIndex < 0 || quickBarIndex >= 5) return;
    if (inventoryIndex < 0 || inventoryIndex >= this.inventory.length) return;
    if (!this.inventory[inventoryIndex].item) return;
    for (let i = 0; i < 5; i++) { if (this.quickBar[i] === inventoryIndex) { this.quickBar[i] = null; } }
    this.quickBar[quickBarIndex] = inventoryIndex;
    this.notify('inventory');
  }

  removeFromQuickBar(quickBarIndex: number) { this.quickBar[quickBarIndex] = null; this.notify('inventory'); }
  selectQuickBar(index: number) { this.selectedQuickBarIndex = index; this.notify('inventory'); }

  private validateQuickBarReferences() {
    for (let i = 0; i < 5; i++) {
      const invIndex = this.quickBar[i];
      if (invIndex !== null && (!this.inventory[invIndex] || !this.inventory[invIndex].item)) { this.quickBar[i] = null; }
    }
  }

  canCraft(recipe: CraftingRecipe): boolean { return recipe.ingredients.every(ing => this.hasItems(ing.item.id, ing.quantity)); }
  craft(recipe: CraftingRecipe): boolean {
    if (!this.canCraft(recipe)) return false;
    recipe.ingredients.forEach(ing => this.removeItem(ing.item.id, ing.quantity));
    this.addItem(recipe.result, recipe.resultQty);
    this.notify('inventory'); return true;
  }

  getStats() {
    const tool = this.getEquippedTool();
    const toolType = tool?.type || 'hands';
    let miningSpeed = 1, choppingSpeed = 1, moveSpeed = 1, attackDamageBonus = 0, extraMaxHp = 0;
    let skillBonus = 0;
    if (tool) {
      const skill = this.skills[toolType];
      if (skill) { const config = SKILLS_CONFIG[toolType]; if (config) skillBonus = skill.level * config.bonusPerLevel; }
    }
    Object.values(this.equipment).forEach(slot => {
      if (slot.item?.bonus) {
        if (slot.item.bonus.hp) extraMaxHp += slot.item.bonus.hp;
        if (slot.item.bonus.moveSpeed) moveSpeed += slot.item.bonus.moveSpeed;
        if (slot.item.bonus.dmg) attackDamageBonus += slot.item.bonus.dmg;
      }
    });
    const currentMaxHp = 100 + extraMaxHp;
    const baseToolDmg = tool ? (TOOL_DAMAGE[toolType] || 1) : TOOL_DAMAGE.hands;
    const attackDamage = (BASE_DAMAGE * baseToolDmg) * (1 + skillBonus + attackDamageBonus);
    if (tool?.type === 'pickaxe') { miningSpeed = TOOL_DAMAGE.pickaxe + (this.skills.pickaxe?.level || 0) * SKILLS_CONFIG.pickaxe.bonusPerLevel; }
    if (tool?.type === 'axe') { choppingSpeed = TOOL_DAMAGE.axe + (this.skills.axe?.level || 0) * SKILLS_CONFIG.axe.bonusPerLevel; }
    if (tool?.type === 'sword') { choppingSpeed = TOOL_DAMAGE.sword + (this.skills.sword?.level || 0) * SKILLS_CONFIG.sword.bonusPerLevel; }
    return { miningSpeed, choppingSpeed, moveSpeed, attackDamage, toolType, hp: this.hp, maxHp: currentMaxHp };
  }

  // Skills Logic
  getXPForLevel(level: number): number {
    if (level === 0) return 100;
    return Math.floor(100 * Math.pow(1.5, level));
  }

  useTool(toolType: string, xpAmount: number = 2) {
    if (!SKILLS_CONFIG[toolType]) return;
    let skill = this.skills[toolType];
    if (!skill) { skill = { toolType, xp: 0, level: 0 }; this.skills[toolType] = skill; }
    if (skill.level >= MAX_SKILL_LEVEL) return;
    
    skill.xp += xpAmount;
    let needed = this.getXPForLevel(skill.level);
    
    while (skill.xp >= needed && skill.level < MAX_SKILL_LEVEL) {
      skill.xp -= needed;
      skill.level++;
      needed = this.getXPForLevel(skill.level);
    }
    this.notify('skills');
  }

  getSkill(toolType: string): Skill | null { return this.skills[toolType] || null; }
  unlearnSkill(toolType: string) { if (this.skills[toolType]) { this.skills[toolType] = { toolType, xp: 0, level: 0 }; this.notify('skills'); this.save(); } }

  toggleInventory() { this.showInventory = !this.showInventory; this.notify('ui'); }
  toggleCrafting() { this.showCrafting = !this.showCrafting; if (!this.showCrafting) this.save(); this.notify('ui'); }
  toggleEquipment() { this.showEquipment = !this.showEquipment; this.notify('ui'); }
  toggleSkills() { this.showSkills = !this.showSkills; this.notify('ui'); }
  closeAll() { this.showInventory = false; this.showCrafting = false; this.showEquipment = false; this.showSkills = false; this.notify('ui'); }

  private buildSaveData(): GameSaveData {
    return {
      playerX: this.playerX, playerY: this.playerY, inventory: this.inventory, equipment: this.equipment, timestamp: Date.now(),
      resourceStates: this.resourceStates, chickenStates: this.chickenStates, crabStates: this.crabStates, bearStates: this.bearStates, rabbitStates: this.rabbitStates,
      placedItems: this.placedItems, quickBar: this.quickBar, selectedQuickBarIndex: this.selectedQuickBarIndex, skills: this.skills, respawnQueue: this.respawnQueue,
    };
  }

  private applySaveData(data: GameSaveData) {
    this.playerX = data.playerX; this.playerY = data.playerY; this.inventory = data.inventory; this.equipment = data.equipment;
    this.resourceStates = data.resourceStates || {}; this.chickenStates = data.chickenStates || {}; this.crabStates = data.crabStates || {};
    this.bearStates = data.bearStates || {}; this.rabbitStates = data.rabbitStates || {}; this.placedItems = data.placedItems || [];
    this.quickBar = data.quickBar || [null, null, null, null, null]; this.selectedQuickBarIndex = data.selectedQuickBarIndex || 0;
    this.skills = data.skills || {}; this.respawnQueue = data.respawnQueue || [];
    this.validateQuickBarReferences();
  }

  save() {
    const data = this.buildSaveData();
    localStorage.setItem('naturequest_save', JSON.stringify(data));
    saveToIndexedDB(data);
  }

  load() {
    try {
      const raw = localStorage.getItem('naturequest_save');
      if (raw) {
        const data: GameSaveData = JSON.parse(raw);
        this.applySaveData(data);
      }
    } catch { /* ignore corrupt saves */ }

    loadFromIndexedDB().then(idbData => {
      if (!idbData) return;
      const localTimestamp = localStorage.getItem('naturequest_save')
        ? (JSON.parse(localStorage.getItem('naturequest_save')!) as GameSaveData).timestamp
        : 0;
      if (!localTimestamp || idbData.timestamp > localTimestamp) {
        this.applySaveData(idbData);
        this.notify();
      }
    });
  }

  resetSave() {
    localStorage.removeItem('naturequest_save');
    deleteFromIndexedDB();
    this.inventory = Array.from({ length: 20 }, () => ({ item: null, quantity: 0 }));
    this.equipment = JSON.parse(JSON.stringify(DEFAULT_EQUIPMENT)); this.playerX = 800; this.playerY = 800; this.hp = 100;
    this.resourceStates = {}; this.chickenStates = {}; this.crabStates = {}; this.bearStates = {}; this.rabbitStates = {}; this.placedItems = [];
    this.quickBar = [null, null, null, null, null]; this.selectedQuickBarIndex = 0; this.skills = {}; this.respawnQueue = [];
    this.notify();
  }

  updatePlayerPos(x: number, y: number) { this.playerX = x; this.playerY = y; }
}

export const gameStore = new GameStore();
