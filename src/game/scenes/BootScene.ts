import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Player Animations (Pixel Crawler)
    const p = 'assets/player/';
    this.load.spritesheet('p_idle_down', p + 'Idle_Down-Sheet.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('p_idle_side', p + 'Idle_Side-Sheet.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('p_idle_up', p + 'Idle_Up-Sheet.png', { frameWidth: 64, frameHeight: 64 });
    
    this.load.spritesheet('p_run_down', p + 'Run_Down-Sheet.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('p_run_side', p + 'Run_Side-Sheet.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('p_run_up', p + 'Run_Up-Sheet.png', { frameWidth: 64, frameHeight: 64 });

    this.load.spritesheet('p_attack_down', p + 'Slice_Down-Sheet.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('p_attack_side', p + 'Slice_Side-Sheet.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('p_attack_up', p + 'Slice_Up-Sheet.png', { frameWidth: 64, frameHeight: 64 });

    // Environment Assets
    const e = 'assets/env/';
    this.load.spritesheet('floor_tiles', e + 'Floors_Tiles.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('water_tiles', e + 'Water_tiles.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('rocks_prof', e + 'rocks.png', { frameWidth: 16, frameHeight: 16 });
    this.load.image('vegetation', e + 'vegetation.png');

    // New Custom Assets
    this.load.image('chao_cascalho', e + 'floors/chao_cascalho.png');
    this.load.image('rock_small', e + 'common-rock/pedra_pequena.png');
    this.load.image('rock_medium', e + 'common-rock/pedra_media.png');
    this.load.image('rock_large', e + 'common-rock/pedra_grande.png');
    this.load.image('tree_common', e + 'trees/common-trees/arvore_comum.png');
    this.load.image('tree_dry', e + 'trees/common-trees/arvore_seca.png');
    this.load.image('bush_41', e + 'bush/common-bush/arbusto_verde_41.png');
    this.load.image('bush_42', e + 'bush/common-bush/arbusto_verde_42.png');
    this.load.image('bush_45', e + 'bush/common-bush/arbusto_verde_45.png');
    this.load.image('bush_46', e + 'bush/common-bush/arbusto_verde_46.png');

    // Chicken Spritesheets (32x32 frames)
    this.load.spritesheet('chicken_white', e + 'chicken/Chicken_Sprite_Sheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('chicken_black', e + 'chicken/Chicken_Sprite_Sheet_Black.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('chicken_brown', e + 'chicken/Chicken_Sprite_Sheet_Light_Brown.png', { frameWidth: 32, frameHeight: 32 });
    
    // Crab Spritesheet (32x32 frames)
    this.load.spritesheet('crab_prof', e + 'crab/Crab Sprite Sheet.png', { frameWidth: 32, frameHeight: 32 });

    // Bonfire Assets
    this.load.spritesheet('bonfire_base', e + 'bonfire/Bonfire_02-Sheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('fire_anim', e + 'bonfire/Fire_01-Sheet.png', { frameWidth: 32, frameHeight: 48 });

    // Bear spritesheet (64x64 frames)
    this.load.spritesheet('bear_sheet', 'assets/bear_sheet.png', { frameWidth: 64, frameHeight: 64 });

    // Rabbit Spritesheet (48x48 frames)
    this.load.spritesheet('rabbit_prof', e + 'rabbit/rabbit_sheet.png', { frameWidth: 48, frameHeight: 48 });

    // RESTORING WORKBENCH ASSETS
    const b = 'assets/env/bancada/';
    this.load.image('workbench_lv1', b + 'rocha_01.png');
    this.load.image('workbench_lv2', b + 'rocha_02.png');
    this.load.image('workbench_lv3', b + 'rocha_03.png');

    // Sound Effects
    const s = 'assets/sounds/';
    this.load.audio('sfx_swing_01', s + 'rpg-sfx/blade_01.ogg');
    this.load.audio('sfx_swing_02', s + 'rpg-sfx/blade_02.ogg');
    this.load.audio('sfx_swing_03', s + 'rpg-sfx/blade_03.ogg');
    this.load.audio('sfx_bow_01', s + 'rpg-sfx/spell_01.ogg');
    this.load.audio('sfx_bow_02', s + 'rpg-sfx/spell_02.ogg');
    this.load.audio('sfx_npc_hurt_01', s + 'rpg-sfx/creature_hurt_01.ogg');
    this.load.audio('sfx_npc_hurt_02', s + 'rpg-sfx/creature_hurt_02.ogg');
    this.load.audio('sfx_npc_die', s + 'rpg-sfx/creature_die_01.ogg');
    this.load.audio('sfx_roar_01', s + 'rpg-sfx/creature_roar_01.ogg');
    this.load.audio('sfx_roar_02', s + 'rpg-sfx/creature_roar_02.ogg');
    this.load.audio('sfx_roar_03', s + 'rpg-sfx/creature_roar_03.ogg');
    this.load.audio('sfx_wood_hit_01', s + 'rpg-sfx/wood_01.ogg');
    this.load.audio('sfx_wood_hit_02', s + 'rpg-sfx/wood_02.ogg');
    this.load.audio('sfx_wood_hit_03', s + 'rpg-sfx/wood_03.ogg');
    this.load.audio('sfx_stone_hit_01', s + 'rpg-sfx/stones_01.ogg');
    this.load.audio('sfx_stone_hit_02', s + 'rpg-sfx/stones_02.ogg');
    this.load.audio('sfx_stone_hit_03', s + 'rpg-sfx/stones_03.ogg');
    this.load.audio('sfx_pickup_01', s + 'rpg-sfx/item_coins_01.ogg');
    this.load.audio('sfx_pickup_02', s + 'rpg-sfx/item_coins_02.ogg');
    this.load.audio('sfx_pickup_03', s + 'rpg-sfx/item_coins_03.ogg');
    this.load.audio('sfx_craft_01', s + 'rpg-sfx/metal_01.ogg');
    this.load.audio('sfx_craft_02', s + 'rpg-sfx/metal_02.ogg');
    this.load.audio('sfx_craft_03', s + 'rpg-sfx/item_misc_01.ogg');
    this.load.audio('sfx_inv_open', s + 'rpg-sfx/book_01.ogg');
    this.load.audio('sfx_inv_close', s + 'rpg-sfx/book_02.ogg');
    this.load.audio('sfx_equip', s + 'rpg-sfx/lock_01.ogg');
    this.load.audio('sfx_player_hurt', s + 'rpg-sfx/creature_hurt_01.ogg');
    this.load.audio('sfx_footstep', s + 'impact/Audio/footstep_grass_000.ogg');
    this.load.audio('sfx_footstep_01', s + 'impact/Audio/footstep_grass_001.ogg');
    this.load.audio('sfx_footstep_02', s + 'impact/Audio/footstep_grass_002.ogg');
    this.load.audio('sfx_footstep_03', s + 'impact/Audio/footstep_grass_003.ogg');
    this.load.audio('sfx_footstep_04', s + 'impact/Audio/footstep_grass_004.ogg');
    this.load.audio('sfx_campfire', s + 'rpg-sfx/spell_fire_01.ogg');
    this.load.audio('sfx_thunder_01', s + 'impact/Audio/impactMetal_heavy_000.ogg');
    this.load.audio('sfx_thunder_02', s + 'impact/Audio/impactMetal_heavy_001.ogg');
    this.load.audio('sfx_thunder_03', s + 'impact/Audio/impactMetal_heavy_002.ogg');
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

    // Rain drop
    g.clear();
    g.fillStyle(0xaaccff, 0.6);
    g.fillRect(0, 0, 2, 6);
    g.generateTexture('p_rain', 2, 6);

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

    // Attack frame (Clean arm, no fixed weapon)
    g.clear();
    const bx = 4;
    g.fillStyle(0x4488cc); g.fillRect(bx, 12, 16, 14); // Body
    g.fillStyle(0xffcc99); g.fillRect(bx + 2, 2, 12, 12); // Head
    g.fillStyle(0x333333); g.fillRect(bx + 5, 6, 3, 3); g.fillRect(bx + 11, 6, 3, 3); // Eyes
    g.fillStyle(0x555555); g.fillRect(bx + 2, 26, 5, 6); g.fillRect(bx + 9, 26, 5, 6); // Legs
    // BARE ARM
    g.fillStyle(0xffcc99);
    g.fillRect(bx + 14, 14, 10, 5); 
    g.lineStyle(1, 0x000000, 0.4);
    g.strokeRect(bx + 14, 14, 10, 5);
    g.generateTexture('player_attack', 32, 32);

    // --- Miniature Tools ---
    // Axe
    g.clear();
    g.fillStyle(0x8B4513); g.fillRect(4, 8, 8, 2); // Handle
    g.fillStyle(0xaaaaaa); g.fillRect(10, 4, 4, 10); // Blade head
    g.generateTexture('min_axe', 16, 16);

    // Pickaxe
    g.clear();
    g.fillStyle(0x8B4513); g.fillRect(4, 8, 8, 2); // Handle
    g.fillStyle(0xaaaaaa); g.fillTriangle(10, 2, 10, 14, 15, 8); // Double head spike
    g.generateTexture('min_pickaxe', 16, 16);

    // Sword
    g.clear();
    g.fillStyle(0x8B4513); g.fillRect(2, 7, 4, 2); // Hilt
    g.fillStyle(0xaaaaaa); g.fillRect(6, 6, 10, 4); // Blade
    g.generateTexture('min_sword', 16, 16);

    // Knife
    g.clear();
    g.fillStyle(0x8B4513); g.fillRect(4, 7, 3, 2); // Hilt
    g.fillStyle(0xaaaaaa); g.fillRect(7, 7, 6, 2); // Small blade
    g.generateTexture('min_knife', 16, 16);

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

    // Bear spritesheet loaded in preload()

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

    // Ore Veins (via canvas)
    const oreColors = {
      iron: { base: 0x6b5b4f, vein: 0x8b7355, sparkle: 0xb8a08a },
      bronze: { base: 0x8b6b4a, vein: 0xa67c52, sparkle: 0xcd853f },
      gold: { base: 0x9a8b5a, vein: 0xc4a044, sparkle: 0xffd700 },
    };

    function drawOreVein(g: Phaser.GameObjects.Graphics, color: typeof oreColors.iron, name: string) {
      g.clear();
      g.fillStyle(color.base);
      g.fillRoundedRect(4, 4, 24, 24, 4);
      g.fillStyle(color.vein);
      for (let i = 0; i < 5; i++) {
        const x = Phaser.Math.Between(6, 22);
        const y = Phaser.Math.Between(6, 22);
        const size = Phaser.Math.Between(3, 6);
        g.fillCircle(x, y, size);
      }
      g.fillStyle(color.sparkle);
      for (let i = 0; i < 3; i++) {
        const x = Phaser.Math.Between(8, 20);
        const y = Phaser.Math.Between(8, 20);
        g.fillRect(x, y, 2, 2);
      }
      g.generateTexture(name, 32, 32);
    }

    drawOreVein(g, oreColors.iron, 'iron_ore_vein');
    drawOreVein(g, oreColors.bronze, 'bronze_ore_vein');
    drawOreVein(g, oreColors.gold, 'gold_ore_vein');

    g.destroy();
  }
}
