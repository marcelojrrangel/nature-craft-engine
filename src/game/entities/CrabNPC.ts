import Phaser from 'phaser';

export type CrabVisualState = 'idle' | 'scuttle' | 'dead';

interface CrabNPCConfig {
  id: string;
  x: number;
  y: number;
  wanderRadius?: number;
}

export class CrabNPC {
  readonly id: string;
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly homeX: number;
  readonly homeY: number;
  private hp: number;
  private maxHp: number = 10;

  private state: CrabVisualState = 'idle';
  private stateTimer = 0;
  private targetPos: { x: number; y: number } | null = null;
  private readonly wanderRadius: number;
  private readonly moveSpeed = 52;
  private hpBar: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, config: CrabNPCConfig, hp: number = 10) {
    this.id = config.id;
    this.homeX = config.x;
    this.homeY = config.y;
    this.hp = hp > 0 ? hp : 10; // Ensure HP is always valid
    this.wanderRadius = config.wanderRadius ?? 70;

    this.sprite = scene.physics.add.sprite(config.x, config.y, 'crab_idle');
    this.sprite.setScale(0.88);
    this.sprite.setDepth(config.y);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(20, 12);
    body.setOffset(6, 16);

    this.hpBar = scene.add.graphics();
    this.hpBar.setDepth(2000);

    this.setState('idle');
  }

  update(delta: number) {
    if (!this.isAlive() || this.hp <= 0) {
      this.hpBar.clear();
      return;
    }

    this.stateTimer -= delta;
    if (this.stateTimer <= 0) {
      this.setState(this.state === 'idle' ? 'scuttle' : 'idle');
    }

    if (this.state === 'idle') {
      const body = this.sprite.body as Phaser.Physics.Arcade.Body;
      if (body) body.setVelocity(0, 0);
      this.targetPos = null;
    } else {
      if (!this.targetPos || Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, this.targetPos.x, this.targetPos.y) < 10) {
        this.targetPos = this.pickTarget();
      }
      const body = this.sprite.body as Phaser.Physics.Arcade.Body;
      if (body && this.targetPos) {
        const dx = this.targetPos.x - this.sprite.x;
        const dy = this.targetPos.y - this.sprite.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        body.setVelocity((dx / len) * this.moveSpeed, (dy / len) * this.moveSpeed);
        if (dx < -1) this.sprite.setFlipX(true);
        if (dx > 1) this.sprite.setFlipX(false);
      }
    }

    this.sprite.setDepth(this.sprite.y);
    this.drawHealthBar();
  }

  private drawHealthBar() {
    this.hpBar.clear();
    if (this.hp >= this.maxHp || this.hp <= 0) return;

    const x = this.sprite.x - 10;
    const y = this.sprite.y - 10;
    const width = 20;
    const height = 3;

    this.hpBar.fillStyle(0x000000, 0.7);
    this.hpBar.fillRect(x, y, width, height);

    const hpPercent = Phaser.Math.Clamp(this.hp / this.maxHp, 0, 1);
    const color = hpPercent < 0.3 ? 0xe74c3c : hpPercent < 0.6 ? 0xf1c40f : 0x2ecc71;
    this.hpBar.fillStyle(color, 1);
    this.hpBar.fillRect(x, y, width * hpPercent, height);
  }

  isAlive() { return this.hp > 0 && this.sprite && this.sprite.active; }

  isInRange(x: number, y: number, distance: number) {
    if (!this.isAlive()) return false;
    return Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, x, y) <= distance;
  }

  collect() {
    this.hp = 0;
    this.hpBar.clear();
    this.sprite.disableBody(true, false);
    this.sprite.setTexture('crab_dead');
  }

  takeDamage(amount: number): number {
    this.hp = Math.max(0, this.hp - amount);
    if (this.hp <= 0) this.collect();
    return this.hp;
  }

  destroy() {
    this.hpBar.destroy();
    this.sprite.destroy();
  }

  private setState(next: CrabVisualState) {
    this.state = next;
    if (next === 'idle') {
      this.stateTimer = Phaser.Math.Between(1000, 2000);
      this.sprite.setTexture('crab_idle');
    } else if (next === 'scuttle') {
      this.stateTimer = Phaser.Math.Between(800, 1500);
      this.sprite.setTexture('crab_scuttle_0');
    }
  }

  private pickTarget() {
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const radius = Phaser.Math.FloatBetween(14, this.wanderRadius);
    return { x: this.homeX + Math.cos(angle) * radius, y: this.homeY + Math.sin(angle) * radius };
  }
}
