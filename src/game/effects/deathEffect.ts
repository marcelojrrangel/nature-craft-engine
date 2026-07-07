import Phaser from 'phaser';

interface DeathStainConfig {
  color: number;
  circleCount?: number;
  offsetXRange?: number;
  offsetYRange?: number;
  radiusMin?: number;
  radiusMax?: number;
  alphaMin?: number;
  alphaMax?: number;
  spriteFadeDuration?: number;
  stainDelay?: number;
  stainFadeDuration?: number;
  baseColor?: number;
  baseRadius?: number;
  baseAlpha?: number;
}

export function createDeathStain(
  scene: Phaser.Scene,
  sprite: Phaser.Physics.Arcade.Sprite,
  config: DeathStainConfig
) {
  const {
    color,
    circleCount = 5,
    offsetXRange = 10,
    offsetYRange = 5,
    radiusMin = 5,
    radiusMax = 12,
    alphaMin = 0.3,
    alphaMax = 0.6,
    spriteFadeDuration = 400,
    stainDelay = 5000,
    stainFadeDuration = 2000,
    baseColor,
    baseRadius,
    baseAlpha
  } = config;

  const g = scene.add.graphics();
  g.setDepth(sprite.y - 5);

  for (let i = 0; i < circleCount; i++) {
    const offX = Phaser.Math.Between(-offsetXRange, offsetXRange);
    const offY = Phaser.Math.Between(-offsetYRange, offsetYRange);
    const radius = Phaser.Math.Between(radiusMin, radiusMax);
    const alpha = Phaser.Math.FloatBetween(alphaMin, alphaMax);
    g.fillStyle(color, alpha);
    g.fillCircle(sprite.x + offX, sprite.y + 10 + offY, radius);
  }

  if (baseColor !== undefined && baseRadius !== undefined) {
    const ba = baseAlpha ?? 0.15;
    g.fillStyle(baseColor, ba);
    g.fillCircle(sprite.x, sprite.y + 8, baseRadius);
  }

  scene.tweens.add({
    targets: sprite,
    alpha: 0,
    duration: spriteFadeDuration,
    onComplete: () => {
      sprite.setVisible(false);
      if (scene) {
        scene.tweens.add({
          targets: g,
          alpha: 0,
          delay: stainDelay,
          duration: stainFadeDuration,
          onComplete: () => g.destroy()
        });
      }
    }
  });
}
