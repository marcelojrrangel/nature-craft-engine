import Phaser from 'phaser';
import { HealthComponent } from '../components/HealthComponent';
import { HealthBarRenderer } from '../components/HealthBarRenderer';

export type RabbitVisualState = 'idle' | 'moving' | 'dead';

interface RabbitNPCConfig {
  id: string;
  x: number;
  y: number;
  wanderRadius?: number;
}

export class RabbitNPC {
  readonly id: string;
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly homeX: number;
  readonly homeY: number;
  
  public health: HealthComponent;
  private hpBar: HealthBarRenderer;

  private state: RabbitVisualState = 'idle';
  private stateTimer = 0;
  private targetPos: { x: number; y: number } | null = null;
  private readonly wanderRadius: number;
  private readonly moveSpeed = 70; // Faster than chicken (40)

  constructor(scene: Phaser.Scene, config: RabbitNPCConfig, initialHp: number = 3) {
    this.id = config.id;
    this.homeX = config.x;
    this.homeY = config.y;
    this.wanderRadius = config.wanderRadius ?? 120;

    const maxHp = 3;
    this.health = new HealthComponent(initialHp > 0 ? initialHp : maxHp, maxHp);

    this.sprite = scene.physics.add.sprite(config.x, config.y, 'rabbit_idle');
    this.sprite.setScale(0.75);
    this.sprite.setDepth(config.y);
    
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(16, 12);
    body.setOffset(8, 16);

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
    
    if (this.state === 'idle') {
      const body = this.sprite.body as Phaser.Physics.Arcade.Body;
      if (body) body.setVelocity(0, 0);
      
      if (this.stateTimer <= 0) {
        this.targetPos = this.pickWanderTarget();
        this.setState('moving');
      }
    } else if (this.state === 'moving') {
      if (!this.targetPos || Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, this.targetPos.x, this.targetPos.y) < 5) {
        this.setState('idle');
      } else {
        const body = this.sprite.body as Phaser.Physics.Arcade.Body;
        if (body) {
          const angle = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, this.targetPos.x, this.targetPos.y);
          body.setVelocity(Math.cos(angle) * this.moveSpeed, Math.sin(angle) * this.moveSpeed);
          this.sprite.setFlipX(body.velocity.x < 0);
          // Play jump-like animation texture toggle
          this.sprite.setTexture(Math.floor(Date.now() / 200) % 2 === 0 ? 'rabbit_jump' : 'rabbit_idle');
        }
      }
    }

    this.sprite.setDepth(this.sprite.y);
    this.hpBar.update();
  }

  isAlive() { return this.health.isAlive; }

  isInRange(x: number, y: number, distance: number) {
    if (!this.isAlive()) return false;
    return Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, x, y) <= distance;
  }

  takeDamage(amount: number): number {
    this.health.takeDamage(amount);
    // If hit, try to run away
    if (this.health.isAlive) {
      this.targetPos = this.pickWanderTarget();
      this.setState('moving');
    }
    return this.health.current;
  }

  collect() {
    this.health.takeDamage(999);
    this.sprite.disableBody(true, false);
    this.sprite.setTexture('rabbit_dead');
  }

  private die() {
    this.setState('dead');
    this.sprite.disableBody(true, false);
  }

  destroy() {
    this.hpBar.destroy();
    this.sprite.destroy();
  }

  private setState(next: RabbitVisualState) {
    this.state = next;
    if (next === 'idle') {
      this.sprite.setTexture('rabbit_idle');
      this.stateTimer = Phaser.Math.Between(1500, 4000); // Wait longer than chickens
    } else if (next === 'dead') {
      this.sprite.setTexture('rabbit_dead');
    }
  }

  private pickWanderTarget() {
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const radius = Phaser.Math.FloatBetween(30, this.wanderRadius);
    return {
      x: this.homeX + Math.cos(angle) * radius,
      y: this.homeY + Math.sin(angle) * radius,
    };
  }
}
