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
  private maxHp: number;

  private state: CrabVisualState = 'idle';
  private stateTimer = 0;
  private targetPos: { x: number; y: number } | null = null;
  private readonly wanderRadius: number;
  private readonly moveSpeed = 52;

  constructor(scene: Phaser.Scene, config: CrabNPCConfig, hp: number = 10) {
    this.id = config.id;
    this.homeX = config.x;
    this.homeY = config.y;
    this.hp = hp;
    this.maxHp = hp;
    this.wanderRadius = config.wanderRadius ?? 70;

    this.sprite = scene.physics.add.sprite(config.x, config.y, 'crab_idle');
    this.sprite.setScale(0.88);
    this.sprite.setDepth(config.y);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(20, 12);
    body.setOffset(6, 16);

    this.setState('idle');
  }

  update(delta: number) {
    if (!this.isAlive()) return;

    this.stateTimer -= delta;
    if (this.stateTimer <= 0) {
      this.setState(this.state === 'idle' ? 'scuttle' : 'idle');
    }

    if (this.state === 'idle') {
      const body = this.sprite.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(0, 0);
      this.targetPos = null;
      this.sprite.setTexture('crab_idle');
      return;
    }

    this.sprite.setTexture(Math.random() > 0.5 ? 'crab_scuttle_0' : 'crab_scuttle_1');

    if (!this.targetPos || Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, this.targetPos.x, this.targetPos.y) < 6) {
      this.targetPos = this.pickTarget();
    }

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const dx = this.targetPos.x - this.sprite.x;
    const dy = this.targetPos.y - this.sprite.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    body.setVelocity((dx / len) * this.moveSpeed, (dy / len) * this.moveSpeed);

    if (dx < -1) this.sprite.setFlipX(true);
    if (dx > 1) this.sprite.setFlipX(false);

    this.sprite.setDepth(this.sprite.y);
  }

  isAlive() {
    return this.state !== 'dead' && this.sprite.active;
  }

  isInRange(x: number, y: number, distance: number) {
    if (!this.isAlive()) return false;
    return Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, x, y) <= distance;
  }

  collect() {
    if (!this.isAlive()) return;
    this.setState('dead');
    this.sprite.disableBody(true, true);
  }

  takeDamage(amount: number): number {
    this.hp = Math.max(0, this.hp - amount);
    return this.hp;
  }

  getHp(): number {
    return this.hp;
  }

  destroy() {
    this.sprite.destroy();
  }

  private setState(next: CrabVisualState) {
    this.state = next;
    if (next === 'idle') {
      this.stateTimer = Phaser.Math.Between(1000, 2000);
      this.sprite.setTexture('crab_idle');
      return;
    }

    if (next === 'scuttle') {
      this.stateTimer = Phaser.Math.Between(800, 1500);
      this.sprite.setTexture('crab_scuttle_0');
      return;
    }

    this.stateTimer = 0;
    this.sprite.setTexture('crab_dead');
  }

  private pickTarget() {
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const radius = Phaser.Math.FloatBetween(14, this.wanderRadius);
    return {
      x: this.homeX + Math.cos(angle) * radius,
      y: this.homeY + Math.sin(angle) * radius,
    };
  }
}
