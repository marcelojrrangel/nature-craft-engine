import Phaser from 'phaser';
import { HealthComponent } from '../components/HealthComponent';
import { HealthBarRenderer } from '../components/HealthBarRenderer';
import { createDeathStain } from '../effects/deathEffect';

export type ChickenVisualState = 'idle' | 'walking' | 'eating' | 'dead';

interface ChickenNPCConfig {
  id: string;
  x: number;
  y: number;
  textureKey: string; // Nova propriedade para suportar cores diferentes
  wanderRadius?: number;
}

export class ChickenNPC {
  readonly id: string;
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly homeX: number;
  readonly homeY: number;
  private textureKey: string;
  
  public health: HealthComponent;
  private hpBar: HealthBarRenderer;

  private state: ChickenVisualState = 'idle';
  private stateTimer = 0;
  private targetPos: { x: number; y: number } | null = null;
  private readonly wanderRadius: number;
  private readonly moveSpeed = 35; // Leve ajuste na velocidade para combinar com a animação

  constructor(scene: Phaser.Scene, config: ChickenNPCConfig, initialHp: number = 5) {
    this.id = config.id;
    this.homeX = config.x;
    this.homeY = config.y;
    this.textureKey = config.textureKey;
    this.wanderRadius = config.wanderRadius ?? 96;

    const maxHp = 5;
    this.health = new HealthComponent(initialHp > 0 ? initialHp : maxHp, maxHp);

    // Criar o sprite com o asset profissional
    this.sprite = scene.physics.add.sprite(config.x, config.y, this.textureKey, 0);
    this.sprite.setDepth(config.y);
    
    // Ajustar corpo físico para o tamanho 32x32
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(16, 14).setOffset(8, 14); // Focado nos pés para profundidade correta

    this.createAnimations(scene);
    this.hpBar = new HealthBarRenderer(scene, this.health, this.sprite, 14);
    this.health.onDeath(() => this.die());

    this.setState('idle');
  }

  private createAnimations(scene: Phaser.Scene) {
    const k = this.textureKey;
    // Criar animações globais uma única vez por cor de galinha
    const anims = [
      { key: `${k}_idle`, start: 0, end: 1, repeat: -1, rate: 4 }, // Piscar/Respirar
      { key: `${k}_walk`, start: 4, end: 7, repeat: -1, rate: 8 }, // Andar
      { key: `${k}_eat`, start: 8, end: 11, repeat: -1, rate: 6 },  // Bicar chão
      { key: `${k}_dead`, start: 12, end: 15, repeat: 0, rate: 8 }  // Morrer
    ];

    anims.forEach(a => {
      if (!scene.anims.exists(a.key)) {
        scene.anims.create({
          key: a.key,
          frames: scene.anims.generateFrameNumbers(k, { start: a.start, end: a.end }),
          frameRate: a.rate,
          repeat: a.repeat
        });
      }
    });
  }

  update(delta: number) {
    if (!this.health.isAlive) {
      this.hpBar.update();
      return;
    }

    this.updateAI(delta);
    this.sprite.setDepth(this.sprite.y);
    this.hpBar.update();
  }

  private updateAI(delta: number) {
    this.stateTimer -= delta;
    
    if (this.stateTimer <= 0) {
      // Alternar entre Idle, Comer e Caminhar
      const rand = Math.random();
      if (rand < 0.4) this.setState('idle');
      else if (rand < 0.7) this.setState('eating');
      else this.setState('walking');
    }

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (!body) return;

    if (this.state === 'walking') {
      if (!this.targetPos || Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, this.targetPos.x, this.targetPos.y) < 10) {
        this.targetPos = this.pickWanderTarget();
      }
      
      const dx = this.targetPos.x - this.sprite.x;
      const dy = this.targetPos.y - this.sprite.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      
      body.setVelocity((dx / len) * this.moveSpeed, (dy / len) * this.moveSpeed);
      
      // Orientação visual
      if (dx < -1) this.sprite.setFlipX(true);
      if (dx > 1) this.sprite.setFlipX(false);
    } else {
      body.setVelocity(0, 0);
      this.targetPos = null;
    }
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

    const colors: Record<string, number> = {
      'chicken_white': 0xffffff,
      'chicken_black': 0x222222,
      'chicken_brown': 0x8B4513
    };

    createDeathStain(this.sprite.scene, this.sprite, {
      color: colors[this.textureKey] || 0xffffff,
      circleCount: 6,
      offsetXRange: 8,
      offsetYRange: 4,
      radiusMin: 4,
      radiusMax: 10,
      alphaMin: 0.2,
      alphaMax: 0.5,
      baseColor: 0x000000,
      baseRadius: 12,
      baseAlpha: 0.15
    });

    this.hpBar.update();
  }

  destroy() {
    this.hpBar.destroy();
    this.sprite.destroy();
  }

  private setState(nextState: ChickenVisualState) {
    this.state = nextState;
    const k = this.textureKey;

    switch (nextState) {
      case 'idle':
        this.sprite.play(`${k}_idle`, true);
        this.stateTimer = Phaser.Math.Between(2000, 4000);
        break;
      case 'walking':
        this.sprite.play(`${k}_walk`, true);
        this.stateTimer = Phaser.Math.Between(3000, 6000);
        break;
      case 'eating':
        this.sprite.play(`${k}_eat`, true);
        this.stateTimer = Phaser.Math.Between(1500, 3000);
        break;
      case 'dead':
        this.sprite.play(`${k}_dead`, true);
        break;
    }
  }

  private pickWanderTarget() {
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const radius = Phaser.Math.FloatBetween(30, this.wanderRadius);
    return { x: this.homeX + Math.cos(angle) * radius, y: this.homeY + Math.sin(angle) * radius };
  }
}
