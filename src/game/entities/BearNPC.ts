import Phaser from 'phaser';
import { gameStore } from '../store';

export type BearVisualState = 'idle' | 'chasing' | 'attacking' | 'dead';

interface BearNPCConfig {
  id: string;
  x: number;
  y: number;
  wanderRadius?: number;
}

export class BearNPC {
  readonly id: string;
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly homeX: number;
  readonly homeY: number;
  private hp: number;
  private maxHp: number;

  private state: BearVisualState = 'idle';
  private stateTimer = 0;
  private targetPos: { x: number; y: number } | null = null;
  private readonly wanderRadius: number;
  private readonly walkSpeed = 30;
  private readonly runSpeed = 100;
  private readonly detectionRange = 120;
  private readonly attackRange = 40;
  private attackCooldown = 0;
  private hpBar: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, config: BearNPCConfig, hp: number = 30) {
    this.id = config.id;
    this.homeX = config.x;
    this.homeY = config.y;
    this.hp = hp;
    this.maxHp = 30;
    this.wanderRadius = config.wanderRadius ?? 150;

    this.sprite = scene.physics.add.sprite(config.x, config.y, 'bear_idle');
    this.sprite.setScale(1.2);
    this.sprite.setDepth(config.y);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(24, 20);
    body.setOffset(4, 12);

    this.hpBar = scene.add.graphics();
    this.hpBar.setDepth(2000);

    this.setState('idle');
  }

  update(delta: number, playerX: number, playerY: number, safeZone?: { x: number, y: number, radius: number }, isPlayerSafe: boolean = false) {
    if (!this.isAlive()) {
      this.hpBar.clear();
      return;
    }

    if (this.attackCooldown > 0) this.attackCooldown -= delta;

    // Physical barrier logic: Don't allow bear to enter safe zone
    if (safeZone) {
      const distToSafeCenter = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, safeZone.x, safeZone.y);
      const buffer = 15; // Bear's own size buffer
      if (distToSafeCenter < safeZone.radius + buffer) {
        const angle = Phaser.Math.Angle.Between(safeZone.x, safeZone.y, this.sprite.x, this.sprite.y);
        this.sprite.x = safeZone.x + Math.cos(angle) * (safeZone.radius + buffer);
        this.sprite.y = safeZone.y + Math.sin(angle) * (safeZone.radius + buffer);
        
        // If it was chasing, make it wander instead
        if (this.state === 'chasing') {
          this.setState('idle');
          this.targetPos = this.pickTarget();
        }
      }
    }

    const distToPlayer = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, playerX, playerY);

    if (isPlayerSafe) {
      if (this.state === 'chasing' || this.state === 'attacking') {
        this.setState('idle');
        this.targetPos = null;
      }
    } else {
      if (distToPlayer < this.attackRange && this.attackCooldown <= 0) {
        this.attackPlayer();
      } else if (distToPlayer < this.detectionRange) {
        this.setState('chasing');
        this.targetPos = { x: playerX, y: playerY };
      } else if (this.state === 'chasing') {
        this.setState('idle');
        this.targetPos = null;
      }
    }

    if (this.state === 'idle') {
      this.updateIdle(delta);
    } else if (this.state === 'chasing') {
      this.updateChasing();
    }

    this.sprite.setDepth(this.sprite.y);
    this.drawHealthBar();
  }

  private drawHealthBar() {
    this.hpBar.clear();
    const x = this.sprite.x - 12, y = this.sprite.y - 22, width = 24, height = 4;
    this.hpBar.fillStyle(0x000000, 0.7);
    this.hpBar.fillRect(x, y, width, height);
    const hpPercent = this.hp / this.maxHp;
    const color = hpPercent < 0.3 ? 0xe74c3c : hpPercent < 0.6 ? 0xf1c40f : 0x2ecc71;
    this.hpBar.fillStyle(color, 1);
    this.hpBar.fillRect(x, y, width * hpPercent, height);
  }

  private updateIdle(delta: number) {
    this.stateTimer -= delta;
    if (this.stateTimer <= 0) {
      this.targetPos = this.pickTarget();
      this.stateTimer = Phaser.Math.Between(2000, 4000);
    }
    if (this.targetPos) {
      const body = this.sprite.body as Phaser.Physics.Arcade.Body;
      const dist = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, this.targetPos.x, this.targetPos.y);
      if (dist < 5) {
        body.setVelocity(0, 0);
        this.targetPos = null;
      } else {
        const angle = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, this.targetPos.x, this.targetPos.y);
        body.setVelocity(Math.cos(angle) * this.walkSpeed, Math.sin(angle) * this.walkSpeed);
        this.sprite.setFlipX(body.velocity.x < 0);
      }
    }
  }

  private updateChasing() {
    if (!this.targetPos) return;
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const angle = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, this.targetPos.x, this.targetPos.y);
    body.setVelocity(Math.cos(angle) * this.runSpeed, Math.sin(angle) * this.runSpeed);
    this.sprite.setFlipX(body.velocity.x < 0);
  }

  private attackPlayer() {
    this.setState('attacking');
    this.attackCooldown = 1500;
    gameStore.receiveDamage(20);
    this.sprite.setTexture('bear_attack');
    this.sprite.scene.time.delayedCall(300, () => {
      if (this.isAlive()) this.sprite.setTexture('bear_idle');
    });
  }

  isAlive() { return this.state !== 'dead' && this.sprite.active; }

  takeDamage(amount: number): number {
    this.hp = Math.max(0, this.hp - amount);
    if (this.hp <= 0) { this.setState('dead'); this.hpBar.clear(); }
    return this.hp;
  }

  collect() { this.setState('dead'); this.sprite.disableBody(true, true); this.hpBar.clear(); }

  destroy() { this.hpBar.destroy(); this.sprite.destroy(); }

  private setState(next: BearVisualState) {
    if (this.state === next) return;
    this.state = next;
    if (next === 'dead') {
      this.sprite.setTexture('bear_dead');
      const body = this.sprite.body as Phaser.Physics.Arcade.Body;
      if (body) body.setVelocity(0, 0);
      this.hpBar.clear();
    } else { this.sprite.setTexture('bear_idle'); }
  }

  private pickTarget() {
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const radius = Phaser.Math.FloatBetween(20, this.wanderRadius);
    return { x: this.homeX + Math.cos(angle) * radius, y: this.homeY + Math.sin(angle) * radius };
  }
}
