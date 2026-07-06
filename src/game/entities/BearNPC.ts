import Phaser from 'phaser';
import { gameStore } from '../store';
import { HealthComponent } from '../components/HealthComponent';
import { HealthBarRenderer } from '../components/HealthBarRenderer';

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
  
  public health: HealthComponent;
  private hpBar: HealthBarRenderer;

  private state: BearVisualState = 'idle';
  private stateTimer = 0;
  private targetPos: { x: number; y: number } | null = null;
  private readonly wanderRadius: number;
  private readonly walkSpeed = 40;
  private readonly runSpeed = 110;
  private readonly detectionRange = 140;
  private readonly attackRange = 45;
  private attackCooldown = 0;

  constructor(scene: Phaser.Scene, config: BearNPCConfig, initialHp: number = 40) {
    this.id = config.id;
    this.homeX = config.x;
    this.homeY = config.y;
    this.wanderRadius = config.wanderRadius ?? 150;

    const maxHp = 40;
    this.health = new HealthComponent(initialHp > 0 ? initialHp : maxHp, maxHp);

    this.sprite = scene.physics.add.sprite(config.x, config.y, 'bear_sheet', 0);
    this.sprite.setDepth(config.y);
    
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(36, 28).setOffset(14, 18);

    this.createAnimations(scene);
    this.hpBar = new HealthBarRenderer(scene, this.health, this.sprite, 52, true);
    this.health.onDeath(() => this.die());

    this.setState('idle');
  }

  private createAnimations(scene: Phaser.Scene) {
    if (!scene.anims.exists('bear_idle_anim')) {
      scene.anims.create({
        key: 'bear_idle_anim',
        frames: [{ key: 'bear_sheet', frame: 0 }],
        frameRate: 1,
        repeat: -1
      });
    }
    if (!scene.anims.exists('bear_run_anim')) {
      scene.anims.create({
        key: 'bear_run_anim',
        frames: scene.anims.generateFrameNumbers('bear_sheet', { start: 1, end: 5 }),
        frameRate: 10,
        repeat: -1
      });
    }
    if (!scene.anims.exists('bear_attack_anim')) {
      scene.anims.create({
        key: 'bear_attack_anim',
        frames: scene.anims.generateFrameNumbers('bear_sheet', { start: 6, end: 8 }),
        frameRate: 8,
        repeat: 0
      });
    }
    if (!scene.anims.exists('bear_death_anim')) {
      scene.anims.create({
        key: 'bear_death_anim',
        frames: scene.anims.generateFrameNumbers('bear_sheet', { start: 9, end: 12 }),
        frameRate: 8,
        repeat: 0
      });
    }
  }

  update(delta: number, playerX: number, playerY: number, safeZone?: { x: number, y: number, radius: number }, isPlayerSafe: boolean = false) {
    if (!this.health.isAlive) {
      this.hpBar.update();
      return;
    }

    if (this.attackCooldown > 0) this.attackCooldown -= delta;

    this.updateFrictionWithSafeZone(safeZone);
    this.updateAI(playerX, playerY, isPlayerSafe);
    this.updateMovement(delta);

    this.sprite.setDepth(this.sprite.y);
    this.hpBar.update();
  }

  private updateFrictionWithSafeZone(safeZone?: { x: number, y: number, radius: number }) {
    if (safeZone) {
      const dist = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, safeZone.x, safeZone.y);
      const buffer = 15;
      if (dist < safeZone.radius + buffer) {
        const angle = Phaser.Math.Angle.Between(safeZone.x, safeZone.y, this.sprite.x, this.sprite.y);
        this.sprite.x = safeZone.x + Math.cos(angle) * (safeZone.radius + buffer);
        this.sprite.y = safeZone.y + Math.sin(angle) * (safeZone.radius + buffer);
        if (this.state === 'chasing') { this.setState('idle'); this.targetPos = this.pickTarget(); }
      }
    }
  }

  private updateAI(playerX: number, playerY: number, isPlayerSafe: boolean) {
    const dist = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, playerX, playerY);
    if (isPlayerSafe) {
      if (this.state === 'chasing' || this.state === 'attacking') { this.setState('idle'); this.targetPos = null; }
    } else {
      if (dist < this.attackRange && this.attackCooldown <= 0) {
        this.attackPlayer();
      } else if (dist < this.detectionRange) {
        this.setState('chasing');
        this.targetPos = { x: playerX, y: playerY };
      } else if (this.state === 'chasing') {
        this.setState('idle');
        this.targetPos = null;
      }
    }
  }

  private updateMovement(delta: number) {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (!body) return;

    if (this.state === 'idle') {
      this.stateTimer -= delta;
      if (this.stateTimer <= 0) { this.targetPos = this.pickTarget(); this.stateTimer = Phaser.Math.Between(2000, 4000); }
      if (this.targetPos) {
        if (Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, this.targetPos.x, this.targetPos.y) < 5) {
          body.setVelocity(0, 0); this.targetPos = null;
          this.sprite.play('bear_idle_anim', true);
        } else {
          const angle = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, this.targetPos.x, this.targetPos.y);
          body.setVelocity(Math.cos(angle) * this.walkSpeed, Math.sin(angle) * this.walkSpeed);
          this.sprite.play('bear_run_anim', true);
          this.sprite.setFlipX(body.velocity.x < 0);
        }
      } else {
        body.setVelocity(0, 0);
        this.sprite.play('bear_idle_anim', true);
      }
    } else if (this.state === 'chasing' && this.targetPos) {
      const angle = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, this.targetPos.x, this.targetPos.y);
      body.setVelocity(Math.cos(angle) * this.runSpeed, Math.sin(angle) * this.runSpeed);
      this.sprite.play('bear_run_anim', true);
      this.sprite.setFlipX(body.velocity.x < 0);
    }
  }

  private attackPlayer() {
    this.setState('attacking');
    this.attackCooldown = 1500;
    gameStore.receiveDamage(25);
    
    this.sprite.scene.cameras.main.flash(100, 255, 0, 0, false);
    
    this.sprite.scene.time.delayedCall(400, () => {
      if (this.health.isAlive) this.setState('idle');
    });
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
    this.sprite.play('bear_death_anim', true);
    this.sprite.setDepth(this.sprite.y - 10);
    this.hpBar.update();
  }

  destroy() {
    this.hpBar.destroy();
    this.sprite.destroy();
  }

  private setState(next: BearVisualState) {
    if (this.state === next && next !== 'dead') return;
    this.state = next;
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (next === 'dead' && body) {
      body.setVelocity(0, 0);
    }
  }

  private pickTarget() {
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const radius = Phaser.Math.FloatBetween(30, this.wanderRadius);
    return { x: this.homeX + Math.cos(angle) * radius, y: this.homeY + Math.sin(angle) * radius };
  }

  isInRange(x: number, y: number, distance: number) {
    if (!this.health.isAlive) return false;
    return Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, x, y) <= distance;
  }
}