import Phaser from 'phaser';
import { gameStore } from '../store';
import { ITEMS, HARDNESS, TOOL_DAMAGE, BASE_DAMAGE, DROP_BONUS_CHANCE, TOOL_REQUIREMENTS, type ChickenState, type CrabState, type BearState, type RabbitState } from '../types';
import { gameEvents } from '../events';
import { ChickenNPC } from '../entities/ChickenNPC';
import { CrabNPC } from '../entities/CrabNPC';
import { BearNPC } from '../entities/BearNPC';
import { RabbitNPC } from '../entities/RabbitNPC';

const MAP_W = 100;
const MAP_H = 100;
const TILE = 16;
const CHICKEN_COUNT = 8;
const CRAB_COUNT = 8;
const BEAR_COUNT = 2;
const RABBIT_COUNT = 6;
const SAFE_ZONE_RADIUS = 100;

interface ResourceObj extends Phaser.GameObjects.Sprite {
  resourceType: 'tree' | 'rock' | 'bush' | 'dead_tree' | 'small_rock';
  resourceHp: number;
  maxHp: number;
  resourceId: string;
}

export class MainScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private playerLight!: Phaser.GameObjects.Light;
  private workbenchLight!: Phaser.GameObjects.Light;
  private safeZoneLight!: Phaser.GameObjects.Light;
  
  private resources: ResourceObj[] = [];
  private chickens: ChickenNPC[] = [];
  private crabs: CrabNPC[] = [];
  private bears: BearNPC[] = [];
  private rabbits: RabbitNPC[] = [];
  private campfireSprites: Phaser.GameObjects.Sprite[] = [];
  
  private resourceGroup!: Phaser.Physics.Arcade.StaticGroup;
  private chickenGroup!: Phaser.Physics.Arcade.Group;
  private crabGroup!: Phaser.Physics.Arcade.Group;
  private bearGroup!: Phaser.Physics.Arcade.Group;
  private rabbitGroup!: Phaser.Physics.Arcade.Group;
  private projectileGroup!: Phaser.Physics.Arcade.Group;

  private woodParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private stoneParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private whiteParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private dustParticles!: Phaser.GameObjects.Particles.ParticleEmitter;

  private isAttacking = false;
  private attackCooldown = 0;
  private interactText!: Phaser.GameObjects.Text;
  private nearWorkbench = false;
  private nearCampfire = false;
  private inSafeZone = false;
  private joyVec = { x: 0, y: 0 };
  private respawnCounter = 0;
  private shoreSpawnPoints: { x: number; y: number }[] = [];
  private facingDir: 'up' | 'down' | 'left' | 'right' = 'down';
  private resourceHpGraphics!: Phaser.GameObjects.Graphics;
  private safeZoneVisual!: Phaser.GameObjects.Graphics;

  private keyI!: Phaser.Input.Keyboard.Key;
  private keyQ!: Phaser.Input.Keyboard.Key;
  private keyC!: Phaser.Input.Keyboard.Key;
  private keyK!: Phaser.Input.Keyboard.Key;
  private keyE!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;
  private keyEsc!: Phaser.Input.Keyboard.Key;
  private keyNumbers!: Phaser.Input.Keyboard.Key[];
  private moveKeys!: { W: Phaser.Input.Keyboard.Key, A: Phaser.Input.Keyboard.Key, S: Phaser.Input.Keyboard.Key, D: Phaser.Input.Keyboard.Key, UP: Phaser.Input.Keyboard.Key, LEFT: Phaser.Input.Keyboard.Key, DOWN: Phaser.Input.Keyboard.Key, RIGHT: Phaser.Input.Keyboard.Key };

  private unsubscribeList: (() => void)[] = [];

  constructor() { super({ key: 'MainScene' }); }

  private drawSafeZone() {
    if (!this.sys || !this.safeZoneVisual) return;
    const wbX = (MAP_W * TILE) / 2, wbY = (MAP_H * TILE) / 2;
    this.safeZoneVisual.clear();
    this.safeZoneVisual.lineStyle(2, 0x00ffff, 0.3);
    this.safeZoneVisual.strokeCircle(wbX, wbY, SAFE_ZONE_RADIUS);
    this.safeZoneVisual.fillStyle(0x00ffff, 0.05);
    this.safeZoneVisual.fillCircle(wbX, wbY, SAFE_ZONE_RADIUS);
  }

  create() {
    this.lights.enable();
    this.lights.setAmbientColor(0x333333);

    this.isAttacking = false;
    this.attackCooldown = 0;
    this.campfireSprites = [];
    this.resources = [];
    this.chickens = [];
    this.crabs = [];
    this.bears = [];
    this.rabbits = [];

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
    
    const wbX = (MAP_W * TILE) / 2, wbY = (MAP_H * TILE) / 2;
    this.playerLight = this.lights.addLight(this.player.x, this.player.y, 180).setColor(0xffffff).setIntensity(1.5);
    this.workbenchLight = this.lights.addLight(wbX, wbY, 120).setColor(0xffaa00).setIntensity(1.2);
    this.safeZoneLight = this.lights.addLight(wbX, wbY, SAFE_ZONE_RADIUS).setColor(0x00ffff).setIntensity(0.6);

    this.tweens.add({ targets: this.safeZoneLight, intensity: { from: 0.4, to: 0.8 }, radius: { from: SAFE_ZONE_RADIUS - 10, to: SAFE_ZONE_RADIUS + 10 }, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    this.setupParticles();
    this.generateResources();
    this.generateChickens();
    this.generateCrabs();
    this.generateBears();
    this.generateRabbits();
    this.setupInput();
    this.setupCamera();
    this.setupCollisions();
    this.drawSafeZone();
    this.restorePlacedItems();

    this.interactText = this.add.text(0, 0, '', { fontSize: '12px', color: '#ffffff', backgroundColor: '#00000088', padding: { x: 4, y: 2 } }).setDepth(3000).setVisible(false);
    
    this.unsubscribeList.push(gameEvents.on('joystickMove', ({ x, y }) => { if (this.sys && this.sys.isActive()) this.joyVec = { x, y }; }));
    this.unsubscribeList.push(gameEvents.on('attack', () => { if (this.sys && this.sys.isActive()) this.doAttack(); }));
    this.unsubscribeList.push(gameEvents.on('interact', () => { if (this.sys && this.sys.isActive()) this.doInteract(); }));
    this.unsubscribeList.push(gameEvents.on('placeItem', ({ type, inventoryIndex }) => { if (this.sys && this.sys.isActive()) this.handlePlaceItem(type, inventoryIndex); }));

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
  }

  private setupParticles() {
    this.woodParticles = this.add.particles(0, 0, 'p_wood', { speed: { min: 60, max: 120 }, gravityY: 400, scale: { start: 1.2, end: 0 }, lifespan: 500, emitting: false }).setDepth(1500);
    this.stoneParticles = this.add.particles(0, 0, 'p_stone', { speed: { min: 80, max: 180 }, gravityY: 500, scale: { start: 1, end: 0 }, lifespan: 400, emitting: false }).setDepth(1500);
    this.whiteParticles = this.add.particles(0, 0, 'p_white', { speed: { min: 30, max: 100 }, scale: { start: 0.5, end: 0 }, lifespan: 600, emitting: false }).setDepth(1500);
    this.dustParticles = this.add.particles(0, 0, 'p_dust', { speed: { min: 10, max: 20 }, alpha: { start: 0.4, end: 0 }, scale: { start: 0.5, end: 0.2 }, lifespan: 400, emitting: false }).setDepth(5);
  }

  private restorePlacedItems() {
    gameStore.placedItems.forEach(item => { if (item.type === 'campfire') this.createCampfire(item.x, item.y); });
  }

  private handlePlaceItem(type: string, inventoryIndex: number) {
    if (!this.sys || !this.sys.isActive()) return;
    if (type === 'campfire') {
      const x = this.player.x, y = this.player.y + 10;
      this.createCampfire(x, y); gameStore.placeItem(type, x, y, inventoryIndex);
      this.showFloatingText(x, y - 20, 'Fogueira posicionada!', '#ffaa00');
      gameStore.closeAll();
    }
  }

  private createCampfire(x: number, y: number) {
    if (!this.add) return;
    const base = this.add.sprite(x, y, 'campfire_base').setDepth(y - 1).setPipeline('Light2D');
    const fire = this.add.sprite(x, y - 4, 'fire_0').setDepth(y).setPipeline('Light2D');
    if (!this.anims.exists('burn')) { this.anims.create({ key: 'burn', frames: [{ key: 'fire_0' }, { key: 'fire_1' }, { key: 'fire_2' }], frameRate: 10, repeat: -1 }); }
    fire.play('burn'); this.campfireSprites.push(fire);
    if (this.lights) {
      const light = this.lights.addLight(x, y, 140).setColor(0xffaa00).setIntensity(1.5);
      this.tweens.add({ targets: light, intensity: { from: 1.5, to: 1.3 }, radius: { from: 140, to: 135 }, duration: 150, yoyo: true, repeat: -1 });
    }
  }

  private setupCollisions() {
    this.physics.add.overlap(this.projectileGroup, this.resourceGroup, (arrow, res) => {
      if (!arrow.active) return;
      const resource = res as ResourceObj;
      if (this.canDamageTarget(resource.resourceType, false)) { this.applyDamageToResource(resource, gameStore.getStats().attackDamage); arrow.destroy(); }
    });
    const configs = [{ g: this.chickenGroup, l: this.chickens, t: 'chicken' }, { g: this.crabGroup, l: this.crabs, t: 'crab' }, { g: this.bearGroup, l: this.bears, t: 'bear' }, { g: this.rabbitGroup, l: this.rabbits, t: 'rabbit' }];
    configs.forEach(cfg => {
      this.physics.add.overlap(this.projectileGroup, cfg.g, (arrow, sprite) => {
        if (!arrow.active) return;
        const npc = cfg.l.find((n: any) => n.sprite === sprite);
        if (npc && this.canDamageTarget(cfg.t, false)) { arrow.destroy(); this.applyDamageToNPC(npc, cfg.t, gameStore.getStats().attackDamage); }
      });
    });
  }

  private buildShoreSpawnPoints() {
    this.shoreSpawnPoints = [];
    for (let y = 5; y < MAP_H - 5; y++) {
      for (let x = 5; x < MAP_W - 5; x++) {
        const wx = x * TILE, wy = y * TILE;
        const d = Math.sqrt((x / MAP_W - 0.5) ** 2 + (y / MAP_H - 0.5) ** 2);
        if (d > 0.405 && d < 0.445) this.shoreSpawnPoints.push({ x: wx, y: wy });
      }
    }
  }

  private getRandomShorePosition() {
    if (this.shoreSpawnPoints.length === 0) return null;
    return this.shoreSpawnPoints[Phaser.Math.Between(0, this.shoreSpawnPoints.length - 1)];
  }

  private generateMap() {
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const dx = x / MAP_W - 0.5;
        const dy = y / MAP_H - 0.5;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d > 0.45) {
          this.add.sprite(x * TILE + 8, y * TILE + 8, 'water_tiles', 0).setDepth(0).setPipeline('Light2D');
        } else {
          // RESTORING GRAVEL FLOOR
          this.add.sprite(x * TILE + 8, y * TILE + 8, 'chao_cascalho').setDepth(0).setPipeline('Light2D');
        }
      }
    }
    this.physics.world.setBounds(0, 0, MAP_W * TILE, MAP_H * TILE);
  }

  private generateResources() {
    const wbX = (MAP_W * TILE) / 2, wbY = (MAP_H * TILE) / 2;
    for (let i = 0; i < 35; i++) { const p = this.getRandomPlaceablePosition(); if (p && Phaser.Math.Distance.Between(p.x, p.y, wbX, wbY) > SAFE_ZONE_RADIUS) this.createResource(p.x, p.y, 'tree', 12, `tree_${i}`); }
    for (let i = 0; i < 15; i++) { const p = this.getRandomPlaceablePosition(); if (p && Phaser.Math.Distance.Between(p.x, p.y, wbX, wbY) > SAFE_ZONE_RADIUS) this.createResource(p.x, p.y, 'dead_tree', 6, `dead_tree_${i}`); }
    for (let i = 0; i < 20; i++) { const p = this.getRandomPlaceablePosition(); if (p && Phaser.Math.Distance.Between(p.x, p.y, wbX, wbY) > SAFE_ZONE_RADIUS) this.createResource(p.x, p.y, 'bush', 3, `bush_${i}`); }
    for (let i = 0; i < 20; i++) { const p = this.getRandomPlaceablePosition(); if (p && Phaser.Math.Distance.Between(p.x, p.y, wbX, wbY) > SAFE_ZONE_RADIUS) this.createResource(p.x, p.y, 'rock', 18, `rock_${i}`); }
    for (let i = 0; i < 15; i++) { const p = this.getRandomPlaceablePosition(); if (p && Phaser.Math.Distance.Between(p.x, p.y, wbX, wbY) > SAFE_ZONE_RADIUS) this.createResource(p.x, p.y, 'small_rock', 2, `small_rock_${i}`); }
    this.workbench = this.physics.add.sprite(wbX, wbY, 'workbench').setPipeline('Light2D');
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
      if (!s) { const p = this.getRandomPlaceablePosition(); if (!p) continue; s = { id, x: p.x, y: p.y, alive: true, respawnAt: null, hp: HARDNESS.rabbit }; if (!gameStore.rabbitStates) gameStore.rabbitStates = {}; gameStore.rabbitStates[id] = s; }
      if (s.respawnAt && now < s.respawnAt) continue;
      if (!s.alive || s.respawnAt !== null) { s.alive = true; s.respawnAt = null; s.hp = HARDNESS.rabbit; }
      this.spawnRabbit(s);
    }
  }

  private spawnChicken(s: ChickenState) {
    if (this.chickens.some(c => c.id === s.id)) return;
    const c = new ChickenNPC(this, { id: s.id, x: s.x, y: s.y, wanderRadius: 96 }, s.hp);
    c.sprite.setPipeline('Light2D');
    this.chickens.push(c); this.chickenGroup.add(c.sprite); this.physics.add.collider(this.player, c.sprite);
  }

  private spawnCrab(s: CrabState) {
    if (this.crabs.some(c => c.id === s.id)) return;
    const c = new CrabNPC(this, { id: s.id, x: s.x, y: s.y, wanderRadius: 48 }, s.hp);
    c.sprite.setPipeline('Light2D');
    this.crabs.push(c); this.crabGroup.add(c.sprite); this.physics.add.collider(this.player, c.sprite);
  }

  private spawnBear(s: BearState) {
    if (this.bears.some(b => b.id === s.id)) return;
    const b = new BearNPC(this, { id: s.id, x: s.x, y: s.y, wanderRadius: 150 }, s.hp);
    b.sprite.setPipeline('Light2D');
    this.bears.push(b); this.bearGroup.add(b.sprite); this.physics.add.collider(this.player, b.sprite);
  }

  private spawnRabbit(s: RabbitState) {
    if (this.rabbits.some(r => r.id === s.id)) return;
    const r = new RabbitNPC(this, { id: s.id, x: s.x, y: s.y, wanderRadius: 150 }, s.hp);
    r.sprite.setPipeline('Light2D');
    this.rabbits.push(r); this.rabbitGroup.add(r.sprite); this.physics.add.collider(this.player, r.sprite);
  }

  private getRandomPlaceablePosition() {
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(TILE * 5, (MAP_W - 5) * TILE), y = Phaser.Math.Between(TILE * 5, (MAP_H - 5) * TILE);
      if (Math.sqrt((x / (MAP_W * TILE) - 0.5) ** 2 + (y / (MAP_H * TILE) - 0.5) ** 2) < 0.36) return { x, y };
    }
    return null;
  }

  private getRandomBearPosition() {
    const wbX = (MAP_W * TILE) / 2, wbY = (MAP_H * TILE) / 2;
    for (let i = 0; i < 30; i++) {
      const p = this.getRandomPlaceablePosition();
      if (p && Phaser.Math.Distance.Between(p.x, p.y, wbX, wbY) > (SAFE_ZONE_RADIUS + 100)) return p;
    }
    return null;
  }

  private createResource(x: number, y: number, type: any, hp: number, id: string) {
    const shp = gameStore.resourceStates[id]; if (shp !== undefined && shp <= 0) return;
    let key = type; let frame = undefined;
    if (type === 'rock') { key = Math.random() > 0.5 ? 'rock_medium' : 'rock_large'; } 
    else if (type === 'small_rock') { key = 'rock_small'; } 
    else if (type === 'tree') { key = 'tree_common'; } 
    else if (type === 'dead_tree') { key = 'tree_dry'; } 
    else if (type === 'bush') { const variants = ['bush_41', 'bush_42', 'bush_45', 'bush_46']; key = variants[Math.floor(Math.random() * variants.length)]; }
    
    const s = this.resourceGroup.create(x, y, key, frame) as ResourceObj;
    s.setPipeline('Light2D'); s.resourceType = type; s.resourceHp = shp ?? hp; s.maxHp = HARDNESS[type] || hp; s.resourceId = id;
    const body = s.body as Phaser.Physics.Arcade.StaticBody;
    
    if (key === 'rock_large') body.setSize(24, 20).setOffset(2, 20); 
    else if (key === 'rock_medium') body.setSize(20, 16).setOffset(3, 8); 
    else if (key === 'rock_small') body.setSize(12, 10).setOffset(2, 2); 
    else if (key === 'tree_common') body.setSize(16, 12).setOffset(8, 48); 
    else if (key === 'tree_dry') body.setSize(14, 10).setOffset(6, 35); 
    else if (key.startsWith('bush')) { if (key === 'bush_41' || key === 'bush_42') body.setSize(24, 16).setOffset(10, 24); else body.setSize(16, 12).setOffset(6, 12); }
    
    s.setDepth(y); this.resources.push(s); this.physics.add.collider(this.player, s);
  }

  private createPlayer() {
    this.player = this.physics.add.sprite(gameStore.playerX, gameStore.playerY, 'p_idle_down', 0).setPipeline('Light2D');
    this.player.setDepth(10); const b = this.player.body as Phaser.Physics.Arcade.Body;
    b.setCollideWorldBounds(true).setSize(16, 16).setOffset(24, 40);
    const anims = [{ key: 'idle_down', sheet: 'p_idle_down', frames: 4 }, { key: 'idle_side', sheet: 'p_idle_side', frames: 4 }, { key: 'idle_up', sheet: 'p_idle_up', frames: 4 }, { key: 'run_down', sheet: 'p_run_down', frames: 6 }, { key: 'run_side', sheet: 'p_run_side', frames: 6 }, { key: 'run_up', sheet: 'p_run_up', frames: 6 }, { key: 'attack_down', sheet: 'p_attack_down', frames: 8 }, { key: 'attack_side', sheet: 'p_attack_side', frames: 8 }, { key: 'attack_up', sheet: 'p_attack_up', frames: 8 }];
    anims.forEach(a => { if (!this.anims.exists(a.key)) { this.anims.create({ key: a.key, frames: this.anims.generateFrameNumbers(a.sheet, { start: 0, end: a.frames - 1 }), frameRate: a.key.includes('attack') ? 12 : 8, repeat: a.key.includes('attack') ? 0 : -1 }); } });
  }

  private setupInput() {
    this.keyI = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I); this.keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q); this.keyC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C); this.keyK = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K); this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E); this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); this.keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    const keys = [Phaser.Input.Keyboard.KeyCodes.ONE, Phaser.Input.Keyboard.KeyCodes.TWO, Phaser.Input.Keyboard.KeyCodes.THREE, Phaser.Input.Keyboard.KeyCodes.FOUR, Phaser.Input.Keyboard.KeyCodes.FIVE];
    this.keyNumbers = keys.map((k, i) => { const key = this.input.keyboard.addKey(k); key.on('down', () => { if (this.sys && this.sys.isActive()) gameStore.selectQuickBar(i); }); return key; });
    this.keyI.on('down', () => { if (this.sys && this.sys.isActive()) gameStore.toggleInventory(); }); this.keyQ.on('down', () => { if (this.sys && this.sys.isActive()) gameStore.toggleEquipment(); }); this.keyC.on('down', () => { if (this.sys && this.sys.isActive()) { if (this.nearWorkbench || this.nearCampfire) { (gameStore as any).currentStation = this.nearWorkbench ? 'workbench' : 'campfire'; gameStore.toggleCrafting(); } } });
    this.keyK.on('down', () => { if (this.sys && this.sys.isActive()) gameStore.toggleSkills(); }); this.keyE.on('down', () => { if (this.sys && this.sys.isActive()) this.doInteract(); }); this.keySpace.on('down', () => { if (this.sys && this.sys.isActive()) this.doAttack(); }); this.keyEsc.on('down', () => { if (this.sys && this.sys.isActive()) gameStore.closeAll(); });
    this.moveKeys = this.input.keyboard.addKeys('W,A,S,D,UP,LEFT,DOWN,RIGHT') as any;
  }

  private setupCamera() { this.cameras.main.startFollow(this.player, true, 0.08, 0.08); this.cameras.main.setBounds(0, 0, MAP_W * TILE, MAP_H * TILE).setZoom(2.5); }

  shutdown() { this.unsubscribeList.forEach(unsub => unsub()); this.unsubscribeList = []; this.chickens.forEach(c => c.destroy()); this.crabs.forEach(c => c.destroy()); this.bears.forEach(b => b.destroy()); this.rabbits.forEach(r => r.destroy()); }

  private showFloatingText(x: number, y: number, text: string, color: string) { if (!this.sys || !this.sys.isActive()) return; const f = this.add.text(x, y, text, { fontSize: '12px', color, fontStyle: 'bold', backgroundColor: '#00000066', padding: { x: 4, y: 2 } }).setDepth(3500); this.tweens.add({ targets: f, y: y - 24, alpha: 0, duration: 850, onComplete: () => f.destroy() }); }

  private canDamageTarget(type: string, show = true): boolean { const t = gameStore.getEquippedTool()?.type || 'hands', r = TOOL_REQUIREMENTS[type]; if (!r || r.includes(t as any)) return true; if (t === 'hands' && (type === 'small_rock' || type === 'dead_tree' || type === 'bush')) return true; if (show) { this.showFloatingText(this.player.x, this.player.y - 40, 'Ferramenta incorreta', '#ffcc66'); } return false; }

  private fireArrow() { if (!gameStore.hasAmmo()) { this.showFloatingText(this.player.x, this.player.y - 40, 'Sem flechas! 🥢', '#ff4444'); return; } gameStore.consumeAmmo(); gameStore.useTool('bow'); let vx = 0, vy = 0, rot = 0; if (this.facingDir === 'up') { vy = -400; rot = -Math.PI / 2; } else if (this.facingDir === 'down') { vy = 400; rot = Math.PI / 2; } else if (this.facingDir === 'left') { vx = -400; rot = Math.PI; } else { vx = 400; rot = 0; } const arrow = this.physics.add.sprite(this.player.x, this.player.y, 'arrow_projectile').setDepth(15).setPipeline('Light2D'); arrow.setRotation(rot); this.projectileGroup.add(arrow); (arrow.body as Phaser.Physics.Arcade.Body).setAllowGravity(false).setVelocity(vx, vy); this.time.delayedCall(1500, () => { if (arrow && arrow.active) arrow.destroy(); }); }

  private applyDamageToResource(res: ResourceObj, dmg: number) { if (!res || !res.active) return; res.resourceHp -= dmg; gameStore.resourceStates[res.resourceId] = res.resourceHp; res.setTint(0xffffff); this.time.delayedCall(100, () => { if (res && res.active) res.clearTint(); }); if (res.resourceType === 'rock' || res.resourceType === 'small_rock') this.stoneParticles.emitParticleAt(res.x, res.y, 5); else if (res.resourceType === 'tree' || res.resourceType === 'dead_tree') this.woodParticles.emitParticleAt(res.x, res.y, 5); const t = this.add.text(res.x, res.y - 20, `-${dmg.toFixed(0)}`, { fontSize: '10px', color: '#ff4444', fontStyle: 'bold' }).setDepth(1000); this.tweens.add({ targets: t, y: res.y - 40, alpha: 0, duration: 600, onComplete: () => t.destroy() }); if (res.resourceHp <= 0) this.harvestResource(res); }

  private applyDamageToNPC(npc: any, type: string, dmg: number) { const sMap = type === 'chicken' ? gameStore.chickenStates : type === 'crab' ? gameStore.crabStates : type === 'bear' ? gameStore.bearStates : gameStore.rabbitStates; if (!sMap) return; const s = sMap[npc.id]; if (!s) return; const hp = npc.takeDamage(dmg); s.hp = hp; this.whiteParticles.emitParticleAt(npc.sprite.x, npc.sprite.y, 8); const t = this.add.text(npc.sprite.x, npc.sprite.y - 20, `-${dmg.toFixed(0)} HP`, { fontSize: '10px', color: '#ff4444', fontStyle: 'bold' }).setDepth(1000); this.tweens.add({ targets: t, y: npc.sprite.y - 40, alpha: 0, duration: 600, onComplete: () => t.destroy() }); if (hp <= 0) { if (type === 'chicken') this.collectChicken(npc); else if (type === 'crab') this.collectCrab(npc); else if (type === 'bear') this.collectBear(npc); else if (type === 'rabbit') this.collectRabbit(npc); } }

  private collectChicken(c: ChickenNPC) { const s = gameStore.chickenStates[c.id]; if (!s) return; s.alive = false; s.respawnAt = Date.now() + Phaser.Math.Between(30000, 60000); gameStore.addItem(ITEMS.chicken_meat, 1); if (Math.random() < 0.7) gameStore.addItem(ITEMS.feather, 1); c.collect(); this.time.delayedCall(80, () => { if (c.sprite && c.sprite.active) c.destroy(); }); this.chickens = this.chickens.filter(chi => chi.id !== c.id); gameStore.save(); }

  private collectCrab(c: CrabNPC) { const s = gameStore.crabStates[c.id]; if (!s) return; s.alive = false; s.respawnAt = Date.now() + Phaser.Math.Between(30000, 60000); gameStore.addItem(ITEMS.crab_meat, 1); if (Math.random() < 0.7) gameStore.addItem(ITEMS.crab_shell, 1); c.collect(); this.time.delayedCall(80, () => { if (c.sprite && c.sprite.active) c.destroy(); }); this.crabs = this.crabs.filter(cra => cra.id !== c.id); gameStore.save(); }

  private collectBear(b: BearNPC) { const s = gameStore.bearStates[b.id]; if (!s) return; s.alive = false; s.respawnAt = Date.now() + Phaser.Math.Between(60000, 120000); gameStore.addItem(ITEMS.pelt, Phaser.Math.Between(2, 4)); gameStore.addItem(ITEMS.food, 3); b.collect(); this.time.delayedCall(80, () => { if (b.sprite && b.sprite.active) b.destroy(); }); this.bears = this.bears.filter(bear => bear.id !== b.id); gameStore.save(); }

  private collectRabbit(r: RabbitNPC) { const s = gameStore.rabbitStates[r.id]; if (!s) return; s.alive = false; s.respawnAt = Date.now() + Phaser.Math.Between(30000, 60000); gameStore.addItem(ITEMS.rabbit_meat, 1); gameStore.addItem(ITEMS.pelt, 1); r.collect(); this.time.delayedCall(80, () => { if (r.sprite && r.sprite.active) r.destroy(); }); this.rabbits = this.rabbits.filter(rab => rab.id !== r.id); gameStore.save(); }

  private harvestResource(res: ResourceObj) { if (!res || !res.active) return; let item, qty = 1; switch (res.resourceType) { case 'tree': item = ITEMS.wood; qty = Phaser.Math.Between(2, 4); break; case 'dead_tree': item = ITEMS.wood; qty = 1; gameStore.addItem(ITEMS.twig, Phaser.Math.Between(2, 4)); break; case 'rock': item = ITEMS.stone; qty = Phaser.Math.Between(1, 3); break; case 'small_rock': item = ITEMS.stone; qty = 1; break; case 'bush': item = Math.random() > 0.5 ? ITEMS.fiber : ITEMS.seed; qty = Phaser.Math.Between(1, 2); break; } if (item) { gameStore.addItem(item, qty); this.showFloatingText(res.x, res.y - 10, `+${qty} ${item.icon}`, '#ffff00'); } this.respawnCounter++; gameStore.respawnQueue.push({ x: res.x, y: res.y, type: res.resourceType, hp: res.maxHp, id: `${res.resourceType}_r${this.respawnCounter}_${Date.now()}`, respawnAt: Date.now() + Phaser.Math.Between(30000, 60000) }); this.resources = this.resources.filter(r => r !== res); delete gameStore.resourceStates[res.resourceId]; res.destroy(); gameStore.save(); }

  private processRespawns() { const now = Date.now(); for (let i = gameStore.respawnQueue.length - 1; i >= 0; i--) { const e = gameStore.respawnQueue[i]; if (now >= e.respawnAt) { gameStore.respawnQueue.splice(i, 1); this.createResource(e.x, e.y, e.type as any, e.hp, e.id); } } const configs = [{ s: gameStore.chickenStates, sp: (s: any) => this.spawnChicken(s) }, { s: gameStore.crabStates, sp: (s: any) => this.spawnCrab(s) }, { s: gameStore.bearStates, sp: (s: any) => this.spawnBear(s) }, { s: gameStore.rabbitStates, sp: (s: any) => this.spawnRabbit(s) }]; configs.forEach(cfg => { if (cfg.s) Object.values(cfg.s).forEach((s: any) => { if (!s.alive && s.respawnAt && now >= s.respawnAt) { s.alive = true; s.respawnAt = null; cfg.sp(s); } }); }); gameStore.save(); }

  private doInteract() { if (this.nearWorkbench) { (gameStore as any).currentStation = 'workbench'; gameStore.toggleCrafting(); } else if (this.nearCampfire) { (gameStore as any).currentStation = 'campfire'; gameStore.toggleCrafting(); } }

  private drawResourceHpBars() { if (!this.resourceHpGraphics) return; this.resourceHpGraphics.clear(); this.resources.forEach(res => { if (res.active && res.resourceHp < res.maxHp) { const x = res.x - 12, y = res.y - 20, p = res.resourceHp / res.maxHp; this.resourceHpGraphics.fillStyle(0x000000, 0.7).fillRect(x, y, 24, 3).fillStyle(p < 0.3 ? 0xe74c3c : p < 0.6 ? 0xf1c40f : 0x2ecc71, 1).fillRect(x, y, 24 * p, 3); } }); }

  private doAttack() {
    if (this.isAttacking || this.attackCooldown > 0) return;
    this.isAttacking = true; this.attackCooldown = 300;
    const animKey = this.facingDir === 'left' || this.facingDir === 'right' ? 'attack_side' : `attack_${this.facingDir}`;
    this.player.setFlipX(this.facingDir === 'left').play(animKey);
    const t = gameStore.getEquippedTool(); if (t?.type === 'bow') this.fireArrow(); else this.doMeleeAttack();
    this.time.delayedCall(400, () => { this.isAttacking = false; });
  }

  private doMeleeAttack() {
    const stats = gameStore.getStats(), t = gameStore.getEquippedTool();
    const targets = [...this.chickens, ...this.crabs, ...this.bears, ...this.rabbits];
    targets.forEach((npc: any) => {
      if (npc.isInRange && npc.isInRange(this.player.x, this.player.y, 42)) {
        let type = npc instanceof CrabNPC ? 'crab' : npc instanceof BearNPC ? 'bear' : npc instanceof RabbitNPC ? 'rabbit' : 'chicken';
        if (this.canDamageTarget(type)) { gameStore.useTool(t?.type === 'knife' ? 'knife' : 'sword'); this.applyDamageToNPC(npc, type, stats.attackDamage); }
      }
    });
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

  update(_t: number, delta: number) {
    if (this.attackCooldown > 0) this.attackCooldown -= delta; this.processRespawns();
    this.chickens.forEach(c => c.update(delta)); this.crabs.forEach(c => c.update(delta)); this.rabbits.forEach(r => r.update(delta));
    if (this.playerLight) { this.playerLight.x = this.player.x; this.playerLight.y = this.player.y; }
    this.inSafeZone = false; this.nearCampfire = false;
    const wbX = (MAP_W * TILE) / 2, wbY = (MAP_H * TILE) / 2, distToWB = Phaser.Math.Distance.Between(this.player.x, this.player.y, wbX, wbY);
    if (distToWB < SAFE_ZONE_RADIUS) this.inSafeZone = true;
    this.campfireSprites.forEach(cf => { if (cf && cf.active && Phaser.Math.Distance.Between(this.player.x, this.player.y, cf.x, cf.y) < 50) this.nearCampfire = true; });
    this.bears.forEach(b => { b.update(delta, this.player.x, this.player.y, { x: wbX, y: wbY, radius: SAFE_ZONE_RADIUS }, this.inSafeZone); const bBody = b.sprite.body as Phaser.Physics.Arcade.Body; if (bBody && (Math.abs(bBody.velocity.x) > 10 || Math.abs(bBody.velocity.y) > 10)) this.dustParticles.emitParticleAt(b.sprite.x, b.sprite.y + 10, 1); });
    this.drawResourceHpBars();
    if (this.isAttacking) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body; let vx = 0, vy = 0;
    if (this.moveKeys.A.isDown || this.moveKeys.LEFT.isDown) { vx = -1; this.facingDir = 'left'; } else if (this.moveKeys.D.isDown || this.moveKeys.RIGHT.isDown) { vx = 1; this.facingDir = 'right'; }
    if (this.moveKeys.W.isDown || this.moveKeys.UP.isDown) { vy = -1; this.facingDir = 'up'; } else if (this.moveKeys.S.isDown || this.moveKeys.DOWN.isDown) { vy = 1; this.facingDir = 'down'; }
    if (this.joyVec.x !== 0 || this.joyVec.y !== 0) { vx = this.joyVec.x; vy = this.joyVec.y; if (Math.abs(vx) > Math.abs(vy)) this.facingDir = vx < 0 ? 'left' : 'right'; else this.facingDir = vy < 0 ? 'up' : 'down'; }
    const stats = gameStore.getStats();
    if (vx !== 0 || vy !== 0) { const len = Math.sqrt(vx * vx + vy * vy); body.setVelocity((vx / len) * 160 * stats.moveSpeed, (vy / len) * 160 * stats.moveSpeed); const animKey = this.facingDir === 'left' || this.facingDir === 'right' ? 'run_side' : `run_${this.facingDir}`; this.player.setFlipX(this.facingDir === 'left').play(animKey, true); this.dustParticles.emitParticleAt(this.player.x, this.player.y + 16, 1); }
    else { if (body) body.setVelocity(0, 0); const animKey = this.facingDir === 'left' || this.facingDir === 'right' ? 'idle_side' : `idle_${this.facingDir}`; this.player.setFlipX(this.facingDir === 'left').play(animKey, true); }
    gameStore.updatePlayerPos(this.player.x, this.player.y);
    this.nearWorkbench = distToWB < 50;
    if (this.nearWorkbench) this.interactText.setText('[C] Bancada').setPosition(wbX - 30, wbY - 30).setVisible(true);
    else if (this.nearCampfire) { const closestCF = this.campfireSprites.find(cf => cf.active && Phaser.Math.Distance.Between(this.player.x, this.player.y, cf.x, cf.y) < 50); if (closestCF) this.interactText.setText('[C] Cozinhar').setPosition(closestCF.x - 30, closestCF.y - 30).setVisible(true); }
    else this.interactText.setVisible(false);
    this.player.setDepth(this.player.y); this.resources.forEach(r => r.setDepth(r.y));
    this.chickens.forEach(c => { c.sprite.setDepth(c.sprite.y); const cb = c.sprite.body as Phaser.Physics.Arcade.Body; if (cb && (Math.abs(cb.velocity.x) > 10 || Math.abs(cb.velocity.y) > 10)) this.dustParticles.emitParticleAt(c.sprite.x, c.sprite.y + 8, 1); }); 
    this.crabs.forEach(c => c.sprite.setDepth(c.sprite.y));
  }
}
