import Phaser from 'phaser';
import { gameStore } from '../store';
import { ITEMS, type ChickenState, type CrabState } from '../types';
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

export class MainScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private resources: ResourceObj[] = [];
  private chickens: ChickenNPC[] = [];
  private crabs: CrabNPC[] = [];
  private shoreSpawnPoints: { x: number; y: number }[] = [];
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
  private respawnQueue: { x: number; y: number; type: 'tree' | 'rock' | 'bush' | 'dead_tree'; hp: number; id: string; respawnAt: number }[] = [];
  private respawnCounter = 0;

  constructor() {
    super({ key: 'MainScene' });
  }

  create() {
    // Generate tilemap
    this.generateMap();
    this.buildShoreSpawnPoints();
    this.createPlayer();
    this.generateResources();
    this.generateChickens();
    this.generateCrabs();
    this.setupInput();
    this.setupCamera();

    // Interact hint text
    this.interactText = this.add.text(0, 0, '', {
      fontSize: '12px', color: '#ffffff', backgroundColor: '#00000088', padding: { x: 4, y: 2 }
    }).setDepth(100).setVisible(false);

    this.unsubscribeJoystick = gameEvents.on('joystickMove', ({ x, y }) => {
      this.joyVec = { x, y };
    });
    this.unsubscribeAttack = gameEvents.on('attack', () => {
      this.doAttack();
    });
    this.unsubscribeInteract = gameEvents.on('interact', () => {
      this.doInteract();
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.shutdown, this);
  }

  private buildShoreSpawnPoints() {
    this.shoreSpawnPoints = [];
    for (let y = 2; y < MAP_H - 2; y++) {
      for (let x = 2; x < MAP_W - 2; x++) {
        const worldX = x * TILE + TILE / 2;
        const worldY = y * TILE + TILE / 2;
        const nx = worldX / (MAP_W * TILE);
        const ny = worldY / (MAP_H * TILE);
        const d = Math.sqrt((nx - 0.5) ** 2 + (ny - 0.5) ** 2);
        if (d > 0.405 && d < 0.445) {
          this.shoreSpawnPoints.push({ x: worldX, y: worldY });
        }
      }
    }
  }

  private generateMap() {
    // Simple noise-based biome map
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const nx = x / MAP_W;
        const ny = y / MAP_H;
        // Simple pattern: center is grass, edges have sand, corners have water
        const distFromCenter = Math.sqrt((nx - 0.5) ** 2 + (ny - 0.5) ** 2);
        let tileKey: string;
        if (distFromCenter > 0.45) {
          tileKey = 'water';
        } else if (distFromCenter > 0.38) {
          tileKey = 'sand';
        } else {
          tileKey = `grass_${Math.floor(Math.random() * 3)}`;
        }
        const tile = this.add.sprite(x * TILE + TILE / 2, y * TILE + TILE / 2, tileKey);
        tile.setDepth(0);
      }
    }

    // World bounds
    this.physics.world.setBounds(0, 0, MAP_W * TILE, MAP_H * TILE);
  }

  private generateResources() {
    // Trees
    for (let i = 0; i < 40; i++) {
      const pos = this.getRandomPlaceablePosition();
      if (!pos) continue;
      const { x, y } = pos;
      this.createResource(x, y, 'tree', 5, `tree_${i}`);
    }

    // Rocks
    for (let i = 0; i < 30; i++) {
      const pos = this.getRandomPlaceablePosition();
      if (!pos) continue;
      const { x, y } = pos;
      this.createResource(x, y, 'rock', 8, `rock_${i}`);
    }

    // Bushes
    for (let i = 0; i < 20; i++) {
      const pos = this.getRandomPlaceablePosition();
      if (!pos) continue;
      const { x, y } = pos;
      this.createResource(x, y, 'bush', 3, `bush_${i}`);
    }

    // Dead trees (dry branches)
    for (let i = 0; i < 18; i++) {
      const pos = this.getRandomPlaceablePosition();
      if (!pos) continue;
      const { x, y } = pos;
      this.createResource(x, y, 'dead_tree', 3, `dead_tree_${i}`);
    }

    // Workbench near center
    const wb = this.physics.add.sprite(MAP_W * TILE / 2 + 64, MAP_H * TILE / 2 + 64, 'workbench');
    wb.setImmovable(true);
    wb.setDepth(5);
    (wb as any).isWorkbench = true;
    this.physics.add.collider(this.player, wb);
  }

  private generateChickens() {
    const now = Date.now();
    let changed = false;

    for (let i = 0; i < CHICKEN_COUNT; i++) {
      const id = `chicken_${i}`;
      let chickenState = gameStore.chickenStates[id];

      if (!chickenState) {
        const pos = this.getRandomPlaceablePosition();
        if (!pos) continue;
        chickenState = { id, x: pos.x, y: pos.y, alive: true, respawnAt: null };
        gameStore.chickenStates[id] = chickenState;
        changed = true;
      }

      if (chickenState.respawnAt && now < chickenState.respawnAt) {
        continue;
      }

      if (!chickenState.alive || chickenState.respawnAt !== null) {
        chickenState.alive = true;
        chickenState.respawnAt = null;
        changed = true;
      }
      this.spawnChicken(chickenState);
    }

    if (changed) gameStore.save();
  }

  private generateCrabs() {
    const saveNow = Date.now();
    let changed = false;

    for (let i = 0; i < CRAB_COUNT; i++) {
      const id = `crab_${i}`;
      let crabState = gameStore.crabStates[id];

      if (!crabState) {
        const pos = this.getRandomShorePosition();
        if (!pos) continue;
        crabState = { id, x: pos.x, y: pos.y, alive: true, respawnAt: null };
        gameStore.crabStates[id] = crabState;
        changed = true;
      }

      if (crabState.respawnAt && saveNow < crabState.respawnAt) {
        continue;
      }

      if (!crabState.alive || crabState.respawnAt !== null) {
        crabState.alive = true;
        crabState.respawnAt = null;
        changed = true;
      }

      this.spawnCrab(crabState);
    }

    if (changed) gameStore.save();
  }

  private spawnChicken(state: ChickenState) {
    if (this.chickens.some(c => c.id === state.id)) return;

    const chicken = new ChickenNPC(this, {
      id: state.id,
      x: state.x,
      y: state.y,
      wanderRadius: 96,
    });

    this.chickens.push(chicken);
    this.physics.add.collider(this.player, chicken.sprite);
  }

  private spawnCrab(state: CrabState) {
    if (this.crabs.some(c => c.id === state.id)) return;

    const crab = new CrabNPC(this, {
      id: state.id,
      x: state.x,
      y: state.y,
      wanderRadius: 48,
    });

    this.crabs.push(crab);
    this.physics.add.collider(this.player, crab.sprite);
  }

  private getRandomPlaceablePosition() {
    for (let tries = 0; tries < 20; tries++) {
      const x = Phaser.Math.Between(3 * TILE, (MAP_W - 3) * TILE);
      const y = Phaser.Math.Between(3 * TILE, (MAP_H - 3) * TILE);
      const nx = x / (MAP_W * TILE);
      const ny = y / (MAP_H * TILE);
      const d = Math.sqrt((nx - 0.5) ** 2 + (ny - 0.5) ** 2);
      if (d < 0.36) return { x, y };
    }
    return null;
  }

  private getRandomShorePosition() {
    if (this.shoreSpawnPoints.length === 0) return null;
    for (let tries = 0; tries < 20; tries++) {
      const pos = this.shoreSpawnPoints[Phaser.Math.Between(0, this.shoreSpawnPoints.length - 1)];
      const tooCloseToPlayer = Phaser.Math.Distance.Between(pos.x, pos.y, gameStore.playerX, gameStore.playerY) < 80;
      if (!tooCloseToPlayer) return { x: pos.x, y: pos.y };
    }
    return this.shoreSpawnPoints[Phaser.Math.Between(0, this.shoreSpawnPoints.length - 1)] || null;
  }

  private createResource(x: number, y: number, type: 'tree' | 'rock' | 'bush' | 'dead_tree', hp: number, id: string) {
    const savedHp = gameStore.resourceStates[id];
    if (savedHp !== undefined && savedHp <= 0) return; // Already harvested

    const sprite = this.physics.add.sprite(x, y, type) as unknown as ResourceObj;
    sprite.resourceType = type;
    sprite.resourceHp = savedHp ?? hp;
    sprite.maxHp = hp;
    sprite.resourceId = id;
    (sprite as any).body.setImmovable(true);
    sprite.setDepth(5);
    this.resources.push(sprite);

    if (this.player) {
      this.physics.add.collider(this.player, sprite as unknown as Phaser.GameObjects.GameObject);
    }
  }

  private createPlayer() {
    this.player = this.physics.add.sprite(gameStore.playerX, gameStore.playerY, 'player_idle');
    this.player.setDepth(10);
    (this.player as any).body.setCollideWorldBounds(true);
    (this.player as any).body.setSize(20, 24);
    (this.player as any).body.setOffset(6, 8);

    // Create animations
    if (!this.anims.exists('idle')) {
      this.anims.create({
        key: 'idle',
        frames: [{ key: 'player_idle' }],
        frameRate: 1,
        repeat: -1,
      });
    }

    if (!this.anims.exists('run')) {
      this.anims.create({
        key: 'run',
        frames: [
          { key: 'player_run_0' },
          { key: 'player_run_1' },
          { key: 'player_run_2' },
          { key: 'player_run_3' },
        ],
        frameRate: 8,
        repeat: -1,
      });
    }

    if (!this.anims.exists('attack')) {
      this.anims.create({
        key: 'attack',
        frames: [{ key: 'player_attack' }],
        frameRate: 4,
        repeat: 0,
      });
    }
  }

  private setupInput() {
    this.keydownHandler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      this.keysDown.add(key);
      if (key === 'e') this.doInteract();
      if (key === 'i') gameStore.toggleInventory();
      if (key === 'c') gameStore.toggleCrafting();
      if (key === 'k') gameStore.toggleSkills();
      if (key === ' ') { e.preventDefault(); this.doAttack(); }
      if (key === 'escape') gameStore.closeAll();
    };
    this.keyupHandler = (e: KeyboardEvent) => {
      this.keysDown.delete(e.key.toLowerCase());
    };
    window.addEventListener('keydown', this.keydownHandler);
    window.addEventListener('keyup', this.keyupHandler);
  }

  private setupCamera() {
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, MAP_W * TILE, MAP_H * TILE);
    this.cameras.main.setZoom(2);
  }

  shutdown() {
    window.removeEventListener('keydown', this.keydownHandler);
    window.removeEventListener('keyup', this.keyupHandler);
    this.unsubscribeJoystick?.();
    this.unsubscribeAttack?.();
    this.unsubscribeInteract?.();
    this.unsubscribeJoystick = undefined;
    this.unsubscribeAttack = undefined;
    this.unsubscribeInteract = undefined;
    this.chickens.forEach(chicken => chicken.destroy());
    this.crabs.forEach(crab => crab.destroy());
    this.chickens = [];
    this.crabs = [];
  }

  private showFloatingText(x: number, y: number, text: string, color: string) {
    const floating = this.add.text(x, y, text, {
      fontSize: '12px',
      color,
      fontStyle: 'bold',
      backgroundColor: '#00000066',
      padding: { x: 4, y: 2 },
    }).setDepth(100);

    this.tweens.add({
      targets: floating,
      y: y - 24,
      alpha: 0,
      duration: 850,
      onComplete: () => floating.destroy(),
    });
  }

  private hasSharpToolEquipped() {
    const tool = gameStore.getEquippedTool();
    return tool?.type === 'sword' || tool?.type === 'axe' || tool?.type === 'knife';
  }

  private doAttack() {
    if (this.isAttacking || this.attackCooldown > 0) return;
    this.isAttacking = true;
    this.attackCooldown = 300;
    this.player.play('attack');

    const tool = gameStore.getEquippedTool();
    if (tool) {
      gameStore.useTool(tool.type);
    }

    const stats = gameStore.getStats();

    const nearbyChicken = this.chickens.find(chicken =>
      chicken.isInRange(this.player.x, this.player.y, 42)
    );

    if (nearbyChicken) {
      if (!this.hasSharpToolEquipped()) {
        this.showFloatingText(this.player.x - 40, this.player.y - 40, 'Você precisa de algo afiado para isso.', '#ffcc66');
      } else {
        this.collectChicken(nearbyChicken);
      }
    }

    const nearbyCrab = this.crabs.find(crab =>
      crab.isInRange(this.player.x, this.player.y, 42)
    );

    if (nearbyCrab) {
      if (!this.hasSharpToolEquipped()) {
        this.showFloatingText(this.player.x - 40, this.player.y - 56, 'Você precisa de algo afiado para isso.', '#ffcc66');
      } else {
        this.collectCrab(nearbyCrab);
      }
    }

    for (const res of this.resources) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, res.x, res.y);
      if (dist < 40) {
        let dmg = 1;
        if (res.resourceType === 'tree') dmg *= stats.choppingSpeed;
        if (res.resourceType === 'rock') dmg *= stats.miningSpeed;
        res.resourceHp -= dmg;
        gameStore.resourceStates[res.resourceId] = res.resourceHp;

        // Flash effect
        res.setTint(0xffffff);
        this.time.delayedCall(100, () => res.clearTint());

        // Damage number
        const dmgText = this.add.text(res.x, res.y - 20, `-${dmg.toFixed(0)}`, {
          fontSize: '10px', color: '#ff4444', fontStyle: 'bold'
        }).setDepth(100);
        this.tweens.add({
          targets: dmgText, y: res.y - 40, alpha: 0, duration: 600,
          onComplete: () => dmgText.destroy()
        });

        if (res.resourceHp <= 0) {
          this.harvestResource(res);
        }
      }
    }

    this.time.delayedCall(250, () => { this.isAttacking = false; });
  }

  private collectChicken(chicken: ChickenNPC) {
    const state = gameStore.chickenStates[chicken.id] || {
      id: chicken.id,
      x: chicken.homeX,
      y: chicken.homeY,
      alive: true,
      respawnAt: null,
    };

    state.alive = false;
    state.respawnAt = Date.now() + Phaser.Math.Between(30000, 60000);
    gameStore.chickenStates[chicken.id] = state;

    const droppedFeather = Math.random() < 0.7;
    const droppedMeat = Math.random() < 0.5;

    if (droppedFeather) {
      gameStore.addItem(ITEMS.feather, 1);
      this.showFloatingText(chicken.sprite.x - 10, chicken.sprite.y - 18, '+1 🪶', '#ffe680');
    }

    if (droppedMeat) {
      gameStore.addItem(ITEMS.chicken_meat, 1);
      this.showFloatingText(chicken.sprite.x + 6, chicken.sprite.y - 30, '+1 🍗', '#ffc266');
    }

    if (!droppedFeather && !droppedMeat) {
      this.showFloatingText(chicken.sprite.x - 12, chicken.sprite.y - 18, 'Nada caiu', '#bbbbbb');
    }

    chicken.collect();
    this.time.delayedCall(80, () => chicken.destroy());
    this.chickens = this.chickens.filter(c => c.id !== chicken.id);
    gameStore.save();
  }

  private collectCrab(crab: CrabNPC) {
    const state = gameStore.crabStates[crab.id] || {
      id: crab.id,
      x: crab.homeX,
      y: crab.homeY,
      alive: true,
      respawnAt: null,
    };

    state.alive = false;
    state.respawnAt = Date.now() + Phaser.Math.Between(30000, 60000);
    gameStore.crabStates[crab.id] = state;

    const droppedShell = Math.random() < 0.7;
    const droppedMeat = Math.random() < 0.5;

    if (droppedShell) {
      gameStore.addItem(ITEMS.crab_shell, 1);
      this.showFloatingText(crab.sprite.x - 10, crab.sprite.y - 18, '+1 🐚', '#ffe099');
    }

    if (droppedMeat) {
      gameStore.addItem(ITEMS.crab_meat, 1);
      this.showFloatingText(crab.sprite.x + 8, crab.sprite.y - 30, '+1 🦀', '#ffb38a');
    }

    if (!droppedShell && !droppedMeat) {
      this.showFloatingText(crab.sprite.x - 12, crab.sprite.y - 18, 'Nada caiu', '#bbbbbb');
    }

    crab.collect();
    this.time.delayedCall(80, () => crab.destroy());
    this.crabs = this.crabs.filter(c => c.id !== crab.id);
    gameStore.save();
  }

  private harvestResource(res: ResourceObj) {
    // Drop items
    let dropItem;
    let qty = 1;
    switch (res.resourceType) {
      case 'tree': dropItem = ITEMS.wood; qty = Phaser.Math.Between(2, 4); break;
      case 'dead_tree': dropItem = ITEMS.twig; qty = Phaser.Math.Between(2, 5); break;
      case 'rock': dropItem = ITEMS.stone; qty = Phaser.Math.Between(1, 3); break;
      case 'bush': dropItem = Math.random() > 0.5 ? ITEMS.fiber : ITEMS.seed; qty = Phaser.Math.Between(1, 2); break;
    }

    if (dropItem) {
      gameStore.addItem(dropItem, qty);
      const pickupText = this.add.text(res.x, res.y - 10, `+${qty} ${dropItem.icon}`, {
        fontSize: '14px', color: '#ffff00'
      }).setDepth(100);
      this.tweens.add({
        targets: pickupText, y: res.y - 40, alpha: 0, duration: 800,
        onComplete: () => pickupText.destroy()
      });
    }

    // Queue respawn (30-60 seconds)
    const delay = Phaser.Math.Between(30000, 60000);
    this.respawnCounter++;
    this.respawnQueue.push({
      x: res.x, y: res.y, type: res.resourceType, hp: res.maxHp,
      id: `${res.resourceType}_r${this.respawnCounter}`,
      respawnAt: this.time.now + delay,
    });

    // Remove resource
    const idx = this.resources.indexOf(res);
    if (idx >= 0) this.resources.splice(idx, 1);
    delete gameStore.resourceStates[res.resourceId];
    res.destroy();
  }

  private processRespawns() {
    const sceneNow = this.time.now;
    for (let i = this.respawnQueue.length - 1; i >= 0; i--) {
      const entry = this.respawnQueue[i];
      if (sceneNow >= entry.respawnAt) {
        this.respawnQueue.splice(i, 1);
        this.createResource(entry.x, entry.y, entry.type, entry.hp, entry.id);
      }
    }

    let changed = false;
    const saveNow = Date.now();
    for (const chickenState of Object.values(gameStore.chickenStates)) {
      if (chickenState.alive) continue;
      if (!chickenState.respawnAt || saveNow < chickenState.respawnAt) continue;
      chickenState.alive = true;
      chickenState.respawnAt = null;
      this.spawnChicken(chickenState);
      changed = true;
    }

    for (const crabState of Object.values(gameStore.crabStates)) {
      if (crabState.alive) continue;
      if (!crabState.respawnAt || saveNow < crabState.respawnAt) continue;
      crabState.alive = true;
      crabState.respawnAt = null;
      this.spawnCrab(crabState);
      changed = true;
    }

    if (changed) gameStore.save();
  }

  private doInteract() {
    if (this.nearWorkbench) {
      gameStore.toggleCrafting();
    }
  }

  update(_time: number, delta: number) {
    if (this.attackCooldown > 0) this.attackCooldown -= delta;
    this.processRespawns();
    this.chickens.forEach(chicken => chicken.update(delta));
    this.crabs.forEach(crab => crab.update(delta));
    if (this.isAttacking) return;

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    let vx = 0, vy = 0;

    // Keyboard
    if (this.keysDown.has('arrowleft') || this.keysDown.has('a')) vx = -1;
    if (this.keysDown.has('arrowright') || this.keysDown.has('d')) vx = 1;
    if (this.keysDown.has('arrowup') || this.keysDown.has('w')) vy = -1;
    if (this.keysDown.has('arrowdown') || this.keysDown.has('s')) vy = 1;

    // Joystick
    if (this.joyVec.x !== 0 || this.joyVec.y !== 0) {
      vx = this.joyVec.x;
      vy = this.joyVec.y;
    }

    const stats = gameStore.getStats();
    const spd = this.speed * stats.moveSpeed;

    if (vx !== 0 || vy !== 0) {
      const len = Math.sqrt(vx * vx + vy * vy);
      body.setVelocity((vx / len) * spd, (vy / len) * spd);
      if (vx < 0) this.player.setFlipX(true);
      if (vx > 0) this.player.setFlipX(false);
      this.player.play('run', true);
    } else {
      body.setVelocity(0, 0);
      this.player.play('idle', true);
    }

    gameStore.updatePlayerPos(this.player.x, this.player.y);

    // Check workbench proximity
    this.nearWorkbench = false;
    this.children.getAll().forEach((child: any) => {
      if (child.isWorkbench) {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, child.x, child.y);
        if (dist < 50) {
          this.nearWorkbench = true;
          this.interactText.setText('[E] Bancada');
          this.interactText.setPosition(child.x - 30, child.y - 30);
          this.interactText.setVisible(true);
        }
      }
    });
    if (!this.nearWorkbench) this.interactText.setVisible(false);

    // Sort depth by y position
    this.player.setDepth(this.player.y);
    this.resources.forEach(r => r.setDepth(r.y));
    this.crabs.forEach(crab => crab.sprite.setDepth(crab.sprite.y));
  }
}
