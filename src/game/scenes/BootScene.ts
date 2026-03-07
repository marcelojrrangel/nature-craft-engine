import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    this.generateTextures();
    this.scene.start('MainScene');
  }

  private generateTextures() {
    const g = this.make.graphics({ x: 0, y: 0 });

    // Grass tiles (3 variations)
    for (let i = 0; i < 3; i++) {
      g.clear();
      g.fillStyle(0x4a7c3f);
      g.fillRect(0, 0, 32, 32);
      // Random darker patches
      g.fillStyle(0x3d6b34);
      for (let j = 0; j < 5; j++) {
        g.fillRect(Math.random() * 28, Math.random() * 28, 4, 4);
      }
      g.generateTexture(`grass_${i}`, 32, 32);
    }

    // Sand
    g.clear();
    g.fillStyle(0xd4b878);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(0xc4a868);
    g.fillRect(4, 8, 3, 3);
    g.fillRect(20, 16, 3, 3);
    g.generateTexture('sand', 32, 32);

    // Water
    g.clear();
    g.fillStyle(0x3388cc);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(0x4499dd);
    g.fillRect(8, 4, 12, 2);
    g.fillRect(4, 18, 14, 2);
    g.generateTexture('water', 32, 32);

    // Tree trunk
    g.clear();
    g.fillStyle(0x8B5E3C);
    g.fillRect(12, 16, 8, 16);
    // Canopy
    g.fillStyle(0x2d8a4e);
    g.fillCircle(16, 12, 14);
    g.fillStyle(0x35a058);
    g.fillCircle(12, 8, 8);
    g.fillCircle(20, 10, 7);
    g.generateTexture('tree', 32, 32);

    // Dead tree (dry branch source)
    g.clear();
    g.fillStyle(0x5c4033);
    g.fillRect(12, 20, 8, 12);
    g.fillStyle(0x4a3428);
    g.fillRect(10, 18, 3, 4);
    g.fillRect(19, 16, 3, 5);
    g.fillRect(14, 12, 2, 4);
    g.fillStyle(0x6b4c3a);
    g.fillRect(11, 14, 2, 3);
    g.generateTexture('dead_tree', 32, 32);

    // Rock
    g.clear();
    g.fillStyle(0x888888);
    g.fillRoundedRect(4, 8, 24, 20, 6);
    g.fillStyle(0x9a9a9a);
    g.fillRoundedRect(8, 10, 12, 8, 4);
    g.generateTexture('rock', 32, 32);

    // Small Rock (loose on ground)
    g.clear();
    g.fillStyle(0x777777);
    g.fillCircle(16, 20, 6);
    g.fillStyle(0x999999);
    g.fillCircle(14, 18, 3);
    g.generateTexture('small_rock', 32, 32);

    // Bush
    g.clear();
    g.fillStyle(0x3a8a3a);
    g.fillCircle(16, 18, 12);
    g.fillStyle(0x4aa04a);
    g.fillCircle(12, 14, 7);
    g.fillCircle(20, 16, 6);
    g.generateTexture('bush', 32, 32);

    // Workbench
    g.clear();
    g.fillStyle(0x8B5E3C);
    g.fillRect(2, 16, 28, 14);
    g.fillStyle(0xa0714a);
    g.fillRect(4, 12, 24, 6);
    g.fillStyle(0x666666);
    g.fillRect(20, 14, 6, 4);
    g.generateTexture('workbench', 32, 32);

    // Campfire Base
    g.clear();
    g.fillStyle(0x555555); // Stones
    g.fillCircle(16, 24, 8);
    g.fillStyle(0x8B5E3C); // Logs
    g.fillRect(12, 18, 8, 4);
    g.fillRect(14, 14, 4, 8);
    g.generateTexture('campfire_base', 32, 32);

    // Fire Frames (Animação)
    const fireColors = [0xff4400, 0xffa500, 0xffff00];
    for (let i = 0; i < 3; i++) {
      g.clear();
      g.fillStyle(fireColors[i]);
      g.fillTriangle(16, 4 + i, 10, 20, 22, 20);
      g.fillStyle(fireColors[(i + 1) % 3]);
      g.fillTriangle(16, 10 + i, 12, 20, 20, 20);
      g.generateTexture(`fire_${i}`, 32, 32);
    }

    // --- Particle Textures ---
    
    // Wood chip
    g.clear();
    g.fillStyle(0x8B5E3C);
    g.fillRect(0, 0, 4, 4);
    g.generateTexture('p_wood', 4, 4);

    // Stone spark
    g.clear();
    g.fillStyle(0xaaaaaa);
    g.fillRect(0, 0, 3, 3);
    g.generateTexture('p_stone', 3, 3);

    // Feather / White particle
    g.clear();
    g.fillStyle(0xffffff);
    g.fillCircle(4, 4, 4);
    g.generateTexture('p_white', 8, 8);

    // Dust / Brown particle
    g.clear();
    g.fillStyle(0x8B5E3C, 0.5);
    g.fillCircle(4, 4, 4);
    g.generateTexture('p_dust', 8, 8);

    // Light Mask Texture (Radial Gradient for torch)
    g.clear();
    const canvas = this.textures.createCanvas('light_mask', 256, 256);
    if (canvas) {
      const ctx = canvas.getContext();
      const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 256, 256);
      canvas.update();
    }

    // Player body (idle)
    g.clear();
    // Body
    g.fillStyle(0x4488cc);
    g.fillRect(8, 12, 16, 14);
    // Head
    g.fillStyle(0xffcc99);
    g.fillRect(10, 2, 12, 12);
    // Eyes
    g.fillStyle(0x333333);
    g.fillRect(13, 6, 3, 3);
    g.fillRect(19, 6, 3, 3);
    // Legs
    g.fillStyle(0x555555);
    g.fillRect(10, 26, 5, 6);
    g.fillRect(17, 26, 5, 6);
    g.generateTexture('player_idle', 32, 32);

    // Player run frames
    for (let f = 0; f < 4; f++) {
      g.clear();
      g.fillStyle(0x4488cc);
      g.fillRect(8, 12, 16, 14);
      g.fillStyle(0xffcc99);
      g.fillRect(10, 2, 12, 12);
      g.fillStyle(0x333333);
      g.fillRect(13, 6, 3, 3);
      g.fillRect(19, 6, 3, 3);
      g.fillStyle(0x555555);
      const legOffset = Math.sin(f * Math.PI / 2) * 3;
      g.fillRect(10, 26 + legOffset, 5, 6);
      g.fillRect(17, 26 - legOffset, 5, 6);
      g.generateTexture(`player_run_${f}`, 32, 32);
    }

    // Attack frame (Improved - With Weapon)
    g.clear();
    const bx = 4;
    g.fillStyle(0x4488cc); g.fillRect(bx, 12, 16, 14); // Body
    g.fillStyle(0xffcc99); g.fillRect(bx + 2, 2, 12, 12); // Head
    g.fillStyle(0x333333); g.fillRect(bx + 5, 6, 3, 3); g.fillRect(bx + 11, 6, 3, 3); // Eyes
    g.fillStyle(0x555555); g.fillRect(bx + 2, 26, 5, 6); g.fillRect(bx + 9, 26, 5, 6); // Legs
    // DRAMATIC ARM
    g.fillStyle(0xffcc99);
    g.fillRect(bx + 14, 14, 10, 5); 
    // WEAPON BLADE
    g.fillStyle(0xdddddd);
    g.fillRect(bx + 22, 8, 4, 16); // Vertical blade
    g.lineStyle(1, 0x000000, 0.5);
    g.strokeRect(bx + 14, 14, 10, 5);
    g.strokeRect(bx + 22, 8, 4, 16);
    g.generateTexture('player_attack', 32, 32);

    // Slash Effect (Visual feedback for hit)
    g.clear();
    g.lineStyle(2, 0xffffff, 0.8);
    g.beginPath();
    g.arc(16, 16, 14, -Math.PI/4, Math.PI/4, false);
    g.strokePath();
    g.generateTexture('slash_effect', 32, 32);

    // Item drop effect
    g.clear();
    g.fillStyle(0xffff00);
    g.fillCircle(8, 8, 6);
    g.generateTexture('item_drop', 16, 16);

    // Chicken idle
    g.clear();
    g.fillStyle(0xffffff);
    g.fillCircle(15, 18, 9);
    g.fillCircle(22, 14, 6);
    g.fillStyle(0xffcc33);
    g.fillTriangle(27, 14, 31, 12, 31, 16);
    g.fillStyle(0xe84a5f);
    g.fillCircle(23, 8, 3);
    g.fillStyle(0x333333);
    g.fillCircle(24, 13, 1.5);
    g.fillStyle(0xf0b36d);
    g.fillRect(12, 24, 2, 6);
    g.fillRect(17, 24, 2, 6);
    g.generateTexture('chicken_idle', 32, 32);

    // Chicken eating frame 1
    g.clear();
    g.fillStyle(0xffffff);
    g.fillCircle(15, 20, 9);
    g.fillCircle(22, 18, 6);
    g.fillStyle(0xffcc33);
    g.fillTriangle(27, 19, 31, 17, 31, 21);
    g.fillStyle(0xe84a5f);
    g.fillCircle(23, 12, 3);
    g.fillStyle(0x333333);
    g.fillCircle(24, 17, 1.5);
    g.fillStyle(0xf0b36d);
    g.fillRect(12, 25, 2, 5);
    g.fillRect(17, 25, 2, 5);
    g.generateTexture('chicken_eat_0', 32, 32);

    // Chicken eating frame 2
    g.clear();
    g.fillStyle(0xffffff);
    g.fillCircle(15, 19, 9);
    g.fillCircle(22, 17, 6);
    g.fillStyle(0xffcc33);
    g.fillTriangle(27, 18, 31, 16, 31, 20);
    g.fillStyle(0xe84a5f);
    g.fillCircle(23, 11, 3);
    g.fillStyle(0x333333);
    g.fillCircle(24, 16, 1.5);
    g.fillStyle(0xf0b36d);
    g.fillRect(12, 25, 2, 5);
    g.fillRect(17, 25, 2, 5);
    g.generateTexture('chicken_eat_1', 32, 32);

    // Chicken dead/collected
    g.clear();
    g.fillStyle(0xd9d9d9);
    g.fillEllipse(16, 22, 18, 12);
    g.fillStyle(0xb0b0b0);
    g.fillEllipse(23, 20, 8, 6);
    g.fillStyle(0xffcc33);
    g.fillTriangle(27, 20, 31, 18, 31, 22);
    g.generateTexture('chicken_dead', 32, 32);

    // Crab idle
    g.clear();
    g.fillStyle(0xcd4f5f);
    g.fillEllipse(16, 18, 20, 12);
    g.fillStyle(0xb83f4f);
    g.fillRect(8, 16, 4, 3);
    g.fillRect(20, 16, 4, 3);
    g.fillStyle(0x1a1a1a);
    g.fillCircle(13, 14, 1.2);
    g.fillCircle(19, 14, 1.2);
    g.fillStyle(0xd96b79);
    g.fillRect(6, 20, 3, 2);
    g.fillRect(10, 22, 3, 2);
    g.fillRect(19, 22, 3, 2);
    g.fillRect(23, 20, 3, 2);
    g.generateTexture('crab_idle', 32, 32);

    // Crab scuttle frame 1
    g.clear();
    g.fillStyle(0xcd4f5f);
    g.fillEllipse(16, 18, 20, 12);
    g.fillStyle(0xb83f4f);
    g.fillRect(7, 15, 4, 3);
    g.fillRect(21, 17, 4, 3);
    g.fillStyle(0x1a1a1a);
    g.fillCircle(13, 14, 1.2);
    g.fillCircle(19, 14, 1.2);
    g.fillStyle(0xd96b79);
    g.fillRect(5, 20, 3, 2);
    g.fillRect(9, 22, 3, 2);
    g.fillRect(20, 22, 3, 2);
    g.fillRect(24, 20, 3, 2);
    g.generateTexture('crab_scuttle_0', 32, 32);

    // Crab scuttle frame 2
    g.clear();
    g.fillStyle(0xcd4f5f);
    g.fillEllipse(16, 18, 20, 12);
    g.fillStyle(0xb83f4f);
    g.fillRect(7, 17, 4, 3);
    g.fillRect(21, 15, 4, 3);
    g.fillStyle(0x1a1a1a);
    g.fillCircle(13, 14, 1.2);
    g.fillCircle(19, 14, 1.2);
    g.fillStyle(0xd96b79);
    g.fillRect(6, 21, 3, 2);
    g.fillRect(10, 23, 3, 2);
    g.fillRect(19, 23, 3, 2);
    g.fillRect(23, 21, 3, 2);
    g.generateTexture('crab_scuttle_1', 32, 32);

    // Crab dead/collected
    g.clear();
    g.fillStyle(0x9a9a9a);
    g.fillEllipse(16, 20, 18, 10);
    g.fillStyle(0x7f7f7f);
    g.fillRect(8, 20, 3, 2);
    g.fillRect(21, 20, 3, 2);
    g.generateTexture('crab_dead', 32, 32);

    // Bear idle
    g.clear();
    g.fillStyle(0x5c4033); // Brown
    g.fillEllipse(16, 18, 24, 18); // Body
    g.fillCircle(16, 10, 10); // Head
    g.fillStyle(0x4a3428); // Darker brown
    g.fillCircle(8, 6, 4); // Ear L
    g.fillCircle(24, 6, 4); // Ear R
    g.fillStyle(0x1a1a1a);
    g.fillRect(13, 8, 2, 2); // Eye L
    g.fillRect(17, 8, 2, 2); // Eye R
    g.generateTexture('bear_idle', 32, 32);

    // Bear attack frame
    g.clear();
    g.fillStyle(0x5c4033);
    g.fillEllipse(16, 18, 24, 18);
    g.fillCircle(16, 10, 10);
    g.fillStyle(0x4a3428);
    g.fillCircle(8, 6, 4);
    g.fillCircle(24, 6, 4);
    g.fillStyle(0xff4444); // Angry eyes
    g.fillRect(12, 8, 3, 2);
    g.fillRect(17, 8, 3, 2);
    g.fillStyle(0x1a1a1a);
    g.fillRect(14, 14, 4, 2); // Mouth
    g.generateTexture('bear_attack', 32, 32);

    // Bear dead
    g.clear();
    g.fillStyle(0x3d2b22);
    g.fillEllipse(16, 22, 26, 14);
    g.generateTexture('bear_dead', 32, 32);

    // Rabbit idle
    g.clear();
    g.fillStyle(0xeeeeee); // Light grey/white
    g.fillEllipse(16, 20, 12, 8); // Body
    g.fillCircle(22, 14, 6); // Head
    g.fillRect(18, 4, 3, 10); // Ear 1
    g.fillRect(23, 4, 3, 10); // Ear 2
    g.fillStyle(0xff9999); // Nose/Inside ear
    g.fillRect(20, 5, 1, 4);
    g.fillRect(25, 5, 1, 4);
    g.generateTexture('rabbit_idle', 32, 32);

    // Rabbit jump frame
    g.clear();
    g.fillStyle(0xeeeeee);
    g.fillEllipse(16, 16, 14, 10);
    g.fillCircle(24, 10, 6);
    g.fillRect(20, 0, 3, 10);
    g.fillRect(25, 0, 3, 10);
    g.generateTexture('rabbit_jump', 32, 32);

    // Rabbit dead
    g.clear();
    g.fillStyle(0xcccccc);
    g.fillEllipse(16, 22, 14, 8);
    g.generateTexture('rabbit_dead', 32, 32);

    // Arrow projectile
    g.clear();

    // Shaft (needle thin)
    g.fillStyle(0x8B5E3C);
    g.fillRect(8, 15.5, 16, 1);
    // Head (needle sharp)
    g.fillStyle(0xdddddd);
    g.fillTriangle(24, 15, 24, 17, 28, 16);
    // Fletching (minimalist)
    g.fillStyle(0xffffff);
    g.fillRect(6, 15, 2, 2);
    g.generateTexture('arrow_projectile', 32, 32);

    g.destroy();
  }
}
