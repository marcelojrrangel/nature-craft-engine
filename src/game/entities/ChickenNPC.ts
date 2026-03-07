import Phaser from 'phaser';
import { HealthComponent } from '../components/HealthComponent';
import { HealthBarRenderer } from '../components/HealthBarRenderer';

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
  
  // Components (Composition)
  public health: HealthComponent;
  private hpBar: HealthBarRenderer;

  private state: ChickenVisualState = 'idle';
  private stateTimer = 0;
  private targetPos: { x: number; y: number } | null = null;
  private readonly wanderRadius: number;
  private readonly moveSpeed = 40;

  constructor(scene: Phaser.Scene, config: ChickenNPCConfig, initialHp: number = 5) {
    this.id = config.id;
    this.homeX = config.x;
    this.homeY = config.y;
    this.wanderRadius = config.wanderRadius ?? 96;

    // 1. Initialize Logic Component
    const maxHp = 5;
    this.health = new HealthComponent(initialHp > 0 ? initialHp : maxHp, maxHp);

    // 2. Initialize Physics/Sprite
    this.sprite = scene.physics.add.sprite(config.x, config.y, 'chicken_idle');
    this.sprite.setDepth(config.y);
    this.sprite.setScale(0.9);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(18, 14);
    body.setOffset(7, 16);

    // 3. Initialize Visual Component (depends on Logic and Sprite)
    this.hpBar = new HealthBarRenderer(scene, this.health, this.sprite, 12);

    // 4. Setup Events
    this.health.onDeath(() => this.die());

    this.setState('idle');
  }

  update(delta: number) {
    if (!this.health.isAlive) {
      this.hpBar.update(); // Clear bar if dead
      return;
    }

    this.updateAI(delta);
    
    // Update visuals
    this.sprite.setDepth(this.sprite.y);
    this.hpBar.update();
  }

  private updateAI(delta: number) {
    this.stateTimer -= delta;
    if (this.stateTimer <= 0) {
      this.setState(this.state === 'idle' ? 'eating' : 'idle');
    }

    if (this.state === 'eating') {
      const body = this.sprite.body as Phaser.Physics.Arcade.Body;
      if (body) body.setVelocity(0, 0);
      this.targetPos = null;
    } else {
      if (!this.targetPos || Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, this.targetPos.x, this.targetPos.y) < 10) {
        this.targetPos = this.pickWanderTarget();
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
  }

  isInRange(x: number, y: number, distance: number) {
    if (!this.health.isAlive) return false;
    return Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, x, y) <= distance;
  }

  // Facade for MainScene interaction
  takeDamage(amount: number): number {
    this.health.takeDamage(amount);
    return this.health.current;
  }

  collect() {
    this.health.takeDamage(9999); // Force death
    this.sprite.disableBody(true, false); // Keep visible but no physics
    this.sprite.setTexture('chicken_dead');
  }

  private die() {
    this.setState('dead');
    this.sprite.disableBody(true, false);
  }

  destroy() {
    this.hpBar.destroy();
    this.sprite.destroy();
  }

  private setState(nextState: ChickenVisualState) {
    this.state = nextState;
    if (nextState === 'idle') {
      this.sprite.setTexture('chicken_idle');
      this.stateTimer = Phaser.Math.Between(1200, 3000);
    } else if (nextState === 'eating') {
      this.sprite.setTexture(Math.random() > 0.5 ? 'chicken_eat_0' : 'chicken_eat_1');
      this.stateTimer = Phaser.Math.Between(800, 2000);
    } else if (nextState === 'dead') {
      this.sprite.setTexture('chicken_dead');
    }
  }

  private pickWanderTarget() {
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const radius = Phaser.Math.FloatBetween(20, this.wanderRadius);
    return { x: this.homeX + Math.cos(angle) * radius, y: this.homeY + Math.sin(angle) * radius };
  }
}
