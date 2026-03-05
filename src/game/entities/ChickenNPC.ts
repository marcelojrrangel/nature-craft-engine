import Phaser from 'phaser';

export type ChickenVisualState = 'idle' | 'eating' | 'dead';

interface ChickenNPCConfig {
  id: string;
  x: number;
  y: number;
  wanderRadius?: number;
}

export class ChickenNPC {
  readonly id: string;
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly homeX: number;
  readonly homeY: number;
  private hp: number;
  private maxHp: number;

  private scene: Phaser.Scene;
  private state: ChickenVisualState = 'idle';
  private stateTimer = 0;
  private targetPos: { x: number; y: number } | null = null;
  private readonly wanderRadius: number;
  private readonly moveSpeed = 40;

  constructor(scene: Phaser.Scene, config: ChickenNPCConfig, hp: number = 5) {
    this.scene = scene;
    this.id = config.id;
    this.homeX = config.x;
    this.homeY = config.y;
    this.hp = hp;
    this.maxHp = hp;
    this.wanderRadius = config.wanderRadius ?? 96;

    this.sprite = scene.physics.add.sprite(config.x, config.y, 'chicken_idle');
    this.sprite.setDepth(config.y);
    this.sprite.setScale(0.9);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(18, 14);
    body.setOffset(7, 16);

    this.setState('idle');
  }

  update(delta: number) {
    if (!this.isAlive()) return;

    this.stateTimer -= delta;
    if (this.stateTimer <= 0) {
      if (this.state === 'idle') {
        this.setState('eating');
      } else {
        this.setState('idle');
      }
    }

    if (this.state === 'eating') {
      const body = this.sprite.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(0, 0);
      this.targetPos = null;
      return;
    }

    if (!this.targetPos || Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, this.targetPos.x, this.targetPos.y) < 6) {
      this.targetPos = this.pickWanderTarget();
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

  private setState(nextState: ChickenVisualState) {
    this.state = nextState;
    if (nextState === 'idle') {
      this.sprite.setTexture('chicken_idle');
      this.stateTimer = Phaser.Math.Between(1200, 2500);
      return;
    }

    if (nextState === 'eating') {
      this.sprite.setTexture(Math.random() > 0.5 ? 'chicken_eat_0' : 'chicken_eat_1');
      this.stateTimer = Phaser.Math.Between(700, 1600);
      return;
    }

    this.sprite.setTexture('chicken_dead');
    this.stateTimer = 0;
  }

  private pickWanderTarget() {
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const radius = Phaser.Math.FloatBetween(16, this.wanderRadius);
    return {
      x: this.homeX + Math.cos(angle) * radius,
      y: this.homeY + Math.sin(angle) * radius,
    };
  }
}
