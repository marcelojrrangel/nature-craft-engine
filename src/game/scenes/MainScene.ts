import Phaser from 'phaser';
import { gameStore } from '../store';
import { ITEMS, HARDNESS, TOOL_DAMAGE, BASE_DAMAGE, DROP_BONUS_CHANCE, TOOL_REQUIREMENTS, type ChickenState, type CrabState, type BearState, type RabbitState } from '../types';
import { gameEvents } from '../events';
import { ChickenNPC } from '../entities/ChickenNPC';
import { CrabNPC } from '../entities/CrabNPC';
import { BearNPC } from '../entities/BearNPC';
import { RabbitNPC } from '../entities/RabbitNPC';

const MAP_W = 50;
const MAP_H = 50;
const TILE = 32;
const CHICKEN_COUNT = 10;
const CRAB_COUNT = 12;
const BEAR_COUNT = 4;
const RABBIT_COUNT = 8;
const SAFE_ZONE_RADIUS = 100;

interface ResourceObj extends Phaser.GameObjects.Sprite {
  resourceType: 'tree' | 'rock' | 'bush' | 'dead_tree' | 'small_rock';
  resourceHp: number;
  maxHp: number;
  resourceId: string;
}

export class MainScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private resources: ResourceObj[] = [];
  private chickens: ChickenNPC[] = [];
  private crabs: CrabNPC[] = [];
  private bears: BearNPC[] = [];
  private rabbits: RabbitNPC[] = [];
  private campfireSprites: Phaser.GameObjects.Sprite[] = [];
  
  private workbench!: Phaser.Physics.Arcade.Sprite;
  private resourceGroup!: Phaser.Physics.Arcade.StaticGroup;
  private chickenGroup!: Phaser.Physics.Arcade.Group;
  private crabGroup!: Phaser.Physics.Arcade.Group;
  private bearGroup!: Phaser.Physics.Arcade.Group;
  private rabbitGroup!: Phaser.Physics.Arcade.Group;
  private projectileGroup!: Phaser.Physics.Arcade.Group;

  private speed = 160;
  private isAttacking = false;
  private attackCooldown = 0;
  private interactText!: Phaser.GameObjects.Text;
  private nearWorkbench = false;
  private nearCampfire = false;
  private inSafeZone = false;
  private joyVec = { x: 0, y: 0 };
  private respawnCounter = 0;
  private shoreSpawnPoints: { x: number; y: number }[] = [];
  private facingDir: 'up' | 'down' | 'left' | 'right' = 'right';
  private resourceHpGraphics!: Phaser.GameObjects.Graphics;
  private safeZoneVisual!: Phaser.GameObjects.Graphics;

  private keyI!: Phaser.Input.Keyboard.Key;
  private keyQ!: Phaser.Input.Keyboard.Key;
  private keyC!: Phaser.Input.Keyboard.Key;
  private keyK!: Phaser.Input.Keyboard.Key;
  private keyE!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;
  private keyEsc!: Phaser.Input.Keyboard.Key;
  private moveKeys!: { W: Phaser.Input.Keyboard.Key, A: Phaser.Input.Keyboard.Key, S: Phaser.Input.Keyboard.Key, D: Phaser.Input.Keyboard.Key, UP: Phaser.Input.Keyboard.Key, LEFT: Phaser.Input.Keyboard.Key, DOWN: Phaser.Input.Keyboard.Key, RIGHT: Phaser.Input.Keyboard.Key };

  private unsubscribeList: (() => void)[] = [];

  constructor() { super({ key: 'MainScene' }); }

  // Definir como arrow function para garantir contexto
  private drawSafeZone = () => {
    const wbX = MAP_W * TILE / 2 + 64, wbY = MAP_H * TILE / 2 + 64;
    if (!this.safeZoneVisual) return;
    this.safeZoneVisual.clear();
    this.safeZoneVisual.lineStyle(2, 0x3498db, 0.3);
    this.safeZoneVisual.strokeCircle(wbX, wbY, SAFE_ZONE_RADIUS);
    this.safeZoneVisual.fillStyle(0x3498db, 0.05);
    this.safeZoneVisual.fillCircle(wbX, wbY, SAFE_ZONE_RADIUS);
  };

  create() {
    this.resourceGroup = this.physics.add.staticGroup();
    this.chickenGroup = this.physics.add.group();
    this.crabGroup = this.physics.add.group();
    this.bearGroup = this.physics.add.group();
    this.rabbitGroup = this.physics.add.group();
    this.projectileGroup = this.physics.add.group();
    this.resourceHpGraphics = this.add.graphics().setDepth(2000);
    this.safeZoneVisual = this.add.graphics().setDepth(1);

    this.generateMap();
    this.buildShoreSpawnPoints();
    this.createPlayer();
    this.generateResources();
    this.generateChickens();
    this.generateCrabs();
    this.generateBears();
    this.generateRabbits();
    this.setupInput();
    this.setupCamera();
    this.setupCollisions();
    
    // Chamar o método garantido
    this.drawSafeZone();
    this.restorePlacedItems();

    this.interactText = this.add.text(0, 0, '', { fontSize: '12px', color: '#ffffff', backgroundColor: '#00000088', padding: { x: 4, y: 2 } }).setDepth(1000).setVisible(false);
    
    this.unsubscribeList.push(gameEvents.on('joystickMove', ({ x, y }) => { this.joyVec = { x, y }; }));
    this.unsubscribeList.push(gameEvents.on('attack', () => { this.doAttack(); }));
    this.unsubscribeList.push(gameEvents.on('interact', () => { this.doInteract(); }));
    this.unsubscribeList.push(gameEvents.on('placeItem', ({ type, inventoryIndex }) => { this.handlePlaceItem(type, inventoryIndex); }));

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
  }

  private restorePlacedItems() {
    gameStore.placedItems.forEach(item => {
      if (item.type === 'campfire') this.createCampfire(item.x, item.y);
    });
  }

  private handlePlaceItem(type: string, inventoryIndex: number) {
    if (type === 'campfire') {
      const x = this.player.x, y = this.player.y + 10;
      this.createCampfire(x, y);
      gameStore.placeItem(type, x, y, inventoryIndex);
      this.showFloatingText(x, y - 20, 'Fogueira posicionada!', '#ffaa00');
      gameStore.closeAll();
    }
  }

  private createCampfire(x: number, y: number) {
    const base = this.add.sprite(x, y, 'campfire_base').setDepth(y - 1);
    const fire = this.add.sprite(x, y - 4, 'fire_0').setDepth(y);
    if (!this.anims.exists('burn')) {
      this.anims.create({ key: 'burn', frames: [{ key: 'fire_0' }, { key: 'fire_1' }, { key: 'fire_2' }], frameRate: 10, repeat: -1 });
    }
    fire.play('burn');
    this.campfireSprites.push(fire);
    this.add.circle(x, y, 40, 0xffaa00, 0.15).setDepth(0);
  }

  private setupCollisions() {
    this.physics.add.overlap(this.projectileGroup, this.resourceGroup, (arrow, res) => {
      if (!arrow.active) return;
      const resource = res as ResourceObj;
      if (this.canDamageTarget(resource.resourceType, false)) { this.applyDamageToResource(resource, gameStore.getStats().attackDamage); arrow.destroy(); }
    });
    const npcConfigs = [
      { group: this.chickenGroup, list: this.chickens, type: 'chicken' },
      { group: this.crabGroup, list: this.crabs, type: 'crab' },
      { group: this.bearGroup, list: this.bears, type: 'bear' },
      { group: this.rabbitGroup, list: this.rabbits, type: 'rabbit' }
    ];
    npcConfigs.forEach(cfg => {
      this.physics.add.overlap(this.projectileGroup, cfg.group, (arrow, sprite) => {
        if (!arrow.active) return;
        const npc = cfg.list.find((n: any) => n.sprite === sprite);
        if (npc && this.canDamageTarget(cfg.type, false)) { arrow.destroy(); this.applyDamageToNPC(npc, cfg.type, gameStore.getStats().attackDamage); }
      });
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
    for (let i = 0; i < 40; i++) { const p = this.getRandomPlaceablePosition(); if (p) this.createResource(p.x, p.y, 'tree', 12, `tree_${i}`); }
    for (let i = 0; i < 30; i++) { const p = this.getRandomPlaceablePosition(); if (p) this.createResource(p.x, p.y, 'rock', 18, `rock_${i}`); }
    for (let i = 0; i < 20; i++) { const p = this.getRandomPlaceablePosition(); if (p) this.createResource(p.x, p.y, 'bush', 3, `bush_${i}`); }
    for (let i = 0; i < 18; i++) { const p = this.getRandomPlaceablePosition(); if (p) this.createResource(p.x, p.y, 'dead_tree', 6, `dead_tree_${i}`); }
    const wbX = MAP_W * TILE / 2 + 64, wbY = MAP_H * TILE / 2 + 64;
    for (let i = 0; i < 15; i++) {
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2), dist = Phaser.Math.Between(60, 200);
      this.createResource(wbX + Math.cos(angle) * dist, wbY + Math.sin(angle) * dist, 'small_rock', 2, `small_rock_${i}`);
    }
    this.workbench = this.physics.add.sprite(wbX, wbY, 'workbench');
    this.workbench.setImmovable(true).setDepth(5); (this.workbench as any).isWorkbench = true;
    this.physics.add.collider(this.player, this.workbench);
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

  private generateBears() {
    const now = Date.now();
    for (let i = 0; i < BEAR_COUNT; i++) {
      const id = `bear_${i}`; let s = gameStore.bearStates[id];
      if (!s) { const p = this.getRandomBearPosition(); if (!p) continue; s = { id, x: p.x, y: p.y, alive: true, respawnAt: null, hp: HARDNESS.bear }; gameStore.bearStates[id] = s; }
      if (s.respawnAt && now < s.respawnAt) continue;
      if (!s.alive || s.respawnAt !== null) { s.alive = true; s.respawnAt = null; s.hp = HARDNESS.bear; }
      this.spawnBear(s);
    }
  }

  private generateRabbits() {
    const now = Date.now();
    for (let i = 0; i < RABBIT_COUNT; i++) {
      const id = `rabbit_${i}`; let s = gameStore.rabbitStates ? gameStore.rabbitStates[id] : null;
      if (!s) { 
        const p = this.getRandomPlaceablePosition(); if (!p) continue; 
        s = { id, x: p.x, y: p.y, alive: true, respawnAt: null, hp: HARDNESS.rabbit }; 
        if (!gameStore.rabbitStates) gameStore.rabbitStates = {};
        gameStore.rabbitStates[id] = s; 
      }
      if (s.respawnAt && now < s.respawnAt) continue;
      if (!s.alive || s.respawnAt !== null) { s.alive = true; s.respawnAt = null; s.hp = HARDNESS.rabbit; }
      this.spawnRabbit(s);
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

  private spawnBear(s: BearState) {
    if (this.bears.some(b => b.id === s.id)) return;
    const b = new BearNPC(this, { id: s.id, x: s.x, y: s.y, wanderRadius: 150 }, s.hp);
    this.bears.push(b); this.bearGroup.add(b.sprite); this.physics.add.collider(this.player, b.sprite);
  }

  private spawnRabbit(s: RabbitState) {
    if (this.rabbits.some(r => r.id === s.id)) return;
    const r = new RabbitNPC(this, { id: s.id, x: s.x, y: s.y, wanderRadius: 150 }, s.hp);
    this.rabbits.push(r); this.rabbitGroup.add(r.sprite); this.physics.add.collider(this.player, r.sprite);
  }

  private getRandomPlaceablePosition() {
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(3 * TILE, (MAP_W - 3) * TILE), y = Phaser.Math.Between(3 * TILE, (MAP_H - 3) * TILE);
      if (Math.sqrt((x / (MAP_W * TILE) - 0.5) ** 2 + (y / (MAP_H * TILE) - 0.5) ** 2) < 0.36) return { x, y };
    }
    return null;
  }

  private getRandomBearPosition() {
    const wbX = MAP_W * TILE / 2 + 64, wbY = MAP_H * TILE / 2 + 64;
    for (let i = 0; i < 30; i++) {
      const p = this.getRandomPlaceablePosition();
      if (p && Phaser.Math.Distance.Between(p.x, p.y, wbX, wbY) > (SAFE_ZONE_RADIUS + 50)) return p;
    }
    return null;
  }

  private getRandomShorePosition() {
    if (this.shoreSpawnPoints.length === 0) return null;
    return this.shoreSpawnPoints[Phaser.Math.Between(0, this.shoreSpawnPoints.length - 1)];
  }

  private createResource(x: number, y: number, type: any, hp: number, id: string) {
    const shp = gameStore.resourceStates[id]; if (shp !== undefined && shp <= 0) return;
    const s = this.resourceGroup.create(x, y, type) as ResourceObj;
    s.resourceType = type; s.resourceHp = shp ?? hp; s.maxHp = HARDNESS[type] || hp; s.resourceId = id; s.setDepth(5);
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
    this.keyI = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
    this.keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.keyC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this.keyK = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
    this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.keyI.on('down', () => gameStore.toggleInventory());
    this.keyQ.on('down', () => gameStore.toggleEquipment());
    this.keyC.on('down', () => { 
      if (this.nearWorkbench) { (gameStore as any).currentStation = 'workbench'; gameStore.toggleCrafting(); }
      else if (this.nearCampfire) { (gameStore as any).currentStation = 'campfire'; gameStore.toggleCrafting(); }
    });
    this.keyK.on('down', () => gameStore.toggleSkills());
    this.keyE.on('down', () => this.doInteract());
    this.keySpace.on('down', () => this.doAttack());
    this.keyEsc.on('down', () => gameStore.closeAll());
    this.moveKeys = this.input.keyboard.addKeys('W,A,S,D,UP,LEFT,DOWN,RIGHT') as any;
  }

  private setupCamera() { this.cameras.main.startFollow(this.player, true, 0.08, 0.08); this.cameras.main.setBounds(0, 0, MAP_W * TILE, MAP_H * TILE).setZoom(2); }

  shutdown() {
    this.unsubscribeList.forEach(unsub => unsub());
    this.chickens.forEach(c => c.destroy()); this.crabs.forEach(c => c.destroy()); this.bears.forEach(b => b.destroy()); this.rabbits.forEach(r => r.destroy());
  }

  private showFloatingText(x: number, y: number, text: string, color: string) {
    if (!this.scene.isActive()) return;
    const f = this.add.text(x, y, text, { fontSize: '12px', color, fontStyle: 'bold', backgroundColor: '#00000066', padding: { x: 4, y: 2 } }).setDepth(1000);
    this.tweens.add({ targets: f, y: y - 24, alpha: 0, duration: 850, onComplete: () => f.destroy() });
  }

  private canDamageTarget(type: string, show = true): boolean {
    const tool = gameStore.getEquippedTool();
    const t = tool?.type || 'hands';
    const r = TOOL_REQUIREMENTS[type];
    if (!r || r.includes(t as any)) return true;
    if (t === 'hands' && (type === 'small_rock' || type === 'dead_tree' || type === 'bush')) return true;
    if (show) {
      let m = 'Ferramenta incorreta';
      if (r.includes('axe')) m = 'Precisa de Machado 🪓'; else if (r.includes('pickaxe')) m = 'Precisa de Picareta ⛏️'; else if (r.includes('sword') || r.includes('knife')) m = 'Precisa de Lâmina ⚔️';
      this.showFloatingText(this.player.x, this.player.y - 40, m, '#ffcc66');
    }
    return false;
  }

  private fireArrow() {
    if (!gameStore.hasAmmo()) { this.showFloatingText(this.player.x, this.player.y - 40, 'Sem flechas! 🥢', '#ff4444'); return; }
    gameStore.consumeAmmo(); gameStore.useTool('bow');
    let vx = 0, vy = 0, rot = 0;
    if (this.facingDir === 'up') { vy = -400; rot = -Math.PI / 2; } else if (this.facingDir === 'down') { vy = 400; rot = Math.PI / 2; }
    else if (this.facingDir === 'left') { vx = -400; rot = Math.PI; } else { vx = 400; rot = 0; }
    const arrow = this.physics.add.sprite(this.player.x, this.player.y, 'arrow_projectile').setDepth(15);
    arrow.setRotation(rot);
    this.projectileGroup.add(arrow); (arrow.body as Phaser.Physics.Arcade.Body).setAllowGravity(false).setVelocity(vx, vy);
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
    const sMap = type === 'chicken' ? gameStore.chickenStates : type === 'crab' ? gameStore.crabStates : type === 'bear' ? gameStore.bearStates : gameStore.rabbitStates;
    if (!sMap) return;
    const s = sMap[npc.id]; if (!s) return;
    const hp = npc.takeDamage(dmg); s.hp = hp;
    const t = this.add.text(npc.sprite.x, npc.sprite.y - 20, `-${dmg.toFixed(0)} HP`, { fontSize: '10px', color: '#ff4444', fontStyle: 'bold' }).setDepth(1000);
    this.tweens.add({ targets: t, y: npc.sprite.y - 40, alpha: 0, duration: 600, onComplete: () => t.destroy() });
    if (hp <= 0) { if (type === 'chicken') this.collectChicken(npc); else if (type === 'crab') this.collectCrab(npc); else if (type === 'bear') this.collectBear(npc); else if (type === 'rabbit') this.collectRabbit(npc); }
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
    const bea = this.bears.find(b => Phaser.Math.Distance.Between(this.player.x, this.player.y, b.sprite.x, b.sprite.y) < 42);
    if (bea && this.canDamageTarget('bear')) { gameStore.useTool('sword'); this.applyDamageToNPC(bea, 'bear', stats.attackDamage); }
    const rab = this.rabbits.find(r => r.isInRange(this.player.x, this.player.y, 42));
    if (rab && this.canDamageTarget('rabbit')) { gameStore.useTool(t?.type === 'knife' ? 'knife' : 'sword'); this.applyDamageToNPC(rab, 'rabbit', stats.attackDamage); }
    for (const res of this.resources) {
      if (res.active && Phaser.Math.Distance.Between(this.player.x, this.player.y, res.x, res.y) < 40 && this.canDamageTarget(res.resourceType)) {
        let dmg = stats.attackDamage;
        if (res.resourceType === 'tree' || res.resourceType === 'dead_tree') { dmg = BASE_DAMAGE * TOOL_DAMAGE[stats.toolType] * stats.choppingSpeed; gameStore.useTool('axe'); }
        else if (res.resourceType === 'rock' || res.resourceType === 'small_rock') { dmg = BASE_DAMAGE * TOOL_DAMAGE[stats.toolType] * stats.miningSpeed; gameStore.useTool('pickaxe'); }
        else dmg = BASE_DAMAGE * TOOL_DAMAGE[stats.toolType];
        this.applyDamageToResource(res, dmg);
      }
    }
  }

  private collectChicken(c: ChickenNPC) {
    const s = gameStore.chickenStates[c.id]; if (!s) return;
    s.alive = false; s.respawnAt = Date.now() + Phaser.Math.Between(30000, 60000);
    gameStore.addItem(ITEMS.chicken_meat, 1); if (Math.random() < 0.7) gameStore.addItem(ITEMS.feather, 1);
    c.collect(); this.time.delayedCall(80, () => { if (c.sprite && c.sprite.active) c.destroy(); });
    this.chickens = this.chickens.filter(chi => chi.id !== c.id); gameStore.save();
  }

  private collectCrab(c: CrabNPC) {
    const s = gameStore.crabStates[c.id]; if (!s) return;
    s.alive = false; s.respawnAt = Date.now() + Phaser.Math.Between(30000, 60000);
    gameStore.addItem(ITEMS.crab_meat, 1); if (Math.random() < 0.7) gameStore.addItem(ITEMS.crab_shell, 1);
    c.collect(); this.time.delayedCall(80, () => { if (c.sprite && c.sprite.active) c.destroy(); });
    this.crabs = this.crabs.filter(cra => cra.id !== c.id); gameStore.save();
  }

  private collectBear(b: BearNPC) {
    const s = gameStore.bearStates[b.id]; if (!s) return;
    s.alive = false; s.respawnAt = Date.now() + Phaser.Math.Between(60000, 120000);
    gameStore.addItem(ITEMS.pelt, Phaser.Math.Between(2, 4)); gameStore.addItem(ITEMS.food, 3);
    b.collect(); this.time.delayedCall(80, () => { if (b.sprite && b.sprite.active) b.destroy(); });
    this.bears = this.bears.filter(bear => bear.id !== b.id); gameStore.save();
  }

  private collectRabbit(r: RabbitNPC) {
    const s = gameStore.rabbitStates[r.id]; if (!s) return;
    s.alive = false; s.respawnAt = Date.now() + Phaser.Math.Between(30000, 60000);
    gameStore.addItem(ITEMS.rabbit_meat, 1); gameStore.addItem(ITEMS.pelt, 1);
    r.collect(); this.time.delayedCall(80, () => { if (r.sprite && r.sprite.active) r.destroy(); });
    this.rabbits = this.rabbits.filter(rab => rab.id !== r.id); gameStore.save();
  }

  private harvestResource(res: ResourceObj) {
    if (!res || !res.active) return;
    let item, qty = 1;
    switch (res.resourceType) {
      case 'tree': item = ITEMS.wood; qty = Phaser.Math.Between(2, 4); break;
      case 'dead_tree': item = ITEMS.wood; qty = 1; gameStore.addItem(ITEMS.twig, Phaser.Math.Between(2, 4)); break;
      case 'rock': item = ITEMS.stone; qty = Phaser.Math.Between(1, 3); break;
      case 'small_rock': item = ITEMS.stone; qty = 1; break;
      case 'bush': item = Math.random() > 0.5 ? ITEMS.fiber : ITEMS.seed; qty = Phaser.Math.Between(1, 2); break;
    }
    if (item) { gameStore.addItem(item, qty); this.showFloatingText(res.x, res.y - 10, `+${qty} ${item.icon}`, '#ffff00'); }
    this.respawnCounter++; gameStore.respawnQueue.push({ x: res.x, y: res.y, type: res.resourceType, hp: res.maxHp, id: `${res.resourceType}_r${this.respawnCounter}_${Date.now()}`, respawnAt: Date.now() + Phaser.Math.Between(30000, 60000) });
    this.resources = this.resources.filter(r => r !== res); delete gameStore.resourceStates[res.resourceId]; res.destroy(); gameStore.save();
  }

  private processRespawns() {
    const now = Date.now();
    for (let i = gameStore.respawnQueue.length - 1; i >= 0; i--) {
      const e = gameStore.respawnQueue[i]; if (now >= e.respawnAt) { gameStore.respawnQueue.splice(i, 1); this.createResource(e.x, e.y, e.type as any, e.hp, e.id); }
    }
    const configs = [{ s: gameStore.chickenStates, sp: (s: any) => this.spawnChicken(s) }, { s: gameStore.crabStates, sp: (s: any) => this.spawnCrab(s) }, { s: gameStore.bearStates, sp: (s: any) => this.spawnBear(s) }, { s: gameStore.rabbitStates, sp: (s: any) => this.spawnRabbit(s) }];
    configs.forEach(cfg => { if (cfg.s) Object.values(cfg.s).forEach((s: any) => { if (!s.alive && s.respawnAt && now >= s.respawnAt) { s.alive = true; s.respawnAt = null; cfg.sp(s); } }); });
    gameStore.save();
  }

  private doInteract() { if (this.nearWorkbench) { (gameStore as any).currentStation = 'workbench'; gameStore.toggleCrafting(); } else if (this.nearCampfire) { (gameStore as any).currentStation = 'campfire'; gameStore.toggleCrafting(); } }

  private drawResourceHpBars() {
    this.resourceHpGraphics.clear();
    this.resources.forEach(res => { if (res.active && res.resourceHp < res.maxHp) { const x = res.x - 12, y = res.y - 20, p = res.resourceHp / res.maxHp; this.resourceHpGraphics.fillStyle(0x000000, 0.7).fillRect(x, y, 24, 3).fillStyle(p < 0.3 ? 0xe74c3c : p < 0.6 ? 0xf1c40f : 0x2ecc71, 1).fillRect(x, y, 24 * p, 3); } });
  }

  update(_t: number, delta: number) {
    if (this.attackCooldown > 0) this.attackCooldown -= delta; this.processRespawns();
    this.chickens.forEach(c => c.update(delta)); this.crabs.forEach(c => c.update(delta)); this.rabbits.forEach(r => r.update(delta));
    this.inSafeZone = false; this.nearCampfire = false;
    const wbX = MAP_W * TILE / 2 + 64, wbY = MAP_H * TILE / 2 + 64, distToWB = Phaser.Math.Distance.Between(this.player.x, this.player.y, wbX, wbY);
    if (distToWB < SAFE_ZONE_RADIUS) this.inSafeZone = true;
    this.campfireSprites.forEach(cf => { if (Phaser.Math.Distance.Between(this.player.x, this.player.y, cf.x, cf.y) < 50) this.nearCampfire = true; });
    this.bears.forEach(b => b.update(delta, this.player.x, this.player.y, { x: wbX, y: wbY, radius: SAFE_ZONE_RADIUS }, this.inSafeZone));
    this.drawResourceHpBars();
    if (this.isAttacking) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body; let vx = 0, vy = 0;
    if (this.moveKeys.A.isDown || this.moveKeys.LEFT.isDown) { vx = -1; this.facingDir = 'left'; } else if (this.moveKeys.D.isDown || this.moveKeys.RIGHT.isDown) { vx = 1; this.facingDir = 'right'; }
    if (this.moveKeys.W.isDown || this.moveKeys.UP.isDown) { vy = -1; this.facingDir = 'up'; } else if (this.moveKeys.S.isDown || this.moveKeys.DOWN.isDown) { vy = 1; this.facingDir = 'down'; }
    if (this.joyVec.x !== 0 || this.joyVec.y !== 0) { vx = this.joyVec.x; vy = this.joyVec.y; if (Math.abs(vx) > Math.abs(vy)) this.facingDir = vx < 0 ? 'left' : 'right'; else this.facingDir = vy < 0 ? 'up' : 'down'; }
    const stats = gameStore.getStats();
    if (vx !== 0 || vy !== 0) { const len = Math.sqrt(vx * vx + vy * vy); body.setVelocity((vx / len) * 160 * stats.moveSpeed, (vy / len) * 160 * stats.moveSpeed); this.player.setFlipX(this.facingDir === 'left').play('run', true); }
    else { if (body) body.setVelocity(0, 0); this.player.play('idle', true); }
    gameStore.updatePlayerPos(this.player.x, this.player.y);
    this.nearWorkbench = distToWB < 50;
    if (this.nearWorkbench) this.interactText.setText('[C] Bancada').setPosition(wbX - 30, wbY - 30).setVisible(true);
    else if (this.nearCampfire) { const closestCF = this.campfireSprites.find(cf => Phaser.Math.Distance.Between(this.player.x, this.player.y, cf.x, cf.y) < 50); if (closestCF) this.interactText.setText('[C] Cozinhar').setPosition(closestCF.x - 30, closestCF.y - 30).setVisible(true); }
    else this.interactText.setVisible(false);
    this.player.setDepth(this.player.y); this.resources.forEach(r => r.setDepth(r.y));
    this.chickens.forEach(c => c.sprite.setDepth(c.sprite.y)); this.crabs.forEach(c => c.sprite.setDepth(c.sprite.y));
  }
}
