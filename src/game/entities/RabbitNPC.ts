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
  private readonly moveSpeed = 85;

  constructor(scene: Phaser.Scene, config: RabbitNPCConfig, initialHp: number = 3) {
    this.id = config.id;
    this.homeX = config.x;
    this.homeY = config.y;
    this.wanderRadius = config.wanderRadius ?? 120;

    const maxHp = 3;
    this.health = new HealthComponent(initialHp > 0 ? initialHp : maxHp, maxHp);

    this.sprite = scene.physics.add.sprite(config.x, config.y, 'rabbit_prof', 0);
    this.sprite.setDepth(config.y);
    
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(16, 14).setOffset(16, 26);

    this.createAnimations(scene);
    this.hpBar = new HealthBarRenderer(scene, this.health, this.sprite, 10);
    this.health.onDeath(() => this.die());

    this.setState('idle');
  }

  private createAnimations(scene: Phaser.Scene) {
    if (!scene.anims.exists('rabbit_idle_anim')) {
      scene.anims.create({
        key: 'rabbit_idle_anim',
        frames: scene.anims.generateFrameNumbers('rabbit_prof', { start: 0, end: 3 }),
        frameRate: 5,
        repeat: -1
      });
    }
    if (!scene.anims.exists('rabbit_move_anim')) {
      scene.anims.create({
        key: 'rabbit_move_anim',
        frames: scene.anims.generateFrameNumbers('rabbit_prof', { start: 4, end: 7 }),
        frameRate: 10,
        repeat: -1
      });
    }
    if (!scene.anims.exists('rabbit_dead_anim')) {
      scene.anims.create({
        key: 'rabbit_dead_anim',
        frames: scene.anims.generateFrameNumbers('rabbit_prof', { start: 8, end: 9 }),
        frameRate: 4,
        repeat: 0
      });
    }
  }

  update(delta: number) {
    if (!this.health.isAlive) {
      this.hpBar.update();
      return;
    }

    this.stateTimer -= delta;
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (!body) return;

    if (this.state === 'idle') {
      body.setVelocity(0, 0);
      if (this.stateTimer <= 0) {
        this.targetPos = this.pickWanderTarget();
        this.setState('moving');
      }
    } else if (this.state === 'moving') {
      if (!this.targetPos || Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, this.targetPos.x, this.targetPos.y) < 10) {
        this.setState('idle');
      } else {
        const dx = this.targetPos.x - this.sprite.x;
        const dy = this.targetPos.y - this.sprite.y;
        const angle = Math.atan2(dy, dx);
        
        body.setVelocity(Math.cos(angle) * this.moveSpeed, Math.sin(angle) * this.moveSpeed);
        
        // Estabilização do Flip (Threshold de 2px)
        if (Math.abs(body.velocity.x) > 2) {
          this.sprite.setFlipX(body.velocity.x < 0);
        }
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
    if (this.health.isAlive) {
      this.targetPos = this.pickWanderTarget();
      this.setState('moving');
    }
    return this.health.current;
  }

  collect() {
    this.health.takeDamage(999);
    this.die();
  }

  private die() {
    this.setState('dead');
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.enable = false;
      this.sprite.disableBody(true, false);
    }

    const g = this.sprite.scene.add.graphics();
    g.setDepth(this.sprite.y - 5);
    const mainColor = 0xeeeeee;

    for (let i = 0; i < 5; i++) {
      const offX = Phaser.Math.Between(-8, 8), offY = Phaser.Math.Between(-4, 4);
      const radius = Phaser.Math.Between(4, 10), alpha = Phaser.Math.FloatBetween(0.2, 0.5);
      g.fillStyle(mainColor, alpha);
      g.fillCircle(this.sprite.x + offX, this.sprite.y + 8 + offY, radius);
    }

    this.sprite.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      duration: 400,
      onComplete: () => {
        this.sprite.setVisible(false);
        if (this.sprite.scene) {
          this.sprite.scene.tweens.add({
            targets: g, alpha: 0, delay: 5000, duration: 2000,
            onComplete: () => g.destroy()
          });
        }
      }
    });

    this.hpBar.update();
  }

  destroy() {
    this.hpBar.destroy();
    this.sprite.destroy();
  }

  private setState(next: RabbitVisualState) {
    this.state = next;
    if (next === 'idle') {
      this.sprite.play('rabbit_idle_anim', true);
      this.stateTimer = Phaser.Math.Between(1500, 4000);
    } else if (next === 'moving') {
      this.sprite.play('rabbit_move_anim', true);
    } else if (next === 'dead') {
      this.sprite.play('rabbit_dead_anim', true);
    }
  }

  private pickWanderTarget() {
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const radius = Phaser.Math.FloatBetween(30, this.wanderRadius);
    return { x: this.homeX + Math.cos(angle) * radius, y: this.homeY + Math.sin(angle) * radius };
  }
}
