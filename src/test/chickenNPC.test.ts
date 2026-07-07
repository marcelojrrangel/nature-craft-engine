import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChickenNPC } from '../game/entities/ChickenNPC';

let mockBody: any;
let mockSprite: any;
let mockScene: any;
let mockGraphics: any;

vi.mock('phaser', () => {
  const mockPhaserMath = {
    Between: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min,
    FloatBetween: (min: number, max: number) => Math.random() * (max - min) + min,
    Distance: {
      Between: (x1: number, y1: number, x2: number, y2: number) =>
        Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2),
    },
    Clamp: (v: number, min: number, max: number) => Math.max(min, Math.min(max, v)),
  };

  return {
    default: {
      Scene: vi.fn(),
      Physics: { Arcade: { Sprite: vi.fn(), Body: vi.fn() } },
      Math: mockPhaserMath,
      GameObjects: { Graphics: vi.fn() },
    },
  };
});

function createMockScene() {
  mockGraphics = {
    setDepth: vi.fn(),
    clear: vi.fn(),
    fillStyle: vi.fn(),
    fillRect: vi.fn(),
    fillCircle: vi.fn(),
    destroy: vi.fn(),
  };

  mockBody = {
    setCollideWorldBounds: vi.fn().mockReturnThis(),
    setSize: vi.fn().mockReturnThis(),
    setOffset: vi.fn().mockReturnThis(),
    setVelocity: vi.fn(),
    enable: true,
    velocity: { x: 0, y: 0 },
    disableBody: vi.fn(),
  };

  mockSprite = {
    x: 400,
    y: 500,
    setDepth: vi.fn(),
    setFlipX: vi.fn(),
    setVisible: vi.fn(),
    play: vi.fn(),
    destroy: vi.fn(),
    disableBody: vi.fn(),
    body: mockBody,
    active: true,
    scene: null as any,
    alpha: 1,
  };

  mockScene = {
    physics: {
      add: {
        sprite: vi.fn((x: number, y: number) => {
          mockSprite.x = x; mockSprite.y = y;
          mockSprite.scene = mockScene;
          return mockSprite;
        }),
      },
    },
    add: {
      graphics: vi.fn(() => mockGraphics),
    },
    tweens: {
      add: vi.fn(),
    },
    anims: {
      create: vi.fn(),
      exists: vi.fn(() => false),
      generateFrameNumbers: vi.fn(() => []),
    },
    time: {
      delayedCall: vi.fn(),
    },
    make: { graphics: vi.fn() },
    textures: { createCanvas: vi.fn() },
  };
  mockSprite.scene = mockScene;

  return mockScene;
}

describe('ChickenNPC', () => {
  beforeEach(() => {
    createMockScene();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create sprite at given position', () => {
    const chicken = new ChickenNPC(mockScene, {
      id: 'chicken_0', x: 400, y: 500, textureKey: 'chicken_white', wanderRadius: 96,
    }, 5);

    expect(mockScene.physics.add.sprite).toHaveBeenCalledWith(400, 500, 'chicken_white', 0);
    expect(chicken.sprite).toBe(mockSprite);
    expect(chicken.id).toBe('chicken_0');
    expect(chicken.homeX).toBe(400);
    expect(chicken.homeY).toBe(500);
  });

  it('should start in idle state with health', () => {
    const chicken = new ChickenNPC(mockScene, {
      id: 'chicken_1', x: 100, y: 200, textureKey: 'chicken_brown', wanderRadius: 96,
    }, 5);

    expect(chicken.health.isAlive).toBe(true);
    expect(chicken.health.current).toBe(5);
    expect(mockSprite.play).toHaveBeenCalledWith('chicken_brown_idle', true);
  });

  it('should use maxHp when initialHp is 0', () => {
    new ChickenNPC(mockScene, {
      id: 'chicken_2', x: 100, y: 200, textureKey: 'chicken_white', wanderRadius: 96,
    }, 0);

    expect(mockSprite.play).toHaveBeenCalled();
  });

  it('should create animations on first creation', () => {
    new ChickenNPC(mockScene, {
      id: 'chicken_3', x: 100, y: 200, textureKey: 'chicken_black', wanderRadius: 96,
    }, 5);

    expect(mockScene.anims.create).toHaveBeenCalledTimes(4);
    const animKeys = mockScene.anims.create.mock.calls.map((c: any[]) => c[0].key);
    expect(animKeys).toContain('chicken_black_idle');
    expect(animKeys).toContain('chicken_black_walk');
    expect(animKeys).toContain('chicken_black_eat');
    expect(animKeys).toContain('chicken_black_dead');
  });

  it('should not recreate existing animations', () => {
    mockScene.anims.exists = vi.fn(() => true);
    new ChickenNPC(mockScene, {
      id: 'chicken_4', x: 100, y: 200, textureKey: 'chicken_white', wanderRadius: 96,
    }, 5);

    expect(mockScene.anims.create).not.toHaveBeenCalled();
  });

  it('should set body size and offset', () => {
    new ChickenNPC(mockScene, {
      id: 'chicken_5', x: 100, y: 200, textureKey: 'chicken_white', wanderRadius: 96,
    }, 5);

    expect(mockBody.setSize).toHaveBeenCalledWith(16, 14);
    expect(mockBody.setOffset).toHaveBeenCalledWith(8, 14);
    expect(mockBody.setCollideWorldBounds).toHaveBeenCalled();
  });

  it('should update depth and hpBar on update', () => {
    const chicken = new ChickenNPC(mockScene, {
      id: 'chicken_6', x: 100, y: 200, textureKey: 'chicken_white', wanderRadius: 96,
    }, 5);

    chicken.update(100);

    expect(mockSprite.setDepth).toHaveBeenCalledWith(mockSprite.y);
  });

  it('should not update AI when dead', () => {
    const chicken = new ChickenNPC(mockScene, {
      id: 'chicken_7', x: 100, y: 200, textureKey: 'chicken_white', wanderRadius: 96,
    }, 5);

    chicken.health.takeDamage(5);
    expect(chicken.health.isAlive).toBe(false);

    const playCallsBefore = mockSprite.play.mock.calls.length;
    chicken.update(100);
    expect(mockSprite.play.mock.calls.length).toBe(playCallsBefore);
  });

  it('should transition states on timer expiry', () => {
    const chicken = new ChickenNPC(mockScene, {
      id: 'chicken_8', x: 100, y: 200, textureKey: 'chicken_white', wanderRadius: 96,
    }, 5);

    mockSprite.play.mockClear();
    chicken.update(5000);
    expect(mockSprite.play).toHaveBeenCalled();
  });

  it('should move towards target when walking', () => {
    const chicken = new ChickenNPC(mockScene, {
      id: 'chicken_9', x: 100, y: 200, textureKey: 'chicken_white', wanderRadius: 96,
    }, 5);

    Object.defineProperty(chicken, 'state', { get: () => 'walking' });
    (chicken as any).targetPos = { x: 200, y: 200 };

    chicken.update(100);
    expect(mockBody.setVelocity).toHaveBeenCalled();
  });

  it('should stop moving when idle or eating', () => {
    const chicken = new ChickenNPC(mockScene, {
      id: 'chicken_10', x: 100, y: 200, textureKey: 'chicken_white', wanderRadius: 96,
    }, 5);

    Object.defineProperty(chicken, 'state', { get: () => 'idle' });

    chicken.update(100);
    expect(mockBody.setVelocity).toHaveBeenCalledWith(0, 0);
  });

  it('isInRange should check distance to sprite', () => {
    const chicken = new ChickenNPC(mockScene, {
      id: 'chicken_11', x: 400, y: 500, textureKey: 'chicken_white', wanderRadius: 96,
    }, 5);

    expect(chicken.isInRange(400, 500, 10)).toBe(true);
    expect(chicken.isInRange(600, 500, 10)).toBe(false);
  });

  it('isInRange should return false when dead', () => {
    const chicken = new ChickenNPC(mockScene, {
      id: 'chicken_12', x: 400, y: 500, textureKey: 'chicken_white', wanderRadius: 96,
    }, 5);

    chicken.health.takeDamage(5);
    expect(chicken.isInRange(400, 500, 10)).toBe(false);
  });

  it('takeDamage should delegate to health component', () => {
    const chicken = new ChickenNPC(mockScene, {
      id: 'chicken_13', x: 400, y: 500, textureKey: 'chicken_white', wanderRadius: 96,
    }, 5);

    const result = chicken.takeDamage(3);
    expect(result).toBe(2);
    expect(chicken.health.current).toBe(2);
  });

  it('collect should kill instantly', () => {
    const chicken = new ChickenNPC(mockScene, {
      id: 'chicken_14', x: 400, y: 500, textureKey: 'chicken_white', wanderRadius: 96,
    }, 5);

    chicken.collect();
    expect(chicken.health.isAlive).toBe(false);
    expect(mockSprite.disableBody).toHaveBeenCalledWith(true, false);
  });

  it('die should create stain and disable body', () => {
    const chicken = new ChickenNPC(mockScene, {
      id: 'chicken_15', x: 400, y: 500, textureKey: 'chicken_white', wanderRadius: 96,
    }, 5);

    chicken.collect();

    expect(mockBody.enable).toBe(false);
    expect(mockSprite.disableBody).toHaveBeenCalledWith(true, false);
    expect(mockScene.add.graphics).toHaveBeenCalled();
  });

  it('destroy should clean up hpBar and sprite', () => {
    const chicken = new ChickenNPC(mockScene, {
      id: 'chicken_16', x: 400, y: 500, textureKey: 'chicken_white', wanderRadius: 96,
    }, 5);

    chicken.destroy();
    expect(mockSprite.destroy).toHaveBeenCalled();
  });

  it('should pick wander targets within wanderRadius', () => {
    const chicken = new ChickenNPC(mockScene, {
      id: 'chicken_17', x: 500, y: 500, textureKey: 'chicken_white', wanderRadius: 96,
    }, 5);

    const target = (chicken as any).pickWanderTarget();
    expect(target.x).toBeGreaterThanOrEqual(500 - 96);
    expect(target.x).toBeLessThanOrEqual(500 + 96);
    expect(target.y).toBeGreaterThanOrEqual(500 - 96);
    expect(target.y).toBeLessThanOrEqual(500 + 96);
  });

  it('should support three color variants', () => {
    const colors = ['chicken_white', 'chicken_black', 'chicken_brown'];
    colors.forEach((color, i) => {
      const chicken = new ChickenNPC(mockScene, {
        id: `chicken_${i}`, x: 100, y: 200, textureKey: color, wanderRadius: 96,
      }, 5);
      expect(chicken).toBeDefined();
      expect(chicken.id).toBe(`chicken_${i}`);
    });
  });
});
