import Phaser from 'phaser';
import { gameStore } from '../store';
import { HealthComponent } from '../components/HealthComponent';
import { HealthBarRenderer } from '../components/HealthBarRenderer';

export type OrcVisualState = 'idle' | 'chasing' | 'attacking' | 'dead';

interface OrcNPCConfig {
  id: string;
  x: number;
  y: number;
  wanderRadius?: number;
}

export class OrcNPC {
  readonly id: string;
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly homeX: number;
  readonly homeY: number;
  
  public health: HealthComponent;
  private hpBar: HealthBarRenderer;

  private state: OrcVisualState = 'idle';
  private stateTimer = 0;
  private targetPos: { x: number; y: number } | null = null;
  private readonly wanderRadius: number;
  private readonly walkSpeed = 40;
  private readonly runSpeed = 110; // Um pouco mais rápido que o urso
  private readonly detectionRange = 140;
  private readonly attackRange = 45;
  private attackCooldown = 0;

  constructor(scene: Phaser.Scene, config: OrcNPCConfig, initialHp: number = 40) {
    this.id = config.id;
    this.homeX = config.x;
    this.homeY = config.y;
    this.wanderRadius = config.wanderRadius ?? 150;

    const maxHp = 40; // Orc é mais resistente
    this.health = new HealthComponent(initialHp > 0 ? initialHp : maxHp, maxHp);

    this.sprite = scene.physics.add.sprite(config.x, config.y, 'orc_idle', 0);
    this.sprite.setDepth(config.y);
    
    // Ajustar corpo físico (Humanóide)
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(16, 24).setOffset(8, 8);

    this.createAnimations(scene);
    this.hpBar = new HealthBarRenderer(scene, this.health, this.sprite, 28, true);
    this.health.onDeath(() => this.die());

    this.setState('idle');
  }

  private createAnimations(scene: Phaser.Scene) {
    if (!scene.anims.exists('orc_idle_anim')) {
      scene.anims.create({
        key: 'orc_idle_anim',
        frames: scene.anims.generateFrameNumbers('orc_idle', { start: 0, end: 3 }),
        frameRate: 6,
        repeat: -1
      });
    }
    if (!scene.anims.exists('orc_run_anim')) {
      scene.anims.create({
        key: 'orc_run_anim',
        frames: scene.anims.generateFrameNumbers('orc_run', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: -1
      });
    }
    if (!scene.anims.exists('orc_death_anim')) {
      scene.anims.create({
        key: 'orc_death_anim',
        frames: scene.anims.generateFrameNumbers('orc_death', { start: 0, end: 5 }),
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
          this.sprite.play('orc_idle_anim', true);
        } else {
          const angle = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, this.targetPos.x, this.targetPos.y);
          body.setVelocity(Math.cos(angle) * this.walkSpeed, Math.sin(angle) * this.walkSpeed);
          this.sprite.play('orc_run_anim', true); // Usa animação de corrida lenta
          this.sprite.setFlipX(body.velocity.x < 0);
        }
      } else {
        body.setVelocity(0, 0);
        this.sprite.play('orc_idle_anim', true);
      }
    } else if (this.state === 'chasing' && this.targetPos) {
      const angle = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, this.targetPos.x, this.targetPos.y);
      body.setVelocity(Math.cos(angle) * this.runSpeed, Math.sin(angle) * this.runSpeed);
      this.sprite.play('orc_run_anim', true);
      this.sprite.setFlipX(body.velocity.x < 0);
    }
  }

  private attackPlayer() {
    this.setState('attacking');
    this.attackCooldown = 1500;
    gameStore.receiveDamage(25); // Orc dá mais dano
    
    // Feedback visual de ataque (Flash vermelho no jogador)
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
    this.sprite.play('orc_death_anim', true);
    this.sprite.setDepth(this.sprite.y - 10);
    this.hpBar.update();
  }

  destroy() {
    this.hpBar.destroy();
    this.sprite.destroy();
  }

  private setState(next: OrcVisualState) {
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
}
