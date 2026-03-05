import Phaser from 'phaser';
import { gameStore } from '../store';
import { ITEMS } from '../types';
import { gameEvents } from '../events';

const MAP_W = 50;
const MAP_H = 50;
const TILE = 32;

interface ResourceObj extends Phaser.GameObjects.Sprite {
  resourceType: 'tree' | 'rock' | 'bush';
  resourceHp: number;
  maxHp: number;
  resourceId: string;
}

export class MainScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private resources: ResourceObj[] = [];
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
  private respawnQueue: { x: number; y: number; type: 'tree' | 'rock' | 'bush'; hp: number; id: string; respawnAt: number }[] = [];
  private respawnCounter = 0;

  constructor() {
    super({ key: 'MainScene' });
  }

  create() {
    // Generate tilemap
    this.generateMap();
    this.createPlayer();
    this.generateResources();
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
    const placeable = (x: number, y: number) => {
      const nx = x / (MAP_W * TILE);
      const ny = y / (MAP_H * TILE);
      const d = Math.sqrt((nx - 0.5) ** 2 + (ny - 0.5) ** 2);
      return d < 0.36;
    };

    // Trees
    for (let i = 0; i < 40; i++) {
      const x = Phaser.Math.Between(3 * TILE, (MAP_W - 3) * TILE);
      const y = Phaser.Math.Between(3 * TILE, (MAP_H - 3) * TILE);
      if (!placeable(x, y)) continue;
      this.createResource(x, y, 'tree', 5, `tree_${i}`);
    }

    // Rocks
    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(3 * TILE, (MAP_W - 3) * TILE);
      const y = Phaser.Math.Between(3 * TILE, (MAP_H - 3) * TILE);
      if (!placeable(x, y)) continue;
      this.createResource(x, y, 'rock', 8, `rock_${i}`);
    }

    // Bushes
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(3 * TILE, (MAP_W - 3) * TILE);
      const y = Phaser.Math.Between(3 * TILE, (MAP_H - 3) * TILE);
      if (!placeable(x, y)) continue;
      this.createResource(x, y, 'bush', 3, `bush_${i}`);
    }

    // Workbench near center
    const wb = this.physics.add.sprite(MAP_W * TILE / 2 + 64, MAP_H * TILE / 2 + 64, 'workbench');
    wb.setImmovable(true);
    wb.setDepth(5);
    (wb as any).isWorkbench = true;
    this.physics.add.collider(this.player, wb);
  }

  private createResource(x: number, y: number, type: 'tree' | 'rock' | 'bush', hp: number, id: string) {
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
    this.anims.create({
      key: 'idle',
      frames: [{ key: 'player_idle' }],
      frameRate: 1,
      repeat: -1,
    });

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

    this.anims.create({
      key: 'attack',
      frames: [{ key: 'player_attack' }],
      frameRate: 4,
      repeat: 0,
    });
  }

  private setupInput() {
    this.keydownHandler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      this.keysDown.add(key);
      if (key === 'e') this.doInteract();
      if (key === 'i') gameStore.toggleInventory();
      if (key === 'c') gameStore.toggleCrafting();
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
  }

  private doAttack() {
    if (this.isAttacking || this.attackCooldown > 0) return;
    this.isAttacking = true;
    this.attackCooldown = 300;
    this.player.play('attack');

    // Check nearby resources
    const stats = gameStore.getStats();
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

  private harvestResource(res: ResourceObj) {
    // Drop items
    let dropItem;
    let qty = 1;
    switch (res.resourceType) {
      case 'tree': dropItem = ITEMS.wood; qty = Phaser.Math.Between(2, 4); break;
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
    const now = this.time.now;
    for (let i = this.respawnQueue.length - 1; i >= 0; i--) {
      const entry = this.respawnQueue[i];
      if (now >= entry.respawnAt) {
        this.respawnQueue.splice(i, 1);
        this.createResource(entry.x, entry.y, entry.type, entry.hp, entry.id);
      }
    }
  }

  private doInteract() {
    if (this.nearWorkbench) {
      gameStore.toggleCrafting();
    }
  }

  update(_time: number, delta: number) {
    if (this.attackCooldown > 0) this.attackCooldown -= delta;
    this.processRespawns();
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
  }
}
