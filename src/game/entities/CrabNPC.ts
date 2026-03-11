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
  private readonly moveSpeed = 45; // Ajustado para combinar com a animação de scuttle

  constructor(scene: Phaser.Scene, config: CrabNPCConfig, initialHp: number = 10) {
    this.id = config.id;
    this.homeX = config.x;
    this.homeY = config.y;
    this.wanderRadius = config.wanderRadius ?? 70;

    const maxHp = 10;
    this.health = new HealthComponent(initialHp > 0 ? initialHp : maxHp, maxHp);

    this.sprite = scene.physics.add.sprite(config.x, config.y, 'crab_prof', 0);
    this.sprite.setDepth(config.y);
    
    // Ajustar corpo físico (Caranguejos são achatados e largos)
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(20, 10).setOffset(6, 18);

    this.createAnimations(scene);
    this.hpBar = new HealthBarRenderer(scene, this.health, this.sprite, 12);
    this.health.onDeath(() => this.die());

    this.setState('idle');
  }

  private createAnimations(scene: Phaser.Scene) {
    if (!scene.anims.exists('crab_idle')) {
      scene.anims.create({
        key: 'crab_idle',
        frames: scene.anims.generateFrameNumbers('crab_prof', { start: 0, end: 3 }),
        frameRate: 6,
        repeat: -1
      });
    }
    if (!scene.anims.exists('crab_scuttle')) {
      scene.anims.create({
        key: 'crab_scuttle',
        frames: scene.anims.generateFrameNumbers('crab_prof', { start: 4, end: 7 }),
        frameRate: 10,
        repeat: -1
      });
    }
    if (!scene.anims.exists('crab_dead_anim')) {
      scene.anims.create({
        key: 'crab_dead_anim',
        frames: scene.anims.generateFrameNumbers('crab_prof', { start: 12, end: 15 }),
        frameRate: 8,
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
    if (this.stateTimer <= 0) {
      this.setState(this.state === 'idle' ? 'scuttle' : 'idle');
    }

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (!body) return;

    if (this.state === 'idle') {
      body.setVelocity(0, 0);
      this.targetPos = null;
    } else {
      if (!this.targetPos || Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, this.targetPos.x, this.targetPos.y) < 10) {
        this.targetPos = this.pickTarget();
      }
      
      const dx = this.targetPos.x - this.sprite.x;
      const dy = this.targetPos.y - this.sprite.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      body.setVelocity((dx / len) * this.moveSpeed, (dy / len) * this.moveSpeed);
      
      if (dx < -1) this.sprite.setFlipX(true);
      if (dx > 1) this.sprite.setFlipX(false);
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
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.enable = false;
      this.sprite.disableBody(true, false);
    }

    // Criar mancha irregular (Cor de Caranguejo: Laranja/Vermelho)
    const g = this.sprite.scene.add.graphics();
    g.setDepth(this.sprite.y - 5);
    const mainColor = 0xcd4f5f;

    for (let i = 0; i < 5; i++) {
      const offX = Phaser.Math.Between(-10, 10);
      const offY = Phaser.Math.Between(-5, 5);
      const radius = Phaser.Math.Between(5, 12);
      const alpha = Phaser.Math.FloatBetween(0.3, 0.6);
      g.fillStyle(mainColor, alpha);
      g.fillCircle(this.sprite.x + offX, this.sprite.y + 10 + offY, radius);
    }

    this.sprite.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      duration: 400,
      onComplete: () => {
        this.sprite.setVisible(false);
        if (this.sprite.scene) {
          this.sprite.scene.tweens.add({
            targets: g,
            alpha: 0,
            delay: 5000,
            duration: 2000,
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

  private setState(next: CrabVisualState) {
    this.state = next;
    switch (next) {
      case 'idle':
        this.stateTimer = Phaser.Math.Between(1500, 3000);
        this.sprite.play('crab_idle', true);
        break;
      case 'scuttle':
        this.stateTimer = Phaser.Math.Between(1000, 2000);
        this.sprite.play('crab_scuttle', true);
        break;
      case 'dead':
        this.sprite.play('crab_dead_anim', true);
        break;
    }
  }

  private pickTarget() {
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const radius = Phaser.Math.FloatBetween(20, this.wanderRadius);
    return { x: this.homeX + Math.cos(angle) * radius, y: this.homeY + Math.sin(angle) * radius };
  }
}
