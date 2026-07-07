import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createDeathStain } from '../game/effects/deathEffect';

type MockFn = ReturnType<typeof vi.fn>;

vi.mock('phaser', () => {
  return {
    default: {
      Scene: vi.fn(),
      Math: {
        Between: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min,
        FloatBetween: (min: number, max: number) => Math.random() * (max - min) + min,
      },
    },
  };
});

interface MockScene {
  add: { graphics: MockFn & { mockReturnThis?: any } };
  tweens: { add: MockFn };
}

function createMockScene(): { scene: MockScene; graphics: any } {
  const graphics = {
    setDepth: vi.fn(),
    fillStyle: vi.fn(),
    fillCircle: vi.fn(),
    destroy: vi.fn(),
  };
  const scene: MockScene = {
    add: { graphics: vi.fn(() => graphics) },
    tweens: { add: vi.fn() },
  };
  return { scene, graphics };
}

function createMockSprite(graphicsContainer: any) {
  return {
    x: 200,
    y: 300,
    scene: graphicsContainer.scene,
    setVisible: vi.fn(),
  } as any;
}

describe('createDeathStain', () => {
  let graphicsContainer: ReturnType<typeof createMockScene>;
  let scene: MockScene;
  let graphics: any;
  let sprite: any;

  beforeEach(() => {
    graphicsContainer = createMockScene();
    scene = graphicsContainer.scene;
    graphics = graphicsContainer.graphics;
    sprite = createMockSprite(graphicsContainer);
  });

  it('should create graphics at depth y-5', () => {
    createDeathStain(scene as any, sprite, { color: 0xff0000 });
    expect(scene.add.graphics).toHaveBeenCalledTimes(1);
    expect(graphics.setDepth).toHaveBeenCalledWith(295);
  });

  it('should draw circles with given color', () => {
    createDeathStain(scene as any, sprite, { color: 0x00ff00 });
    expect(graphics.fillStyle).toHaveBeenCalledWith(0x00ff00, expect.any(Number));
    expect(graphics.fillCircle).toHaveBeenCalled();
  });

  it('should draw default 5 circles', () => {
    createDeathStain(scene as any, sprite, { color: 0x0000ff });
    expect(graphics.fillStyle).toHaveBeenCalledTimes(5);
    expect(graphics.fillCircle).toHaveBeenCalledTimes(5);
  });

  it('should draw custom circle count', () => {
    createDeathStain(scene as any, sprite, { color: 0xff0000, circleCount: 3 });
    expect(graphics.fillStyle).toHaveBeenCalledTimes(3);
    expect(graphics.fillCircle).toHaveBeenCalledTimes(3);
  });

  it('should draw base circle when baseColor provided', () => {
    createDeathStain(scene as any, sprite, {
      color: 0xff0000,
      baseColor: 0x000000,
      baseRadius: 12,
      baseAlpha: 0.15,
    });
    expect(graphics.fillCircle).toHaveBeenCalledWith(200, 308, 12);
  });

  it('should create sprite fade tween with correct duration', () => {
    createDeathStain(scene as any, sprite, { color: 0xff0000, spriteFadeDuration: 600 });
    const tween = scene.tweens.add.mock.calls[0][0];
    expect(tween.targets).toBe(sprite);
    expect(tween.alpha).toBe(0);
    expect(tween.duration).toBe(600);
  });

  it('should default sprite fade duration to 400', () => {
    createDeathStain(scene as any, sprite, { color: 0xff0000 });
    const tween = scene.tweens.add.mock.calls[0][0];
    expect(tween.duration).toBe(400);
  });

  it('should create stain fade tween after sprite fade completes', () => {
    createDeathStain(scene as any, sprite, { color: 0xff0000 });
    const spriteTween = scene.tweens.add.mock.calls[0][0];
    expect(typeof spriteTween.onComplete).toBe('function');
    spriteTween.onComplete();
    expect(sprite.setVisible).toHaveBeenCalledWith(false);
    const stainTween = scene.tweens.add.mock.calls[1][0];
    expect(stainTween.targets).toBeDefined();
    expect(stainTween.delay).toBe(5000);
    expect(stainTween.duration).toBe(2000);
    expect(stainTween.alpha).toBe(0);
  });

  it('should handle zero circles gracefully', () => {
    createDeathStain(scene as any, sprite, { color: 0xff0000, circleCount: 0 });
    expect(graphics.fillCircle).not.toHaveBeenCalled();
  });

  it('should cleanup stain graphics when onComplete fires', () => {
    createDeathStain(scene as any, sprite, { color: 0xff0000 });
    const spriteTween = scene.tweens.add.mock.calls[0][0];
    spriteTween.onComplete();
    const stainTween = scene.tweens.add.mock.calls[1][0];
    expect(typeof stainTween.onComplete).toBe('function');
    stainTween.onComplete();
    expect(graphics.destroy).toHaveBeenCalled();
  });
});
