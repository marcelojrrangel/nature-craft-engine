import Phaser from 'phaser';
import { gameStore } from '../store';
import { ITEMS, HARDNESS, TOOL_DAMAGE, BASE_DAMAGE, DROP_BONUS_CHANCE, TOOL_REQUIREMENTS, type ChickenState, type CrabState } from '../types';
import { gameEvents } from '../events';
import { ChickenNPC } from '../entities/ChickenNPC';
import { CrabNPC } from '../entities/CrabNPC';

const MAP_W = 50;
const MAP_H = 50;
const TILE = 32;
const CHICKEN_COUNT = 10;
const CRAB_COUNT = 12;

interface ResourceObj extends Phaser.GameObjects.Sprite {
  resourceType: 'tree' | 'rock' | 'bush' | 'dead_tree';
  resourceHp: number;
  maxHp: number;
  resourceId: string;
}

type Direction = 'up' | 'down' | 'left' | 'right';

export class MainScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private resources: ResourceObj[] = [];
  private chickens: ChickenNPC[] = [];
  private crabs: CrabNPC[] = [];
  private resourceGroup!: Phaser.Physics.Arcade.StaticGroup;
  private chickenGroup!: Phaser.Physics.Arcade.Group;
  private crabGroup!: Phaser.Physics.Arcade.Group;
  private projectileGroup!: Phaser.Physics.Arcade.Group;
  private speed = 160;
  private isAttacking = false;
  private attackCooldown = 0;
  private interactText!: Phaser.GameObjects.Text;
  private nearWorkbench = false;
  private joyVec = { x: 0, y: 0 };
  private keysDown: Set<string> = new Set();
  private keydownHandler!: (e: KeyboardEvent) => void;
  private keyupHandler!: (e: KeyboardEvent) => void;
  private unsubscribeJoystick?: () => void;
  private unsubscribeAttack?: () => void;
  private unsubscribeInteract?: () => void;
  private respawnCounter = 0;
  private shoreSpawnPoints: { x: number; y: number }[] = [];
  private facingDir: Direction = 'right';

  constructor() { super({ key: 'MainScene' }); }

  create() {
    this.resourceGroup = this.physics.add.staticGroup();
    this.chickenGroup = this.physics.add.group();
    this.crabGroup = this.physics.add.group();
    this.projectileGroup = this.physics.add.group();
    this.generateMap();
    this.buildShoreSpawnPoints();
    this.createPlayer();
    this.generateResources();
    this.generateChickens();
    this.generateCrabs();
    this.setupInput();
    this.setupCamera();
    this.setupCollisions();
    this.interactText = this.add.text(0, 0, '', { fontSize: '12px', color: '#ffffff', backgroundColor: '#00000088', padding: { x: 4, y: 2 } }).setDepth(1000).setVisible(false);
    this.unsubscribeJoystick = gameEvents.on('joystickMove', ({ x, y }) => { this.joyVec = { x, y }; });
    this.unsubscribeAttack = gameEvents.on('attack', () => { this.doAttack(); });
    this.unsubscribeInteract = gameEvents.on('interact', () => { this.doInteract(); });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
  }

  private setupCollisions() {
    this.physics.add.overlap(this.projectileGroup, this.resourceGroup, (arrow, res) => {
      if (!arrow.active) return;
      const resource = res as ResourceObj;
      if (this.canDamageTarget(resource.resourceType, false)) {
        this.applyDamageToResource(resource, gameStore.getStats().attackDamage);
        arrow.destroy();
      }
    });
    this.physics.add.overlap(this.projectileGroup, this.chickenGroup, (arrow, c) => {
      if (!arrow.active) return;
      const npc = this.chickens.find(chi => chi.sprite === c);
      if (npc && this.canDamageTarget('chicken', false)) {
        arrow.destroy();
        this.applyDamageToNPC(npc, 'chicken', gameStore.getStats().attackDamage);
      }
    });
    this.physics.add.overlap(this.projectileGroup, this.crabGroup, (arrow, c) => {
      if (!arrow.active) return;
      const npc = this.crabs.find(cra => cra.sprite === c);
      if (npc && this.canDamageTarget('crab', false)) {
        arrow.destroy();
        this.applyDamageToNPC(npc, 'crab', gameStore.getStats().attackDamage);
      }
    });
  }

  private buildShoreSpawnPoints() {
    this.shoreSpawnPoints = [];
    for (let y = 2; y < MAP_H - 2; y++) {
      for (let x = 2; x < MAP_W - 2; x++) {
        const wx = x * TILE + TILE / 2, wy = y * TILE + TILE / 2;
        const d = Math.sqrt((wx / (MAP_W * TILE) - 0.5) ** 2 + (wy / (MAP_H * TILE) - 0.5) ** 2);
        if (d > 0.405 && d < 0.445) this.shoreSpawnPoints.push({ x: wx, y: wy });
      }
    }
  }

  private generateMap() {
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const d = Math.sqrt((x / MAP_W - 0.5) ** 2 + (y / MAP_H - 0.5) ** 2);
        const tileKey = d > 0.45 ? 'water' : d > 0.38 ? 'sand' : `grass_${Math.floor(Math.random() * 3)}`;
        this.add.sprite(x * TILE + TILE / 2, y * TILE + TILE / 2, tileKey).setDepth(0);
      }
    }
    this.physics.world.setBounds(0, 0, MAP_W * TILE, MAP_H * TILE);
  }

  private generateResources() {
    for (let i = 0; i < 40; i++) { const p = this.getRandomPlaceablePosition(); if (p) this.createResource(p.x, p.y, 'tree', 5, `tree_${i}`); }
    for (let i = 0; i < 30; i++) { const p = this.getRandomPlaceablePosition(); if (p) this.createResource(p.x, p.y, 'rock', 8, `rock_${i}`); }
    for (let i = 0; i < 20; i++) { const p = this.getRandomPlaceablePosition(); if (p) this.createResource(p.x, p.y, 'bush', 3, `bush_${i}`); }
    for (let i = 0; i < 18; i++) { const p = this.getRandomPlaceablePosition(); if (p) this.createResource(p.x, p.y, 'dead_tree', 3, `dead_tree_${i}`); }
    const wb = this.physics.add.sprite(MAP_W * TILE / 2 + 64, MAP_H * TILE / 2 + 64, 'workbench');
    wb.setImmovable(true).setDepth(5); (wb as any).isWorkbench = true;
    this.physics.add.collider(this.player, wb);
  }

  private generateChickens() {
    const now = Date.now();
    for (let i = 0; i < CHICKEN_COUNT; i++) {
      const id = `chicken_${i}`; let s = gameStore.chickenStates[id];
      if (!s) { const p = this.getRandomPlaceablePosition(); if (!p) continue; s = { id, x: p.x, y: p.y, alive: true, respawnAt: null, hp: HARDNESS.chicken }; gameStore.chickenStates[id] = s; }
      if (s.respawnAt && now < s.respawnAt) continue;
      if (!s.alive || s.respawnAt !== null) { s.alive = true; s.respawnAt = null; s.hp = HARDNESS.chicken; }
      this.spawnChicken(s);
    }
  }

  private generateCrabs() {
    const now = Date.now();
    for (let i = 0; i < CRAB_COUNT; i++) {
      const id = `crab_${i}`; let s = gameStore.crabStates[id];
      if (!s) { const p = this.getRandomShorePosition(); if (!p) continue; s = { id, x: p.x, y: p.y, alive: true, respawnAt: null, hp: HARDNESS.crab }; gameStore.crabStates[id] = s; }
      if (s.respawnAt && now < s.respawnAt) continue;
      if (!s.alive || s.respawnAt !== null) { s.alive = true; s.respawnAt = null; s.hp = HARDNESS.crab; }
      this.spawnCrab(s);
    }
  }

  private spawnChicken(s: ChickenState) {
    if (this.chickens.some(c => c.id === s.id)) return;
    const c = new ChickenNPC(this, { id: s.id, x: s.x, y: s.y, wanderRadius: 96 }, s.hp);
    this.chickens.push(c); this.chickenGroup.add(c.sprite); this.physics.add.collider(this.player, c.sprite);
  }

  private spawnCrab(s: CrabState) {
    if (this.crabs.some(c => c.id === s.id)) return;
    const c = new CrabNPC(this, { id: s.id, x: s.x, y: s.y, wanderRadius: 48 }, s.hp);
    this.crabs.push(c); this.crabGroup.add(c.sprite); this.physics.add.collider(this.player, c.sprite);
  }

  private getRandomPlaceablePosition() {
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(3 * TILE, (MAP_W - 3) * TILE), y = Phaser.Math.Between(3 * TILE, (MAP_H - 3) * TILE);
      if (Math.sqrt((x / (MAP_W * TILE) - 0.5) ** 2 + (y / (MAP_H * TILE) - 0.5) ** 2) < 0.36) return { x, y };
    }
    return null;
  }

  private getRandomShorePosition() {
    if (this.shoreSpawnPoints.length === 0) return null;
    return this.shoreSpawnPoints[Phaser.Math.Between(0, this.shoreSpawnPoints.length - 1)];
  }

  private createResource(x: number, y: number, type: 'tree' | 'rock' | 'bush' | 'dead_tree', hp: number, id: string) {
    const shp = gameStore.resourceStates[id]; if (shp !== undefined && shp <= 0) return;
    const s = this.resourceGroup.create(x, y, type) as ResourceObj;
    s.resourceType = type; s.resourceHp = shp ?? hp; s.maxHp = hp; s.resourceId = id; s.setDepth(5);
    this.resources.push(s); this.physics.add.collider(this.player, s);
  }

  private createPlayer() {
    this.player = this.physics.add.sprite(gameStore.playerX, gameStore.playerY, 'player_idle');
    this.player.setDepth(10); const b = this.player.body as Phaser.Physics.Arcade.Body;
    b.setCollideWorldBounds(true).setSize(20, 24).setOffset(6, 8);
    if (!this.anims.exists('idle')) this.anims.create({ key: 'idle', frames: [{ key: 'player_idle' }], frameRate: 1, repeat: -1 });
    if (!this.anims.exists('run')) this.anims.create({ key: 'run', frames: [{ key: 'player_run_0' }, { key: 'player_run_1' }, { key: 'player_run_2' }, { key: 'player_run_3' }], frameRate: 8, repeat: -1 });
    if (!this.anims.exists('attack')) this.anims.create({ key: 'attack', frames: [{ key: 'player_attack' }], frameRate: 4, repeat: 0 });
  }

  private setupInput() {
    this.keydownHandler = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase(); this.keysDown.add(k);
      if (k === 'e') this.doInteract(); if (k === 'i') gameStore.toggleInventory(); if (k === 'q') gameStore.toggleEquipment();
      if (k === 'c' && this.nearWorkbench) gameStore.toggleCrafting(); if (k === 'k') gameStore.toggleSkills();
      if (k === ' ') { e.preventDefault(); this.doAttack(); } if (k === 'escape') gameStore.closeAll();
    };
    this.keyupHandler = (e: KeyboardEvent) => this.keysDown.delete(e.key.toLowerCase());
    window.addEventListener('keydown', this.keydownHandler); window.addEventListener('keyup', this.keyupHandler);
  }

  private setupCamera() { this.cameras.main.startFollow(this.player, true, 0.08, 0.08); this.cameras.main.setBounds(0, 0, MAP_W * TILE, MAP_H * TILE).setZoom(2); }

  shutdown() {
    window.removeEventListener('keydown', this.keydownHandler); window.removeEventListener('keyup', this.keyupHandler);
    this.unsubscribeJoystick?.(); this.unsubscribeAttack?.(); this.unsubscribeInteract?.();
    this.chickens.forEach(c => c.destroy()); this.crabs.forEach(c => c.destroy());
  }

  private showFloatingText(x: number, y: number, text: string, color: string) {
    if (!this.scene.isActive()) return;
    const f = this.add.text(x, y, text, { fontSize: '12px', color, fontStyle: 'bold', backgroundColor: '#00000066', padding: { x: 4, y: 2 } }).setDepth(1000);
    this.tweens.add({ targets: f, y: y - 24, alpha: 0, duration: 850, onComplete: () => f.destroy() });
  }

  private canDamageTarget(type: string, show = true): boolean {
    const t = gameStore.getEquippedTool()?.type || 'hands', r = TOOL_REQUIREMENTS[type];
    if (!r || r.includes(t as any)) return true;
    if (show) {
      let m = 'Ferramenta incorreta';
      if (r.includes('axe')) m = 'Precisa de Machado 🪓'; else if (r.includes('pickaxe')) m = 'Precisa de Picareta ⛏️'; else if (r.includes('sword') || r.includes('knife')) m = 'Precisa de Lâmina ⚔️';
      this.showFloatingText(this.player.x, this.player.y - 40, m, '#ffcc66');
    }
    return false;
  }

  private fireArrow() {
    if (!gameStore.hasAmmo()) { this.showFloatingText(this.player.x, this.player.y - 40, 'Sem flechas! 🏹', '#ff4444'); return; }
    gameStore.consumeAmmo(); gameStore.useTool('bow');
    
    let vx = 0, vy = 0, rotation = 0;
    switch (this.facingDir) {
      case 'up': vy = -400; rotation = -Math.PI / 2; break;
      case 'down': vy = 400; rotation = Math.PI / 2; break;
      case 'left': vx = -400; rotation = Math.PI; break;
      case 'right': vx = 400; rotation = 0; break;
    }

    const arrow = this.physics.add.sprite(this.player.x, this.player.y, 'arrow_projectile').setDepth(15);
    arrow.setRotation(rotation);

    this.projectileGroup.add(arrow);
    const body = arrow.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false).setVelocity(vx, vy);
    
    this.time.delayedCall(1500, () => { if (arrow && arrow.active) arrow.destroy(); });
  }

  private applyDamageToResource(res: ResourceObj, dmg: number) {
    if (!res || !res.active) return;
    res.resourceHp -= dmg; gameStore.resourceStates[res.resourceId] = res.resourceHp; res.setTint(0xffffff);
    this.time.delayedCall(100, () => { if (res && res.active) res.clearTint(); });
    const t = this.add.text(res.x, res.y - 20, `-${dmg.toFixed(0)}`, { fontSize: '10px', color: '#ff4444', fontStyle: 'bold' }).setDepth(1000);
    this.tweens.add({ targets: t, y: res.y - 40, alpha: 0, duration: 600, onComplete: () => t.destroy() });
    if (res.resourceHp <= 0) this.harvestResource(res);
  }

  private applyDamageToNPC(npc: any, type: string, dmg: number) {
    if (!npc || !npc.id) return;
    const stateMap = type === 'chicken' ? gameStore.chickenStates : gameStore.crabStates;
    const state = stateMap[npc.id];
    if (!state) return;
    
    const hp = npc.takeDamage(dmg); state.hp = hp;
    const t = this.add.text(npc.sprite.x, npc.sprite.y - 20, `-${dmg.toFixed(0)} HP`, { fontSize: '10px', color: '#ff4444', fontStyle: 'bold' }).setDepth(1000);
    this.tweens.add({ targets: t, y: npc.sprite.y - 40, alpha: 0, duration: 600, onComplete: () => t.destroy() });
    
    if (hp <= 0) {
      if (type === 'chicken') this.collectChicken(npc);
      else this.collectCrab(npc);
    }
  }

  private doAttack() {
    if (this.isAttacking || this.attackCooldown > 0) return;
    this.isAttacking = true; this.attackCooldown = 300; this.player.play('attack');
    const t = gameStore.getEquippedTool(); if (t?.type === 'bow') this.fireArrow(); else this.doMeleeAttack();
    this.time.delayedCall(250, () => { this.isAttacking = false; });
  }

  private doMeleeAttack() {
    const stats = gameStore.getStats(), t = gameStore.getEquippedTool();
    const chi = this.chickens.find(c => c.isInRange(this.player.x, this.player.y, 42));
    if (chi && this.canDamageTarget('chicken')) { gameStore.useTool(t?.type === 'knife' ? 'knife' : 'sword'); this.applyDamageToNPC(chi, 'chicken', stats.attackDamage); }
    const cra = this.crabs.find(c => c.isInRange(this.player.x, this.player.y, 42));
    if (cra && this.canDamageTarget('crab')) { gameStore.useTool(t?.type === 'knife' ? 'knife' : 'sword'); this.applyDamageToNPC(cra, 'crab', stats.attackDamage); }
    for (const res of this.resources) {
      if (res.active && Phaser.Math.Distance.Between(this.player.x, this.player.y, res.x, res.y) < 40 && this.canDamageTarget(res.resourceType)) {
        let dmg = stats.attackDamage;
        if (res.resourceType === 'tree' || res.resourceType === 'dead_tree') { dmg = BASE_DAMAGE * TOOL_DAMAGE[stats.toolType] * stats.choppingSpeed; gameStore.useTool('axe'); }
        else if (res.resourceType === 'rock') { dmg = BASE_DAMAGE * TOOL_DAMAGE[stats.toolType] * stats.miningSpeed; gameStore.useTool('pickaxe'); }
        else dmg = BASE_DAMAGE * TOOL_DAMAGE[stats.toolType];
        this.applyDamageToResource(res, dmg);
      }
    }
  }

  private collectChicken(c: ChickenNPC) {
    const s = gameStore.chickenStates[c.id]; if (!s) return;
    s.alive = false; s.respawnAt = Date.now() + Phaser.Math.Between(30000, 60000);
    if (Math.random() < 0.7) gameStore.addItem(ITEMS.feather, 1); if (Math.random() < 0.5) gameStore.addItem(ITEMS.chicken_meat, 1);
    c.collect(); this.time.delayedCall(80, () => { if (c.sprite && c.sprite.active) c.destroy(); });
    this.chickens = this.chickens.filter(chi => chi.id !== c.id); gameStore.save();
  }

  private collectCrab(c: CrabNPC) {
    const s = gameStore.crabStates[c.id]; if (!s) return;
    s.alive = false; s.respawnAt = Date.now() + Phaser.Math.Between(30000, 60000);
    if (Math.random() < 0.7) gameStore.addItem(ITEMS.crab_shell, 1); if (Math.random() < 0.5) gameStore.addItem(ITEMS.crab_meat, 1);
    c.collect(); this.time.delayedCall(80, () => { if (c.sprite && c.sprite.active) c.destroy(); });
    this.crabs = this.crabs.filter(cra => cra.id !== c.id); gameStore.save();
  }

  private harvestResource(res: ResourceObj) {
    if (!res || !res.active) return;
    let item, qty = 1;
    switch (res.resourceType) {
      case 'tree': item = ITEMS.wood; qty = Phaser.Math.Between(2, 4); break;
      case 'dead_tree': item = ITEMS.twig; qty = Phaser.Math.Between(2, 5); break;
      case 'rock': item = ITEMS.stone; qty = Phaser.Math.Between(1, 3); break;
      case 'bush': item = Math.random() > 0.5 ? ITEMS.fiber : ITEMS.seed; qty = Phaser.Math.Between(1, 2); break;
    }
    if (item) gameStore.addItem(item, qty);
    this.respawnCounter++; gameStore.respawnQueue.push({ x: res.x, y: res.y, type: res.resourceType, hp: res.maxHp, id: `${res.resourceType}_r${this.respawnCounter}_${Date.now()}`, respawnAt: Date.now() + Phaser.Math.Between(30000, 60000) });
    this.resources = this.resources.filter(r => r !== res); delete gameStore.resourceStates[res.resourceId]; res.destroy(); gameStore.save();
  }

  private processRespawns() {
    const now = Date.now();
    for (let i = gameStore.respawnQueue.length - 1; i >= 0; i--) {
      const e = gameStore.respawnQueue[i]; if (now >= e.respawnAt) { gameStore.respawnQueue.splice(i, 1); this.createResource(e.x, e.y, e.type as any, e.hp, e.id); }
    }
    let ch = false;
    for (const s of Object.values(gameStore.chickenStates)) { if (!s.alive && s.respawnAt && now >= s.respawnAt) { s.alive = true; s.respawnAt = null; this.spawnChicken(s); ch = true; } }
    for (const s of Object.values(gameStore.crabStates)) { if (!s.alive && s.respawnAt && now >= s.respawnAt) { s.alive = true; s.respawnAt = null; this.spawnCrab(s); ch = true; } }
    if (ch) gameStore.save();
  }

  private doInteract() { if (this.nearWorkbench) gameStore.toggleCrafting(); }

  update(_t: number, delta: number) {
    if (this.attackCooldown > 0) this.attackCooldown -= delta; this.processRespawns();
    this.chickens.forEach(c => c.update(delta)); this.crabs.forEach(c => c.update(delta));
    if (this.isAttacking) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body; let vx = 0, vy = 0;
    if (this.keysDown.has('arrowleft') || this.keysDown.has('a')) { vx = -1; this.facingDir = 'left'; }
    else if (this.keysDown.has('arrowright') || this.keysDown.has('d')) { vx = 1; this.facingDir = 'right'; }
    if (this.keysDown.has('arrowup') || this.keysDown.has('w')) { vy = -1; this.facingDir = 'up'; }
    else if (this.keysDown.has('arrowdown') || this.keysDown.has('s')) { vy = 1; this.facingDir = 'down'; }
    
    if (this.joyVec.x !== 0 || this.joyVec.y !== 0) { 
      vx = this.joyVec.x; vy = this.joyVec.y; 
      if (Math.abs(vx) > Math.abs(vy)) this.facingDir = vx < 0 ? 'left' : 'right';
      else this.facingDir = vy < 0 ? 'up' : 'down';
    }
    
    const stats = gameStore.getStats();
    if (vx !== 0 || vy !== 0) {
      const len = Math.sqrt(vx * vx + vy * vy); body.setVelocity((vx / len) * 160 * stats.moveSpeed, (vy / len) * 160 * stats.moveSpeed);
      this.player.setFlipX(this.facingDir === 'left').play('run', true);
    } else { if (body) body.setVelocity(0, 0); this.player.play('idle', true); }
    gameStore.updatePlayerPos(this.player.x, this.player.y);
    this.nearWorkbench = false;
    this.children.getAll().forEach((c: any) => {
      if (c.isWorkbench && Phaser.Math.Distance.Between(this.player.x, this.player.y, c.x, c.y) < 50) {
        this.nearWorkbench = true; this.interactText.setText('[C] Bancada').setPosition(c.x - 30, c.y - 30).setVisible(true);
      }
    });
    if (!this.nearWorkbench) this.interactText.setVisible(false);
    this.player.setDepth(this.player.y); this.resources.forEach(r => r.setDepth(r.y));
    this.chickens.forEach(c => c.sprite.setDepth(c.sprite.y)); this.crabs.forEach(c => c.sprite.setDepth(c.sprite.y));
  }
}
