import Phaser from 'phaser';
import { HealthComponent } from '../components/HealthComponent';
import { HealthBarRenderer } from '../components/HealthBarRenderer';

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
  
  public health: HealthComponent;
  private hpBar: HealthBarRenderer;

  private state: CrabVisualState = 'idle';
  private stateTimer = 0;
  private targetPos: { x: number; y: number } | null = null;
  private readonly wanderRadius: number;
  private readonly moveSpeed = 52;

  constructor(scene: Phaser.Scene, config: CrabNPCConfig, initialHp: number = 10) {
    this.id = config.id;
    this.homeX = config.x;
    this.homeY = config.y;
    this.wanderRadius = config.wanderRadius ?? 70;

    const maxHp = 10;
    this.health = new HealthComponent(initialHp > 0 ? initialHp : maxHp, maxHp);

    this.sprite = scene.physics.add.sprite(config.x, config.y, 'crab_idle');
    this.sprite.setScale(0.88);
    this.sprite.setDepth(config.y);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(20, 12);
    body.setOffset(6, 16);

    this.hpBar = new HealthBarRenderer(scene, this.health, this.sprite, 10);
    this.health.onDeath(() => this.die());

    this.setState('idle');
  }

  update(delta: number) {
    if (!this.health.isAlive) {
      this.hpBar.update();
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
    this.hpBar.update();
  }

  isInRange(x: number, y: number, distance: number) {
    if (!this.health.isAlive) return false;
    return Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, x, y) <= distance;
  }

  takeDamage(amount: number): number {
    this.health.takeDamage(amount);
    return this.health.current;
  }

  collect() {
    this.health.takeDamage(9999);
    this.die();
  }

  private die() {
    this.setState('dead');
    this.sprite.disableBody(true, false);
    this.sprite.setTexture('crab_dead');
    this.hpBar.update();
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
    } else if (next === 'dead') {
      this.sprite.setTexture('crab_dead');
    }
  }

  private pickTarget() {
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const radius = Phaser.Math.FloatBetween(14, this.wanderRadius);
    return { x: this.homeX + Math.cos(angle) * radius, y: this.homeY + Math.sin(angle) * radius };
  }
}
