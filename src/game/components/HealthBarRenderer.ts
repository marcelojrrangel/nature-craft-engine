import Phaser from 'phaser';
import { IHealth } from '../core/interfaces';

export class HealthBarRenderer {
  private scene: Phaser.Scene;
  private health: IHealth;
  private graphics: Phaser.GameObjects.Graphics;
  private target: { x: number, y: number };
  private offset: { x: number, y: number };
  private alwaysVisible: boolean;

  constructor(scene: Phaser.Scene, health: IHealth, target: { x: number, y: number }, offsetY: number = 20, alwaysVisible: boolean = false) {
    this.scene = scene;
    this.health = health;
    this.target = target;
    this.offset = { x: 0, y: -offsetY };
    this.alwaysVisible = alwaysVisible;
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(2000);
  }

  update() {
    this.graphics.clear();
    
    // Critically: Do not draw if dead
    if (!this.health.isAlive || this.health.current <= 0) return;
    
    // Hide if full and not marked as always visible
    if (!this.alwaysVisible && this.health.current >= this.health.max) return;

    const width = 24;
    const height = 4;
    const x = this.target.x - width / 2;
    const y = this.target.y + this.offset.y;

    // Background
    this.graphics.fillStyle(0x000000, 0.7);
    this.graphics.fillRect(x, y, width, height);

    // Fill
    const percent = Phaser.Math.Clamp(this.health.current / this.health.max, 0, 1);
    const color = percent < 0.3 ? 0xe74c3c : percent < 0.6 ? 0xf1c40f : 0x2ecc71;

    this.graphics.fillStyle(color, 1);
    this.graphics.fillRect(x, y, width * percent, height);
  }

  destroy() {
    if (this.graphics) {
      this.graphics.clear();
      this.graphics.destroy();
    }
  }
}
